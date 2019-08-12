import { readFileSync, writeFileSync } from 'fs';

export function load() {
  try {
    return JSON.parse(readFileSync('persitent/data.json').toString()) || {};
    // eslint-disable-next-line no-empty
  } catch (err) {}
  return {};
}

export function save(data) {
  return writeFileSync('persitent/data.json', JSON.stringify(data, null, 2));
}
