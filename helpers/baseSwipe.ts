import {log} from "./baseScreen.ts"
import { browser} from '@wdio/globals'
import { findElement,elWaitForExistTweet } from "./baseScreen.ts"


/**
 * Scrolls up the screen until the element specified by the locator is displayed.
 * @param {string} locator - The locator of the element to check its display status.
 * @returns {Promise<void>} - A Promise that resolves after the element is displayed or if it's already displayed.
 */
async function swipeUpElDisplayed (locator:string) : Promise<string> {
    try {
        const windowSize = await browser.getWindowSize();
        const coordinateX = Math.round(windowSize.width * 0.2) 
        const coordinateY = Math.round(windowSize.height * 1.70)
        // const coordinateX = Math.round (windowSize.width * 0.2)
        // const coordinateY = Math.round(windowSize.height * 1.70)
        let attempts = 0;
        const maxAttempts = 13;

        while (!await (await findElement(locator)).isDisplayed() ) {
            await browser.scroll(coordinateX,coordinateY)
            log("INFO", `Swipe attempts: ${attempts}`);
            await browser.pause(1000);
            attempts++

            if (attempts >= maxAttempts) {
                // throw new Error(`${keyElement(locator)} not found, swipe up exceeded`)
                // console.error(`${keyElement(locator)} not found, swipe up exceeded`)
                console.error(`${locator} not found, swipe up exceeded`)
                return '404'
            }
        }

        // await scrollIntoView(locator)
        log("INFO", `${locator} found after ${attempts} swipes`);
        return '200'
    } catch (err:any) {
        log("ERROR", err.message)
        throw err
    }
}

async function swipeUpElDisplayedCustom (tweet: WebdriverIO.Element, locator:string) : Promise<string> {
    try {
        const windowSize = await browser.getWindowSize();
        const coordinateX = Math.round(windowSize.width * 0.2) 
        const coordinateY = Math.round(windowSize.height * 1.70)
        // const coπordinateX = Math.round (windowSize.width * 0.2)
        // const coordinateY = Math.round(windowSize.height * 1.70)
        let attempts = 0;
        const maxAttempts = 6;

        while (!await elWaitForExistTweet(tweet, locator) ) {
            await browser.scroll(coordinateX,coordinateY)
            log("INFO", `Swipe attempts: ${attempts}`);
            await browser.pause(1000);
            attempts++

            if (attempts >= maxAttempts) {
                // throw new Error(`${keyElement(locator)} not found, swipe up exceeded`)
                // console.error(`${keyElement(locator)} not found, swipe up exceeded`)
                console.error(`${locator} not found, swipe up exceeded`)
                return '404'
            }
        }

        // await scrollIntoView(locator)
        log("INFO", `${locator} found after ${attempts} swipes`);
        return '200'
    } catch (err:any) {
        log("ERROR", err.message)
        throw err
    }
}


async function swipeUpIntoView (locator:string) : Promise<string> {
    try {
       (await findElement(locator)).scrollIntoView()
        return '200'
    } catch (err:any) {
        log("ERROR", err.message)
        throw err
    }
}
/**
 * Simulates a swipe up action on the screen for a given duration.
 * @param {number} time - The duration of the swipe action, specified in the number of repetitions.
 */
async function swipeUpwithTime (duration:number) {
    const windowSize = await browser.getWindowSize();
    // const coordinateX = Math.round (windowSize.width * 0.2)
    // const coordinateY = Math.round(windowSize.height * 1.70)
    const coordinateX = Math.round (windowSize.width * 0.2)
    const coordinateY = Math.round(windowSize.height * 1.70)


    for (let i = 0; i < duration; i++) {
        await browser.scroll(coordinateX, coordinateY);
        await browser.pause(1000);
    }
}

export {swipeUpElDisplayed, swipeUpElDisplayedCustom, swipeUpwithTime, swipeUpIntoView };