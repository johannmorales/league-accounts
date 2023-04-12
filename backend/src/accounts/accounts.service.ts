import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { RiotService } from 'src/riot/riot.service';
import { Repository } from 'typeorm';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { Account } from './entities/account.entity';
import { firstValueFrom, map, Observable } from 'rxjs';
import { QueueType } from 'src/riot/entities/ranked-queue.entity';

@Injectable()
export class AccountsService {
  constructor(
    private readonly riotService: RiotService,
    @InjectRepository(Account)
    private accountsRepository: Repository<Account>,
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

    const obs = new Observable();

    if (!account.riotSummonerId) {
      const { data: summoner } = await firstValueFrom(
        this.riotService.getSummonerByRegionAndName(
          account.region,
          account.summoner,
        ),
      );
      await this.accountsRepository.update(id, {
        riotAccountId: summoner.accountId,
        riotProfileIconId: summoner.profileIconId,
        riotSummonerId: summoner.id,
        riotSummonerLevel: summoner.summonerLevel,
      });

      account = await this.accountsRepository.findOneOrFail({
        where: { id },
      });
    }

    const { data: rankedQueues } = await firstValueFrom(
      this.riotService.getRankedInformationBySummonerId(
        account.region,
        account.riotSummonerId,
      ),
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
        lastSyncAt: new Date(),
      });
    }
  }
}
