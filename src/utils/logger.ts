interface LogLevel {
  ERROR: 'error';
  WARN: 'warn';
  INFO: 'info';
  DEBUG: 'debug';
}

const LOG_LEVELS: LogLevel = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
};

class Logger {
  private isDevelopment = __DEV__;
  private enabledLevels: string[];

  constructor() {
    // In production, only log errors and warnings
    this.enabledLevels = this.isDevelopment 
      ? ['error', 'warn', 'info', 'debug']
      : ['error', 'warn'];
  }

  private shouldLog(level: string): boolean {
    return this.enabledLevels.includes(level);
  }

  private formatMessage(level: string, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    
    if (data) {
      return `${prefix} ${message} ${JSON.stringify(data)}`;
    }
    return `${prefix} ${message}`;
  }

  error(message: string, error?: any): void {
    if (this.shouldLog(LOG_LEVELS.ERROR)) {
      console.error(this.formatMessage('error', message, error));
      
      // In production, you might want to send errors to a service like Sentry
      if (!this.isDevelopment && error) {
        // TODO: Integrate with error reporting service
        // Sentry.captureException(error);
      }
    }
  }

  warn(message: string, data?: any): void {
    if (this.shouldLog(LOG_LEVELS.WARN)) {
      console.warn(this.formatMessage('warn', message, data));
    }
  }

  info(message: string, data?: any): void {
    if (this.shouldLog(LOG_LEVELS.INFO)) {
      console.info(this.formatMessage('info', message, data));
    }
  }

  debug(message: string, data?: any): void {
    if (this.shouldLog(LOG_LEVELS.DEBUG)) {
      console.log(this.formatMessage('debug', message, data));
    }
  }

  // Service-specific loggers
  auth(message: string, data?: any): void {
    this.info(`[AUTH] ${message}`, data);
  }

  event(message: string, data?: any): void {
    this.info(`[EVENT] ${message}`, data);
  }

  notification(message: string, data?: any): void {
    this.info(`[NOTIFICATION] ${message}`, data);
  }

  firebase(message: string, data?: any): void {
    this.info(`[FIREBASE] ${message}`, data);
  }
}

export const logger = new Logger();
export default logger; 