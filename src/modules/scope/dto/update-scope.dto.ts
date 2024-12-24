import { IsOptional, IsString } from 'class-validator';

export class UpdateScopeDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
