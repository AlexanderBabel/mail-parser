import { Injectable } from '@nestjs/common';
import { MailAnnouncementParserService } from './parsers/mail.announcement.parser.service';
import { MailParser } from './parsers/parser.interface';

@Injectable()
export class ParserService {
  constructor(
    private mailAnnouncementParserService: MailAnnouncementParserService,
  ) {}

  public getParsers(): MailParser[] {
    return [this.mailAnnouncementParserService];
  }
}
