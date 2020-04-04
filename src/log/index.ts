import winston, { format } from 'winston';
import { Loggly } from 'winston-loggly-bulk';
import dotenv from 'dotenv';

dotenv.config();

const errorStackTracerFormat = winston.format((info) => {
  if (info.meta && info.meta instanceof Error) {
    // eslint-disable-next-line no-param-reassign
    info.message = `${info.message} - ${info.meta.stack}`;
  }
  return info;
});

export const logger = winston.createLogger({
  format: format.combine(
    format.timestamp(),
    format.colorize(),
    format.json(),
    format.prettyPrint(),
    errorStackTracerFormat(),
  ),
  defaultMeta: { service: 'avail' },
  transports: [
    //
    // - Write all logs with level `error` and below to `error.log`
    // - Write all logs with level `info` and below to `combined.log`
    //
    new winston.transports.File({
      filename: './src/log/info.log',
      level: 'info',
    }),
    new winston.transports.File({
      filename: './src/log/mail.log',
      level: 'mail',
    }),
    new winston.transports.File({
      filename: './src/log/error.log',
      level: 'error',
    }),
    // new winston.transports.File({ filename: "./src/log/combined.log" }),
    new Loggly({
      token: `${process.env.LOGGLY_TOKEN}`,
      subdomain: 'alkashotta',
      tags: ['aval-server'],
      json: true,
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

export const stream = {
  write: (message: string) => {
    logger.info(message);
  },
};
