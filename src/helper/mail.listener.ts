import Imap from 'imap';
import { EventEmitter } from 'node:events';
import { simpleParser } from 'mailparser';

type MailOptions = {
  markSeen?: boolean;
  mailbox?: string;
  searchFilter?: string | string[];
  fetchUnreadOnStart?: boolean;
} & Imap.Config;

export class MailListener extends EventEmitter {
  private readonly markSeen;

  private readonly mailbox;

  private readonly fetchUnreadOnStart;

  private readonly searchFilter: string[];

  private readonly imap;

  constructor(options: MailOptions) {
    super();

    this.markSeen = options.markSeen ?? true;
    this.mailbox = options.mailbox ?? 'INBOX';

    this.searchFilter =
      typeof options.searchFilter === 'string'
        ? [options.searchFilter]
        : options.searchFilter || ['UNSEEN'];

    this.fetchUnreadOnStart = options.fetchUnreadOnStart ?? true;

    this.imap = new Imap({
      xoauth2: options.xoauth2,
      user: options.user,
      password: options.password,
      host: options.host,
      port: options.port,
      tls: options.tls,
      tlsOptions: options.tlsOptions,
      connTimeout: options.connTimeout,
      authTimeout: options.authTimeout,
      debug: options.debug,
    });

    this.imap.once('ready', this.imapReady.bind(this));
    this.imap.once('close', this.imapClose.bind(this));
    this.imap.on('error', this.imapError.bind(this));
  }

  start() {
    this.imap.connect();
  }

  stop() {
    this.imap.end();
  }

  imapReady() {
    this.imap.openBox(this.mailbox, false, (err) => {
      if (err) {
        this.emit('error', err);
      } else {
        this.emit('server:connected');
        if (this.fetchUnreadOnStart) {
          this.parseUnread();
        }

        this.imap.on('mail', this.imapMail.bind(this));
        this.imap.on('update', this.imapMail.bind(this));
      }
    });
  }

  imapClose() {
    this.emit('server:disconnected');
  }

  imapError(err: Error) {
    this.emit('error', err);
  }

  imapMail() {
    this.parseUnread();
  }

  parseUnread() {
    this.imap.search(this.searchFilter, (err, results) => {
      if (err) {
        this.emit('error', err);
      } else if (results.length > 0) {
        // eslint-disable-next-line no-restricted-syntax
        for (const result of results) {
          const f = this.imap.fetch(result, {
            bodies: '',
            markSeen: this.markSeen,
          });

          f.once('error', (error) => {
            this.emit('error', error);
          });

          f.on('message', this.handleMessage.bind(this));
        }
      }
    });
  }

  handleMessage(message: Imap.ImapMessage, seqno: number) {
    let attributes: Imap.ImapMessageAttributes;

    message.on('body', (stream) => {
      let data = '';
      stream.on('data', (chunk) => {
        data += chunk.toString('UTF-8');
      });

      stream.once('end', () => {
        simpleParser(data, (err1, mail) => {
          if (err1) {
            this.emit('error', err1);
            return;
          }

          this.emit('mail', mail, seqno, attributes);
        });
      });
    });

    message.on('attributes', (attrs) => {
      attributes = attrs;
    });
  }
}
