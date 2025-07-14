import { log } from "../utils/logger.ts";
import { runTweetScrapingLoops } from "./tweetCollector.ts";

export async function scraper (tweetLimit: number) {
    try {
        await runTweetScrapingLoops(tweetLimit)
        // await runScrapingLoopsProfilesLoops()
    } catch (err: any) {
        log('error', 'An error occurred', { err: new Error(err.message) });
        throw err;
    }
}