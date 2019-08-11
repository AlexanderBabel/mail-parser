import { getText, getLink, getSrc } from '../helper/puppeteer';

const URL = 'https://nuki.io/en/blog/';

function getResponse(text) {
  return {
    text,
    url: URL
  };
}

async function getImage(images, index) {
  if (!images || !images[index]) {
    return null;
  }

  const img = await getSrc(images[index]);
  if (img) {
    return img.replace(/\?.*/, '');
  }

  return null;
}

export default {
  task: 'Nuki',
  pushEvent: 'nuki_push',
  getData: async page => {
    await page.goto(URL);
    await page.waitForSelector('.blog-view-tile .blog-view-content h2 a');

    const blogEntries = await page.$$('.blog-view-tile .blog-view-content h2 a');
    if (!blogEntries) {
      return getResponse('Error: No blog entries found!');
    }

    const images = await page.$$('.blog-view-tile .blog-view-img img');
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
