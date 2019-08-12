import 'dotenv/config';
import cron from 'node-cron';
import { handleRequests } from './helper/puppeteer';
import { save, load } from './helper/storage';
import { requireFiles } from './helper/file';
import mailChecker from './utils/mailChecker';

async function run(task = null) {
  const tasks = await requireFiles('tasks');
  if (task) {
    const obj = tasks.find(t => t.task === task);
    if (obj) {
      const res = await handleRequests([obj], await load());
      await save(res);
    }
    return;
  }

  const res = await handleRequests(tasks, await load());
  await save(res);
}

if (process.env.LOCAL_TEST !== 'true') {
  cron.schedule('55 */8 * * *', run);
  mailChecker();
} else {
  // run('Nuki');
  mailChecker();
}
