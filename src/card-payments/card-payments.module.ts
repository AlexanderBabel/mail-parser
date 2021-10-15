import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { config } from '../config';
import { CardPaymentsApiService } from './services/card-payments-api.service';
import { CardPaymentsController } from './card-payments.controller';
import { PrismaService } from './services/prisma.service';

@Module({
  imports: [ConfigModule.forRoot({ load: [config] })],
  controllers: [CardPaymentsController],
  providers: [CardPaymentsApiService, PrismaService],
})
export class CardPaymentsModule {}
