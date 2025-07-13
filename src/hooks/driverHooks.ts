import globalVariables from "../../resources/globalVariable.ts";
import PropertiesReader from 'properties-reader';
import { ITestCaseHookParameter } from "@cucumber/cucumber";
import { log } from "../utils/logger.ts";
import { printExecutionSummary } from "../utils/timer.ts";
import { takeScreenshot } from "../utils/webdriver/browser.ts";

let keepAliveInterval: any;

/**
 * Executes before each Cucumber scenario.
 * Extracts the day from the scenario name if it matches the format "<day> March 2025"
 * and sets a global variable for report naming.
 *
 * @param world - The Cucumber World object containing scenario metadata.
 */
export async function hookBeforeScenario(world: ITestCaseHookParameter) {
  const dateMatch = world.pickle.name.match(/\b(\d{1,2}) March 2025\b/);
  globalVariables.scenarioName = world.pickle.name

  if (dateMatch) {
    const day = dateMatch[1].padStart(2, '0');
    globalVariables.scrapingReportsName = `tweet_${day}_march_2025`;
  } else {
    log("warn", "No valid date found in scenario name.");
  }

  keepAliveInterval = setInterval(async () => {
    try {
      await browser.getTitle();
      log("info", "Keep-alive ping sent")
    } catch (e: any) {
      log("warn", `Keep-alive failed: ${e.message}`)
    }
  }, 5 * 60 * 1000);

  // try {
  //   await browser.cdp('Network', 'enable');
  //   await browser.cdp('Network', 'setBlockedURLs', {
  //     urls: ['*.jpg', '*.png', '*.gif']
  //   });
  //   log("info", "CDP setBlockedURLs executed successfully")
  // } catch (err: any) {
  //   log("error", `An error occurred when set CDP setBlockedURLs`, { err: new Error(err.message) })
  //   throw err
  // }
}


/**
 * Executes after a Cucumber scenario completes.
 * Updates properties in the Allure report and saves screenshots in case of failure.
 * @param {any} world - The Cucumber World object containing information about the scenario.
 * @param {any} result results object containing scenario results
 * @returns {Promise<void>} - A Promise that resolves after updating properties and saving screenshots.
 */
export async function hooksAfterScenario(world: any, result: any): Promise<void> {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
  }
  const propertiesPath = globalVariables.allureProperties;
  const properties = PropertiesReader(propertiesPath);
  const allureHostUrl = () => {
    if (process.env.HOST_NAME === 'localhost:8080') {
      return 'localhost:8080'
    } else {
      return 'selenium/standalone-chrome'
    }
  }
  properties.set('Host', allureHostUrl() || 'Unknown');
  properties.save(propertiesPath);
  const userAgent = await browser.execute(() => {
    return navigator.userAgent;
  });
  log("info", userAgent)

  log("info", `Tweets collected: ${globalVariables.tweetsCount}/${globalVariables.desiredTweets}`)
  log("info", `Count of tweets checked: ${globalVariables.tweetCountCheck}`)
  log("info", `Reports: ${globalVariables.scrapingReportsName}.json ${globalVariables.scrapingReportsName}.csv`)
  printExecutionSummary()



  if (result.error) {
    await takeScreenshot(`failed_${world.pickle.name}`)
  } else {
    await takeScreenshot(`success${world.pickle.name}`)
  }
}