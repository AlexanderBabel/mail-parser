import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { config } from '../config';
import { IMAPService } from './services/imap.service';
import { ParserService } from './services/parser.service';
import { DHLParserService } from './services/parsers/dhl.parser.service';
import { MailAnnouncementParserService } from './services/parsers/mail.announcement.parser.service';
import { PushService } from './services/push.service';

@Module({
  imports: [ConfigModule.forRoot({ load: [config] })],
  controllers: [],
  providers: [
    IMAPService,
    PushService,
    ParserService,
    DHLParserService,
    MailAnnouncementParserService,
  ],
})
export class MailModule {}
