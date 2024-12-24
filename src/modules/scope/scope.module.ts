import { Module } from '@nestjs/common';
import { ScopeController } from './controllers/scopte.controller';
import { ScopeService } from './services/scope.service';

@Module({
  controllers: [ScopeController],
  providers: [ScopeService],
})
export class ScopeModule {}
