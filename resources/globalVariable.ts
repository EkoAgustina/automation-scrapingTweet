import { platform } from 'node:process';


/**
 * Class representing global variables and settings.
 */
export default class globalVariables {
  /**
   * Operating system information.
   * @type {string}
   */
  static os: string = platform;

  /**
   * Services configuration.
   * @type {any}
   */
  static services: any;

  /**
   * URL before the step execution.
   * @type {any}
   */
  static urlBeforeStep: any;

  /**
   * URL after the step execution.
   * @type {any}
   */
  static urlAfterStep: any;

  /**
   * Feature name before the step execution.
   * @type {any}
   */
  static featureNameBefore: any;

  /**
   * Feature name after the step execution.
   * @type {any}
   */
  static featureNameAfter: any;

  /**
   * Path to the Allure environment properties file.
   * @type {string}
   */
  static allureProperties: string = './reporter/allure-results/environment.properties';

  /**
    * User agents for random selection.
    * @type {string[]}
    */
  // static userAgents: string[] = [
  //   process.env.CUSTOM_USER_AGENT_ONE || 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
  //   process.env.CUSTOM_USER_AGENT_TWO || 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
  //   process.env.CUSTOM_USER_AGENT_THREE || 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
  //   process.env.CUSTOM_USER_AGENT_FOUR || 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
  //   process.env.CUSTOM_USER_AGENT_FIVE || 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36'
  // ].filter(Boolean) as string[];
  static userAgents: string[] = [
    `${process.env.CUSTOM_USER_AGENT_ONE}`,
    `${process.env.CUSTOM_USER_AGENT_TWO}`,
    `${process.env.CUSTOM_USER_AGENT_THREE}`,
  ]

  /**
   * Get a random user agent.
   * @returns {string} Random user agent
   */
  static getRandomUserAgent(): string {
    const randomIndex = Math.floor(Math.random() * globalVariables.userAgents.length);
    return globalVariables.userAgents[randomIndex];
  }

  /**
   * Locations for random selection.
   * @type {{latitude: number, longitude: number}[]}
   */
  static locations: { latitude: number, longitude: number }[] = [
    { latitude: -6.902516, longitude: 107.618782 }, // Bandung
    { latitude: -6.3597485502896545, longitude: 106.8272343 }, // Depok
    { latitude: 3.562682562085971, longitude: 98.65840223634574 }, // Medan
    { latitude: -7.770860000118525, longitude: 110.3780433227243 }, // UGM
    { latitude: -7.932413460573722, longitude: 112.60569427952304 } // Malang
  ];

  /**
   * Get a random location.
   * @returns {{latitude: number, longitude: number}} Random location
   */
  static getRandomLocation(): { latitude: number, longitude: number } {
    const randomIndex = Math.floor(Math.random() * globalVariables.locations.length);
    return globalVariables.locations[randomIndex];
  }

  /**
   * Random user agent.
   * @returns {string} Random user agent
   */
  static get randomUserAgent(): string {
    return globalVariables.getRandomUserAgent();
  }

  /**
   * Random location.
   * @returns {{latitude: number, longitude: number}} Random location
   */
  static get randomLocation(): { latitude: number, longitude: number } {
    return globalVariables.getRandomLocation();
  }

  /**
   * Latitude.
   * @returns {number} Latitude
   */
  static get setLatitude(): number {
    return globalVariables.randomLocation.latitude;
  }

  /**
   * Longitude.
   * @returns {number} Longitude
   */
  static get setLongitude(): number {
    return globalVariables.randomLocation.longitude;
  }
}
