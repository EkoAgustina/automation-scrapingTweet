import { keyElement } from "../mappings/mapper.ts";
import { swipeUpElDisplayed, swipeUpwithTime } from './baseSwipe.ts';
import { log, saveToCSV, saveToJSON } from './baseScreen.ts';
import globalVariables from "../resources/globalVariable.ts";
import * as fs from 'fs';



let extractTweetCallCount = 0;
let hasRunCollectOnce = false;
// let similarTweets = new Set<string>();

function checkDuplicateTweets(username: string, posting: string) {
  // Jika ini run pertama dan file belum ada, skip
  try {
    if (!hasRunCollectOnce) {
      const rawData = fs.readFileSync('reporter/tweets.json', 'utf-8');
      const data = JSON.parse(rawData);
      // Jika file sudah bisa dibaca walaupun flag false, tetap lanjut cek
      const found = data.some((item: any) => {
        return item.textTweet === posting && item.username === username;
      });
      if (found) {
        if (extractTweetCallCount !== 0){
          log('WARNING', `⚠️ [${extractTweetCallCount}] Tweet already exists, ${username}: ${posting}`);
          globalVariables.similarTweets.add(`⚠️ [${extractTweetCallCount}] Tweet already exists, ${username}: ${posting}`)
          return 'Tweet already exists';
        }
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
      return item.textTweet === posting && item.username === username;
    });
    if (found) {
      log('WARNING', `[${extractTweetCallCount}] ⚠️ Tweet already exists, ${username}: ${posting}`);
      globalVariables.similarTweets.add(`⚠️ [${extractTweetCallCount}] Tweet already exists, ${username}: ${posting}`)
      return 'Tweet already exists';
    }
    return 'Tweet not found';
  } catch (err:any) {
    // Jika file tidak bisa dibaca karena alasan lain
    log('ERROR', `❌ Gagal membaca tweets.json: ${err.message}`);
    return 'Skip check - read error';
  }
}

function extractUsername(tweet: string): string[] {
  const usernameRegex = /@\w+/g;
  const usernames = tweet.match(usernameRegex);
  return usernames ? usernames : [];
}


/**
 * Membersihkan dan menormalkan teks agar siap untuk dicek duplikat.
 * - Menghapus karakter aneh/tak kasat mata.
 * - Merapikan spasi dan mengubah ke huruf kecil.
 * 
 * @param text Teks asli dari elemen web.
 * @returns Teks hasil normalisasi.
 */
// function normalizeTweetText(text: string): string {
//   // return text
//   //   .replace(/\s+/g, ' ')              // Gabungkan spasi jadi satu spasi
//   //   .replace(/[^\x20-\x7E]+/g, '')     // Hapus karakter non-ASCII
//   //   .trim()
//   //   .toLowerCase();
//   return text
//     .replace(/\s+/g, ' ')
//     .replace(/[\u200B-\u200D\uFEFF]/g, '') // invisible chars
//     .replace(/[^\x20-\x7E]+/g, '') // non-ASCII
//     .trim()
//     .toLowerCase();
// }

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
  globalVariables.tweetCountCheck ++
  let interactionType;

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
    // const tweetKey = `${username.toLowerCase()}|${normalizeTweetText(posting)}`;
    // if (seenTweetCombos.has(tweetKey)) {
    //   log("INFO", `🔁 Duplikat total ditemukan (username + postingan) di index ${index}. Skip.`)
    //   return [];
    // }
    if (checkDuplicateTweets(username,posting) == 'Tweet already exists') {
      return [];
    }

    const usernameMention = extractUsername(posting)

    // Simpan tweet sebagai yang sudah pernah dilihat
    // seenTweetCombos.add(tweetKey);

    // Ambil nama akun
    // const accountNameEl = await tweet.$(`.${keyElement("aboutPage:accountName")}`);
    // const accountName = accountNameEl ? await accountNameEl.getText() : '';

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

    // Ambil reply
    // let replyingTo = 'Empty';
    let replyingTo: string = "Empty"
    try {
      const replyingToEl = await tweet.$(`.${keyElement("aboutPage:replyingTo")}`);
      if (replyingToEl) replyingTo = (await replyingToEl.getText()).trim() || 'Empty';
    } catch {
      console.log(replyingTo);
    }
    const usernameReplyingTo = extractUsername(replyingTo)
    let setTargetUsername = ""

    if (usernameMention.length > 0 && usernameReplyingTo.length > 0) {
      interactionType = "Mention and Reply"
      setTargetUsername = usernameMention.join(" ") + usernameReplyingTo.join(" ")
    } else if (usernameReplyingTo.length > 0) {
      interactionType = 'Reply'
      setTargetUsername = usernameReplyingTo.join(" ")
    } else if (usernameMention.length > 0) {
      interactionType = "Mention"
      setTargetUsername = usernameMention.join(" ")
    }
    else {
      interactionType = 'Regular post'
    }

    // Susun data tweet
    const objTweets = [
      username,
      tanggal.trim(), 
      posting,
      replies,
      reposts,
      likes,
      interactionType,
      setTargetUsername
    ];
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
      if (i % 4 === 0) await swipeUpwithTime(1)
      if (i === count) await swipeUpwithTime(1)

      // await swipeUpIntoView(`${keyElement("aboutPage:tweetArticles")}[${i}]`)

      // Ambil data tweet
      const tweetData = await extractTweetDataAtIndex(i);

      await browser.pause(2000);

      // Jika kosong atau duplikat, lanjut ke berikutnya
      if (!tweetData.length) continue;

      // Simpan ke CSV (escape tanda kutip)
      const csvRow = tweetData.map(v => `"${v.replace(/"/g, '""')}"`).join(",");
      await saveToCSV(csvRow);
      const tweetObject = {
        username: tweetData[0],
        tanggal: tweetData[1],
        textTweet: tweetData[2],
        replies: tweetData[3],
        reposts: tweetData[4],
        likes: tweetData[5],
        interactionType: tweetData[6],
        targetUsername: tweetData[7]

        };
    await saveToJSON(tweetObject);
      log("INFO", `📊 Fungsi extractTweetDataAtIndex telah dijalankan sebanyak ${extractTweetCallCount} kali.`)
    }
    hasRunCollectOnce = true;
    log("INFO", "✅ Semua tweet unik telah diproses dan disimpan.")
    await browser.pause(1000);
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
      await collectUniqueTweetsToCSV(12);
    }
  } catch (err: any) {
    console.error("❌ Terjadi error di loop utama:", err.message);
    throw err;
  }
}

export {runTweetScrapingLoops}