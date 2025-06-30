import globalVariables from "../resources/globalVariable.ts"

const allureConfig = {
    outputDir: 'reporter/allure-results',
    disableWebdriverStepsReporting: true,
    disableWebdriverScreenshotsReporting: false,
    useCucumberStepReporter: true,
    addConsoleLogs: false,
    reportedEnvironmentVars: {
      OS: globalVariables.os
    }
};

const specConfig = {
    onlyFailures: false,
    addConsoleLogs: false,
    realtimeReporting: true
  };
  
const cucumberJsonConfig = {
    disableHooks: false,
    jsonFolder: 'reporter/cucumber/jsonReport/',
    language: 'en'
};

/**
 * Sets the path for the generated Cucumber HTML report based on the scenario name.
 * If a directory for the scenario already exists, it increments the count in the directory name.
 * @param {any} Scenario - The name of the scenario.
 * @returns {void} - Does not return a value.
 */
// function SetPathCucumberHtmlReport (Scenario:any) {
//     let count = 0;
//     const checkDirectories = new RegExp(Scenario)
//     const htmlBasePath = 'reporter/cucumber/htmlReport'
//     if (existsSync(htmlBasePath) === false) {
//       mkdirSync(htmlBasePath)
//     }
//     for (let i = 0; i <= readdirSync(htmlBasePath + '/').length; i++) {
//       if (checkDirectories.exec(readdirSync(htmlBasePath + '/')[i])) {
//         count += 1;
//       }
//     }
//     if (count === 0) {
//       count += 1;
//       generate({
//         jsonDir: 'reporter/cucumber/jsonReport/',
//         reportPath: htmlBasePath + '/' + Scenario + ' ' + count + '/'
//       });
//     } else {
//       count += 1;
//       generate({
//         jsonDir: 'reporter/cucumber/jsonReport/',
//         reportPath: htmlBasePath + '/' + Scenario + ' ' + count + '/'
//       });
//     }
// }

export { specConfig, allureConfig, cucumberJsonConfig };