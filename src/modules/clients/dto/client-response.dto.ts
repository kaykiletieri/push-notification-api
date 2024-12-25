import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { ScopeResponseDto } from 'src/modules/scope/dto/scope-response.dto';

@Exclude()
export class ClientResponseDto {
  @Expose()
  @ApiProperty({
    description: 'Client ID',
    example: 'f5e6f5f7-6e2b-4e2f-8b5d-0e3a2c1b4e2f',
    type: 'string',
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: 'Client ID',
    example: 'generated-client-id',
    type: 'string',
  })
  clientId: string;

  @Expose()
  @ApiProperty({
    description: 'Client secret',
    example: 'example description',
    type: 'string',
  })
  description?: string;

  @Expose()
  @ApiProperty({
    description: 'Client creation date',
    example: '2021-08-01T00:00:00.000Z',
    type: 'string',
  })
  createdAt: Date;

  @Expose()
  @ApiProperty({
    description: 'Client update date',
    example: '2021-08-01T00:00:00.000Z',
    type: 'string',
  })
  updatedAt: Date;

  @Expose()
  @Type(() => ScopeResponseDto)
  @ApiProperty({
    description: 'List of associated scopes',
    type: [ScopeResponseDto],
    example: [
      {
        id: 'abc123',
        name: 'example-scope',
        description: 'Example scope description',
      },
    ],
  })
  scopes: ScopeResponseDto[];
}
