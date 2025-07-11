import { convertDate } from "../utils/dateFormatter.ts";
import { log } from "../utils/logger.ts";
import { keyElement } from "../utils/mapper.ts";
import { actionGetText, tweetGetText } from "../utils/webdriver/getText.ts";
import { swipeUpElDisplayedCustom, swipeUpwithTime } from "../utils/webdriver/swipeActions.ts";
import { checkDuplicateTweets, checkDuplicateUsernameProfile, extractUsername, handleSww, tweetCache } from "./tweetUtils.ts";
import globalVariables from "../../resources/globalVariable.ts";
import { measureTime } from "../utils/timer.ts";
import { elWaitForExist, findElement } from "../utils/webdriver/element.ts";

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
export async function swipeUpByLastIndex(indexArticle: number) {
  try {

    if (!Array.isArray(tweetCache)) {
      log('error', 'An error occurred while initializing browser');
      return false
    }

    if (tweetCache.length >= 20) {
      const divider = (tweetCache.length / indexArticle)
      const reducer = (30 / 100) * Math.ceil(divider);
      const lastIndex = Math.ceil(divider) - Math.ceil(reducer)
      log("info", `Swipe will be executed ${Math.ceil(lastIndex)} times`)
      for (let i = 0; i < Math.ceil(lastIndex); i++) {
        await swipeUpwithTime(i)
        log("info", `Swipeup was done ${i} times.`)
        await browser.pause(5000);
        await handleSww()
      }
      return true
    } else {
      log("warn", `Not running swipe last index`)
      return false
    }
  } catch (err: any) {
    log('error', 'An error occurred while trying to swipe up to the last index.', { err: new Error(err.message) });
    return false
  }
}

/**
 * Safely retrieves text content from a specific selector inside a tweet element.
 *
 * @param {WebdriverIO.Element} tweet - The tweet WebdriverIO element containing the target.
 * @param {string} selector - The selector string to locate the element within the tweet.
 * @param {string} [fallback='0'] - A fallback value returned if the selector cannot be accessed.
 * @returns {Promise<string>} - The text content of the element or the fallback value.
 */
export async function getSafeText(tweet: WebdriverIO.Element, selector: string, fallback = '0'): Promise<string> {
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
export async function getTweetId(tweet: WebdriverIO.Element) {
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
export async function getTweetStats(tweet: WebdriverIO.Element) {
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
export function getInteractionInfo(posting: string, replyingTo: string, tweetQuotes: string) {
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
 * This includes the tweet ID, URL, username, tweet body, posting `date`, interaction counts,
 * and metadata about whether it's a reply, quote, or mention.
 *
 * Performs checks for duplicate tweets, safely extracts data,
 * and ensures the tweet is visible before interacting.
 *
 * @param {number} index - The index of the tweet element to extract data from.
 * @returns {Promise<TweetData | null>} - A `TweetData` object if extraction is successful, or `null` if duplicate or failed.
 */
export async function extractTweetDataAtIndex(index: number): Promise<TweetData | null> {
  const tweetArticles = await $$(`${keyElement("tweets:tweetArticles")}[${index}]`);
  //   extractTweetCallCount++;
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

async function checkIfVerified(verifiedEl: string): Promise<boolean> {
  if (!await elWaitForExist(verifiedEl)) return false;
  const el = await findElement(verifiedEl);
  return await el.isDisplayed();
}


export async function fetchProfileElementsData() {
  const [loadPostsCount, joined, following, follower, verified] = await Promise.all([
    actionGetText(keyElement("tweets:profile_posts")),
    actionGetText(keyElement("tweets:profile_joined")),
    actionGetText(keyElement("tweets:profile_following")),
    actionGetText(keyElement("tweets:profile_followers")),
    checkIfVerified(keyElement("tweets:profile_verified"))
  ])
  const postsCount = loadPostsCount.replace(" posts", "");
  return {
    postsCount,
    joined,
    following,
    follower,
    verified
  }
}

export async function extractProfileDataAtIndex(username: string) {
  try {
    if (checkDuplicateUsernameProfile(username) === 'Username already exists') return null;
    const { postsCount, joined, following, follower, verified } = await measureTime("getTweetStats", () => fetchProfileElementsData())
    const objProfile = {
      postsCount, joined, following, follower, verified
    }
    return objProfile
  } catch (err: any) {
    log('error', 'An error occurred', { err: new Error(err.message) });
    throw err;
  }

}