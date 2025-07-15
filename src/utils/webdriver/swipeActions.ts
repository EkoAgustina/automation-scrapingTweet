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
export async function scrollUntilElementVisible(tweet: WebdriverIO.Element, locator: string, scrollRatio = 0.9, maxScrolls = 10,): Promise<boolean> {
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

// export async function smartScrollUntilNewTweetFound(maxRetries = 12, pause = 2500) {
//     try {
//         let lastHref = "";
//         let retries = 0;
//         let differentHrefCount = 0;

//         for (; ;) {
//             const tweets = await $$('article');
//             if (!tweets.length) break;

//             const last = tweets[tweets.length - 1];
//             await last.scrollIntoView();
//             await browser.pause(pause);

//             const swipeTweetLink = await scrollUntilElementVisible(last, `a[href*="/status/`,0.5)
//             if (!swipeTweetLink) throw new Error("href not found");
//             const linkEl = await last.$('a[href*="/status/"]');
//             const href = await linkEl?.getAttribute('href');

//             if (!href) {
//                 log("warn", `Failed to fetch href. Stop`);
//                 break;
//             }

//             // 🔁 Iterasi pertama
//             if (!lastHref) {
//                 lastHref = href;
//                 log("info", `Initialize first href: ${href}`);
//                 continue;
//             }

//             // 🔍 Ada perubahan tweet
//             if (href !== lastHref) {
//                 differentHrefCount++;
//                 log("info", `New tweet found: ${href} ≠ ${lastHref} → change ${differentHrefCount}`);
//                 break;
//             } else {
//                 // 🔁 Masih tweet yang sama
//                 retries++;
//                 log("info", `Tweet still the same (${href}) → retry to-${retries}`);
//                 if (retries >= maxRetries) {
//                     // log("error", `No new tweets after ${maxRetries} scrolls. Stop.`);
//                     throw new Error(`No new tweets after ${maxRetries} scrolls. Stop.`)
//                 }
//                 await browser.pause(pause);
//             }

//             // ✅ Update terakhir, selalu dilakukan
//             lastHref = href;
//         }
//     } catch (err: any) {
//         log('error', 'An error occurred while trying smartScrollUntilNewTweetFound', { err: new Error(err.message) });
//         throw err
//     }

// }


// export async function smartScrollUntilNewTweetFound(maxRetries = 12, pause = 2500) {
//   try {
//     let lastHref = "";
//     let retries = 0;

//     for (; ;) {
//       const tweets = await $$('article');
//       if (!tweets.length) {
//         log("warn", "❌ No tweets found on page.");
//         break;
//       }

//       // Scroll smooth ke bawah
//       await browser.execute(() => {
//         window.scrollBy(0, window.innerHeight * 0.9);
//       });

//       await browser.pause(pause);

//       // Ambil 3 tweet terakhir
//       const last3Tweets = tweets.slice(-6);

//       // Ambil semua href dari 3 tweet terakhir dengan polling agar stabil
//       const hrefs = await Promise.all(last3Tweets.map(async (tweet, index) => {
//         let href = "";
//         for (let i = 0; i < 5; i++) {
//           await browser.pause(1500);
//           const swipeTweetLink = await scrollUntilElementVisible(tweet, `a[href*="/status/`,0.5)
//           if (!swipeTweetLink) throw new Error("href not found");
//           const a = await tweet.$('a[href*="/status/"]');
//           href = await a?.getAttribute('href') || "";
//           if (href) break;
//           await browser.pause(300);
//         }
//         log("info", `Tweet [${index}]: ${href}`);
//         return href;
//       }));

//       const newHref = hrefs.find(h => h && h !== lastHref);

//       if (!lastHref) {
//         // Iterasi pertama → inisialisasi
//         lastHref = hrefs[0] || "";
//         log("info", `🔰 Initialize href: ${lastHref}`);
//         continue;
//       }

//       if (newHref) {
//         log("info", `✅ New tweet found: ${newHref} ≠ ${lastHref}`);
//         break;
//       } else {
//         retries++;
//         log("info", `🔁 Still same tweets, retry #${retries}`);
//         if (retries >= maxRetries) {
//           throw new Error(`🚫 No new tweets after ${maxRetries} scroll attempts.`);
//         }
//         await browser.pause(pause);
//       }

//       // Update href terakhir (gunakan yang pertama kalau ada)
//       lastHref = hrefs[0] || lastHref;
//     }

//   } catch (err: any) {
//     log('error', 'An error occurred while trying smartScrollUntilNewTweetFound', {
//       err: new Error(err.message)
//     });
//     throw err;
//   }
// }
async function extractStatusHref(tweet: WebdriverIO.Element, index: number): Promise<string> {
  try {
    await browser.waitUntil(async () => {
      const a = await tweet.$('a[href*="/status/"]');
      return a && await a.isExisting();
    }, {
      timeout: 10000,
      interval: 500,
      timeoutMsg: `Timeout waiting for status link in tweet [${index}]`
    });

    const link = await tweet.$('a[href*="/status/"]');
    const href = await link.getAttribute('href');

    if (!href) {
      log("error", `❌ Tweet [${index}] found, but href is empty or null.`);
      throw new Error(`Tweet [${index}] found but missing href`);
    }

    log("info", `✅ Tweet [${index}]: ${href}`);
    return href;

  } catch (err: any) {
    log("error", `❌ Failed to get href for tweet [${index}]: ${err.message}`);
    throw err; // Melempar ulang error ke pemanggil
  }
}


export async function smartScrollUntilNewTweetFound(maxRetries = 12, pause = 1000) {
  try {
    let lastHref = "";
    let retries = 0;

    for (;;) {
      const tweets = await $$('article');

      if (!tweets.length) {
        log("warn", "❌ No tweets found on page.");
        break;
      }

      // Scroll ke bawah
      await browser.execute(() => {
        window.scrollBy(0, window.innerHeight * 0.9);
      });

      await browser.pause(pause);

      // Ambil 6 tweet terakhir
      const lastTweets = tweets.slice(-6);

      // Ambil href setiap tweet (dengan validasi ketat)
      const hrefs = await Promise.all(lastTweets.map((tweet, index) =>
        extractStatusHref(tweet, index) // <- Akan melempar jika ada tweet tidak valid
      ));

      const newHref = hrefs.find(h => h && h !== lastHref);

      if (!lastHref) {
        lastHref = hrefs[0] || "";
        log("info", `🔰 Initialize href: ${lastHref}`);
        continue;
      }

      if (newHref) {
        log("info", `✅ New tweet found: ${newHref} ≠ ${lastHref}`);
        break;
      } else {
        retries++;
        log("info", `🔁 Still same tweets, retry #${retries}`);
        if (retries >= maxRetries) {
          throw new Error(`🚫 No new tweets after ${maxRetries} scroll attempts.`);
        }
      }

      lastHref = hrefs[0] || lastHref;
    }

  } catch (err: any) {
    log('error', 'An error occurred while trying smartScrollUntilNewTweetFound', {
      err: new Error(err.message)
    });
    throw err;
  }
}


