import { keyElement } from "../mappings/mapper.ts";
import { swipeUpElDisplayed, swipeUpwithTime } from './baseSwipe.ts';
import { log, saveToCSV, saveToJSON } from './baseScreen.ts';
import * as fs from 'fs';


const seenTweetCombos = new Set<string>();
let extractTweetCallCount = 0;
let hasRunCollectOnce = false;

function checkDuplicateTweets(username: string, posting: string) {
  // Jika ini run pertama dan file belum ada, skip
  try {
    if (!hasRunCollectOnce) {
      const rawData = fs.readFileSync('reporter/tweets.json', 'utf-8');
      const data = JSON.parse(rawData);
      // Jika file sudah bisa dibaca walaupun flag false, tetap lanjut cek
      const found = data.some((item: any) => {
        return item.Posting === posting && item.Username === username;
      });
      if (found) {
        log('WARNING', `⚠️ Tweet already exists, ${username}: ${posting}`);
        return 'Tweet already exists';
      }
    }
  } catch (err) {
    return 'Skip check - first run';
  }

  // Kalau sudah pernah jalan dan file tersedia, lanjut cek biasa
  try {
    const rawData = fs.readFileSync('reporter/tweets.json', 'utf-8');
    const data = JSON.parse(rawData);
    const found = data.some((item: any) => {
      return item.Posting === posting && item.Username === username;
    });
    if (found) {
      log('WARNING', `⚠️ Tweet already exists, ${username}: ${posting}`);
      return 'Tweet already exists';
    }
    return 'Tweet not found';
  } catch (err:any) {
    // Jika file tidak bisa dibaca karena alasan lain
    log('ERROR', `❌ Gagal membaca tweets.json: ${err.message}`);
    return 'Skip check - read error';
  }
}


/**
 * Membersihkan dan menormalkan teks agar siap untuk dicek duplikat.
 * - Menghapus karakter aneh/tak kasat mata.
 * - Merapikan spasi dan mengubah ke huruf kecil.
 * 
 * @param text Teks asli dari elemen web.
 * @returns Teks hasil normalisasi.
 */
function normalizeTweetText(text: string): string {
  // return text
  //   .replace(/\s+/g, ' ')              // Gabungkan spasi jadi satu spasi
  //   .replace(/[^\x20-\x7E]+/g, '')     // Hapus karakter non-ASCII
  //   .trim()
  //   .toLowerCase();
  return text
    .replace(/\s+/g, ' ')
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // invisible chars
    .replace(/[^\x20-\x7E]+/g, '') // non-ASCII
    .trim()
    .toLowerCase();
}

/**
 * Mengambil data tweet lengkap dari satu elemen tweet berdasarkan index.
 * Meliputi: username, nama akun, tanggal, postingan, replies, reposts, likes.
 * 
 * @param index Index dari elemen tweet (berbasis DOM) yang ingin diambil datanya.
 * @returns Array string berisi data tweet, atau array kosong jika data kosong atau duplikat.
 */
async function extractTweetDataAtIndex(index: number): Promise<string[]> {
  const tweetArticles = await $$(`${keyElement("aboutPage:tweetArticles")}[${index}]`);
  await browser.pause(2000); // Delay untuk memastikan DOM stabil
  extractTweetCallCount++; // Hitung setiap kali fungsi ini dipanggil

  for (const tweet of tweetArticles) {
    // Ambil username
    const usernameEl = await tweet.$(`.${keyElement("aboutPage:username")}`);
    const username = usernameEl ? (await usernameEl.getText()).trim() : '';

    // Ambil konten tweet
    const postingEl = await tweet.$(`.${keyElement("aboutPage:posting")}`);
    const rawPosting = postingEl ? await postingEl.getText() : '';
    const posting = rawPosting.trim();

    // Validasi isi
    if (!username || !posting) {
      log("INFO", `⚠️ Data kosong pada index ${index}, dilewati.`)
      return [];
    }

    // Cek apakah tweet sudah pernah diproses (username + posting)
    const tweetKey = `${username.toLowerCase()}|${normalizeTweetText(posting)}`;
    // if (seenTweetCombos.has(tweetKey)) {
    //   log("INFO", `🔁 Duplikat total ditemukan (username + postingan) di index ${index}. Skip.`)
    //   return [];
    // }
    if (checkDuplicateTweets(username,posting) == 'Tweet already exists') {
      return [];
    }

    // Simpan tweet sebagai yang sudah pernah dilihat
    seenTweetCombos.add(tweetKey);

    // Ambil nama akun
    const accountNameEl = await tweet.$(`.${keyElement("aboutPage:accountName")}`);
    const accountName = accountNameEl ? await accountNameEl.getText() : '';

    // Ambil waktu/tanggal posting
    const timeEl = await tweet.$(`.${keyElement("aboutPage:postingTime")}`);
    const tanggal = timeEl ? await timeEl.getText() : '';

    // Ambil jumlah reply
    let replies = '0';
    try {
      const repliesEl = await tweet.$(`.${keyElement("aboutPage:replies")}`);
      if (repliesEl) replies = (await repliesEl.getText()).trim() || '0';
    } catch {
      console.log(replies);
    }

    // Ambil jumlah repost
    let reposts = '0';
    try {
      const repostsEl = await tweet.$(`.${keyElement("aboutPage:reposts")}`);
      if (repostsEl) reposts = (await repostsEl.getText()).trim() || '0';
    } catch {
      console.log(reposts);
    }

    // Ambil jumlah like
    let likes = '0';
    try {
      const likesEl = await tweet.$(`.${keyElement("aboutPage:likes")}`);
      if (likesEl) likes = (await likesEl.getText()).trim() || '0';
    } catch {
      console.log(likes);
    }

    // Susun data tweet
    const objTweets = [
      username,
      accountName.trim(),
      tanggal.trim(),
      posting,
      replies,
      reposts,
      likes
    ];

    log("INFO",`✅ Data disimpan @${username}: ${posting}`)
    return objTweets;
  }

  return [];
}

/**
 * Mengambil dan menyimpan data tweet sebanyak `count` tweet unik ke file CSV.
 * Tweet akan di-scroll satu per satu berdasarkan index DOM.
 * 
 * @param count Jumlah tweet yang ingin diambil.
 */
async function collectUniqueTweetsToCSV(count: number) {
  try {
    for (let i = 1; i <= count; i++) {
      // Pastikan tweet ada di viewport dengan swipe
      const swipeCheck = await swipeUpElDisplayed(`${keyElement("aboutPage:tweetArticles")}[${i}]`);
      if (swipeCheck !== '200') throw new Error("Tweet tidak ditemukan");

      // Ambil data tweet
      const tweetData = await extractTweetDataAtIndex(i);

      // Scroll agar tweet selanjutnya muncul
      await swipeUpwithTime(1);
      await browser.pause(2000);

      // Jika kosong atau duplikat, lanjut ke berikutnya
      if (!tweetData.length) continue;

      // Simpan ke CSV (escape tanda kutip)
      const csvRow = tweetData.map(v => `"${v.replace(/"/g, '""')}"`).join(",");
      await saveToCSV(csvRow);
      const tweetObject = {
        Username: tweetData[0],
        Account: tweetData[1],
        Tanggal: tweetData[2],
        Posting: tweetData[3],
        Replies: tweetData[4],
        Reposts: tweetData[5],
        Likes: tweetData[6]
        };
    await saveToJSON(tweetObject);
      log("INFO", `📊 Fungsi extractTweetDataAtIndex telah dijalankan sebanyak ${extractTweetCallCount} kali.`)
    }
    hasRunCollectOnce = true;
    log("INFO", "✅ Semua tweet unik telah diproses dan disimpan.")
  } catch (err: any) {
    // console.error("❌ Terjadi kesalahan:", err.message);
    log("ERROR", `❌ Terjadi kesalahan:, ${err.message}`)
    throw err;
  }
}

/**
 * Fungsi untuk menjalankan proses scraping tweet sebanyak `loopCount` kali.
 * Setiap loop akan memproses 10 tweet (default behavior).
 * 
 * @param loopCount Jumlah pengulangan scraping batch (1 batch = 10 tweet).
 */
async function runTweetScrapingLoops(loopCount: number) {
  try {
    for (let i = 1; i <= loopCount; i++) {
      await collectUniqueTweetsToCSV(7);
      console.log("------------------tweet key------------------")
      console.log(seenTweetCombos)
      console.log("------------------tweet key------------------")
    }
  } catch (err: any) {
    console.error("❌ Terjadi error di loop utama:", err.message);
    throw err;
  }
}

export {runTweetScrapingLoops}