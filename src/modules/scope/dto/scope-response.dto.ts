import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ScopeResponseDto {
  @Expose()
  @ApiProperty({
    description: 'Scope ID',
    example: 'f5e6f5f7-6e2b-4e2f-8b5d-0e3a2c1b4e2f',
    type: 'string',
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: 'Scope name',
    example: 'example-scope',
    type: 'string',
  })
  name: string;

  @Expose()
  @ApiProperty({
    description: 'Scope description',
    example: 'Example description',
    type: 'string',
  })
  description: string;

  @Expose({ name: 'created_at' })
  @ApiProperty({
    description: 'Scope creation date',
    example: '2021-08-01T00:00:00.000Z',
    type: 'string',
  })
  createdAt: Date;

  @Expose({ name: 'updated_at' })
  @ApiProperty({
    description: 'Scope update date',
    example: '2021-08-01T00:00:00.000Z',
    type: 'string',
  })
  updatedAt: Date;
}
