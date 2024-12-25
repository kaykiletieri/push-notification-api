import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  IsUUID,
  ArrayNotEmpty,
} from 'class-validator';

export class CreateClientDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Client secret',
    example: 'example-secret',
    type: 'string',
  })
  clientSecret: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Client description',
    example: 'Example description',
    type: 'string',
  })
  description?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('all', { each: true })
  @ArrayNotEmpty()
  @ApiProperty({
    description: 'Scope ids',
    example: ['f7b2d3e3-5e0a-4b1b-8b3c-8b5c7b0e1a7d'],
    type: 'array',
    items: {
      type: 'string',
    },
  })
  scopeIds?: string[];
}
