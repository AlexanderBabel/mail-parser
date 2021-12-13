import { ParsedMail } from 'mailparser';

export interface MailParser {
  getSender(): string | string[];

  parseMail(mail: ParsedMail): Promise<void>;
}
