import { IsUrl, IsNotEmpty } from 'class-validator';

export class ProcessUrlDto {
  @IsUrl()
  @IsNotEmpty()
  url: string;
}
