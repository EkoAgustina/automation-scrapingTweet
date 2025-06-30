Feature: Portfolio - Home Page

@portfolio @homePage_googleSearchEngine @homePage
Scenario: Verify users can see Footer component on Home page via google search engine 
    Given Users access web portfolios on Google search engine
    # Then Title currently opened website is equal with "testData:testData_validWebTitle"
    Then Currently opened website URL is equal with "testData:testData_homePageUrl"
    # Then Element "homePage:home_sayTitle" is equal with data "testData:testData_homeContent_sayHi"
    Then Element "homePage:home_nameTitile" is equal with data "testData:testData_homeContent_mame"
    Then Element "homePage:home_buttonContactMe" is displayed
    Then Element "navbar:navHomeIcon" is displayed
    # Then Element "navbar:navAboutIcon" is displayed
    # Then Element "navbar:navProjectIcon" is displayed
    And User take screenshot with file name "2.homePage"
    And User click "homePage:home_buttonContactMe" 
    And User take screenshot with file name "3.ContactPage_viaHomePage"

@portfolio @homePage_googleSearchEngine_two @homePage
Scenario: Verify users can see Footer component on Home page via google search engine - two
    Given Users access web portfolios on Google search engine
    # Then Title currently opened website is equal with "testData:testData_validWebTitle"
    Then Currently opened website URL is equal with "testData:testData_homePageUrl"
    # Then Element "homePage:home_sayTitle" is equal with data "testData:testData_homeContent_sayHi"
    Then Element "homePage:home_nameTitile" is equal with data "testData:testData_homeContent_mame"
    # Then Element "homePage:home_buttonContactMe" is displayed
    Then Element "navbar:navHomeIcon" is displayed
    And User take screenshot with file name "2.homePage"
    And User click "homePage:home_buttonContactMe" 

@portfolio @homePage_googleSearchEngine_three @homePage
Scenario: Verify users can see Footer component on Home page via google search engine - three
    Given Users access web portfolios on Google search engine
    # Then Title currently opened website is equal with "testData:testData_validWebTitle"
    Then Currently opened website URL is equal with "testData:testData_homePageUrl"
    # Then Element "homePage:home_sayTitle" is equal with data "testData:testData_homeContent_sayHi"
    Then Element "homePage:home_nameTitile" is equal with data "testData:testData_homeContent_mame"
    # Then Element "homePage:home_buttonContactMe" is displayed
    Then Element "navbar:navHomeIcon" is displayed
    And User take screenshot with file name "2.homePage"
    And User click "homePage:home_buttonContactMe" 

@portfolio @homePage_googleSearchEngine_four @homePage
Scenario: Verify users can see Footer component on Home page via google search engine - four
    Given Users access web portfolios on Google search engine
    # Then Title currently opened website is equal with "testData:testData_validWebTitle"
    Then Currently opened website URL is equal with "testData:testData_homePageUrl"
    # Then Element "homePage:home_sayTitle" is equal with data "testData:testData_homeContent_sayHi"
    Then Element "homePage:home_nameTitile" is equal with data "testData:testData_homeContent_mame"
    # Then Element "homePage:home_buttonContactMe" is displayed
    Then Element "navbar:navHomeIcon" is displayed
    And User take screenshot with file name "2.homePage"
    And User click "homePage:home_buttonContactMe" 

@portfolio @homePage_googleSearchEngine_five @homePage
Scenario: Verify users can see Footer component on Home page via google search engine - five
    Given Users access web portfolios on Google search engine
    # Then Title currently opened website is equal with "testData:testData_validWebTitle"
    Then Currently opened website URL is equal with "testData:testData_homePageUrl"
    # Then Element "homePage:home_sayTitle" is equal with data "testData:testData_homeContent_sayHi"
    Then Element "homePage:home_nameTitile" is equal with data "testData:testData_homeContent_mame"
    # Then Element "homePage:home_buttonContactMe" is displayed
    Then Element "navbar:navHomeIcon" is displayed
    And User take screenshot with file name "2.homePage"
    And User click "homePage:home_buttonContactMe" 
    
