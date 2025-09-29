import { IsUrl, IsNotEmpty } from 'class-validator';

export class ScrapeUrlDto {
  @IsUrl()
  @IsNotEmpty()
  url: string;
}
