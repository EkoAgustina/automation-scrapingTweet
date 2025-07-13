import { browser } from '@wdio/globals'
import { elWaitForExistTweet, findElement } from './element.ts';
import { log } from '../logger.ts';


/**
 * Scrolls up the screen until the element specified by the locator is displayed.
 * @param {string} locator - The locator of the element to check its display status.
 * @returns {Promise<void>} - A Promise that resolves after the element is displayed or if it's already displayed.
 */
export async function swipeUpElDisplayed(locator: string): Promise<string> {
    try {
        const windowSize = await browser.getWindowSize();
        const coordinateX = Math.round(windowSize.width * 0.2)
        const coordinateY = Math.round(windowSize.height * 1.70)
        let attempts = 0;
        const maxAttempts = 13;

        while (!await (await findElement(locator)).isDisplayed()) {
            await browser.scroll(coordinateX, coordinateY)
            log("info", `Swipe attempts: ${attempts}`);
            await browser.pause(1000);
            attempts++

            if (attempts >= maxAttempts) {
                log('warn', 'not found, swipe up exceeded', { err: locator});
                return '404'
            }
        }

        // await scrollIntoView(locator)
        log("info", `${locator} found after ${attempts} swipes`);
        return '200'
    } catch (err: any) {
        log('error', 'An error occurred while trying to swipe up until the element was found.', { err: new Error(err.message) });
        throw err
    }
}

export async function swipeUpElDisplayedCustom(tweet: WebdriverIO.Element, locator: string): Promise<string> {
    try {
        const windowSize = await browser.getWindowSize();
        const coordinateX = Math.round(windowSize.width * 0.2)
        const coordinateY = Math.round(windowSize.height * 1.70)
        let attempts = 0;
        const maxAttempts = 6;

        while (!await elWaitForExistTweet(tweet, locator)) {
            await browser.scroll(coordinateX, coordinateY)
            log("info", `Swipe attempts: ${attempts}`);
            await browser.pause(1000);
            attempts++

            if (attempts >= maxAttempts) {
                log('warn', 'Element not found, swipe up exceeded', { err: locator});
                return '404'
            }
        }

        // await scrollIntoView(locator)
        log("info", `${locator} found after ${attempts} swipes`);
        return '200'
    } catch (err: any) {
        log('error', 'An error occurred while trying to swipe up until the element was found.', { err: new Error(err.message) });
        throw err
    }
}


export async function swipeUpIntoView(locator: string): Promise<string> {
    try {
        (await findElement(locator)).scrollIntoView()
        return '200'
    } catch (err: any) {
        log('error', 'An error occurred while trying to swipe up until the element was found.', { err: new Error(err.message) });
        throw err
    }
}
/**
 * Simulates a swipe up action on the screen for a given duration.
 * @param {number} time - The duration of the swipe action, specified in the number of repetitions.
 */
export async function swipeUpwithTime(duration: number) {
    // const windowSize = await browser.getWindowSize();
    // const coordinateX = Math.round(windowSize.width * 0.2)
    // const coordinateY = Math.round(windowSize.height * 1.70)


    for (let i = 0; i < duration; i++) {
        // await browser.scroll(coordinateX, coordinateY);
        await browser.execute(() => {
  window.scrollBy(0, window.innerHeight * 0.9);
});

        await browser.pause(1000);
    }
}