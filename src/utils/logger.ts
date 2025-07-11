import pino from 'pino';

const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  },
  level: process.env.LOG_LEVEL || 'info',
});

type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'fatal';

/**
 * Logs a message using the specified log level.
 *
 * Utilizes Pino logger with optional structured context.
 * Throws an error if an unsupported log level is used.
 *
 * @param {LogLevel} level - The severity level of the log ('info', 'warn', 'error', 'debug', 'fatal').
 * @param {string} message - The message to be logged.
 * @param {Record<string, unknown>} [context] - Optional contextual metadata to include in the log.
 *
 * @throws {Error} Will throw an error if the provided log level is not supported.
 *
 * @example
 * log('info', 'Server started');
 * log('error', 'Something went wrong', { userId: 123, action: 'login' });
 */
export const log = (
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>
) => {
  if (!logger[level]) {
    throw new Error(`Unsupported log level: ${level}`);
  }

  if (context) {
    logger[level](context, message);
  } else {
    logger[level](message);
  }
};