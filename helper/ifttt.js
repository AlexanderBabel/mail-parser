import axios from 'axios';

const API_URL = 'https://maker.ifttt.com/trigger/%event%/with/key/%key%';

export async function sendPush({ event, text, link, image }) {
  return axios({
    url: API_URL.replace('%event%', event).replace('%key%', process.env.API_KEY),
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    data: JSON.stringify({ value1: text, value2: link, value3: image })
    // eslint-disable-next-line no-console
  }).catch(err => console.log(err));
}
