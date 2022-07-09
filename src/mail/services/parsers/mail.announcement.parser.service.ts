import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ParsedMail } from 'mailparser';
import { PushAttachment, PushService } from '../push.service';
import { MailParser } from './parser.interface';

@Injectable()
export class MailAnnouncementParserService implements MailParser {
  private readonly MAIL_ANNOUNCEMENT_PUSH_ROOM = this.configService.get<string>(
    'MAIL_ANNOUNCEMENT_PUSH_ROOM',
  );

  constructor(
    private configService: ConfigService,
    private pushService: PushService,
  ) {
    if (!this.MAIL_ANNOUNCEMENT_PUSH_ROOM) {
      throw new Error('Missing MAIL_ANNOUNCEMENT_PUSH_ROOM env var!');
    }
  }

  public getSender(): string {
    return 'ankuendigung@brief.deutschepost.de';
  }

  public async parseMail(mail: ParsedMail): Promise<void> {
    if (mail.attachments.length === 0) {
      await this.sendPush('Error: Could not find attachments.');
      return;
    }

    const attachment: PushAttachment = {
      contentType: mail.attachments[0].contentType,
      content: mail.attachments[0].content.toString('base64'),
      name: mail.attachments[0].filename ?? mail.attachments[0].cid,
      thumbnailSize: 512,
    };

    await this.sendPush(`You will get mail today!`, attachment);
  }

  private async sendPush(message: string, content?: PushAttachment) {
    if (!this.MAIL_ANNOUNCEMENT_PUSH_ROOM) {
      throw new Error('Missing MAIL_ANNOUNCEMENT_PUSH_ROOM env var!');
    }

    if (content) {
      await this.pushService.sendAttachment(
        this.MAIL_ANNOUNCEMENT_PUSH_ROOM,
        content,
      );
    }

    return this.pushService.sendPush(this.MAIL_ANNOUNCEMENT_PUSH_ROOM, message);
  }
}
