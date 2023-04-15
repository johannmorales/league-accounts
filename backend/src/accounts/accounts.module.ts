import { Module } from '@nestjs/common';
import { AccountsService } from './accounts.service';
import { AccountsController } from './accounts.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { Match } from 'src/matches/entities/match.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Account, Match])],
  controllers: [AccountsController],
  providers: [AccountsService],
})
export class AccountsModule {}
