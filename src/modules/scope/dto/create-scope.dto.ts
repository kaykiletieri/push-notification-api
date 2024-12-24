import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateScopeDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;
}
