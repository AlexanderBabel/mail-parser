import { load } from 'cheerio';
import { MailListener } from '../helper/mailer';
import { sendPush } from '../helper/ifttt';

export function error(message) {
  sendPush({
    event: 'dhl_push',
    text: `DHL mTAN: Error`,
    link: `${message}\n`,
  });
}

export default () => {
  const mailListener = new MailListener({
    username: process.env.MAIL_USER,
    password: process.env.MAIL_PASSWORD,
    host: process.env.MAIL_HOST,
    port: process.env.MAIL_PORT,
    tls: true,
    tlsOptions: { rejectUnauthorized: false },
    mailbox: 'INBOX',
    searchFilter: ['UNSEEN'],
    markSeen: true,
    fetchUnreadOnStart: true,
    attachments: false,
  });

  mailListener.start();

  mailListener.on('server:disconnected', () => {
    mailListener.start();
  });

  mailListener.on('error', (err) => {
    // eslint-disable-next-line no-console
    console.log(err);
  });

  mailListener.on('mail', (mail) => {
    if (!mail.html) {
      error('Could not find HTML content.');
      return;
    }

    const $ = load(mail.html);

    const trackingLink = $('.mobileVersion .text span>a').eq(1).attr('href');
    if (!trackingLink) {
      error('Could not find Tracking link.');
      return;
    }

    const trackingNumber = trackingLink.split('idc=')[1].trim();
    const mTan = $('.mobileVersion .headline span>b').text();
    if (!mTan) {
      error('Could not find mTAN');
      return;
    }

    sendPush({
      event: 'dhl_push',
      title: `DHL mTAN: ${mTan}`,
      text: `Your shipment ${trackingNumber} is ready for pickup.\n`,
      link: trackingLink,
    });
  });
};
