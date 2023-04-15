import { Division, Tier } from 'src/riot/entities/ranked-queue.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity()
export class Match {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ collation: 'utf8mb4_general_ci', unique: true })
  matchId: string;

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

  @Column()
  startAt: Date;

  @Column()
  duration: number;

  @CreateDateColumn()
  createdAt: Date;
}
