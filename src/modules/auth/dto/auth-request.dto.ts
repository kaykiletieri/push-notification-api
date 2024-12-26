import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class AuthRequestDto {
  @ApiProperty({
    description: 'Grant type',
    example: 'client_credentials',
  })
  @IsString()
  @IsNotEmpty()
  grant_type: string;

  @ApiProperty({
    description: 'Client ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  clientId: string;

  @ApiProperty({
    description: 'Client Secret',
    example: 'mySuperSecret',
  })
  @IsString()
  @IsNotEmpty()
  clientSecret: string;

  @ApiProperty({
    description: 'Scopes as a comma-separated string',
    example: 'scope:read,scope:write',
  })
  @IsString()
  @IsNotEmpty()
  scopes: string; 
}
