import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';
import * as argon2 from 'argon2';
import { v4 as uuidv4 } from 'uuid';
import { Scope } from 'src/modules/scope/entities/scope.entity';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn('uuid')
  @IsUUID()
  id: string;

  @Column({ unique: true, name: 'client_id' })
  @IsNotEmpty()
  @IsString()
  clientId: string;

  @Column({ name: 'client_secret' })
  @IsNotEmpty()
  @IsString()
  clientSecret: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deletedAt?: Date;

  @ManyToMany(() => Scope, (scope) => scope.clients, {
    cascade: ['insert', 'update'],
  })
  @JoinTable({
    name: 'client_scopes',
    joinColumn: { name: 'client_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'scope_id', referencedColumnName: 'id' },
  })
  scopes: Scope[];

  @BeforeInsert()
  generateUUID() {
    if (!this.id) {
      this.id = uuidv4();
    }
  }

  @BeforeInsert()
  @BeforeUpdate()
  async hashClientSecret() {
    if (this.clientSecret) {
      this.clientSecret = await argon2.hash(this.clientSecret);
    }
  }

  async validateClientSecret(password: string): Promise<boolean> {
    return await argon2.verify(this.clientSecret, password);
  }
}
