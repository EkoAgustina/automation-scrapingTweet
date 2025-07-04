Feature: Twitter - Scraping

@scrapingTwitter @scFifteenToSeventeen
Scenario: Ensure that users successfully collect Twitter data during the time period from March 15 to March 17 2025.
    # Given User open "https://x.com/search?q=%22RUU%20TNI%22%20lang%3Aid%20until%3A2025-03-17%20since%3A2025-03-15&src=typed_query"
    Given User open "https://x.com/search?q=%22RUU%20TNI%22%20lang%3Aid%20until%3A2025-03-17%20since%3A2025-03-15&src=typed_query&f=live"
    When Users do scraping twitter data
    