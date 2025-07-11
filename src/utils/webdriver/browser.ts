import globalVariables from "../../../resources/globalVariable.ts";
import { env } from 'node:process';
import { log } from "../logger.ts";
import { existsSync, mkdirSync } from 'node:fs';


/**
 * Opens the browser and navigates to the specified URL.
 * @param {string} url - The URL to navigate to.
 * @returns {Promise<void>} A promise that resolves when the browser is opened and the URL is loaded.
 */
export async function baseOpenBrowser(url: string): Promise<void> {
  try {
    const authToken = process.env.COOKIE_AUTH_TOKEN;
    const ct0 = process.env.COOKIE_CT0;

    if (!authToken || !ct0) {
      throw new Error('COOKIE_AUTH_TOKEN or COOKIE_CT0 has not been set in the environment variables.');
    }
    await browser.url(url);
    await setBrowserSize()

    if ((await browser.getCookies(['authToken'])).length === 0 && (await browser.getCookies(['ct0'])).length === 0) {
      await browser.setCookies([
        { name: 'auth_token', value: authToken },
        { name: 'ct0', value: ct0 }
      ])
      await browser.pause(1000);
      await browser.refresh();
      await baseOpenBrowser(url);
    }
    await pageLoad(5);
    log('info', `Width: ${(await browser.getWindowSize()).width}, Height: ${(await browser.getWindowSize()).height}`);

    await browser.pause(2000)
  } catch (err: any) {
    log('error', 'An error occurred while initializing browser', { err: new Error(err.message) });
    throw err
  }
}

/**
 * Sets the browser window size based on the current environment and browser type.
 *
 * - If the environment is Linux or Docker, it sets a fixed window size.
 * - If the browser is Chrome or running in headless mode, it maximizes the window.
 * - Throws an error if the browser name is not recognized.
 *
 * This is useful for ensuring consistent viewport dimensions across different test environments.
 *
 * @async
 * @function setBrowserSize
 * @returns {Promise<void>} Resolves when the window size has been set successfully.
 * @throws {Error} Throws an error if the browser name is not supported or an unexpected issue occurs.
 */
export async function setBrowserSize(): Promise<void> {
  try {
    const browserName = env.BROWSER_NAME?.toLowerCase();

    if (globalVariables.os === 'linux' || browserName === 'docker') {
      await browser.setWindowSize(1470, 854);
    } else if (browserName === 'chrome' || browserName === 'headless') {
      await browser.maximizeWindow();
    } else {
      throw new Error(`browserName "${browserName}" not recognized!`);
    }
  } catch (err: any) {
    log('error', 'An error occurred while trying to resize the browser window', { err: new Error(err.message) });
    throw err;
  }
}

/**
 * Take a screenshot of the current browser view.
 * @param {string} name - The name of the screenshot file.
 * @returns {Promise<void>} A promise that resolves when the screenshot is captured.
 */
export async function takeScreenshot(name: string) {
  const checkDirectories = './screenshot'
  if (existsSync(checkDirectories) === false) {
    mkdirSync(checkDirectories)
  }
  try {
    await pageLoad(5)
    await browser.saveScreenshot('./screenshot/' + name + '.png');
  } catch (err: any) {
    log('error', 'An error occurred while trying to take a screenshot', { err: new Error(err.message) });
    throw err
  }
}

/**
 * Wait until the page is fully loaded.
 * @param {number} duration - The maximum duration to wait for page load, in seconds.
 * @throws {Error} If the page fails to load within the specified duration.
 */
export async function pageLoad(duration: number) {
  try {
    await browser.waitUntil(() => browser.execute(() => document.readyState === 'complete'), {
      timeout: duration * 1000,
      timeoutMsg: 'Page failed to load'
    });
  } catch (err: any) {
    log('error', 'An error occurred while waiting for the page to fully load', { err: new Error(err.message) });
    throw err
  }
}

/**
 * Overrides the browser's geolocation with the specified latitude and longitude.
 *
 * @param customLatitude - The latitude to set in the geolocation override.
 * @param customLongitude - The longitude to set in the geolocation override.
 * @throws Will throw an error if the geolocation override fails.
 */
export async function customGeolocation(customLatitude: any, customLongitude: any) {
  try {
    await browser.sendCommand('Emulation.setGeolocationOverride', {
      latitude: customLatitude,
      longitude: customLongitude,
      accuracy: 100
    });
  } catch (err: any) {
    log('error', 'An error occurred while trying to set geolocation', { err: new Error(err.message) });
    throw err
  }
}

/**
 * Simulates pressing the "Enter" key on the keyboard.
 * @returns {Promise<void>} A promise that resolves when the key action is completed.
 */
export async function actionEnter(): Promise<void> {
  try {
    await browser.keys('Enter')
  } catch (err: any) {
    log('error', 'An error occurred', { err: new Error(err.message) });
    throw err
  }
}