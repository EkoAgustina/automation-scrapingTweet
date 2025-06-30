Feature: Portfolio - About Page

@portfolio @aboutPage @aboutPage_googleSearchEngine
Scenario: Verify user successfully redirects to About page when clicking About on navbar on Home page via google search engine
    Given Users access web portfolios on Google search engine
    Then Title currently opened website is equal with "testData:testData_validWebTitle"
    Then Currently opened website URL is equal with "testData:testData_homePageUrl"
    # Then Element "navbar:navAboutIcon" is displayed
    # And User take screenshot with file name "2.aboutePage_homePage"
    When User click "navbar:navAboutIcon"
    # Then Title currently opened website is equal with "testData:testData_aboutTitle"
    Then Currently opened website URL is equal with "testData:testData_aboutPageUrl"
    Then Element "aboutPage:aboutPageTitle" is displayed
    Then Element "aboutPage:aboutContent" is equal with data "testData:testData_aboutContent"
    And User take screenshot with file name "3.about"

@portfolio @aboutPage @aboutPage_googleSearchEngine_two
Scenario: Verify user successfully redirects to About page when clicking About on navbar on Home page via google search engine - two
    Given Users access web portfolios on Google search engine
    Then Title currently opened website is equal with "testData:testData_validWebTitle"
    Then Currently opened website URL is equal with "testData:testData_homePageUrl"
    # Then Element "navbar:navAboutIcon" is displayed
    # And User take screenshot with file name "2.aboutePage_homePage"
    When User click "navbar:navAboutIcon"
    # Then Title currently opened website is equal with "testData:testData_aboutTitle"
    Then Currently opened website URL is equal with "testData:testData_aboutPageUrl"
    Then Element "aboutPage:aboutPageTitle" is displayed
    And User take screenshot with file name "3.about"

@portfolio @aboutPage @aboutPage_googleSearchEngine_three
Scenario: Verify user successfully redirects to About page when clicking About on navbar on Home page via google search engine - three
    Given Users access web portfolios on Google search engine
    Then Currently opened website URL is equal with "testData:testData_homePageUrl"
    # Then Element "navbar:navAboutIcon" is displayed
    # And User take screenshot with file name "2.aboutePage_homePage"
    When User click "navbar:navAboutIcon"
    # Then Title currently opened website is equal with "testData:testData_aboutTitle"
    Then Currently opened website URL is equal with "testData:testData_aboutPageUrl"
    Then Element "aboutPage:aboutPageTitle" is displayed
    And User take screenshot with file name "3.about"

@portfolio @aboutPage @aboutPage_googleSearchEngine_four
Scenario: Verify user successfully redirects to About page when clicking About on navbar on Home page via google search engine - four
    Given Users access web portfolios on Google search engine
    Then Title currently opened website is equal with "testData:testData_validWebTitle"
    Then Currently opened website URL is equal with "testData:testData_homePageUrl"
    # Then Element "navbar:navAboutIcon" is displayed
    # And User take screenshot with file name "2.aboutePage_homePage"
    When User click "navbar:navAboutIcon"
    # Then Title currently opened website is equal with "testData:testData_aboutTitle"
    Then Currently opened website URL is equal with "testData:testData_aboutPageUrl"
    Then Element "aboutPage:aboutPageTitle" is displayed
    And User take screenshot with file name "3.about"

@portfolio @aboutPage @aboutPage_googleSearchEngine_five
Scenario: Verify user successfully redirects to About page when clicking About on navbar on Home page via google search engine - five
    Given Users access web portfolios on Google search engine
    Then Title currently opened website is equal with "testData:testData_validWebTitle"
    Then Currently opened website URL is equal with "testData:testData_homePageUrl"
    # Then Element "navbar:navAboutIcon" is displayed
    # And User take screenshot with file name "2.aboutePage_homePage"
    When User click "navbar:navAboutIcon"
    # Then Title currently opened website is equal with "testData:testData_aboutTitle"
    Then Currently opened website URL is equal with "testData:testData_aboutPageUrl"
    Then Element "aboutPage:aboutPageTitle" is displayed
    And User take screenshot with file name "3.about"


