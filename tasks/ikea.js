import moment from 'moment';
import { getText } from '../helper/puppeteer';

const DATE_FORMAT = 'ddd DD. MMM';
const INPUT_FORMAT = 'DD.MM.YYYY';

function formatDate(d) {
  return moment(d, INPUT_FORMAT).format(DATE_FORMAT);
}

export default {
  url:
    'https://www.ikea.com/de/de/p/fyrtur-verdunklungsrollo-kabellos-batteriebetrieben-grau-90408170/',
  push: {
    title: 'IEKA Frytur'
  },
  getData: async (page, data) => {
    await page.goto(data.url);
    await page.click('#find-product');
    await page.select('#new-stockcheck-dropdown', '520');
    await page.waitForSelector('.range-stock-info__text>span');

    const res = await page.$('.range-stock-info__restock-dates>span');
    if (res) {
      const text = await getText(res);
      if (!text) {
        return 'Error: No Restock Data found.';
      }

      const matches = text.match(/(\d{2}\.\d{2}\.\d{4})\s.{1}\s(\d{2}\.\d{2}\.\d{4})/);
      if (matches) {
        return `Current Status: Available between ${formatDate(matches[1])} and ${formatDate(
          matches[2]
        )}`;
      }

      return 'Error: Restock match did not work';
    }

    const res1 = await page.$('.range-stock-info__text--bold');
    if (res1) {
      const text = await getText(res);
      if (!text) {
        return 'Error: No Stock Data found.';
      }

      return `IMPORTANT: There are ${text} items currently available!`;
    }

    return 'Error: No Data at all found.';
  }
};
