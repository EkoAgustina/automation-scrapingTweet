@scrapingTweets
Feature: Twitter - Scraping - Period from 21 March 2025

@scrapingTwitter @scTwentyOne
Scenario: Ensure that users successfully collect Twitter data during the time period from 21 March 2025.
    Given User open "https://x.com/search?q=%22RUU%20TNI%22%20lang%3Aid%20until%3A2025-03-21%20since%3A2025-03-20&f=live&src=typed_query"
    When Users do scraping twitter data
    