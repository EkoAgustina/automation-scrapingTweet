import { saveToCSV } from "../utils/fileHandler.ts";
import { log } from "../utils/logger.ts";
import globalVariables from "../../resources/globalVariable.ts";
import { checkDuplicateUsernameProfile, checkIfTweetLimitReached, checkTweetDate, handleSww, loadProfileTweetCache, loadTweetCache, saveProfileTweetCache, saveTweetCache, tweetCache, tweetProfilieCache, waitForProfileTitle } from "./tweetUtils.ts";
import { extractProfileDataAtIndex, extractTweetDataAtIndex, swipeUpByLastIndex } from "./tweetExtractors.ts";
import { baseOpenBrowser, pageLoad } from "../utils/webdriver/browser.ts";
import { scrollPageDownTimes } from "../utils/webdriver/swipeActions.ts";

export const indexArticle = 15;
let lastIndexCount = 0

/**
 * Runs the main scraping loop to collect tweets up to a specified limit.
 *
 * It dynamically calculates how many tweet elements should be processed,
 * handles Twitter UI quirks like "something went wrong" screens, swipes,
 * duplicate detection, and persists results to both JSON and CSV files.
 *
 * @param {number} tweetLimit - The maximum number of tweets to scrape.
 */
export async function runTweetScrapingLoops(tweetLimit: number) {
  const requestTweet: number = tweetLimit + (tweetLimit * 1.8);

  const indexDivisorTotal = Math.ceil(requestTweet / indexArticle);
  let currentRequestTweet = 0;

  try {
    loadTweetCache()
    for (let divisorIndex = 0; divisorIndex <= indexDivisorTotal; divisorIndex++) {
      if (checkIfTweetLimitReached(tweetLimit)) {
        log("info", `✅ Tweet limit of ${tweetLimit} already reached. Skipping scraping.`);
        return;
      }
      if (lastIndexCount < 1) {
        await swipeUpByLastIndex(indexArticle)
        lastIndexCount++
      }

      for (let i = 1; i <= indexArticle; i++) {
        if (currentRequestTweet >= tweetLimit) break;
        if (checkIfTweetLimitReached(tweetLimit)) {
          log("info", `✅ Tweet limit of ${tweetLimit} reached during iteration ${i}. Stopping loop.`);
          break;
        }
        await handleSww()
        if (i === indexArticle || i === 7) await scrollPageDownTimes(1,0.9)
        const tweetData = await extractTweetDataAtIndex(i);

        log("info", `The scraper has run ${globalVariables.tweetCountCheck} times.`)

        if (!tweetData) continue;
        const csvRow = tweetData
          ? Object.values(tweetData)
            .map(v => `"${String(v).replace(/"/g, '""')}"`)
            .join(",")
          : "";
        
        if (checkTweetDate(tweetData.date)) {
          return;
        }

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
        await saveToCSV(csvRow, globalVariables.scrapingReportsName, 'tweetData');

        currentRequestTweet++;
      }
    }
  } catch (err: any) {
    log('error', 'An error occurred', { err: new Error(err.message) });
    throw err;
  }
}

export async function runScrapingLoopsProfilesLoops() {
  try {
    loadProfileTweetCache()
    const loadUsername: any[] = tweetCache.map(tweet => tweet.username);
    for (const [index, username] of loadUsername.entries()) {
      if (checkDuplicateUsernameProfile(username) === 'Username already exists') continue;

      // Refresh session setiap 20 kali
      if (index > 0 && index % 20 === 0) {
        log("info", "🔄 Refreshing browser session to avoid timeout/memory issues...");
        await browser.reloadSession();
        await browser.pause(2000); // beri waktu sedikit
      }

      await baseOpenBrowser(`https://x.com/${username}`, false)
      await browser.pause(1000);
      await pageLoad(5);
      await browser.pause(1000);

       const title = await browser.getTitle();
      if (!title.includes(username)) {
        await waitForProfileTitle(username)
      }

      const loadProfileData = await extractProfileDataAtIndex()
      if (!loadProfileData) continue;
      const profileData = {
        username,
        ...loadProfileData
      }

      const csvRow = profileData
        ? Object.values(profileData)
          .map(v => `"${String(v).replace(/"/g, '""')}"`)
          .join(",")
        : "";

      const profileObj = {
        username: profileData.username,
        posts_count: profileData.postsCount,
        joined: profileData.joined,
        following: profileData.following,
        follower: profileData.follower,
        verified: profileData.verified
      }
      tweetProfilieCache.push(profileObj)
      saveProfileTweetCache()
      await saveToCSV(csvRow, globalVariables.scrapingReportsName, 'metaData');
      await browser.pause(500);
    }
  } catch (err: any) {
    log('error', 'An error occurred', { err: new Error(err.message) });
    throw err
  }

}