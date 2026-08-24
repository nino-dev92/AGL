import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return stack
    ? `${timestamp} [${level}]: ${stack}`
    : `${timestamp} [${level}]: ${message}`;
});

const logger = winston.createLogger({
  level: "info",

  format: combine(
    timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    errors({ stack: true }),
    logFormat,
  ),

  transports: [
    new DailyRotateFile({
      filename: "logs/application-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxFiles: "14d",
    }),

    new DailyRotateFile({
      filename: "logs/error-%DATE%.log",
      level: "error",
      datePattern: "YYYY-MM-DD",
      maxFiles: "30d",
    }),

    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({
          format: "HH:mm:ss",
        }),
        logFormat,
      ),
    }),
  ],
});

export default logger;
