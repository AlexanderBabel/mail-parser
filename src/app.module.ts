import { Module } from '@nestjs/common';
import { CardPaymentsModule } from './card-payments/card-payments.module';
import { HealthCheckModule } from './health-check/health-check.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [HealthCheckModule, MailModule, CardPaymentsModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
