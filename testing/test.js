import { load } from 'cheerio';

const $ = load(require('fs').readFileSync('t.html'));

// eslint-disable-next-line no-console
console.log(
  $('.mobileVersion .text span>a'),
  $('.mobileVersion .text span>a').attr('href'),
  $('.mobileVersion .text span>a').text()
);
