# mail-parser

An extensible NestJS project, that can parse e-mails and send push notifications.

Implemented functionalities:
- `Deutsche Post Briefankündigung`: Sends a message to Matrix including an image of the mail envelope from the e-mail

## Deutsche Post Briefankündigung

This functionality takes advantages of the emails send by the Deutsche Post, when a letter is on its way to your mailbox. You need to setup this feature by getting an mail account at web.de or gmx.de. Deutsche Post will sent you a letter to verify your address.

Afterwards, you can setup an app specific password in your mail account. This password is used to connect to the mail server and parse the e-mails.

### Prerequisites
- A mail account at web.de or gmx.de
- Enable the `Deutsche Post Briefankündigung` feature in your mail account settings
- Setup an app specific password in your mail account settings
- Maubot with the [`hasswebhookbot`](https://github.com/v411e/hasswebhookbot) plugin installed
- Exposed Maubot endpoint
- A Matrix room with the Maubot bot to sent the push notification to

### Setup

Run this project with Docker!

```bash
docker pull alexbabel/mail-parser:latest
```

docker-compose:
```yaml
services:
  mail-parser:
    image: alexbabel/mail-parser:latest
    restart: unless-stopped
    environment:
      - MAIL_HOST=mail.example.com
      - MAIL_PORT=993
      - MAIL_USER=parse@example.com
      - MAIL_PASSWORD=
      - PUSH_ENDPOINT=
      - MAIL_ANNOUNCEMENT_PUSH_ROOM=
```

### Environment variables
| Variable | Description | Example |
| --- | --- | --- |
| `MAIL_HOST` | The IMAP mail server to connect to | `imap.example.com` |
| `MAIL_PORT` | The IMAP port of the mail server | `993` |
| `MAIL_USER` | The user to connect to the mail server | `parse@example.com` |
| `MAIL_PASSWORD` | The password to connect to the mail server | `secure-password` |
| `PUSH_ENDPOINT` | The endpoint to send the push notification to | `https://matrix-bot.example.com/_matrix/maubot/plugin/mail/push/` |
| `MAIL_ANNOUNCEMENT_PUSH_ROOM` | The Matrix room to send the push notification to | `!LSsicedfgixpqFfsDz:example.com` |
