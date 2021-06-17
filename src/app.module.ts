import { Module } from '@nestjs/common';
import { HealthCheckModule } from './health-check/health-check.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [HealthCheckModule, MailModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
