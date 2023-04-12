export enum QueueType {
  RANKED_SOLO_5x5 = 'RANKED_SOLO_5x5',
}

export enum Tier {
  DIAMOND = 'DIAMOND',
  GOLD = 'GOLD',
  SILVER = 'SILVER',
  BRONZE = 'BRONZE',
}

export enum Division {
  I = 'I',
  II = 'II',
  III = 'III',
  IV = 'IV',
}

export type RankedQueue = {
  leagueId: string;
  queueType: QueueType;
  tier: Tier;
  rank: Division;
  leaguePoints: number;
  wins: number;
  losses: number;
  veteran: boolean;
  inactive: boolean;
  freshBlood: boolean;
  hotStreak: boolean;
};
