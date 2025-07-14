// import * as fs from 'fs';
// import * as path from 'path';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // type Tweet = {
// //   Username: string;
// //   Account: string;
// //   Tanggal: string;
// //   Posting: string;
// //   Replies: string;
// //   Reposts: string;
// //   Likes: string;
// // };

// type Tweet = {
//  username: string,
//         tanggal: string,
//         textTweet: string,
//         replies: string,
//         reposts: string,
//         likes: string,
//         interactionType: string,
//         targetUsername: string
// };

// const filePath = path.join(__dirname, 'reporter', 'tweets.json');
// const raw = fs.readFileSync(filePath, 'utf-8');
// const data: Tweet[] = JSON.parse(raw);

// const seen = new Map<string, number[]>();

// data.forEach((item, index) => {
//   const key = `${item.username.trim()}|${item.textTweet.trim()}`;
//   if (!seen.has(key)) {
//     seen.set(key, [index]);
//   } else {
//     seen.get(key)!.push(index);
//   }
// });

// let found = false;
// seen.forEach((indexes, key) => {
//   if (indexes.length > 1) {
//     console.warn(`⚠️ Duplikat ditemukan untuk "${key}" pada index: ${indexes.join(', ')} \n`);
//     found = true;
//   }
// });

// if (!found) {
//   console.log('✅ Tidak ditemukan duplikat berdasarkan Username + Posting.');
// }

// import * as fs from 'fs';
// import * as path from 'path';
// import { fileURLToPath } from 'url';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// type Tweet = {
//   username: string,
//   tanggal: string,
//   text_tweet: string,
//   replies: string,
//   reposts: string,
//   likes: string,
//   interactionType: string,
//   targetUsername: string
// };

// const folderPath = path.join(__dirname, 'reporter');

// // Baca semua file .json dalam folder
// const jsonFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.json'));

// const seen = new Map<string, { file: string, index: number }[]>();

// jsonFiles.forEach(file => {
//   const filePath = path.join(folderPath, file);
//   const raw = fs.readFileSync(filePath, 'utf-8');
  
//   let data: Tweet[];
//   try {
//     data = JSON.parse(raw);
//   } catch (err) {
//     console.error(`❌ Gagal parsing file ${file}:`, err);
//     return;
//   }

//   data.forEach((item, index) => {
//     const key = `${item.username.trim()}|${item.text_tweet.trim()}`;
//     const entry = { file, index };

//     if (!seen.has(key)) {
//       seen.set(key, [entry]);
//     } else {
//       seen.get(key)!.push(entry);
//     }
//   });
// });

// let found = false;

// seen.forEach((entries, key) => {
//   if (entries.length > 1) {
//     found = true;
//     console.warn(`⚠️ Duplikat ditemukan untuk "${key}" pada lokasi berikut:`);
//     entries.forEach(entry => {
//       console.warn(`   - File: ${entry.file}, Index: ${entry.index}`);
//     });
//     console.warn('');
//   }
// });

// if (!found) {
//   console.log('✅ Tidak ditemukan duplikat berdasarkan Username + text_tweet di semua file.');
// }
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, 'reporter/tweet_18_march_2025/tweet_18_march_2025.json');


type Tweet = {
  tweet_id: string;
  href: string;
  username: string;
  date: string;
  text_tweet: string;
  replies: number;
  reposts: number;
  likes: number;
  is_regular_post: boolean;
  is_mention: boolean;
  mention_to: string | null;
  is_quote: boolean;
  quote_to: string | null;
  is_reply: boolean;
  reply_to: string | null;
};

// // Path ke file JSON
// const filePath = path.join(__dirname, 'reporter/tweet_18_march_2025/tweet_18_march_2025.json');

try {
  const data = fs.readFileSync(filePath, 'utf-8');
  const tweets: Tweet[] = JSON.parse(data);

  const seen = new Set<string>();
  const duplicates: string[] = [];

  for (const tweet of tweets) {
    if (seen.has(tweet.tweet_id)) {
      duplicates.push(tweet.tweet_id);
    } else {
      seen.add(tweet.tweet_id);
    }
  }

  if (duplicates.length > 0) {
    console.log('Duplicate tweet_id(s) found:', duplicates);
  } else {
    console.log('No duplicate tweet_id found.');
  }
} catch (error) {
  console.error('Error reading or parsing JSON file:', error);
}

