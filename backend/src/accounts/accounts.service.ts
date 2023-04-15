import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RiotService } from 'src/riot/riot.service';
import { Repository } from 'typeorm';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { Account } from './entities/account.entity';
import {
  Division,
  QueueType,
  Tier,
} from 'src/riot/entities/ranked-queue.entity';
import { Match } from 'src/matches/entities/match.entity';

@Injectable()
export class AccountsService {
  constructor(
    private readonly riotService: RiotService,
    @InjectRepository(Account)
    private accountsRepository: Repository<Account>,
    @InjectRepository(Match)
    private matchesRepository: Repository<Match>,
  ) {}

  async create(createAccountDto: CreateAccountDto) {
    await this.accountsRepository.insert({
      region: createAccountDto.region,
      summoner: createAccountDto.summoner,
    });
  }

  async findAll() {
    return this.accountsRepository.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} account`;
  }

  update(id: number, updateAccountDto: UpdateAccountDto) {
    return `This action updates a #${id} account`;
  }

  remove(id: number) {
    return `This action removes a #${id} account`;
  }

  async sync(id: number) {
    let account = await this.accountsRepository.findOneOrFail({
      where: { id },
    });

    // if (!account.riotSummonerId) {
    const summoner = await this.riotService.getSummonerByRegionAndName(
      account.region,
      account.summoner,
    );
    await this.accountsRepository.update(id, {
      riotAccountId: summoner.accountId,
      riotProfileIconId: summoner.profileIconId,
      riotSummonerId: summoner.id,
      riotSummonerLevel: summoner.summonerLevel,
      riotPuuid: summoner.puuid,
    });

    account = await this.accountsRepository.findOneOrFail({
      where: { id },
    });
    // }

    const rankedQueues =
      await this.riotService.getRankedInformationBySummonerId(
        account.region,
        account.riotSummonerId,
      );

    const soloQueue = rankedQueues.find(
      (queue) => queue.queueType === QueueType.RANKED_SOLO_5x5,
    );

    if (soloQueue) {
      await this.accountsRepository.update(id, {
        wins: soloQueue.wins,
        losses: soloQueue.losses,
        tier: soloQueue.tier,
        division: soloQueue.rank,
        lp: soloQueue.leaguePoints,
      });
    }

    const matchIds = await this.riotService.getLastSoloQueueGameIds(
      account.riotPuuid,
    );

    if (matchIds.length > 0) {
      const matchRanks = [];
      for (const matchId of matchIds) {
        let match = await this.matchesRepository.findOne({
          where: {
            matchId,
          },
        });

        if (!match) {
          const matchDetails = await this.riotService.getMatchDetails(matchId);
          const puuids = matchDetails.metadata.participants.filter(
            (puuid) => puuid !== account.riotPuuid,
          );
          const ranks = [];
          for (const puuid of puuids) {
            const summoner = await this.riotService.getSummonerByPuuid(
              account.region,
              puuid,
            );
            const rankedInformation =
              await this.riotService.getRankedInformationBySummonerId(
                account.region,
                summoner.id,
              );

            const soloQueue = rankedInformation.find(
              (queue) => queue.queueType === QueueType.RANKED_SOLO_5x5,
            );

            if (soloQueue) {
              ranks.push({ tier: soloQueue.tier, division: soloQueue.rank });
            }
          }

          const averageRank = this.getRankAverage(ranks);

          await this.matchesRepository.insert({
            matchId,
            startAt: new Date(matchDetails.info.gameStartTimestamp),
            division: averageRank.division,
            tier: averageRank.tier,
            duration: matchDetails.info.gameDuration,
          });

          match = await this.matchesRepository.findOne({
            where: {
              matchId,
            },
          });
        }

        if (match.tier && match.division) {
          matchRanks.push({
            tier: match.tier,
            division: match.division,
          });
        }
      }
      const matchAverage = this.getRankAverage(matchRanks);
      await this.accountsRepository.update(id, {
        matchedDivision: matchAverage.division,
        matchedTier: matchAverage.tier,
      });
    }

    await this.accountsRepository.update(id, {
      lastSyncAt: new Date(),
    });
  }

  private getDivisionValue(division: Division) {
    switch (division) {
      case Division.I:
        return 80;
      case Division.II:
        return 60;
      case Division.III:
        return 40;
      case Division.IV:
        return 20;
    }
  }

  private getDivisionFromValue(value: number) {
    switch (value) {
      case 0:
        return Division.IV;
      case 25:
        return Division.III;
      case 50:
        return Division.II;
      case 75:
        return Division.I;
    }
  }

  private getTierValue(tier: Tier) {
    switch (tier) {
      case Tier.IRON:
        return 100;
      case Tier.BRONZE:
        return 200;
      case Tier.SILVER:
        return 300;
      case Tier.GOLD:
        return 400;
      case Tier.PLATINUM:
        return 500;
      case Tier.DIAMOND:
        return 600;
      case Tier.MASTER:
        return 700;
    }
  }
  private getTierFromValue(value: number) {
    switch (value) {
      case 100:
        return Tier.IRON;
      case 200:
        return Tier.BRONZE;
      case 300:
        return Tier.SILVER;
      case 400:
        return Tier.GOLD;
      case 500:
        return Tier.PLATINUM;
      case 600:
        return Tier.DIAMOND;
      case 700:
        return Tier.MASTER;
    }
  }

  private getRankAverage(ranks: { tier: Tier; division: Division }[]) {
    if (ranks.length === 0) {
      return {
        tier: null,
        division: null,
      };
    }
    let total = 0;

    for (const rank of ranks) {
      total +=
        this.getTierValue(rank.tier) + this.getDivisionValue(rank.division);
    }

    const average = total / ranks.length;

    const roundedAverage = Math.floor(average / 25) * 25;

    const tierValue = Math.floor(roundedAverage / 100) * 100;
    const divisionValue = roundedAverage % 100;

    return {
      tier: this.getTierFromValue(tierValue),
      division: this.getDivisionFromValue(divisionValue),
    };
  }
}
