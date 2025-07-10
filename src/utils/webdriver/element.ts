import { log } from "../logger.ts"

/**
 * Waits for the element specified by the locator to exist on the page.
 * If the element exists within the timeout period, it resolves; otherwise, it logs a warning and continues.
 * @param {string} locator - The locator of the element to wait for.
 * @returns {Promise<void>} - A Promise that resolves after the element exists or after the timeout.
 */
export async function elWaitForExist(locator: string, duration = 6500) {
  try {
    await $(locator).waitForExist({ timeout: duration })
    return true
  } catch (err) {
    log('WARNING', (err as Error).message)
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
export async function elWaitForExistTweet(tweet: WebdriverIO.Element, locator: string) {
  try {
    await browser.pause(2000)
    await (await tweet.$(locator)).waitForExist({ timeout: 6500 })
    return true
  } catch (err) {
    log('WARNING', (err as Error).message)
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
        log("INFO", locator)
        resolve(element[1])
      })
      .catch((err) => {
        reject(err)
      })
  })
}