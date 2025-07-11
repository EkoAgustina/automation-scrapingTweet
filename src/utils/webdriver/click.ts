import { log } from "../logger.ts";
import { findElement } from "./element.ts";


/**
 * Perform a click action on an element identified by the provided locator.
 * @param {string} locator - The locator string to identify the element to click.
 * @returns {Promise<void>} A promise that resolves when the click action is completed.
 */
async function actionClick(locator: string): Promise<void> {
  try {
    await (await findElement(locator)).isClickable()
    await (await findElement(locator)).click()
  } catch (err: unknown) {
    if (err instanceof Error) {
      log('error', 'An error occurred while trying to fill', { err: new Error(err.message) });
      throw err;
    } else {
      throw new Error("An unknown error occurred during click.");
    }
  }
}

export { actionClick };