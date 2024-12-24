import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScopeService } from './services/scope.service';
import { Scope } from './entities/scope.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Scope])],
  providers: [ScopeService],
  exports: [ScopeService],
})
export class ScopeModule {}
