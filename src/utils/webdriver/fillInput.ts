import { log } from "../logger.ts";
import { parseTestData } from "../mapper.ts"
import { findElement } from "./element.ts";

/**
 * Fill an input element identified by the provided locator with the specified data.
 * @param {string} locator - The locator string to identify the element to fill.
 * @param {string} test_data - The data to input into the element.
 * @returns {Promise<void>} A promise that resolves when the fill action is completed.
 */
export async function actionFill(locator: string, test_data: string): Promise<void> {
    try {
        for (const char of parseTestData(test_data)) {
            await (await findElement(locator)).addValue(char);
        }
    } catch (err: any) {
        log("ERROR", err.message)
        throw err
    }
}