import { keyElement } from "../mappings/mapper.ts";
import { swipeUpElDisplayed, swipeUpwithTime, swipeUpElDisplayedCustom } from './baseSwipe.ts';
import { log, saveToCSV, saveToJSON } from './baseScreen.ts';
import globalVariables from "../resources/globalVariable.ts";
import * as fs from 'fs';
import { tweetGetText } from "./baseGet.ts";



let extractTweetCallCount = 0;
let hasRunCollectOnce = false;
// let similarTweets = new Set<string>();

function checkIfTweetLimitReached(maxLength: number): boolean {
  try {
    const rawData = fs.readFileSync(`reporter/${globalVariables.scrapingReportsName}.json`, 'utf-8');
    const data = JSON.parse(rawData);

    if (!Array.isArray(data)) {
      log("ERROR", "JSON file does not contain arrays")
      // return '❌ File JSON tidak berisi array.';
      return false
    }

    globalVariables.tweetsCount = data.length

    if (data.length >= maxLength) {
      log("INFO", `Tweets collected have reached ${maxLength} according to your wishes`)
      return true
    } else {
      log("INFO", `Tweets collected have not reached ${maxLength}`)
      return false
    }
  } catch (err: any) {
    log("ERROR", `An error occurred: ${err.message}`)
    return false
  }
}


function checkDuplicateTweets(username: string, posting: string, tweetId: string) {
  // Jika ini run pertama dan file belum ada, skip
  try {
    if (!hasRunCollectOnce) {
      const rawData = fs.readFileSync(`reporter/${globalVariables.scrapingReportsName}.json`, 'utf-8');
      const data = JSON.parse(rawData);
      // Jika file sudah bisa dibaca walaupun flag false, tetap lanjut cek tweetId
      const found = data.some((item: any) => {
        // return item.text_tweet === posting && item.username === username;
        return item.tweet_id === tweetId
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
    const rawData = fs.readFileSync(`reporter/${globalVariables.scrapingReportsName}.json`, 'utf-8');
    const data = JSON.parse(rawData);
    const found = data.some((item: any) => {
      // return item.text_tweet === posting && item.username === username;
      return item.tweet_id === tweetId
    });
    if (found) {
      log('WARNING', `[${extractTweetCallCount}] ⚠️ Tweet already exists, ${username}: ${posting}`);
      globalVariables.similarTweets.add(`⚠️ [${extractTweetCallCount}] Tweet already exists, ${username}: ${posting}`)
      return 'Tweet already exists';
    }
    return 'Tweet not found';
  } catch (err:any) {
    // Jika file tidak bisa dibaca karena alasan lain
    log('ERROR', `❌ Failed to read ${globalVariables.scrapingReportsName}.json: ${err.message}`);
    return 'Skip check - read error';
  }
}

function extractUsername(tweet: string): string[] {
  const usernameRegex = /@\w+/g;
  const usernames = tweet.match(usernameRegex);
  return usernames ? usernames : [];
}

async function getSafeText(tweet: WebdriverIO.Element, selector: string, fallback = '0'): Promise<string> {
  try {
    const el = await tweet.$(selector);
    return el ? (await el.getText()).trim() || fallback : fallback;
  } catch {
    return fallback;
  }
}

function convertDate(dateStr: string) {
  const [, day] = dateStr.split(" ");
  const indonesianMonth = "Maret"; // hardcoded karena hanya "Mar" seperti penjelasanmu

  return `${day} ${indonesianMonth} 2025`;
}

// const normalizeTextTweet = (textTweet: string): string => {
//   return textTweet
//     .split('\n')                       // Pisah berdasarkan newline
//     .map(line => line.trim())         // Hilangkan spasi di awal/akhir setiap baris
//     .filter(line => line.length > 0)  // Hapus baris kosong
//     .join(' ')                        // Gabungkan dengan spasi
//     .replace(/\s+([?.!])/g, '$1');    // Hapus spasi sebelum tanda baca
// };


async function getTweetTextData(tweet: WebdriverIO.Element) {

  const usernameEl = (await tweetGetText(tweet, `.${keyElement("tweets:username")}`))
  const textTweetEl = await tweetGetText(tweet, `.${keyElement("tweets:posting")}`)
  const timeEl = await tweetGetText(tweet, `.${keyElement("tweets:postingTime")}`)

  const swipeCheckUsername = await swipeUpElDisplayedCustom(tweet, `.${keyElement("tweets:username")}`)
  if (swipeCheckUsername !== '200') throw new Error("Tweet tidak ditemukan");

  const username = usernameEl ? usernameEl.trim() : '';
  const textTweet = textTweetEl ? textTweetEl.trim() : '';
  const tgl = timeEl ? timeEl.trim() : '';
  const date = convertDate(tgl)

  return { username, textTweet, date };
}

async function getTweetStats(tweet: WebdriverIO.Element) {
  const replies = await getSafeText(tweet, `.${keyElement("tweets:replies")}`);
  const reposts = await getSafeText(tweet, `.${keyElement("tweets:reposts")}`);
  const likes = await getSafeText(tweet, `.${keyElement("tweets:likes")}`);
  const replyingTo = await getSafeText(tweet, `.${keyElement("tweets:replyingTo")}`, 'NA')
  const tweetQuotes = await getSafeText(tweet, `.${keyElement("tweets:tweetQuetes")}`, 'NA')

  return { replies, reposts, likes, replyingTo, tweetQuotes };
}

function getInteractionInfo(posting: string, replyingTo: string, tweetQuetes: string)  {
  const usernameMention = extractUsername(posting);
  const usernameReplyingTo = extractUsername(replyingTo);
  const usernameTweetQuotes = extractUsername(tweetQuetes); 

  if (usernameMention.length > 0 && usernameReplyingTo.length > 0) {
    return {
      // interactionType: "Mention and Reply",
      isRegularPost: false,
      isMention: true,
      isQuote: false,
      isReply: true,
      setTargetUsername: usernameMention.join(" ") + " " + usernameReplyingTo.join(" ")
    };
  } else if (usernameMention.length > 0 && usernameTweetQuotes.length > 0) {
    return {
      // interactionType: "Mention and Quotes",
      isRegularPost: false,
      isMention: true,
      isQuote: true,
      isReply: false,
      setTargetUsername: usernameMention.join(" ") + " " + usernameTweetQuotes.join(" ")
    };
  } else if (usernameTweetQuotes.length > 0) {
    return {
      // interactionType: "Quotes",
      isRegularPost: false,
      isMention: false,
      isQuote: true,
      isReply: false,
      setTargetUsername: usernameTweetQuotes.join(" ")
    };
  } 
  else if (usernameReplyingTo.length > 0) {
    return {
      // interactionType: "Reply",
      isRegularPost: false,
      isMention: false,
      isQuote: false,
      isReply: true,
      setTargetUsername: usernameReplyingTo.join(" ")
    };
  } 
  else if (usernameMention.length > 0) {
    return {
      // interactionType: "Mention",
      isRegularPost: false,
      isMention: true,
      isQuote: false,
      isReply: false,
      setTargetUsername: usernameMention.join(" ")
    };
  } else {
    return {
      // interactionType: "Regular post",
      isRegularPost: true,
      isMention: false,
      isQuote: false,
      isReply: false,
      setTargetUsername: "NA"
    };
  }
}

async function extractTweetDataAtIndex(index: number): Promise<string[]> {
  const tweetArticles = await $$(`${keyElement("tweets:tweetArticles")}[${index}]`);
  extractTweetCallCount++;
  globalVariables.tweetCountCheck ++
  await browser.pause(3500);

  for (const tweet of tweetArticles) {
    const { username, textTweet, date } = await getTweetTextData(tweet);
    if (!username || !textTweet) return [];
    const tweetLink = await tweet.$('a[href*="/status/"]');
    const href = await tweetLink.getAttribute('href'); // e.g., "/ibranimovic29/status/1769255174513518627"
    const tweetId = href.split('/status/')[1]; 

    if (checkDuplicateTweets(username,textTweet, tweetId) === 'Tweet already exists') return [];

    // const replyingToEl = await tweet.$(`.${keyElement("tweets:replyingTo")}`);
    // const replyingTo = replyingToEl ? (await replyingToEl.getText()).trim() : 'Empty';

    const { replies, reposts, likes, replyingTo, tweetQuotes } = await getTweetStats(tweet);
    const { isRegularPost, isMention, isQuote, isReply, setTargetUsername } = getInteractionInfo(textTweet, replyingTo, tweetQuotes);
    // console.log(`-------- cekk tweetLink --------`)
    // console.log(href)
    // console.log(tweet_id)
    // console.log(`-------- cekk tweetLink --------`)

    const objTweets = [
      tweetId, href , username, date, textTweet, replies, reposts, likes, isRegularPost.toString(), isMention.toString(), isQuote.toString(), isReply.toString(), setTargetUsername
    ];
    return objTweets;
  }

  return [];
}


/**
 * Mengambil dan menyimpan data tweet sebanyak `count` tweet unik ke file CSV.
 * Tweet akan di-scroll satu per satu berdasarkan index DOM.
 * 
 * @param tweetLimit Jumlah tweet yang ingin diambil.
 */
async function runTweetScrapingLoops(tweetLimit: number) {
  // const request = 100;
  // const a: number = 20;
  const requestTweet: number = tweetLimit + (tweetLimit * 0.8);

  const indexArticle = 11;
  const indexDivisorTotal = Math.ceil(requestTweet / indexArticle);
  let currentRequestTweet = 0;

  try {
    for (let divisorIndex = 0; divisorIndex < indexDivisorTotal; divisorIndex++) {
      if (checkIfTweetLimitReached(tweetLimit)) {
      log("INFO", `✅ Tweet limit of ${tweetLimit} already reached. Skipping scraping.`);
      return;
    }

    for (let i = 1; i <= indexArticle; i++) {
      if (currentRequestTweet >= requestTweet) break;
      if (checkIfTweetLimitReached(tweetLimit)) {
        log("INFO", `✅ Tweet limit of ${tweetLimit} reached during iteration ${i}. Stopping loop.`);
        break;
      }
      const swipeCheck = await swipeUpElDisplayed(`${keyElement("tweets:tweetArticles")}[${i}]`);
      if (swipeCheck !== '200') throw new Error("Tweet not found");
      if (i !== 0 && i % 3 === 0) await swipeUpwithTime(1)
      if (i === indexDivisorTotal) await swipeUpwithTime(1)

      // Ambil data tweet
      const tweetData = await extractTweetDataAtIndex(i);

      await browser.pause(2000);

      // Jika kosong atau duplikat, lanjut ke berikutnya
      if (!tweetData.length) continue;

      // Simpan ke CSV (escape tanda kutip)
      const csvRow = tweetData.map(v => `"${v.replace(/"/g, '""')}"`).join(",");
      await saveToCSV(csvRow, globalVariables.scrapingReportsName);
      const tweetObject = {
        tweet_id: tweetData[0],
        href: tweetData[1],
        username: tweetData[2],
        date: tweetData[3],
        text_tweet: tweetData[4],
        replies: +tweetData[5],
        reposts: +tweetData[6],
        likes: +tweetData[7],
        is_regular_post: tweetData[8] === "true",
        is_mention: tweetData[9] === "true",
        is_quote: tweetData[10] === "true",
        is_reply: tweetData[11] === "true",
        target_username: tweetData[12],
        };
    await saveToJSON(tweetObject, globalVariables.scrapingReportsName);
      log("INFO", `The extractTweetDataAtIndex function has been executed ${extractTweetCallCount} times.`)
    }
    hasRunCollectOnce = true;
    currentRequestTweet++;
    await browser.pause(1000);
    }
  } catch (err: any) {
    log("ERROR", `An error occurred:, ${err.message}`)
    throw err;
  }
}


export {runTweetScrapingLoops}