import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { Summoner } from './entities/summoner.entity';
import axios from 'axios';
import { Region } from 'src/accounts/entities/region.enum';
import { RankedQueue } from './entities/ranked-queue.entity';
import schema from './riot.schema';

@Injectable()
export class RiotService {
  private readonly logger = new Logger(RiotService.name);
  constructor(private readonly httpService: HttpService) {}

  private async get(props: { path: string; params?: any; region?: Region }) {
    let subdomain = 'americas';
    if (props.region) {
      subdomain = this.getRegionSubdomain(props.region);
    }
    const url = `https://${subdomain}.api.riotgames.com${props.path}`;

    this.logger.log(
      `Requesting... ${url} ${JSON.stringify(props.params || {})}`,
    );

    return axios
      .get(url, {
        headers: {
          'X-Riot-Token': 'Token',
        },
        params: props.params,
        timeout: 10000,
      })
      .then((response) => {
        this.logger.log(
          `Response... ${url} ${JSON.stringify(
            props.params || {},
          )} ${JSON.stringify(response.data)}`,
        );

        return response.data;
      })
      .catch((error) => {
        this.logger.error(`${JSON.stringify(error, null, 2)}`);
        throw error;
      });
  }

  private getRegionSubdomain(region: Region) {
    switch (region) {
      case Region.LA1:
        return 'la1';
      case Region.LA2:
        return 'la2';
      case Region.NA:
        return 'na';
    }
    throw new Error('Unsupported region');
  }

  getSummonerByRegionAndName(
    region: Region,
    summonerName: string,
  ): Promise<Summoner> {
    return this.get({
      path: `/lol/summoner/v4/summoners/by-name/${summonerName}`,
      region,
    });
  }

  async getSummonerByPuuid(region: Region, puuid: string): Promise<Summoner> {
    return this.get({
      path: `/lol/summoner/v4/summoners/by-puuid/${puuid}`,
      region,
    });
  }

  async getRankedInformationBySummonerId(
    region: Region,
    summonerId: string,
  ): Promise<RankedQueue[]> {
    return await this.get({
      path: `/lol/league/v4/entries/by-summoner/${summonerId}`,
      region,
    });
  }

  async getMatchDetails(matchId: string): Promise<schema['match-v5.MatchDto']> {
    return this.get({
      path: `/lol/match/v5/matches/${matchId}`,
    });
  }

  async getLastSoloQueueGameIds(puuid: string): Promise<string[]> {
    return this.get({
      path: `/lol/match/v5/matches/by-puuid/${puuid}/ids`,
      params: {
        queue: 420,
        type: 'ranked',
        start: 0,
        count: 5,
      },
    });
  }
}
