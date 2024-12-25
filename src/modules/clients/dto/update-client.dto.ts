import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

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
}
