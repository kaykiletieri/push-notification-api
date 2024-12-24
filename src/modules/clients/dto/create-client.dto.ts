import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateClientDto {
  @IsNotEmpty()
  @IsString()
  clientSecret: string;

  @IsOptional()
  @IsString()
  description?: string;
}
