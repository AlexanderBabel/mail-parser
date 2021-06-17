import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import cheerio from 'cheerio';
import { ParsedMail } from 'mailparser';
import { PushService } from '../push.service';
import { MailParser } from './parser.interface';

@Injectable()
export class DHLParserService implements MailParser {
  private readonly DHL_PUSH_ROOM =
    this.configService.get<string>('DHL_PUSH_ROOM');

  constructor(
    private configService: ConfigService,
    private pushService: PushService,
  ) {
    if (!this.DHL_PUSH_ROOM) {
      throw new Error('Missing DHL_PUSH_ROOM env var!');
    }
  }

  getSender(): string {
    return 'noreply.packstation@dhl.de';
  }

  async parseMail(mail: ParsedMail): Promise<void> {
    if (!mail.html) {
      this.sendPush('DHL: Could not find HTML content.');
      return;
    }

    const $ = cheerio.load(mail.html);
    const mTan = $('.mobileVersion .headline span>b').text();
    if (!mTan) {
      this.sendPush('DHL: Could not find mTAN');
      return;
    }

    this.sendPush(`DHL mTAN: ${mTan}`);
  }

  sendPush(message: string) {
    if (!this.DHL_PUSH_ROOM) {
      throw new Error('Missing DHL_PUSH_ROOM env var!');
    }

    return this.pushService.sendPush(this.DHL_PUSH_ROOM, message);
  }
}
