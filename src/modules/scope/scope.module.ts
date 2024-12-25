import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScopeService } from './services/scope.service';
import { Scope } from './entities/scope.entity';
import { ScopesController } from './controllers/scope.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Scope])],
  providers: [ScopeService],
  exports: [ScopeService],
  controllers: [ScopesController],
})
export class ScopeModule {}
