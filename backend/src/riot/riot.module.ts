import { HttpModule } from '@nestjs/axios';
import { Global, Module } from '@nestjs/common';
import { RiotService } from './riot.service';

@Global()
@Module({
  imports: [HttpModule],
  providers: [RiotService],
  exports: [RiotService],
})
export class RiotModule {}
