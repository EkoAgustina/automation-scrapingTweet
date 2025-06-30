Feature: Portfolio - Project Page

@portfolio @projectPage @projectPage_googleSearchEngine
Scenario: Verify user successfully redirects to Project page when clicking Project on navbar on Home page via google search engine
    Given Users access web portfolios on Google search engine
    When User click "navbar:navProjectIcon"
    # Then Currently opened website URL is equal with "testData:testData_projectPageUrl"
    Then Title currently opened website is equal with "testData:testData_projectTitle"
    Then Element "projectPage:projectPageTitle" is displayed
    Then Element "projectPage:projectContentTitleOne" is equal with data "testData:testData_projectContentTitleOne"
    # Then Element "projectPage:projectContentOne" is equal with data "testData:testData_projectContentOne"
    Then Element "projectPage:projectContentTitleTwo" is equal with data "testData:testData_projectContentTitleTwo"
    # Then Element "projectPage:projectContentTwo" is equal with data "testData:testData_projectContentTwo"
    Then Element "projectPage:projectContentTitleThree" is equal with data "testData:testData_projectContentTitleThree"
    # Then Element "projectPage:projectContentThree" is equal with data "testData:testData_projectContentThree"
    # And User take screenshot with file name "3.projectPageFirstPart"
    When User swipe up until 3 seconds
    Then Element "projectPage:projectContentTitleFour" is equal with data "testData:testData_projectContentTitleFour"
    # Then Element "projectPage:projectContentFour" is equal with data "testData:testData_projectContentFour"
    Then Element "projectPage:projectContentTitleFive" is equal with data "testData:testData_projectContentTitleFive"
    # Then Element "projectPage:projectContentFive" is equal with data "testData:testData_projectContentFive"
    Then Element "projectPage:projectContentTitleSix" is equal with data "testData:testData_projectContentTitleSix"
    # Then Element "projectPage:projectContentSix" is equal with data "testData:testData_projectContentSix"
    # And User take screenshot with file name "4.projectPageMiddle"
    When User swipe up until 3 seconds
    Then Element "projectPage:projectContentTitleSeven" is equal with data "testData:testData_projectContentTitleSeven"
    # Then Element "projectPage:projectContentSeven" is equal with data "testData:testData_projectContentSeven"
    And User take screenshot with file name "5.projectPageLastPart"
    And User click "projectPage:projectSeven_button"

@portfolio @projectPage @projectPage_googleSearchEngine_two
Scenario: Verify user successfully redirects to Project page when clicking Project on navbar on Home page via google search engine - two
    Given Users access web portfolios on Google search engine
    When User click "navbar:navProjectIcon"
    # Then Currently opened website URL is equal with "testData:testData_projectPageUrl"
    Then Title currently opened website is equal with "testData:testData_projectTitle"
    Then Element "projectPage:projectPageTitle" is displayed
    Then Element "projectPage:projectContentTitleOne" is equal with data "testData:testData_projectContentTitleOne"
    # Then Element "projectPage:projectContentTitleTwo" is equal with data "testData:testData_projectContentTitleTwo"
    # Then Element "projectPage:projectContentTitleThree" is equal with data "testData:testData_projectContentTitleThree"
    # And User take screenshot with file name "3.projectPageFirstPart"
    When User swipe up until 3 seconds
    # Then Element "projectPage:projectContentTitleFour" is equal with data "testData:testData_projectContentTitleFour"
    # Then Element "projectPage:projectContentTitleFive" is equal with data "testData:testData_projectContentTitleFive"
    Then Element "projectPage:projectContentTitleSix" is equal with data "testData:testData_projectContentTitleSix"
    And User take screenshot with file name "4.projectPageMiddle"
    When User swipe up until 3 seconds
    Then Element "projectPage:projectContentTitleSeven" is equal with data "testData:testData_projectContentTitleSeven"
    And User take screenshot with file name "5.projectPageLastPart"

@portfolio @projectPage @projectPage_googleSearchEngine_three
Scenario: Verify user successfully redirects to Project page when clicking Project on navbar on Home page via google search engine - three
    Given Users access web portfolios on Google search engine
    When User click "navbar:navProjectIcon"
    # Then Currently opened website URL is equal with "testData:testData_projectPageUrl"
    # Then Title currently opened website is equal with "testData:testData_projectTitle"
    Then Element "projectPage:projectPageTitle" is displayed
    Then Element "projectPage:projectContentTitleOne" is equal with data "testData:testData_projectContentTitleOne"
    # Then Element "projectPage:projectContentTitleTwo" is equal with data "testData:testData_projectContentTitleTwo"
    # Then Element "projectPage:projectContentTitleThree" is equal with data "testData:testData_projectContentTitleThree"
    And User take screenshot with file name "3.projectPageFirstPart"
    When User swipe up until 3 seconds
    # Then Element "projectPage:projectContentTitleFour" is equal with data "testData:testData_projectContentTitleFour"
    # Then Element "projectPage:projectContentTitleFive" is equal with data "testData:testData_projectContentTitleFive"
    Then Element "projectPage:projectContentTitleSix" is equal with data "testData:testData_projectContentTitleSix"
    And User take screenshot with file name "4.projectPageMiddle"
    When User swipe up until 3 seconds
    Then Element "projectPage:projectContentTitleSeven" is equal with data "testData:testData_projectContentTitleSeven"
    And User take screenshot with file name "5.projectPageLastPart"

@portfolio @projectPage @projectPage_googleSearchEngine_four
Scenario: Verify user successfully redirects to Project page when clicking Project on navbar on Home page via google search engine - four
    Given Users access web portfolios on Google search engine
    When User click "navbar:navProjectIcon"
    # Then Currently opened website URL is equal with "testData:testData_projectPageUrl"
    Then Title currently opened website is equal with "testData:testData_projectTitle"
    Then Element "projectPage:projectPageTitle" is displayed
    Then Element "projectPage:projectContentTitleOne" is equal with data "testData:testData_projectContentTitleOne"
    # Then Element "projectPage:projectContentTitleTwo" is equal with data "testData:testData_projectContentTitleTwo"
    # Then Element "projectPage:projectContentTitleThree" is equal with data "testData:testData_projectContentTitleThree"
    # And User take screenshot with file name "3.projectPageFirstPart"
    When User swipe up until 3 seconds
    # Then Element "projectPage:projectContentTitleFour" is equal with data "testData:testData_projectContentTitleFour"
    # Then Element "projectPage:projectContentTitleFive" is equal with data "testData:testData_projectContentTitleFive"
    Then Element "projectPage:projectContentTitleSix" is equal with data "testData:testData_projectContentTitleSix"
    And User take screenshot with file name "4.projectPageMiddle"
    When User swipe up until 3 seconds
    Then Element "projectPage:projectContentTitleSeven" is equal with data "testData:testData_projectContentTitleSeven"
    And User take screenshot with file name "5.projectPageLastPart"

@portfolio @projectPage @projectPage_googleSearchEngine_five
Scenario: Verify user successfully redirects to Project page when clicking Project on navbar on Home page via google search engine - five
    Given Users access web portfolios on Google search engine
    When User click "navbar:navProjectIcon"
    # Then Currently opened website URL is equal with "testData:testData_projectPageUrl"
    Then Title currently opened website is equal with "testData:testData_projectTitle"
    Then Element "projectPage:projectPageTitle" is displayed
    Then Element "projectPage:projectContentTitleOne" is equal with data "testData:testData_projectContentTitleOne"
    # Then Element "projectPage:projectContentTitleTwo" is equal with data "testData:testData_projectContentTitleTwo"
    # Then Element "projectPage:projectContentTitleThree" is equal with data "testData:testData_projectContentTitleThree"
    # And User take screenshot with file name "3.projectPageFirstPart"
    When User swipe up until 3 seconds
    # Then Element "projectPage:projectContentTitleFour" is equal with data "testData:testData_projectContentTitleFour"
    # Then Element "projectPage:projectContentTitleFive" is equal with data "testData:testData_projectContentTitleFive"
    Then Element "projectPage:projectContentTitleSix" is equal with data "testData:testData_projectContentTitleSix"
    And User take screenshot with file name "4.projectPageMiddle"
    When User swipe up until 3 seconds
    Then Element "projectPage:projectContentTitleSeven" is equal with data "testData:testData_projectContentTitleSeven"
    And User take screenshot with file name "5.projectPageLastPart"