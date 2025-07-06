import { Given, When, Then } from '@wdio/cucumber-framework';
import { baseOpenBrowser, takeScreenshot, pageLoad, sleep, actionEnter, log } from '../../helpers/baseScreen.ts';
import { actionClick } from '../../helpers/baseClick.ts';
import { elementDisplayed, equalData, titleEqual, urlEqual } from '../../helpers/baseExpect.ts';
import { swipeUpwithTime, swipeUpElDisplayed } from "../../helpers/baseSwipe.ts";
import { actionFill } from '../../helpers/baseFill.ts';
import { runTweetScrapingLoops } from '../../helpers/baseTweets.ts';
import { env } from 'process';

/**
 * Step definition for the Cucumber step: Given User open "<page>".
 * Opens the specified page in the browser.
 * @param {string} page - The page to be opened.
 * @returns {Promise<void>} - A Promise that resolves after the page is opened.
 */
Given(/^User open "(.*)"$/, async (page: string) => {
    try {
        await baseOpenBrowser(page);
        await pageLoad(5);
        // await swipeUpwithTime(1)
    } catch (err: any) {
        log("ERROR", err.message)
        throw err
    }
});

/**
 * Step definition for the Cucumber step: When User click "<locator>".
 * Performs a click action on the specified locator.
 * @param {string} locator - The locator to be clicked.
 * @returns {Promise<void>} - A Promise that resolves after the click action is performed.
 */
When(/^User click "(.*)"$/, async (locator) => {
    try {
        await actionClick(locator);
    } catch (err: any) {
        log("ERROR", err.message)
        throw err
    }
});

When(/^Users do scraping twitter data$/,async () => {
    try {
        const loopCountStr = env.TWEETS_COUNTS_REQUEST;
        const loopCount = parseInt(loopCountStr || '', 10);

        if (isNaN(loopCount)) {
        throw new Error("TWEETS_COUNTS_REQUEST must be a valid number.");
        }

        await runTweetScrapingLoops(loopCount)
    } catch (err: any) {
        log("ERROR", err.message)
        throw err
    }
});

/**
 * Step definition for the Cucumber step: Then Element "<locator>" (is displayed|not displayed).
 * Checks whether the specified element is displayed or not based on the condition.
 * @param {string} locator - The locator of the element to be checked.
 * @param {string} condition - The condition to check, either "is displayed" or "not displayed".
 * @returns {Promise<void>} - A Promise that resolves after checking the element's visibility.
 */
Then(/^Element "(.*)" (is displayed|not displayed)$/, async (locator, condition) => {
    try {
        await elementDisplayed(locator, condition);
    } catch (err: any) {
        log("ERROR", err.message)
        throw err
    }
});

/**
 * Step definition for the Cucumber step: Then Element "<locator>" is (equal|not equal) with data "<testData>".
 * Checks whether the text of the element specified by the locator matches the provided test data based on the specified condition.
 * @param {string} locator - The locator of the element to check its text.
 * @param {string} condition - The condition to check, either 'equal' or 'not equal'.
 * @param {string} testData - The test data to compare with the element's text.
 * @returns {Promise<void>} - A Promise that resolves after the comparison is done.
 */
Then(/^Element "(.*)" is (equal|not equal) with data "(.*)"$/, async (locator, condition, testData) => {
    try {
        await equalData(condition, locator, testData);
    } catch (err: any) {
        log("ERROR", err.message)
        throw err
    }
});

/**
 * Step definition for the Cucumber step: Then User swipe up until he finds element "<locator>".
 * Scrolls up the screen until the specified element becomes displayed.
 * @param {string} locator - The locator of the element to find while scrolling up.
 * @returns {Promise<void>} - A Promise that resolves after the element is found or if it's already displayed.
 */
When(/^User swipe up until he finds element "(.*)"$/, async (locator) => {
    try {
        const swpieElement = await swipeUpElDisplayed(locator);
        if (swpieElement != '200') {
            console.error("ga adaa")
        }
    } catch (err: any) {
        log("ERROR", err.message)
        throw err
    }
});

/**
 * Step definition for the Cucumber step: Then User swipe up until <duration> seconds".
 * Simulates a swipe up action on the screen for the specified duration.
 * @param {number} duration - The duration of the swipe action, specified in seconds.
 */
When(/^User swipe up until (.*) seconds$/, async (duration: number) => {
    try {
        await swipeUpwithTime(duration);
    } catch (err: any) {
        log("ERROR", err.message)
        throw err
    }
});

/**
 * Step definition for check if the title of the currently opened website matches the expected title.
 * @param {string} condition - The condition to be checked. It can be either 'equal' or 'not equal'.
 * @param {string} testData - The expected title to be compared with the title of the currently opened website.
 */
Then(/^Title currently opened website is (equal|not equal) with "(.*)"$/, async (condition, testData) => {
    try {
        await titleEqual(condition, testData);
    } catch (err: any) {
        log("ERROR", err.message)
        throw err
    }
});

/**
 * Step definition for to check if the URL of the currently opened website matches the expected URL.
 * @param {string} condition - The condition to be checked. It can be either 'equal' or 'not equal'.
 * @param {string} testData - The expected URL to be compared with the URL of the currently opened website.
 */
Then(/^Currently opened website URL is (equal|not equal) with "(.*)"$/, async (condition, testData) => {
    try {
        await urlEqual(condition, testData);
    } catch (err: any) {
        log("ERROR", err.message)
        throw err
    }
});

/**
 * Step definition for Cucumber scenario to take a screenshot with a specified file name.
 * @param {string} name - The file name for the screenshot.
 */
Then(/^User take screenshot with file name "(.*)"$/, async (name) => {
    try {
        await takeScreenshot(name);
    } catch (err: any) {
        log("ERROR", err.message)
        throw err
    }
});

/**
 * Step definition for filling an input element with the specified data.
 * @param {string} locator - The locator string to identify the input element.
 * @param {string} test_data - The data to fill into the input element.
 */
Then(/^User fill "(.*)" with data "(.*)"$/, async (locator, test_data) => {
    try {
        await actionFill(locator, test_data);
    } catch (err: any) {
        log("ERROR", err.message)
        throw err
    }
});

/**
 * Step definition for simulating a press of the "Enter" key.
 * This step also includes a sleep for 3 seconds after the key press.
 */
Then(/^User press enter$/, async () => {
    try {
        await actionEnter();
        sleep(1);
    } catch (err: any) {
        log("ERROR", err.message)
        throw err
    }
});


