import { Division, Tier } from 'src/riot/entities/ranked-queue.entity';
import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';
import { Region } from './region.enum';

@Entity()
@Index(['region', 'summoner'], { unique: true })
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: Region,
  })
  region: Region;

  @Column({ collation: 'utf8mb4_general_ci' })
  summoner: string;

  @Column({ nullable: true, unique: true })
  riotSummonerId: string;

  @Column({ nullable: true, unique: true })
  riotAccountId: string;

  @Column({ nullable: true, unique: true })
  riotPuuid: string;

  @Column({ nullable: true })
  riotProfileIconId: number;

  @Column({ nullable: true })
  riotSummonerLevel: number;

  @Column({
    type: 'enum',
    enum: Tier,
    nullable: true,
  })
  tier: Tier;

  @Column({
    type: 'enum',
    enum: Division,
    nullable: true,
  })
  division: Division;

  @Column({
    type: 'enum',
    enum: Tier,
    nullable: true,
  })
  matchedTier: Tier;

  @Column({
    type: 'enum',
    enum: Division,
    nullable: true,
  })
  matchedDivision: Division;

  @Column({ nullable: true })
  lp: number;

  @Column({ nullable: true })
  wins: number;

  @Column({ nullable: true })
  losses: number;

  @Column({ nullable: true })
  lastSyncAt: Date;
}
