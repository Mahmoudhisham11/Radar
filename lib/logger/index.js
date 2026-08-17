/**
 * RADAR Structured Logger
 * Provides structured logging with metadata (operation, provider, duration, error).
 * Never logs secrets or access tokens.
 */

const LOG_LEVELS = {
  DEBUG: "debug",
  INFO: "info",
  WARN: "warn",
  ERROR: "error",
};

function formatLog(level, message, metadata = {}) {
  const sanitizedMeta = { ...metadata };
  
  // Guard against accidental token leakage
  const sensitiveKeys = ["token", "accessToken", "refreshToken", "clientSecret", "apiKey", "privateKey"];
  for (const key of Object.keys(sanitizedMeta)) {
    if (sensitiveKeys.some(s => key.toLowerCase().includes(s.toLowerCase()))) {
      sanitizedMeta[key] = "[REDACTED]";
    }
  }

  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...sanitizedMeta,
  };
}

export const logger = {
  info(message, metadata) {
    const entry = formatLog(LOG_LEVELS.INFO, message, metadata);
    console.log(JSON.stringify(entry));
  },
  
  warn(message, metadata) {
    const entry = formatLog(LOG_LEVELS.WARN, message, metadata);
    console.warn(JSON.stringify(entry));
  },

  error(message, error, metadata = {}) {
    const errorDetails = error instanceof Error 
      ? { errorMessage: error.message, stack: error.stack }
      : { errorMessage: String(error) };

    const entry = formatLog(LOG_LEVELS.ERROR, message, {
      ...metadata,
      ...errorDetails,
    });
    console.error(JSON.stringify(entry));
  },

  debug(message, metadata) {
    if (process.env.NODE_ENV === "development") {
      const entry = formatLog(LOG_LEVELS.DEBUG, message, metadata);
      console.debug(JSON.stringify(entry));
    }
  },

  startTimer(operation, metadata = {}) {
    const startTime = Date.now();
    return {
      end(status = "success", extraMeta = {}) {
        const durationMs = Date.now() - startTime;
        logger.info(`Completed: ${operation}`, {
          operation,
          durationMs,
          status,
          ...metadata,
          ...extraMeta,
        });
      },
      error(err, extraMeta = {}) {
        const durationMs = Date.now() - startTime;
        logger.error(`Failed: ${operation}`, err, {
          operation,
          durationMs,
          status: "failed",
          ...metadata,
          ...extraMeta,
        });
      }
    };
  }
};
