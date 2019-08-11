import { getText, getLink, getSrc } from '../helper/puppeteer';

const URL = 'https://n26.com/en-de/blog';

function getResponse(text) {
  return {
    text,
    url: URL
  };
}

async function getImage(images, index) {
  if (!images) {
    return null;
  }

  const img = await getSrc(images[index]);
  if (img) {
    return img.replace(/\?.*/, '');
  }

  return null;
}

export default {
  task: 'N26',
  pushEvent: 'n26_push',
  getData: async page => {
    await page.goto(URL);
    const [button] = await page.$x("//button[contains(., 'Accept')]");
    if (button) {
      await button.click();
    }

    await page.select('#blogCategorySelect', '/en-de/blog-archive');
    await page.waitForSelector('main h2>a');

    const blogEntries = await page.$$('main h2>a');
    if (!blogEntries) {
      return getResponse('Error: No blog entries found!');
    }

    const images = await page.$$('main img');
    const entries = await Promise.all(
      blogEntries.map(async (t, i) => ({
        link: await getLink(t),
        text: await getText(t),
        image: await getImage(images, i)
      }))
    );

    return entries[0];
  }
};
