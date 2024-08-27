import pino from 'pino';
import pinoHTTP from 'pino-http';

const levels = {
  emerg: 80,
  alert: 70,
  crit: 60,
  error: 50,
  warn: 40,
  notice: 30,
  info: 20,
  debug: 10,
};

const options = {
  level: process.env.PINO_LOG_LEVEL || 'info',
  customLevels: levels,
  useOnlyCustomLevels: true,
  formatters: {
    level(label: string): Record<string, string> {
      return { level: label.toUpperCase() };
    },
    bindings(bindings: Record<string, string>): Record<string, string> {
      return {
        pid: String(process.pid),
        hostname: bindings.hostname,
        node_version: process.version,
        app_version: String(process.env.npm_package_version),
      };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
};

const transport =
  process.env.NODE_ENV === 'development'
    ? {
        transport: {
          target: 'pino-pretty',
          options: {
            colorize: true,
            ignore: 'pid,hostname,node_version,app_version',
          },
        },
      }
    : {};

export const logger = pino({ ...options, ...transport });

export const httpLogger = pinoHTTP({ logger });
