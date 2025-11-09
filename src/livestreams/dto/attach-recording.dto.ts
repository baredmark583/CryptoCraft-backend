import { IsString, IsUrl } from 'class-validator';

export class AttachRecordingDto {
  @IsUrl()
  recordingUrl: string;

  @IsString()
  storageProvider: string;
}
