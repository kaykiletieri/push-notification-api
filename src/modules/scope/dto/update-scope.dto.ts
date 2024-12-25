import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateScopeDto {
  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Scope name',
    example: 'example-scope',
    type: 'string',
  })
  name?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Scope description',
    example: 'Example description',
    type: 'string',
  })
  description?: string;
}
