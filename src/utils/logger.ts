/**
 * Global Logger Utility
 * Logs to console in development mode (__DEV__)
 * Always forwards errors to Sentry in all environments
 */

import * as Sentry from '@sentry/react-native';

interface Logger {
  log: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
}

const noop = () => {};

/**
 * Forwards error to Sentry
 * Handles both Error objects and string messages
 */
const captureToSentry = (...args: unknown[]): void => {
  if (args[0] instanceof Error) {
    Sentry.captureException(args[0]);
  } else {
    const message = args.map(arg =>
      typeof arg === 'string' ? arg : JSON.stringify(arg)
    ).join(' ');
    Sentry.captureMessage(message, 'error');
  }
};

const createLogger = (): Logger => {
  if (!__DEV__) {
    return {
      log: noop,
      warn: noop,
      error: (...args) => captureToSentry(...args),
      debug: noop,
      info: noop,
    };
  }

  return {
    log: (...args) => console.log(...args),
    warn: (...args) => console.warn(...args),
    error: (...args) => {
      console.error(...args);
      captureToSentry(...args);
    },
    debug: (...args) => console.debug(...args),
    info: (...args) => console.info(...args),
  };
};

export const logger = createLogger();
