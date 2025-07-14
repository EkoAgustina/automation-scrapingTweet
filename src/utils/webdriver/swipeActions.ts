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
                log('warn', 'not found, swipe up exceeded', { err: locator });
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

// export async function swipeUpElDisplayedCustom(tweet: WebdriverIO.Element, locator: string): Promise<string> {
//     try {
//         const windowSize = await browser.getWindowSize();
//         const coordinateX = Math.round(windowSize.width * 0.2)
//         const coordinateY = Math.round(windowSize.height * 1.70)
//         let attempts = 0;
//         const maxAttempts = 6;

//         while (!await elWaitForExistTweet(tweet, locator)) {
//             await browser.scroll(coordinateX, coordinateY)
//             log("info", `Swipe attempts: ${attempts}`);
//             await browser.pause(1000);
//             attempts++

//             if (attempts >= maxAttempts) {
//                 log('warn', 'Element not found, swipe up exceeded', { err: locator });
//                 return '404'
//             }
//         }

//         // await scrollIntoView(locator)
//         log("info", `${locator} found after ${attempts} swipes`);
//         return '200'
//     } catch (err: any) {
//         log('error', 'An error occurred while trying to swipe up until the element was found.', { err: new Error(err.message) });
//         throw err
//     }
// }
// export async function swipeUpElDisplayedCustom(tweet: WebdriverIO.Element, locator: string): Promise<string> {
//     try {
//         const windowSize = await browser.getWindowSize();
//         const coordinateX = Math.round(windowSize.width * 0.2)
//         const coordinateY = Math.round(windowSize.height * 1.70)
//         let attempts = 0;
//         const maxAttempts = 6;

//         while (!await elWaitForExistTweet(tweet, locator)) {
//             await browser.scroll(coordinateX, coordinateY)
//             log("info", `Swipe attempts: ${attempts}`);
//             await browser.pause(1000);
//             attempts++

//             if (attempts >= maxAttempts) {
//                 log('warn', 'Element not found, swipe up exceeded', { err: locator });
//                 return '404'
//             }
//         }

//         // await scrollIntoView(locator)
//         log("info", `${locator} found after ${attempts} swipes`);
//         return '200'
//     } catch (err: any) {
//         log('error', 'An error occurred while trying to swipe up until the element was found.', { err: new Error(err.message) });
//         throw err
//     }
// }
export async function scrollUntilElementVisible(tweet: WebdriverIO.Element, locator: string, scrollRatio = 0.9, maxScrolls = 8, waitPerScroll = 1500): Promise<boolean> {
    for (let i = 0; i < maxScrolls; i++) {
        const isVisible = await elWaitForExistTweet(tweet, locator)

        if (isVisible) {
            log('info', `✅ Element "${locator}" found on attempt ${i + 1}`);
            return true;
        }

        // Scroll ke bawah
        await browser.execute((ratio) => {
            window.scrollBy(0, window.innerHeight * ratio);
        }, scrollRatio);

        // Tunggu sebelum scroll lagi
        await browser.pause(waitPerScroll);
    }

    log('warn', `⚠️ Element "${locator}" not found after ${maxScrolls} scrolls.`);
    return false;
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
export async function scrollPageDownTimes(duration: number, scrollRatio: number = 0.9) {
    for (let i = 0; i < duration; i++) {
        await browser.execute((ratio) => {
            window.scrollBy(0, window.innerHeight * ratio);
        }, scrollRatio); 

        await browser.pause(1000);
    }
}

export async function smartScrollUntilNewTweetFound(maxRetries = 12, pause = 2500) {
    try {
        let lastHref = "";
        let retries = 0;
        let differentHrefCount = 0;

        for (; ;) {
            const tweets = await $$('article');
            if (!tweets.length) break;

            const last = tweets[tweets.length - 1];
            await last.scrollIntoView();
            await browser.pause(pause);

            const swipeTweetLink = await scrollUntilElementVisible(last, `a[href*="/status/`,0.5)
            if (!swipeTweetLink) throw new Error("href not found");
            const linkEl = await last.$('a[href*="/status/"]');
            const href = await linkEl?.getAttribute('href');

            if (!href) {
                log("warn", `Failed to fetch href. Stop`);
                break;
            }

            // 🔁 Iterasi pertama
            if (!lastHref) {
                lastHref = href;
                log("info", `Initialize first href: ${href}`);
                continue;
            }

            // 🔍 Ada perubahan tweet
            if (href !== lastHref) {
                differentHrefCount++;
                log("info", `New tweet found: ${href} ≠ ${lastHref} → change ${differentHrefCount}`);
                if (differentHrefCount >= 2) break;
            } else {
                // 🔁 Masih tweet yang sama
                retries++;
                log("info", `Tweet still the same (${href}) → retry to-${retries}`);
                if (retries >= maxRetries) {
                    // log("error", `No new tweets after ${maxRetries} scrolls. Stop.`);
                    throw new Error(`No new tweets after ${maxRetries} scrolls. Stop.`)
                }
                await browser.pause(pause);
            }

            // ✅ Update terakhir, selalu dilakukan
            lastHref = href;
        }
    } catch (err: any) {
        log('error', 'An error occurred while trying smartScrollUntilNewTweetFound', { err: new Error(err.message) });
        throw err
    }

}


