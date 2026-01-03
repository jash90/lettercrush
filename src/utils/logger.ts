/**
 * Global Logger Utility
 * Only logs in development mode (__DEV__)
 */

interface Logger {
  log: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void;
  info: (...args: unknown[]) => void;
}

const noop = () => {};

const createLogger = (): Logger => {
  if (!__DEV__) {
    return {
      log: noop,
      warn: noop,
      error: noop,
      debug: noop,
      info: noop,
    };
  }

  return {
    log: (...args) => console.log(...args),
    warn: (...args) => console.warn(...args),
    error: (...args) => console.error(...args),
    debug: (...args) => console.debug(...args),
    info: (...args) => console.info(...args),
  };
};

export const logger = createLogger();
