import { log, takeScreenshot } from "../helpers/baseScreen.ts";
import globalVariables from "../resources/globalVariable.ts";
import PropertiesReader from 'properties-reader';
import { env } from 'process';
import { browser } from '@wdio/globals'


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
  globalVariables.featureNameAfter = world.gherkinDocument.feature.name
  properties.set('Host', allureHostUrl() || 'Unknown');
  properties.save(propertiesPath);

  const userAgent = await browser.execute(() => {
    return navigator.userAgent;
  });
  log("INFO", userAgent)
  if (globalVariables.similarTweets.size === 0) {
    console.log("No similar tweets found.");
  } else {
    console.log("Similar Tweets:");
    globalVariables.similarTweets.forEach((tweet) => console.log(`- ${tweet}`));
  }


  if (result.error) {
    await takeScreenshot(`failed_${world.pickle.name}`)
  }
}

export { hooksAfterScenario };