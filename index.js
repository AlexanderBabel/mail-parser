import "dotenv/config";
import { handleRequests } from "./helper/puppeteer";
import { save, load } from "./helper/storage";
import { requireFiles } from "./helper/file";

(async () => {
  const tasks = await requireFiles('tasks');
  const res = await handleRequests(tasks, await load());
  await save(res);
})();
