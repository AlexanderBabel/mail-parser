import puppeteer from "puppeteer";
import { sendPush } from "./ifttt";

export async function getText(el) {
  return (await el.getProperty("innerHTML")).jsonValue();
}

export async function handleRequests(jobs, persitentData) {
  const browser = await puppeteer.launch({ headless: true });
  await Promise.all(
    jobs.map(async (data, i) => {
      const page = await browser.newPage();

      if (!data.getData) {
        return;
      }

      const text = await data.getData(page, data);
      if (!persitentData[i] || persitentData[i].sent !== text) {
        persitentData[i] = { sent: text };
        return sendPush({
          title: data.push.title,
          text,
          link: data.url
        });
      }
    })
  );

  await browser.close();
  return persitentData;
}
