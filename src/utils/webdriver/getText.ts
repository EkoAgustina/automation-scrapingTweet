import { log } from "../logger.ts";
import { elWaitForExistTweet, findElement } from "./element.ts";
import { scrollUntilElementVisible } from "./swipeActions.ts";



/**
 * Retrieve the text content of an element identified by the provided locator.
 * @param {string} locator - The locator string to identify the element.
 * @returns {Promise<string>} A promise that resolves with the text content of the element.
 * @throws {Error} If the text content is empty or null.
 */
// export async function actionGetText(locator: string): Promise<string> {
//   try {
//     const textValue = await (await findElement(locator)).getText()

//     if (textValue === '' || textValue === null) {
//       throw new Error(`Cannot get text on element '${locator}'`);
//     } else {
//       log("info", textValue)
//       return textValue;
//     }
//   } catch (err: any) {
//     log('error', 'An error occurred while trying to get text from object tweet', { err: new Error(err.message) });
//     throw err
//   }
// }
export async function actionGetText(locator: string): Promise<string> {
  try {
    let attempts = 0;
    let textValue: string | null = null;

    while (attempts < 5) {
      const element = await findElement(locator);
      textValue = await element.getText();

      if (textValue && textValue.trim() !== '') {
        log("info", `✅ Retrieved text: "${textValue}"`);
        return textValue;
      }

      log("warn", `⚠️ Empty text attempt ${attempts + 1} for locator: ${locator}`);
      await browser.pause(1000);

      if (attempts === 3) {
        log("warn", `♻️ Attempt ${attempts + 1}: refreshing page for locator: ${locator}`);
        await browser.refresh();
        log("info", `🔄 Page refreshed after ${attempts + 1} failed attempts`);
      }

      attempts++;
    }

    throw new Error(`❌ Failed to get non-empty text from element '${locator}' after ${attempts} attempts`);
  } catch (err: any) {
    log('error', 'An error occurred while trying to get text from object tweet', { err: new Error(err.message) });
    throw err;
  }
}


/**
 * Attempts to retrieve the text content of a child element within a tweet element.
 *
 * @param tweet - The WebdriverIO tweet element that contains the target child element.
 * @param locator - A selector string to locate the specific element inside the tweet.
 * @returns The trimmed text content if found and non-empty.
 * @throws Will throw an error if the element does not exist or contains no readable text.
 */
export async function tweetGetText(tweet: WebdriverIO.Element, locator: string) {
  try {
    const elWaitForExist = await elWaitForExistTweet(tweet, locator)
    if (elWaitForExist) {
      const textValue = await (await tweet.$(locator)).getText()
      if (textValue === '' || textValue === null) {
        throw new Error(`Cannot get text on element '${locator}'`);
      } else if (!textValue || textValue.trim() === '') {
        throw new Error(`Cannot get text on element '${locator}'`);
      }

      else {
        log("info", textValue)
        return textValue.trim();
      }
    }
  } catch (err: any) {
    log('error', 'An error occurred while trying to get text from object tweet', { err: new Error(err.message) });
    throw err
  }
}

export async function ensureAndGetText(tweet: WebdriverIO.Element, selector: string, errorMsg: string): Promise<string> {
  const elWait = await elWaitForExistTweet(tweet, selector);
  
  if (!elWait) {
    const status = await scrollUntilElementVisible(tweet, selector, 0.7);
    if (!status) {
      const outerHTML = await tweet.getHTML();
      log("info", `Tweet outerHTML: ${outerHTML}`);
      throw new Error(errorMsg);
    }
  }

  const text = await tweetGetText(tweet, selector);
  return text?.trim() || '';
}

export async function ensureTweetId(tweet: WebdriverIO.Element, selector: string, errorMsg: string): Promise<boolean> {
  const elWait = await elWaitForExistTweet(tweet, selector);
  
  if (!elWait) {
    const status = await scrollUntilElementVisible(tweet, selector, 0.7);
    if (!status){
      const outerHTML = await tweet.getHTML();
      log("info", `Tweet outerHTML: ${outerHTML}`);
      throw new Error(errorMsg);
    } 
  }

  return true;
}
