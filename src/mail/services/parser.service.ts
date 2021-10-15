import { Injectable } from '@nestjs/common';
import { DHLParserService } from './parsers/dhl.parser.service';
import { MailAnnouncementParserService } from './parsers/mail.announcement.parser.service';
import { MailParser } from './parsers/parser.interface';

@Injectable()
export class ParserService {
  constructor(
    private dhlParserService: DHLParserService,
    private mailAnnouncementParserService: MailAnnouncementParserService,
  ) {}

  public getParsers(): MailParser[] {
    return [this.dhlParserService, this.mailAnnouncementParserService];
  }
}
