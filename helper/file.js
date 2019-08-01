/* eslint-disable import/no-dynamic-require */
/* eslint-disable global-require */
import { readdirSync, lstatSync } from 'fs';

export async function requireFiles(path) {
  const res = await Promise.all(
    readdirSync(path).map(f => {
      const name = `${path}/${f}`;
      if (lstatSync(name).isDirectory()) {
        return requireFiles(name);
      }

      if (f.endsWith('.js')) {
        return [require(`../${name}`).default];
      }

      return [];
    })
  );

  return res.reduce((prev, cur) => [...prev, ...cur], []);
}
