import puppeteer from 'puppeteer';
import { sendPush } from './ifttt';

export async function getText(el) {
  return (await el.getProperty('innerHTML')).jsonValue();
}

export async function getLink(el) {
  return (await el.getProperty('href')).jsonValue();
}

export async function getSrc(el) {
  return (await el.getProperty('src')).jsonValue();
}

export async function handleRequests(jobs, persitentData) {
  const pData = { ...persitentData };
  const browser = await puppeteer.launch(
    process.env.LOCAL_TEST === 'true'
      ? {
          headless: false
        }
      : {
          headless: true,
          executablePath: '/usr/bin/chromium-browser',
          args: ['--no-sandbox', '--disable-dev-shm-usage']
        }
  );
  await Promise.all(
    jobs.map(async ({ task, getData, pushEvent }) => {
      const page = await browser.newPage();

      if (!getData) {
        return;
      }

      const res = await getData(page);
      if (!pData[task] || JSON.stringify(pData[task]) !== JSON.stringify(res)) {
        pData[task] = res;
        await sendPush({
          ...res,
          event: pushEvent
        });
      }
    })
  );

  await browser.close();
  return pData;
}
