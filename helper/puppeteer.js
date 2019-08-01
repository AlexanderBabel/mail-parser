import puppeteer from 'puppeteer';
import { sendPush } from './ifttt';

export async function getText(el) {
  return (await el.getProperty('innerHTML')).jsonValue();
}

export async function handleRequests(jobs, persitentData) {
  const pData = [...persitentData];
  const browser = await puppeteer.launch({ headless: true });
  await Promise.all(
    jobs.map(async (data, i) => {
      const page = await browser.newPage();

      if (!data.getData) {
        return;
      }

      const text = await data.getData(page, data);
      if (!pData[i] || pData[i].sent !== text) {
        pData[i] = { sent: text };
        await sendPush({
          title: data.push.title,
          text,
          link: data.url
        });
      }
    })
  );

  await browser.close();
  return pData;
}
