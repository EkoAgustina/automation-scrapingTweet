@scrapingTweets
Feature: Twitter - Scraping

@scrapingTwitter @scSeventeen
Scenario: Ensure that users successfully collect Twitter data during the time period from 17 March 2025.
    # Given User open "https://x.com/search?q=%22RUU%20TNI%22%20lang%3Aid%20until%3A2025-03-17%20since%3A2025-03-15&src=typed_query"
    Given User open "https://x.com/search?q=%22RUU%20TNI%22%20lang%3Aid%20until%3A2025-03-17%20since%3A2025-03-16&f=live&src=typed_query"
    When Users do scraping twitter data
    