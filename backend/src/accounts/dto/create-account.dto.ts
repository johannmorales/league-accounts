import { Region } from '../entities/region.enum';

export class CreateAccountDto {
  summoner: string;
  region: Region;
}
