import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log levels
const LogLevels = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
};

// Colors for console output
const colors = {
  ERROR: '\x1b[31m', // Red
  WARN: '\x1b[33m',  // Yellow
  INFO: '\x1b[36m',  // Cyan
  DEBUG: '\x1b[35m', // Magenta
  RESET: '\x1b[0m',  // Reset
};

class Logger {
  constructor() {
    this.logLevel = process.env.LOG_LEVEL || 'INFO';
    this.logToFile = process.env.LOG_TO_FILE === 'true';
    this.logToConsole = process.env.LOG_TO_CONSOLE !== 'false';
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaString = Object.keys(meta).length > 0 ? JSON.stringify(meta, null, 2) : '';
    
    return {
      timestamp,
      level,
      message,
      meta,
      formatted: `[${timestamp}] ${level}: ${message}${metaString ? '\n' + metaString : ''}`,
    };
  }

  shouldLog(level) {
    const levels = Object.keys(LogLevels);
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    
    return messageLevelIndex <= currentLevelIndex;
  }

  writeToFile(level, formattedMessage) {
    if (!this.logToFile) return;

    const filename = `${level.toLowerCase()}.log`;
    const filepath = path.join(logsDir, filename);
    
    fs.appendFile(filepath, formattedMessage + '\n', (err) => {
      if (err) {
        console.error('Failed to write to log file:', err);
      }
    });

    // Also write to combined log
    const combinedPath = path.join(logsDir, 'combined.log');
    fs.appendFile(combinedPath, formattedMessage + '\n', (err) => {
      if (err) {
        console.error('Failed to write to combined log file:', err);
      }
    });
  }

  writeToConsole(level, message, meta) {
    if (!this.logToConsole) return;

    const color = colors[level] || colors.RESET;
    const timestamp = new Date().toISOString();
    
    console.log(
      `${color}[${timestamp}] ${level}:${colors.RESET} ${message}`
    );
    
    if (Object.keys(meta).length > 0) {
      console.log(JSON.stringify(meta, null, 2));
    }
  }

  log(level, message, meta = {}) {
    if (!this.shouldLog(level)) return;

    const formatted = this.formatMessage(level, message, meta);
    
    this.writeToConsole(level, message, meta);
    this.writeToFile(level, formatted.formatted);
  }

  error(message, meta = {}) {
    this.log(LogLevels.ERROR, message, meta);
  }

  warn(message, meta = {}) {
    this.log(LogLevels.WARN, message, meta);
  }

  info(message, meta = {}) {
    this.log(LogLevels.INFO, message, meta);
  }

  debug(message, meta = {}) {
    this.log(LogLevels.DEBUG, message, meta);
  }

  // Request logging middleware
  requestLogger() {
    return (req, res, next) => {
      const start = Date.now();
      
      // Log request
      this.info('Incoming request', {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id,
      });

      // Override res.end to log response
      const originalEnd = res.end;
      res.end = function(chunk, encoding) {
        const duration = Date.now() - start;
        
        logger.info('Request completed', {
          method: req.method,
          url: req.originalUrl,
          statusCode: res.statusCode,
          duration: `${duration}ms`,
          userId: req.user?.id,
        });

        originalEnd.call(this, chunk, encoding);
      };

      next();
    };
  }

  // Performance logging
  performance(label, fn) {
    return async (...args) => {
      const start = Date.now();
      
      try {
        const result = await fn(...args);
        const duration = Date.now() - start;
        
        this.debug(`Performance: ${label}`, {
          duration: `${duration}ms`,
          success: true,
        });
        
        return result;
      } catch (error) {
        const duration = Date.now() - start;
        
        this.error(`Performance: ${label} failed`, {
          duration: `${duration}ms`,
          error: error.message,
        });
        
        throw error;
      }
    };
  }

  // Database query logging
  queryLogger(query, params = []) {
    const start = Date.now();
    
    return {
      success: (result) => {
        const duration = Date.now() - start;
        this.debug('Database query executed', {
          query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
          params,
          duration: `${duration}ms`,
          rowCount: result?.rowCount || result?.length || 0,
        });
      },
      error: (error) => {
        const duration = Date.now() - start;
        this.error('Database query failed', {
          query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
          params,
          duration: `${duration}ms`,
          error: error.message,
        });
      },
    };
  }

  // Clean old log files (keep last 30 days)
  cleanOldLogs() {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    fs.readdir(logsDir, (err, files) => {
      if (err) {
        this.error('Failed to read logs directory', { error: err.message });
        return;
      }

      files.forEach(file => {
        const filepath = path.join(logsDir, file);
        
        fs.stat(filepath, (err, stats) => {
          if (err) return;
          
          if (stats.mtime < thirtyDaysAgo) {
            fs.unlink(filepath, (err) => {
              if (err) {
                this.error('Failed to delete old log file', { 
                  file, 
                  error: err.message 
                });
              } else {
                this.info('Deleted old log file', { file });
              }
            });
          }
        });
      });
    });
  }
}

// Create singleton instance
const logger = new Logger();

// Clean old logs on startup
logger.cleanOldLogs();

// Schedule log cleanup daily
setInterval(() => {
  logger.cleanOldLogs();
}, 24 * 60 * 60 * 1000); // 24 hours

export default logger;
