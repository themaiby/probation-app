import { Module } from '@nestjs/common';
import { SimpleLockService } from './simple-lock.service';

@Module({
  providers: [SimpleLockService],
  exports: [SimpleLockService],
})
export class SimpleLockModule {}
