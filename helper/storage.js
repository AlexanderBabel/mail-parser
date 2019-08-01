import { readFileSync, writeFileSync } from "fs";

export function load() {
  try {
    return JSON.parse(readFileSync("persitentData.json").toString()) || [];
  } catch (err) {}
  return [];
}

export function save(data) {
  return writeFileSync("persitentData.json", JSON.stringify(data, null, 2));
}
