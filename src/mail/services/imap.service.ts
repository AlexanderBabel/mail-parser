import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ParsedMail } from 'mailparser';
import { MailListener } from 'src/helper/mail.listener';
import { ParserService } from './parser.service';

@Injectable()
export class IMAPService {
  private readonly logger = new Logger(IMAPService.name);

  private readonly mailListener;

  private readonly MAIL_USER = this.configService.get<string>('MAIL_USER');

  private readonly MAIL_PASSWORD =
    this.configService.get<string>('MAIL_PASSWORD');

  private readonly MAIL_HOST = this.configService.get<string>('MAIL_HOST');

  private readonly MAIL_PORT = this.configService.get<number>('MAIL_PORT');

  constructor(
    private configService: ConfigService,
    private parserService: ParserService,
  ) {
    if (
      !this.MAIL_USER ||
      !this.MAIL_PASSWORD ||
      !this.MAIL_PORT ||
      !this.MAIL_HOST
    ) {
      throw new Error(
        'Missing env var! MAIL_USER, MAIL_PASSWORD, MAIL_PORT or MAIL_HOST is not defined.',
      );
    }

    this.mailListener = new MailListener({
      user: this.MAIL_USER,
      password: this.MAIL_PASSWORD,
      host: this.MAIL_HOST,
      port: this.MAIL_PORT,
      tls: true,
      tlsOptions: { rejectUnauthorized: false },
      mailbox: 'INBOX',
      searchFilter: ['UNSEEN'],
      markSeen: true,
      fetchUnreadOnStart: true,
    });

    this.mailListener.start();

    this.mailListener.on('server:disconnected', () => {
      this.mailListener.start();
    });

    this.mailListener.on('error', (err) => {
      this.logger.error(err);
    });

    this.mailListener.on('mail', (mail: ParsedMail) => {
      this.handleMail(mail);
    });
  }

  private async handleMail(mail: ParsedMail) {
    const parser = this.parserService.getParsers().find((p) =>
      mail.from?.value.some((s) => {
        const sender = p.getSender();
        return Array.isArray(sender) && s.address
          ? sender.includes(s.address)
          : s.address === sender;
      }),
    );

    if (!parser) {
      this.logger.warn(
        `Could not find parser for incoming E-Mail. Sender: ${mail.from?.text}`,
      );
      return;
    }

    await parser
      .parseMail(mail)
      .catch((error) =>
        this.logger.error(
          `[${parser}] [${parser.getSender()}] Error occurred: ${error} - ${
            error.message
          } Data: ${JSON.stringify(error.data, null, 2)}`,
        ),
      );
  }
}
