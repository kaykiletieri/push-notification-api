import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  PrimaryColumn,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Client } from '../../clients/entities/client.entity';
import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';

@Entity('scopes')
export class Scope {
  @PrimaryColumn({ type: 'uuid' })
  @IsUUID()
  id: string;

  @Column({ unique: true })
  @IsNotEmpty()
  @IsString()
  name: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  description: string;

  @ManyToMany(() => Client, (client) => client.scopes, {
    cascade: ['insert', 'update'],
  })
  clients: Client[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @BeforeInsert()
  generateUUID() {
    if (!this.id) {
      this.id = uuidv4();
    }
  }
}
