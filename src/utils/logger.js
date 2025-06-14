const isDev = process.env.NODE_ENV === 'development';

const logger = {
  info: (message, ...args) => {
    console.log(`[INFO] ${message}`, ...args);
  },
  
  error: (message, ...args) => {
    console.error(`[ERROR] ${message}`, ...args);
  },
  
  debug: (message, ...args) => {
    if (isDev) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  },
  
  warn: (message, ...args) => {
    console.warn(`[WARN] ${message}`, ...args);
  }
};

export default logger;
