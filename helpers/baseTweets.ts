import { keyElement } from "../mappings/mapper.ts";
import { swipeUpElDisplayed, swipeUpwithTime, swipeUpElDisplayedCustom } from './baseSwipe.ts';
import { elWaitForExist, findElement, log, measureTime, saveToCSV } from './baseScreen.ts';
import globalVariables from "../resources/globalVariable.ts";
import * as fs from 'fs';
import { tweetGetText } from "./baseGet.ts";
import { actionClick } from "./baseClick.ts";



let extractTweetCallCount = 0;
// let hasRunCollectOnce = false;
const indexArticle = 11;
let lastIndexCount = 0
let tweetCache: any[] = [];

function loadTweetCache() {
  try {
    const rawData = fs.readFileSync(`reporter/${globalVariables.scrapingReportsName}.json`, 'utf-8');
    const data = JSON.parse(rawData);
    tweetCache = Array.isArray(data) ? data : [];
    log("INFO", `✅ Loaded ${tweetCache.length} tweets from cache`);
  } catch (err: any) {
    tweetCache = [];
    log("WARNING", `Could not load tweet cache: ${err.message}`);
  }
}

function saveTweetCache() {
  try {
    fs.writeFileSync(
      `reporter/${globalVariables.scrapingReportsName}.json`,
      JSON.stringify(tweetCache, null, 2)
    );
    log("INFO", "✅ Tweet cache saved to file");
  } catch (err: any) {
    log("ERROR", `Failed to save tweet cache: ${err.message}`);
  }
}


async function scrollByLastIndex() {
  try {
    // const rawData = fs.readFileSync(`reporter/${globalVariables.scrapingReportsName}.json`, 'utf-8');
    // const data = tweetCache

    if (!Array.isArray(tweetCache)) {
      log("ERROR", "JSON file does not contain arrays")
      // return '❌ File JSON tidak berisi array.';
      return false 
    }

    if (tweetCache.length >= 20) {
      const divider = (tweetCache.length / indexArticle)
      const reducer = (30 / 100) * Math.ceil(divider);
      const lastIndex = Math.ceil(divider) - Math.ceil(reducer)
      log("INFO", `Swipe will be executed ${Math.ceil(lastIndex)} times`)
      await swipeUpwithTime(Math.ceil(lastIndex))
      await browser.pause(3000);
      return true
    } else {
      log("WARNING", `Not running swipe last index`)
      return false
    }
  } catch (err: any) {
    log("ERROR", `An error occurred: ${err.message}`)
    return false
  }
}

function checkIfTweetLimitReached(maxLength: number): boolean {
  const currentCount = tweetCache.length;
  globalVariables.tweetsCount = currentCount + 1;
  globalVariables.desiredTweets = maxLength;

  if (currentCount >= maxLength) {
    log("INFO", `✅ Tweets collected have reached ${maxLength}`);
    return true;
  } else {
    log("INFO", `📉 Tweets collected: ${currentCount}/${maxLength}`);
    return false;
  }
}


function checkDuplicateTweets(tweetId: string) {
  const found = tweetCache.some((item: any) => item.tweet_id === tweetId);
  if (found) {
    if (extractTweetCallCount !== 0) {
      log('WARNING', `⚠️ [${extractTweetCallCount}] Tweet already exists, ${tweetId}`);
    }
    return 'Tweet already exists';
  }
  return 'Tweet not found';
}

async function handleSww() {
  const retryButton = keyElement("tweets:retryButton_sww")
  let attempts = 0;
  const maxAttempts = 5;
  try {
    if (await elWaitForExist(retryButton, 3500)) {
      while (await (await findElement(retryButton)).isDisplayed() ) {
      await browser.pause(2000);
      await actionClick(retryButton)
      await browser.pause(4000);
      attempts++

      if (attempts >= maxAttempts) {
        throw new Error(`SWW retry still keeps appearing`)
      }
    }
    }
  } catch (err: any) {
    log("ERROR",err.message)
    throw err
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

    if (!await el.isDisplayed()) {
      await el.waitForDisplayed({ timeout: 3000 }); // Tunggu max 3 detik kalau belum muncul
    }

    return (await el.getText()).trim() || fallback;
  } catch {
    return fallback;
  }
}


function convertDate(dateStr: string) {
  const [, day] = dateStr.split(" ");
  const indonesianMonth = "Maret";

  return `${day} ${indonesianMonth} 2025`;
}


async function getTweetId(tweet: WebdriverIO.Element) {
  const swipeTweetLink = await swipeUpElDisplayedCustom(tweet, `a[href*="/status/`)
  if (swipeTweetLink !== '200') throw new Error("Tweet not found");
  const tweetLink = await tweet.$('a[href*="/status/"]');
  const href = await tweetLink.getAttribute('href');
  const tweetId = href.split('/status/')[1];

  return { href, tweetId }
}

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
  const [replies, reposts, likes, replyingTo, tweetQuotes] = await Promise.all([
    getSafeText(tweet, `.${keyElement("tweets:replies")}`),
    getSafeText(tweet, `.${keyElement("tweets:reposts")}`),
    getSafeText(tweet, `.${keyElement("tweets:likes")}`),
    getSafeText(tweet, `.${keyElement("tweets:replyingTo")}`, 'NA'),
    getSafeText(tweet, `.${keyElement("tweets:tweetQuetes")}`, 'NA'),
  ]);

  return { replies, reposts, likes, replyingTo, tweetQuotes };
}


function getInteractionInfo(posting: string, replyingTo: string, tweetQuetes: string) {
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
  globalVariables.tweetCountCheck++

  for (const tweet of tweetArticles) {
    // const { href, tweetId } = await getTweetId(tweet)
    const { href, tweetId } = await measureTime("getTweetId", () => getTweetId(tweet));
    if (checkDuplicateTweets(tweetId) === 'Tweet already exists') return [];

    // const { username, textTweet, date } = await getTweetTextData(tweet);
    const { username, textTweet, date } = await measureTime("getTweetTextData", () => getTweetTextData(tweet));
    if (!username || !textTweet) return [];

    const { replies, reposts, likes, replyingTo, tweetQuotes } = await measureTime("getTweetStats", () => getTweetStats(tweet));
    await browser.pause(1000);
    const { isRegularPost, isMention, isQuote, isReply, setTargetUsername } = getInteractionInfo(textTweet, replyingTo, tweetQuotes);

    const objTweets = [
      tweetId, href, username, date, textTweet, replies, reposts, likes, isRegularPost.toString(), isMention.toString(), isQuote.toString(), isReply.toString(), setTargetUsername
    ];
    return objTweets;
  }

  return [];
}


/**
 * The function scrolls through the timeline, extracts tweets one by one,
 * and saves them to a CSV file and a JSON cache file.
 *
 * It checks for duplicates and skips already saved tweets.
 *
 * @param {number} tweetLimit - Total number of unique tweets to collect.
 */
async function runTweetScrapingLoops(tweetLimit: number) {
  const requestTweet: number = tweetLimit + (tweetLimit * 0.8);

  const indexDivisorTotal = Math.ceil(requestTweet / indexArticle);
  let currentRequestTweet = 0;

  try {
    loadTweetCache()
    for (let divisorIndex = 0; divisorIndex < indexDivisorTotal; divisorIndex++) {
      if (checkIfTweetLimitReached(tweetLimit)) {
        log("INFO", `✅ Tweet limit of ${tweetLimit} already reached. Skipping scraping.`);
        return;
      }
      if (lastIndexCount < 1) {
      await scrollByLastIndex()
      lastIndexCount++
    }

      for (let i = 1; i <= indexArticle; i++) {
        if (currentRequestTweet >= tweetLimit) break;
        if (checkIfTweetLimitReached(tweetLimit)) {
          log("INFO", `✅ Tweet limit of ${tweetLimit} reached during iteration ${i}. Stopping loop.`);
          break;
        }
        await handleSww()
        const swipeCheck = await swipeUpElDisplayed(`${keyElement("tweets:tweetArticles")}[${i}]`);
        if (swipeCheck !== '200') throw new Error("Tweet not found");
        if (i !== 0 && i % 4 === 0) await swipeUpwithTime(1)
        if (i === indexArticle) await swipeUpwithTime(1)
        // if (i === indexArticle) {
        //   await browser.pause(1000);
        //   await swipeUpIntoView(`${keyElement("tweets:tweetArticles")}[${i}]`)
        // }

        // Ambil data tweet
        const tweetData = await extractTweetDataAtIndex(i);

        log("INFO", `The scraper has run ${extractTweetCallCount} times.`)

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
        // await saveToJSON(tweetObject, globalVariables.scrapingReportsName);
        tweetCache.push(tweetObject);         // Tambah ke memori
        saveTweetCache();                     // Simpan ke file

        currentRequestTweet++;
      }
      // hasRunCollectOnce = true;
    }
  } catch (err: any) {
    log("ERROR", `An error occurred:, ${err.message}`)
    throw err;
  }
}


export { runTweetScrapingLoops }