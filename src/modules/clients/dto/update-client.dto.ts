import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateClientDto {
  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Client description',
    example: 'Example description',
    type: 'string',
  })
  description?: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Client secret',
    example: 'example-secret',
    type: 'string',
  })
  clientSecret?: string;

  @IsOptional()
  @IsArray()
  @IsUUID(undefined, { each: true })
  @ApiProperty({
    description: 'Scope IDs to associate with the client',
    example: ['f7b2d3e3-5e0a-4b1b-8b3c-8b5c7b0e1a7d'],
    type: 'array',
    items: { type: 'string' },
  })
  scopeIds?: string[];
}
