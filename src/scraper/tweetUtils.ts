import * as fs from 'fs';
import globalVariables from "../../resources/globalVariable.ts";
import { log } from "../utils/logger.ts";
import { keyElement } from '../utils/mapper.ts';
import { elWaitForExist, findElement } from '../utils/webdriver/element.ts';
import { pageLoad } from '../utils/webdriver/browser.ts';
import { actionClick } from '../utils/webdriver/click.ts';
import path from 'path';


export let tweetCache: any[] = [];
export let tweetProfilieCache: any[] = [];
/**
 * Loads cached tweet data from a JSON file into memory.
 *
 * Used to avoid collecting duplicate tweets during the scraping process.
 */
export function loadTweetCache() {
  try {
    // const rawData = fs.readFileSync(`reporter/${globalVariables.scrapingReportsName}.json`, 'utf-8');
    const rawData = fs.readFileSync(`reporter/${globalVariables.scrapingReportsName}/${globalVariables.scrapingReportsName}.json`, 'utf-8');
    const data = JSON.parse(rawData);
    tweetCache = Array.isArray(data) ? data : [];
    log("info", `✅ Loaded ${tweetCache.length} tweets from cache`);
  } catch (err: any) {
    tweetCache = [];
    log("warn", `Could not load tweet cache: ${err.message}`);
  }
}

export function loadProfileTweetCache() {
  try {
    const rawData = fs.readFileSync(`reporter/${globalVariables.scrapingReportsName}/${globalVariables.scrapingReportsName}_metadata.json`, 'utf-8');
    const data = JSON.parse(rawData);
    tweetProfilieCache = Array.isArray(data) ? data : [];
    log("info", `✅ Loaded ${tweetProfilieCache.length} tweets from cache`);
  } catch (err: any) {
    tweetProfilieCache = [];
    log("warn", `Could not load profile tweet cache: ${err.message}`);
  }
}

/**
 * Saves the current tweet cache to a JSON file on disk.
 */
export function saveTweetCache() {
  const dirPath = path.resolve('reporter', globalVariables.scrapingReportsName);
  const filePath = path.join(dirPath, `${globalVariables.scrapingReportsName}.json`);

  try {
    // Buat folder jika belum ada
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    // Tulis file JSON
    fs.writeFileSync(filePath, JSON.stringify(tweetCache, null, 2));
    log("info", "✅ Tweet cache saved to file");
  } catch (err: any) {
    log('error', 'Failed to save tweet cache', { err: new Error(err.message) });
    throw err;
  }
}

export function saveProfileTweetCache() {
  const dirPath = path.resolve('reporter', globalVariables.scrapingReportsName);
  const filePath = path.join(dirPath, `${globalVariables.scrapingReportsName}_metadata.json`);
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }

    fs.writeFileSync(filePath, JSON.stringify(tweetProfilieCache, null, 2));
    log("info", "✅ Profile tweet cache saved to file");
  } catch (err: any) {
    log('error', 'Failed to save profile tweet cache', { err: new Error(err.message) });
    throw err;
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
export function checkIfTweetLimitReached(maxLength: number): boolean {
  const currentCount = tweetCache.length;
  globalVariables.tweetsCount = currentCount + 1;
  globalVariables.desiredTweets = maxLength;

  if (currentCount >= maxLength) {
    log("info", `[${globalVariables.scenarioName}] Tweets collected have reached ${maxLength}`);
    return true;
  } else {
    log("info", `[${globalVariables.scenarioName}] Tweets collected: ${currentCount}/${maxLength}`);
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
export function checkDuplicateTweets(tweetId: string) {
  const found = tweetCache.some((item: any) => item.tweet_id === tweetId);
  if (found) {
    if (globalVariables.tweetCountCheck !== 0) {
      log('warn', `[${globalVariables.scenarioName}] [${globalVariables.tweetCountCheck}] Tweet already exists, ${tweetId}`);
    }
    return 'Tweet already exists';
  }
  return 'Tweet not found';
}

export function checkDuplicateUsernameProfile(username: string) {
  const found = tweetProfilieCache.some((item: any) => item.username === username);
  if (found) {
    log('warn', `[${globalVariables.scenarioName}] Username already exists, ${username}`);
    return 'Username already exists';
  }
  return 'Username not found';
}

/**
 * Extracts all Twitter usernames from a given tweet string.
 *
 * @param {string} tweet - The raw tweet text to extract usernames from.
 * @returns {string[]} - An array of usernames found in the tweet (e.g., ['@user1', '@user2']).
 */
export function extractUsername(tweet: string): string[] {
  const usernameRegex = /@\w+/g;
  const usernames = tweet.match(usernameRegex);
  return usernames ? usernames : [];
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
// export async function handleSww() {
//   const retryButton = keyElement("tweets:retryButton_sww")
//   let attempts = 0;
//   const maxAttempts = 7;
//   try {
//     if (await elWaitForExist(retryButton, 2500)) {
//       while (await (await findElement(retryButton)).isDisplayed()) {
//         if (attempts) {
//           log("warn", `It has been attempted ${attempts} times, but the 'sww retry' keeps appearing. Please wait a moment...`)
//           await browser.pause(180000); // three minutes
//         } else if (attempts === 4) {
//           log("warn", `It has been attempted ${attempts} times, but the 'sww retry' keeps appearing. Please wait a moment...`)
//           await browser.pause(300000); // three minutes
//           sleep(300)
//         } else if (attempts === 5) {
//           log("warn", `It has been attempted ${attempts} times, but the 'sww retry' keeps appearing. Please wait a moment...`)
//           await browser.pause(480000);
//         } else if (attempts === 6) {
//           log("warn", `It has been attempted ${attempts} times, but the 'sww retry' keeps appearing. Please wait a moment...`)
//           await browser.pause(600000);
//         }
//         await browser.pause(2000);
//         await pageLoad(5)
//         await actionClick(retryButton)
//         await browser.pause(2000);
//         attempts++

//         if (attempts >= maxAttempts) {
//           throw new Error(`Attempts exhausted! It has been tried ${attempts} times, but the 'sww retry' keeps appearing.`)
//         }
//       }
//     }
//   } catch (err: any) {
//     log('error', 'An error occurred while trying to handle sww', { err: new Error(err.message) });
//     throw err
//   }
// }
export async function handleSww() {
  const retryButton = keyElement("tweets:retryButton_sww")
  let attempts = 0;
  const maxAttempts = 5;
  try {
    if (await elWaitForExist(retryButton, 1500)) {
      // }
      const waitTimes = [180000, 180000, 300000, 480000, 600000]; // Total 27 menit!

      for (const waitTime of waitTimes) {
        if (await (await findElement(retryButton)).isDisplayed()) {
          log("warn", `Retry button still visible. Waiting for ${waitTime / 60000} minutes...`);
          await browser.pause(waitTime);
          await actionClick(retryButton);
          await browser.pause(2000);
          await pageLoad(5);
          attempts++;
        }
        if (attempts >= maxAttempts) {
          throw new Error(`Attempts exhausted after ${attempts} tries.`);
        }
      }

    }
  } catch (err: any) {
    log('error', 'An error occurred while trying to handle sww', { err: new Error(err.message) });
    throw err
  }
}