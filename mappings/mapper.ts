import { load } from 'js-yaml';
import { readFileSync } from 'fs';
// import * as pkg from 'lodash';
import pkg from 'lodash';
const { get } = pkg;


/**
 * Load YAML file from specified paths.
 * @param {string} pathOne - The first part of the path.
 * @param {string} pathTwo - The second part of the path.
 * @returns {any} The parsed YAML content.
 * @throws {Error} If there's an error loading or parsing the YAML file.
 */
function loadYaml(pathOne: string, pathTwo: string): any {
    const path = './resources/' + pathOne + '/' + pathTwo + '.YAML';
    try {
        const fileContent = readFileSync(path);
        const fileContentString = fileContent.toString(); // Convert Buffer to string
        return load(fileContentString);
    } catch (err:any) {
        throw new Error(`Failed to load YAML with original failed message: ${err.message}`);
    }
}

/**
 * Parse elements based on the locator provided.
 * @param {string} locator - The locator string to identify the element.
 * @returns {any} The parsed element data.
 * @throws {Error} If the element is not found or there's an error during parsing.
 */
function parseElements (locator:string): any {
    const pathOne = 'selector';
    const getKey = locator.split(':');
    const yamlData = loadYaml(pathOne,getKey[0])
    let key;

    try {
        key = getKey[1];
        return get(yamlData,key);
    } catch (err:any) {
        throw new Error (`Element not found with original fail message: ${err.message}`)
    }
}

/**
 * Parse test data based on the provided key.
 * @param {string} testData - The test data key to retrieve the data.
 * @returns {any} The parsed test data.
 * @throws {Error} If the test data is not found or there's an error during parsing.
 */
function parseTestData (testData: string) {
const path1 = 'test_data';
  const getkey = testData.split(':');
  const yamlData = loadYaml(path1, getkey[0]);
  let key;
  try {
    key = getkey[1];
    console.log(get(yamlData, key));
    return get(yamlData, key);
  } catch (err:any) {
    throw new Error('Test data not found with original fail message: ' + err.message);
  }
}

/**
 * Parse and transform a locator string into a key element.
 * @param {string} locator - The locator string to parse.
 * @returns {string} The key element transformed from the locator.
 * @throws {Error} If the locator string format is not recognized.
 */
function keyElement (locator:string): string {
    const parseKey = parseElements(locator).split(' => ');
    const cond = parseKey[0];
    const key = parseKey[1];
    let keyCond;
  
    switch (cond) {
      case 'By.xpath':
        console.log('By.xpath: ', key);
        return key;
      case 'By.id':
        // keyCond = 'id=' + key;
        keyCond = '#' + key;
        console.log('By.id: ', keyCond);
        return keyCond;
      case 'By.accessibility_id':
        keyCond = '~' + key;
        console.log('By.accessibility_id: ', keyCond);
        return keyCond;
      default:
        throw new Error('Unknown selector!');
    }
}

export {keyElement, parseTestData}

