import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ClientResponseDto {
  @Expose()
  id: string;

  @Expose()
  clientId: string;

  @Expose()
  description?: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;
}
