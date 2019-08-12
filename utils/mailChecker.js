import { load } from 'cheerio';
import { MailListener } from '../helper/mailer';
import { sendPush } from '../helper/ifttt';

export default function() {
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
    attachments: false
  });

  mailListener.start();

  mailListener.on('server:disconnected', () => {
    mailListener.start();
  });

  mailListener.on('error', err => {
    console.log(err);
  });

  mailListener.on('mail', mail => {
    const $ = load(mail.html);
    const trackingNumber = $('#content_div>p')
      .eq(1)
      .text()
      .split('Sendung')[1]
      .split('lautet')[0]
      .trim();
    const mTan = $('#content_div>p>b').text();

    sendPush({
      event: 'dhl_push',
      text: `DHL mTAN: ${mTan}`,
      link: `Your shipment ${trackingNumber} is ready for pickup.\n`,
      image: `https://nolp.dhl.de/nextt-online-public/set_identcodes.do?&idc=${trackingNumber}`
    });
  });
}
