import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type Tweet = {
  Username: string;
  Account: string;
  Tanggal: string;
  Posting: string;
  Replies: string;
  Reposts: string;
  Likes: string;
};

const filePath = path.join(__dirname, 'reporter', 'tweets.json');
const raw = fs.readFileSync(filePath, 'utf-8');
const data: Tweet[] = JSON.parse(raw);

const seen = new Map<string, number[]>();

data.forEach((item, index) => {
  const key = `${item.Username.trim()}|${item.Posting.trim()}`;
  if (!seen.has(key)) {
    seen.set(key, [index]);
  } else {
    seen.get(key)!.push(index);
  }
});

let found = false;
seen.forEach((indexes, key) => {
  if (indexes.length > 1) {
    console.warn(`⚠️ Duplikat ditemukan untuk "${key}" pada index: ${indexes.join(', ')} \n`);
    found = true;
  }
});

if (!found) {
  console.log('✅ Tidak ditemukan duplikat berdasarkan Username + Posting.');
}
