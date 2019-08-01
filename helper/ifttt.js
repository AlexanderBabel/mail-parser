import axios from "axios";

const API_URL = "https://maker.ifttt.com/trigger/%event%/with/key/%key%";

export async function sendPush({ title, text, link }) {
  return axios({
    url: API_URL.replace("%event%", process.env.API_EVENT).replace(
      "%key%",
      process.env.API_KEY
    ),
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    data: JSON.stringify({ value1: title, value2: text, value3: link })
  }).catch(err => console.log(err));
}
