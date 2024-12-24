import { IsOptional, IsString } from 'class-validator';

export class UpdateClientDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  clientSecret?: string;
}
