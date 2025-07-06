
// import cucumberJson from 'wdio-cucumberjs-json-reporter';
import logger from '@wdio/logger';
import * as fs from 'node:fs/promises';
import { existsSync, readdirSync, mkdirSync } from 'node:fs';
import path from 'node:path';



/**
 * Logs a message with the specified log level.
 * @param {string} level - The log level. Should be one of 'WARNING', 'INFO', or 'ERROR'.
 * @param {string} message - The message to be logged.
 * @throws {Error} Throws an error if the specified log level is not recognized.
 */
const log = (level:string, message:string) => {
  switch (level) {
    case 'WARNING':
      logger('WARNING').warn(message)
      break;
    case 'INFO':
      logger('INFO').info(message)
      break;
    case 'ERROR':
      logger('ERROR').info(message)
      break;
    default:
      throw new Error('Unknown conditions')
  }
}

/**
 * Pause the execution for a specified duration.
 * @param {number} duration - The duration to sleep in seconds.
 */
function sleep (duration:number) {
    const date = Date.now();
    let currentDate = null;
    do {
      currentDate = Date.now();
    } while (currentDate - date < duration * 1000);
}

async function customGeolocation(customLatitude:any, customLongitude:any) {
//   await browser.emulate('geolocation', {
//     latitude: customLatitude,
//     longitude: customLongitude,
//     accuracy: 100
// })
try {
  await browser.sendCommand('Emulation.setGeolocationOverride', {
    latitude: customLatitude,
    longitude: customLongitude,
    accuracy: 100
});
} catch (err:any) {
  log("ERROR", err.message)
  throw err
}
}

/**
 * For set browser size.
 */
async function setBrowserSize() {
  try {
    await browser.maximizeWindow();
  } catch (err: any) {
    log("ERROR", err.message)
    throw err
  }
}

/**
 * Opens the browser and navigates to the specified URL.
 * @param {string} url - The URL to navigate to.
 * @returns {Promise<void>} A promise that resolves when the browser is opened and the URL is loaded.
 */
async function baseOpenBrowser(url: string): Promise<void> {
  try {
    await browser.url("https://x.com");
    await setBrowserSize()
    await browser.setCookies([
        {name: 'auth_token', value: '4c9492cd77ca663cb211b09e650d3702397fa874'},
        {name: 'ct0', value: '1929ee776904b162d7736c7d79ee39c7dd42cf31edb73eb102a5eddc64b43462d23c2508c4001b87a1dd91449bbde4a609611d30d16bc857200bcbbd1ab2bf6fb9051a7aaf7e3fc41ec5eb203328cae2'}
    ])
    await browser.pause(1000);
    await browser.refresh()
    await browser.url(url);

    log('INFO', `Width: ${(await browser.getWindowSize()).width}, Height: ${(await browser.getWindowSize()).height}`);
    
    sleep(3)
  } catch (err:any) {
    log("ERROR", err.message)
    throw err
  }
}

async function scrollIntoView(locator: string) {
  try {
    await (await $(locator)).scrollIntoView()
  } catch (err:any) {
    log("ERROR", err.message)
    throw err
  }
}

/**
 * Waits for the element specified by the locator to exist on the page.
 * If the element exists within the timeout period, it resolves; otherwise, it logs a warning and continues.
 * @param {string} locator - The locator of the element to wait for.
 * @returns {Promise<void>} - A Promise that resolves after the element exists or after the timeout.
 */
async function elWaitForExist (locator:string) {
  try {
    await $(locator).waitForExist({ timeout: 6500 })
  } catch (err) {
    log('WARNING', (err as Error).message)
    sleep(2)
  }
}

async function elWaitForExistTweet (tweet: WebdriverIO.Element, locator:string) {
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
// const findElement = async (locator: string): Promise<WebdriverIO.Element> => {
//   return new Promise((resolve, reject) => {
//     Promise.all([
//       elWaitForExist(locator),
//       $(keyElement(locator))
//     ])
//       .then((element) => {
//         log("INFO", keyElement(locator))
//         sleep(1)
//         resolve(element[1])
//       })
//       .catch((err) => {
//         reject(err)
//       })
//   })
// }
const findElement = async (locator: string): Promise<WebdriverIO.Element> => {
  return new Promise((resolve, reject) => {
    Promise.all([
      elWaitForExist(locator),
      $(locator)
    ])
      .then((element) => {
        log("INFO", locator)
        sleep(1)
        resolve(element[1])
      })
      .catch((err) => {
        reject(err)
      })
  })
}

/**
 * Wait until the page is fully loaded.
 * @param {number} duration - The maximum duration to wait for page load, in seconds.
 * @throws {Error} If the page fails to load within the specified duration.
 */
async function pageLoad (duration:number) {
  try {
    await browser.waitUntil(() => browser.execute(() => document.readyState === 'complete'), {
      timeout: duration * 1000,
      timeoutMsg: 'Page failed to load'
    });
  } catch (err:any) {
    log("ERROR", err.message)
    throw err
  }
}

/**
 * Take a screenshot of the current browser view.
 * @param {string} name - The name of the screenshot file.
 * @returns {Promise<void>} A promise that resolves when the screenshot is captured.
 */
async function takeScreenshot (name:string) {
  const checkDirectories = './screenshot'
  if (existsSync(checkDirectories) === false) {
    mkdirSync(checkDirectories)
  }
  try {
    await pageLoad(5)
    await browser.saveScreenshot('./screenshot/' + name + '.png');
  } catch (err:any) {
    log("ERROR", err.message)
    throw err
  }
    // cucumberJson.attach(await browser.takeScreenshot(), 'image/png');
}


/**
 * Get the current date in the format "dd-mm-yyyy".
 * @returns {string} The current date.
 */
function getCurrentDate () {
    const today = new Date();
    const date = today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear();
    return date;
}

/**
 * Apply ANSI color to a message and return it.
 * @param {string} color - The color to apply ('red' or 'yellow').
 * @param {string} message - The message to colorize.
 * @returns {string} The colorized message with ANSI escape codes.
 */
const stdoutAnsiColor = (color:string, message:string) => {
    if (color === 'red') {
      return '\x1b[31m' + message + '\x1b[0m';
    } else if (color === 'yellow') {
      return '\x1b[33m' + message + '\x1b[0m';
    }
};


/**
 * Clean a directory by removing all files and subdirectories inside it.
 * @param {string} directoryPath - The path to the directory to be cleaned.
 */
function cleanDirectory (directoryPath:string) {
    for (let i = 0; i < directoryPath.length; i++) {
      if (existsSync(directoryPath[i])) {
        for (let a = 0; a < readdirSync(directoryPath[i]).length; a++) {
          const filePath = directoryPath[i] + readdirSync(directoryPath[i])[a];
          fs.rm(filePath, { recursive: true });
        }
      } else {
        log("WARNING", `Warning: your path report "${directoryPath[i]}" does not exist!`)
      }
    }
}

/**
 * Simulates pressing the "Enter" key on the keyboard.
 * @returns {Promise<void>} A promise that resolves when the key action is completed.
 */
async function actionEnter(): Promise<void> {
  try {
    await browser.keys('Enter')
  } catch (err:any) {
    log("ERROR", err.message)
    throw err
  }
}



async function saveToCSV(row: string, baseName: string) {
  const folderPath = path.join('reporter');
  if (!existsSync(folderPath)) {
    mkdirSync(folderPath, { recursive: true });
  }

  const filePath = path.join(folderPath, `${baseName}.csv`);

  try {
    // kalau file belum ada, tulis header baru
    if (!existsSync(filePath)) {
      // const header = 'Username,Date,Text Tweets,Replies,Reposts,Likes,Interaction Type,Target Username\n';
      const header = 'Tweet ID,href,Username,Date,Text Tweets,Replies,Reposts,Likes,Is Regular Post,Is Mention,Is Quote,Is Reply,Target Username\n';
      await fs.writeFile(filePath, header, 'utf-8');
    }

    // lalu append baris baru
    await fs.appendFile(filePath, row + '\n', 'utf-8');
    console.log(`✅ Baris ditambahkan ke: ${filePath}`);
  } catch (err) {
    console.error(`❌ Gagal simpan CSV: ${err}`);
    throw err;
  }
}


async function saveToJSON(obj: any, baseName: string) {
  const folderPath = path.join('reporter');
  if (!existsSync(folderPath)) {
    mkdirSync(folderPath, { recursive: true });
  }

  const filePath = path.join(folderPath, `${baseName}.json`);

  try {
    let data: Record<string, string>[] = [];

    // Kalau file json sudah ada, baca datanya dulu
    if (existsSync(filePath)) {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      data = JSON.parse(fileContent);
    }

    // Tambahkan data baru
    data.push(obj);

    // Tulis ulang seluruh data ke file JSON
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`✅ Data JSON ditambahkan ke: ${filePath}`);
  } catch (err) {
    console.error(`❌ Gagal simpan JSON: ${err}`);
    throw err;
  }
}




export {elWaitForExistTweet, saveToJSON, saveToCSV, baseOpenBrowser, findElement, takeScreenshot, sleep, pageLoad, stdoutAnsiColor, scrollIntoView, getCurrentDate, cleanDirectory, log, customGeolocation, actionEnter, setBrowserSize}