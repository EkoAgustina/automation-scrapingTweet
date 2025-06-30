import {findElement, log} from "./baseScreen.ts"
import { parseTestData } from "../mappings/mapper.ts"

/**
 * Fill an input element identified by the provided locator with the specified data.
 * @param {string} locator - The locator string to identify the element to fill.
 * @param {string} test_data - The data to input into the element.
 * @returns {Promise<void>} A promise that resolves when the fill action is completed.
 */
async function actionFill(locator: string, test_data: string): Promise<void> {
    try {
        // await (await findElement(locator)).setValue(parseTestData(test_data));
        for (const char of parseTestData(test_data)) {
            await (await findElement(locator)).addValue(char);
            //await browser.pause(1); // Pause 100ms antara tiap karakter untuk simulasi pengetikan
          }
    } catch (err:any) {
        log("ERROR", err.message)
        throw err
    }
}

export {actionFill}