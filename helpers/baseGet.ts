import { findElement, log } from "./baseScreen.ts";


/**
 * Retrieve the text content of an element identified by the provided locator.
 * @param {string} locator - The locator string to identify the element.
 * @returns {Promise<string>} A promise that resolves with the text content of the element.
 * @throws {Error} If the text content is empty or null.
 */
async function actionGetText (locator:string): Promise<string> {
  try {
    const textValue = await (await findElement(locator)).getText()
  
    if (textValue === '' || textValue === null) {
      throw new Error(`Cannot get text on element '${locator}'`);
    } else {
      log("INFO", textValue)
      return textValue;
    }
  } catch (err:any) {
    log("ERROR", err.message)
    throw err
  }
}
  
  export { actionGetText };