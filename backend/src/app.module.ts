import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { RiotModule } from './riot/riot.module';
import { AccountsModule } from './accounts/accounts.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchesModule } from './matches/matches.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: 'mysql',
      database: 'league-accounts',
      autoLoadEntities: true,
      synchronize: true,
      logging: true,
    }),
    RiotModule,
    AccountsModule,
    MatchesModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
