import 'dotenv/config';

export const config = () => ({
  ...process.env,
  MAIL_PORT: process.env.MAIL_PORT
    ? Number.parseInt(process.env.MAIL_PORT, 10)
    : undefined,
});
