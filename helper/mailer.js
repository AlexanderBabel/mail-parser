/* eslint-disable no-param-reassign */
import Imap from 'imap';
import { EventEmitter } from 'events';
import { simpleParser } from 'mailparser';
import fs from 'fs';
import path from 'path';

export class MailListener extends EventEmitter {
  constructor(options) {
    super();

    this.markSeen = !!options.markSeen;
    this.mailbox = options.mailbox || 'INBOX';
    if (typeof options.searchFilter === 'string') {
      this.searchFilter = [options.searchFilter];
    } else {
      this.searchFilter = options.searchFilter || ['UNSEEN'];
    }
    this.fetchUnreadOnStart = !!options.fetchUnreadOnStart;
    this.mailParserOptions = options.mailParserOptions || {};
    if (options.attachments && options.attachmentOptions && options.attachmentOptions.stream) {
      this.mailParserOptions.streamAttachments = true;
    }
    this.attachmentOptions = options.attachmentOptions || {};
    this.attachments = options.attachments || false;
    this.attachmentOptions.directory = this.attachmentOptions.directory
      ? this.attachmentOptions.directory
      : '';
    this.imap = new Imap({
      xoauth2: options.xoauth2,
      user: options.username,
      password: options.password,
      host: options.host,
      port: options.port,
      tls: options.tls,
      tlsOptions: options.tlsOptions || {},
      connTimeout: options.connTimeout || null,
      authTimeout: options.authTimeout || null,
      debug: options.debug || null
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
    this.imap.openBox(this.mailbox, false, err => {
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

  imapError(err) {
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
        results.forEach(result => {
          const f = this.imap.fetch(result, {
            bodies: '',
            markSeen: this.markSeen
          });

          f.once('error', error => {
            this.emit('error', error);
          });

          f.on('message', (msg, seqno) => {
            let attributes = null;

            msg.on('body', stream => {
              let data = '';
              stream.on('data', chunk => {
                data += chunk.toString('UTF-8');
              });

              stream.once('end', () => {
                simpleParser(data, (err1, mail) => {
                  if (err1) {
                    this.emit('error', err1);
                    return;
                  }

                  if (
                    !this.mailParserOptions.streamAttachments &&
                    mail.attachments &&
                    this.attachments
                  ) {
                    mail.attachments.forEach(attachment => {
                      fs.writeFile(
                        this.attachmentOptions.directory + attachment.generatedFileName,
                        attachment.content,
                        error => {
                          if (err) {
                            this.emit('error', error);
                          } else {
                            attachment.path = path.resolve(
                              this.attachmentOptions.directory + attachment.generatedFileName
                            );
                            this.emit('attachment', attachment);
                          }
                        }
                      );
                    });
                  }

                  this.emit('mail', mail, seqno, attributes);
                });
              });
            });

            msg.on('attributes', attrs => {
              attributes = attrs;
            });
          });
        });
      }
    });
  }
}
