import { log, printExecutionSummary, takeScreenshot } from "../helpers/baseScreen.ts";
import globalVariables from "../resources/globalVariable.ts";
import PropertiesReader from 'properties-reader';
import { env } from 'process';
import { ITestCaseHookParameter } from "@cucumber/cucumber";


async function hookBeforeScenario(world: ITestCaseHookParameter) {
  const dateMatch = world.pickle.name.match(/\b(\d{1,2}) March 2025\b/);

  if (dateMatch) {
    const day = dateMatch[1].padStart(2, '0');
    globalVariables.scrapingReportsName = `tweet_${day}_march_2025`;
  } else {
    log("WARNING", "No valid date found in scenario name.");
  }
}


/**
 * Executes after a Cucumber scenario completes.
 * Updates properties in the Allure report and saves screenshots in case of failure.
 * @param {any} world - The Cucumber World object containing information about the scenario.
 * @param {any} result results object containing scenario results
 * @returns {Promise<void>} - A Promise that resolves after updating properties and saving screenshots.
 */
async function hooksAfterScenario(world: any, result: any): Promise<void> {
  const propertiesPath = globalVariables.allureProperties;
  const properties = PropertiesReader(propertiesPath);
  const allureHostUrl = () => {
    if (env.HOST_NAME === 'localhost:8080') {
      return 'localhost:8080'
    } else {
      return 'selenium/standalone-chrome'
    }
  }
  properties.set('Host', allureHostUrl() || 'Unknown');
  properties.save(propertiesPath);

  log ("INFO", `Tweets collected: ${globalVariables.tweetsCount}/${globalVariables.desiredTweets}`)
  log("INFO", `Count of tweets checked: ${globalVariables.tweetCountCheck}`)
  log("INFO", `Reports: ${globalVariables.scrapingReportsName}.json ${globalVariables.scrapingReportsName}.csv`)
  printExecutionSummary()



  if (result.error) {
    await takeScreenshot(`failed_${world.pickle.name}`)
  } else {
    await takeScreenshot(`success${world.pickle.name}`)
  }
}


export { hookBeforeScenario, hooksAfterScenario };