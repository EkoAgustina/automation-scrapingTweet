import { log } from "../logger.ts"

/**
 * Waits for the element specified by the locator to exist on the page.
 * If the element exists within the timeout period, it resolves; otherwise, it logs a warning and continues.
 * @param {string} locator - The locator of the element to wait for.
 * @returns {Promise<void>} - A Promise that resolves after the element exists or after the timeout.
 */
export async function elWaitForExist(locator: string, duration = 6500) {
  try {
    await browser.waitUntil(async () => {
      const el = await $(locator)
      return await el.isExisting()
    }, {
      timeout: duration,
      interval: 500, // lebih agresif polling tiap 250ms
      timeoutMsg: `Element ${locator} did not exist within ${duration}ms`,
    })

    await browser.waitUntil(async () => {
      const el = await $(locator);
      return await el.isDisplayed();
    }, {
      timeout: duration,
      interval: 500,
      timeoutMsg: `Element ${locator} did not become visible within ${duration}ms`,
    });
    return true
  } catch (err: any) {
    log('warn', 'An error occurred, the tweet object element does not exist in the DOM', { err: err.message })
    return false
  }
}

/**
 * Waits for a specific child element inside a tweet element to exist within the DOM.
 *
 * - Pauses the browser for 2 seconds before checking.
 * - Then attempts to locate the child element using the provided CSS/XPath selector.
 * - Waits up to 6.5 seconds for the element to exist.
 *
 * @async
 * @function elWaitForExistTweet
 * @param {WebdriverIO.Element} tweet - The root tweet element in which to search for the child element.
 * @param {string} locator - The selector string used to locate the target child element within the tweet.
 */
export async function elWaitForExistTweet(tweet: WebdriverIO.Element, locator: string, duration = 6500) {
  try {
    await browser.waitUntil(async () => {
      const el = await tweet.$(locator)
      return await el.isExisting()
    }, {
      timeout: duration,
      interval: 500, // lebih agresif polling tiap 250ms
      timeoutMsg: `Tweet element ${locator} did not exist within ${duration}ms`,
    })

    await browser.waitUntil(async () => {
      const el = await tweet.$(locator)
      return await el.isDisplayed();
    }, {
      timeout: duration,
      interval: 500,
      timeoutMsg: `Tweet element ${locator} did not become visible within ${duration}ms`,
    });
    return true
  } catch (err: any) {
    log('warn', 'An error occurred, the tweet object element does not exist in the DOM', { err: err.message })
    return false
  }
}


/**
 * Find an element based on the provided locator.
 * @param {string} locator - The locator string to identify the element.
 * @returns {WebdriverIO.Element} The found element.
 */
export const findElement = async (locator: string): Promise<WebdriverIO.Element> => {
  return new Promise((resolve, reject) => {
    Promise.all([
      elWaitForExist(locator),
      $(locator)
    ])
      .then((element) => {
        resolve(element[1])
      })
      .catch((err) => {
        reject(err)
      })
  })
}