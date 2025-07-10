@scrapingTweets
Feature: Twitter - Scraping - Period from 16 March 2025

@scrapingTwitter @scSixteen
Scenario: Ensure that users successfully collect Twitter data during the time period from 16 March 2025
    Given User open "https://x.com/search?q=%22RUU%20TNI%22%20lang%3Aid%20until%3A2025-03-16%20since%3A2025-03-15&f=live&src=typed_query"
    When Users do scraping twitter data

    