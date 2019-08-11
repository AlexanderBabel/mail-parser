import moment from 'moment';
import { getText } from '../helper/puppeteer';

const DATE_FORMAT = 'ddd DD. MMM';
const INPUT_FORMAT = 'DD.MM.YYYY';
const URL =
  'https://www.ikea.com/de/de/p/fyrtur-verdunklungsrollo-kabellos-batteriebetrieben-grau-90408170/';

function formatDate(d) {
  return moment(d, INPUT_FORMAT).format(DATE_FORMAT);
}

function getResponse(text) {
  return {
    text,
    url: URL,
    image:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Ikea_logo.svg/440px-Ikea_logo.svg.png'
  };
}

export default {
  task: 'IKEA',
  pushEvent: 'ikea_push',
  getData: async page => {
    await page.goto(URL);

    const btn = await page.$('#find-product');
    if (!btn) {
      return getResponse('Error: Product not found.');
    }
    await btn.click();

    await page.select('#new-stockcheck-dropdown', '520');
    await page.waitForSelector('.range-stock-info__text>span');

    const res = await page.$('.range-stock-info__restock-dates>span');
    if (res) {
      const text = await getText(res);
      if (!text) {
        return getResponse('Error: No Restock Data found.');
      }

      const matches = text.match(/(\d{2}\.\d{2}\.\d{4})\s.{1}\s(\d{2}\.\d{2}\.\d{4})/);
      if (matches) {
        return getResponse(
          `Current Status: Available between ${formatDate(matches[1])} and ${formatDate(
            matches[2]
          )}`
        );
      }

      return getResponse('Error: Restock match did not work');
    }

    const res1 = await page.$('.range-stock-info__text--bold');
    if (res1) {
      const text = await getText(res);
      if (!text) {
        return getResponse('Error: No Stock Data found.');
      }

      return getResponse(`IMPORTANT: There are ${text} items currently available!`);
    }

    return getResponse('Error: No Data at all found.');
  }
};
