import { keyElement } from "../utils/mapper.ts";
import { swipeUpElDisplayed, swipeUpwithTime, swipeUpElDisplayedCustom } from '../utils/webdriver/swipeActions.ts';
import { tweetGetText } from "../utils/webdriver/getText.ts";
import { actionClick } from "../utils/webdriver/click.ts";
import { log } from "../utils/logger.ts";
import { elWaitForExist, findElement } from "../utils/webdriver/element.ts";
import { pageLoad } from "../utils/webdriver/browser.ts";
import { convertDate } from "../utils/dateFormatter.ts";
import { measureTime } from "../utils/timer.ts";
import { saveToCSV } from "../utils/fileHandler.ts";
import globalVariables from "../../resources/globalVariable.ts";
import * as fs from 'fs';


interface TweetData {
  tweetId: string;
  href: string;
  username: string;
  date: string;
  textTweet: string;
  replies: string;
  reposts: string;
  likes: string;
  isRegularPost: boolean;
  isMention: boolean;
  mentionTo: string | null;
  isQuote: boolean;
  quoteTo: string | null;
  isReply: boolean;
  replyTo: string | null;
}

let extractTweetCallCount = 0;
const indexArticle = 11;
let lastIndexCount = 0
let tweetCache: any[] = [];

/**
 * Loads cached tweet data from a JSON file into memory.
 *
 * Used to avoid collecting duplicate tweets during the scraping process.
 */
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

/**
 * Saves the current tweet cache to a JSON file on disk.
 */
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

/**
 * Performs a calculated number of swipe-up gestures based on the tweet cache size.
 *
 * This function estimates how many times it should swipe up the timeline
 * to re-display previously collected tweets (based on a fixed `indexArticle` value).
 *
 * It runs only if the tweet cache contains 20 or more entries.
 * The number of swipes is reduced slightly (30%) from the total estimated divisor count.
 *
 * Between swipes, it pauses and handles potential "Something went wrong" (SWW) errors.
 */
async function swipeUpByLastIndex() {
  try {

    if (!Array.isArray(tweetCache)) {
      log("ERROR", "JSON file does not contain arrays")
      return false
    }

    if (tweetCache.length >= 20) {
      const divider = (tweetCache.length / indexArticle)
      const reducer = (30 / 100) * Math.ceil(divider);
      const lastIndex = Math.ceil(divider) - Math.ceil(reducer)
      log("INFO", `Swipe will be executed ${Math.ceil(lastIndex)} times`)
      for (let i=0; i < Math.ceil(lastIndex); i++) {
        await swipeUpwithTime(i)
        log("INFO", `Swipeup was done ${i} times.`)
        await browser.pause(5000);
        await handleSww()
      }
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

/**
 * Checks if the number of collected tweets has reached the specified maximum limit.
 *
 * This function compares the current length of the `tweetCache` array
 * with the `maxLength` parameter. It also updates global variables
 * (`tweetsCount` and `desiredTweets`) for external tracking purposes.
 *
 * @param {number} maxLength - The maximum number of tweets to collect.
 * @returns {boolean} - Returns true if the limit has been reached, false otherwise.
 */
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

/**
 * Checks whether a tweet with a given tweet ID already exists in the tweet cache.
 *
 * This function searches the `tweetCache` array to see if a tweet
 * with the provided `tweetId` has already been collected.
 *
 * @param {string} tweetId - The unique ID of the tweet to check.
 * @returns {string} - Returns "Tweet already exists" if found, or "Tweet not found" if it's new.
 */
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

/**
 * Handles the "Something went wrong" (SWW) state by retrying the action several times.
 *
 * This function checks whether a retry button (usually shown when Twitter fails to load content)
 * is visible. If it appears, it will attempt to click the retry button multiple times with
 * increasing delays in between retries to give the application time to recover.
 *
 * @throws {Error} - Throws an error when the maximum retry attempts are reached.
 */
async function handleSww() {
  const retryButton = keyElement("tweets:retryButton_sww")
  let attempts = 0;
  const maxAttempts = 7;
  try {
    if (await elWaitForExist(retryButton, 2500)) {
      while (await (await findElement(retryButton)).isDisplayed()) {
        if (attempts) {
          log("WARNING", `It has been attempted ${attempts} times, but the 'sww retry' keeps appearing. Please wait a moment...`)
          await browser.pause(180000); // three minutes
        } else if (attempts === 4) {
          log("WARNING", `It has been attempted ${attempts} times, but the 'sww retry' keeps appearing. Please wait a moment...`)
          await browser.pause(300000); // five minutes
        } else if (attempts === 5) {
          log("WARNING", `It has been attempted ${attempts} times, but the 'sww retry' keeps appearing. Please wait a moment...`)
          await browser.pause(480000); // eight minutes
        } else if (attempts === 6) {
          log("WARNING", `It has been attempted ${attempts} times, but the 'sww retry' keeps appearing. Please wait a moment...`)
          await browser.pause(600000);
        }
        await browser.pause(2000);
        await pageLoad(5)
        await actionClick(retryButton)
        await browser.pause(4000);
        attempts++

        if (attempts >= maxAttempts) {
          throw new Error(`Attempts exhausted! It has been tried ${attempts} times, but the 'sww retry' keeps appearing.`)
        }
      }
    }
  } catch (err: any) {
    log("ERROR", err.message)
    throw err
  }
}

/**
 * Extracts all Twitter usernames from a given tweet string.
 *
 * @param {string} tweet - The raw tweet text to extract usernames from.
 * @returns {string[]} - An array of usernames found in the tweet (e.g., ['@user1', '@user2']).
 */
function extractUsername(tweet: string): string[] {
  const usernameRegex = /@\w+/g;
  const usernames = tweet.match(usernameRegex);
  return usernames ? usernames : [];
}

/**
 * Safely retrieves text content from a specific selector inside a tweet element.
 *
 * @param {WebdriverIO.Element} tweet - The tweet WebdriverIO element containing the target.
 * @param {string} selector - The selector string to locate the element within the tweet.
 * @param {string} [fallback='0'] - A fallback value returned if the selector cannot be accessed.
 * @returns {Promise<string>} - The text content of the element or the fallback value.
 */
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

/**
 * Retrieves the tweet ID and full tweet URL (href) from a tweet element.
 *
 * This function locates the anchor tag containing `/status/` in the href attribute,
 * extracts the tweet ID from the URL, and returns both values.
 *
 * @param {WebdriverIO.Element} tweet - The WebdriverIO element representing a tweet container.
 * @returns {Promise<{ href: string; tweetId: string }>} - An object containing the tweet's href and its ID.
 * @throws {Error} - Throws if the tweet link cannot be found or loaded properly.
 */
async function getTweetId(tweet: WebdriverIO.Element) {
  const swipeTweetLink = await swipeUpElDisplayedCustom(tweet, `a[href*="/status/`)
  if (swipeTweetLink !== '200') throw new Error("Tweet not found");
  const tweetLink = await tweet.$('a[href*="/status/"]');
  const href = await tweetLink.getAttribute('href');
  const tweetId = href.split('/status/')[1];

  return { href, tweetId }
}

/**
 * Extracts the username, tweet text, and date from a tweet element.
 *
 * This function safely gets text content for the username, tweet body, and posting time
 * by targeting their respective selectors. It also performs a swipe check to ensure
 * the username element is visible before continuing.
 *
 * @param {WebdriverIO.Element} tweet - The WebdriverIO element representing a tweet container.
 * @returns {Promise<{ username: string; textTweet: string; date: string }>} - An object containing the tweet’s user, text, and formatted date.
 * @throws {Error} - Throws if the username element cannot be found or loaded.
 */
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

/**
 * Retrieves statistical information from a tweet element, such as replies, reposts, likes,
 * as well as any "replying to" or "quoted tweet" usernames.
 *
 * It uses the `getSafeText()` utility to ensure graceful handling of missing elements
 * and uses default fallbacks where needed.
 *
 * @param {WebdriverIO.Element} tweet - The WebdriverIO element representing a tweet container.
 */
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

/**
 * Determines the type of tweet interaction based on the content of the tweet,
 * including mentions, replies, and quotes.
 *
 * @param {string} posting - The main content of the tweet.
 * @param {string} replyingTo - The text indicating who the tweet is replying to (if any).
 * @param {string} tweetQuotes - The text of the quoted tweet (if any).
 */
function getInteractionInfo(posting: string, replyingTo: string, tweetQuotes: string) {
  const usernameMention = extractUsername(posting);
  const usernameReplyingTo = extractUsername(replyingTo);
  const usernameTweetQuotes = extractUsername(tweetQuotes);

  const hasMention = usernameMention.length > 0;
  const hasReply = usernameReplyingTo.length > 0;
  const hasQuote = usernameTweetQuotes.length > 0;

  const concatUsernames = (...usernames: string[][]) => usernames.flat().join(" ");

  let isMention = false;
  let isReply = false;
  let isQuote = false;
  let isRegularPost = false;

  let mentionTo = null;
  let replyTo = null;
  let quoteTo = null;

  if (hasMention && hasReply) {
    isMention = true;
    isReply = true;
    mentionTo = concatUsernames(usernameMention)
    replyTo = concatUsernames(usernameReplyingTo)
  } else if (hasMention && hasQuote) {
    isMention = true;
    isQuote = true;
    mentionTo = concatUsernames(usernameMention)
    quoteTo = concatUsernames(usernameTweetQuotes)
  } else if (hasQuote) {
    isQuote = true;
    quoteTo = concatUsernames(usernameTweetQuotes)
  } else if (hasReply) {
    isReply = true;
    replyTo = concatUsernames(usernameReplyingTo)
  } else if (hasMention) {
    isRegularPost = true;
    isMention = true;
    mentionTo = concatUsernames(usernameMention)
  } else {
    isRegularPost = true;
  }

  return {
    isRegularPost,
    isMention,
    mentionTo,
    isQuote,
    quoteTo,
    isReply,
    replyTo,
  };
}

/**
 * Extracts all relevant data from a single tweet at the specified index.
 *
 * This includes the tweet ID, URL, username, tweet body, posting date, interaction counts,
 * and metadata about whether it's a reply, quote, or mention.
 *
 * Performs checks for duplicate tweets, safely extracts data,
 * and ensures the tweet is visible before interacting.
 *
 * @param {number} index - The index of the tweet element to extract data from.
 * @returns {Promise<TweetData | null>} - A `TweetData` object if extraction is successful, or `null` if duplicate or failed.
 */
async function extractTweetDataAtIndex(index: number): Promise<TweetData | null> {
  const tweetArticles = await $$(`${keyElement("tweets:tweetArticles")}[${index}]`);
  extractTweetCallCount++;
  globalVariables.tweetCountCheck++;

  for (const tweet of tweetArticles) {
    const { href, tweetId } = await measureTime("getTweetId", () => getTweetId(tweet));
    if (checkDuplicateTweets(tweetId) === 'Tweet already exists') return null;

    const { username, textTweet, date } = await measureTime("getTweetTextData", () => getTweetTextData(tweet));
    if (!username || !textTweet) return null;

    const { replies, reposts, likes, replyingTo, tweetQuotes } = await measureTime("getTweetStats", () => getTweetStats(tweet));
    await browser.pause(1000);

    const {
      isRegularPost,
      isMention,
      mentionTo,
      isQuote,
      quoteTo,
      isReply,
      replyTo
    } = getInteractionInfo(textTweet, replyingTo, tweetQuotes);

    const objTweets: TweetData = {
      tweetId,
      href,
      username,
      date,
      textTweet,
      replies,
      reposts,
      likes,
      isRegularPost,
      isMention,
      mentionTo,
      isQuote,
      quoteTo,
      isReply,
      replyTo
    };

    return objTweets;
  }

  return null;
}


/**
 * Runs the main scraping loop to collect tweets up to a specified limit.
 *
 * It dynamically calculates how many tweet elements should be processed,
 * handles Twitter UI quirks like "something went wrong" screens, swipes,
 * duplicate detection, and persists results to both JSON and CSV files.
 *
 * @param {number} tweetLimit - The maximum number of tweets to scrape.
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
        await swipeUpByLastIndex()
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

        const tweetData = await extractTweetDataAtIndex(i);

        log("INFO", `The scraper has run ${extractTweetCallCount} times.`)

        if (!tweetData) continue;
        const csvRow = tweetData
          ? Object.values(tweetData)
            .map(v => `"${String(v).replace(/"/g, '""')}"`)
            .join(",")
          : "";

        const tweetObject = {
          tweet_id: tweetData.tweetId,
          href: tweetData.href,
          username: tweetData.username,
          date: tweetData.date,
          text_tweet: tweetData.textTweet,
          replies: +tweetData.replies,
          reposts: +tweetData.reposts,
          likes: +tweetData.likes,
          is_regular_post: tweetData.isRegularPost,
          is_mention: tweetData.isMention,
          mention_to: tweetData.mentionTo,
          is_quote: tweetData.isQuote,
          quote_to: tweetData.quoteTo,
          is_reply: tweetData.isReply,
          reply_to: tweetData.replyTo
        };
        tweetCache.push(tweetObject);
        saveTweetCache();
        await saveToCSV(csvRow, globalVariables.scrapingReportsName);

        currentRequestTweet++;
      }
    }
  } catch (err: any) {
    log("ERROR", `An error occurred:, ${err.message}`)
    throw err;
  }
}


export { runTweetScrapingLoops }