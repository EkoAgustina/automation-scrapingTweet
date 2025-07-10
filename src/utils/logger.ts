import logger from '@wdio/logger';

/**
 * Logs a message with the specified log level.
 * @param {string} level - The log level. Should be one of 'WARNING', 'INFO', or 'ERROR'.
 * @param {string} message - The message to be logged.
 * @throws {Error} Throws an error if the specified log level is not recognized.
 */
export const log = (level: string, message: string) => {
  switch (level) {
    case 'WARNING':
      logger('⚠️ SCRAPER').warn(message)
      break;
    case 'INFO':
      logger('💡 SCRAPER').info(message)
      break;
    case 'ERROR':
      logger('🚫 SCRAPER').error(message)
      break;
    default:
      throw new Error('Unknown conditions')
  }
}