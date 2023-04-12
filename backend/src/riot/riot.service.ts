import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Summoner } from './entities/summoner.entity';
import { AxiosResponse } from 'axios';
import { Region } from 'src/accounts/entities/region.enum';
import { RankedQueue } from './entities/ranked-queue.entity';

@Injectable()
export class RiotService {
  constructor(private readonly httpService: HttpService) {}

  getSummonerByRegionAndName(
    region: Region,
    summonerName: string,
  ): Observable<AxiosResponse<Summoner>> {
    return this.httpService.get(
      `https://${region}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}`,
      {
        headers: {
          'X-Riot-Token': 'RGAPI-5c2d8cc8-38ea-4967-b524-f6f7e99ae7b7',
        },
      },
    );
  }

  getRankedInformationBySummonerId(
    region: Region,
    summonerId: string,
  ): Observable<AxiosResponse<RankedQueue[]>> {
    return this.httpService.get(
      `https://${region}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}`,
      {
        headers: {
          'X-Riot-Token': 'RGAPI-5c2d8cc8-38ea-4967-b524-f6f7e99ae7b7',
        },
      },
    );
  }
}
