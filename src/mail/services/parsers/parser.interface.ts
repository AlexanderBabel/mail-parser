import { ParsedMail } from 'mailparser';

export interface MailParser {
  getSender(): string;

  parseMail(mail: ParsedMail): Promise<void>;
}
