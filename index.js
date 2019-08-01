import 'dotenv/config';
import cron from 'node-cron';
import { handleRequests } from './helper/puppeteer';
import { save, load } from './helper/storage';
import { requireFiles } from './helper/file';

async function run() {
  const tasks = await requireFiles('tasks');
  const res = await handleRequests(tasks, await load());
  await save(res);
}

cron.schedule('40 * * * *', run);
