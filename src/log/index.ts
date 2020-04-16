import winston, { format } from "winston";
import { Loggly } from "winston-loggly-bulk";
import dotenv from "dotenv";
import { ElasticSearchClient } from "../search/elasticsearch";
import { ElasticsearchTransport } from "winston-elasticsearch";
const client = ElasticSearchClient();

// dotenv.config();
// let  apm = require("elastic-apm-node").start({
//   // Override service name from package.json
//   // Allowed characters: a-z, A-Z, 0-9, -, _, and space
//   serviceName: "hhs",

//   environment: `${process.env.NODE_ENV}`,

//   // Use if APM Server requires a token
//   secretToken: "0gcOqtwZe2LBLhFWuA",

//   // Set custom APM Server URL (default: http://localhost:8200)
//   serverUrl:
//     "https://5937c8a340f749e8b814d3753ae70cd2.apm.ap-southeast-2.aws.cloud.es.io:443",
// });


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
    errorStackTracerFormat()
  ),
  defaultMeta: { service: "avail" },
  transports: [
    //
    // - Write all logs with level `error` and below to `error.log`
    // - Write all logs with level `info` and below to `combined.log`
    //
    new winston.transports.File({
      filename: "./src/log/info.log",
      level: "info",
    }),
    new winston.transports.File({
      filename: "./src/log/mail.log",
      level: "mail",
    }),
    new ElasticsearchTransport({
      level: "info",
      clientOpts: {
        node: `${process.env.ELASTIC_SEARCH_SERVER_URL}`,
        auth: {
          apiKey: {
            api_key: `${process.env.ELASTIC_SEARCH_SERVER_API_KEY}`,
            id: `${process.env.ELASTIC_SEARCH_SERVER_API_ID}`,
          },
        },
      },
      index: "human-hope-server-logs",
    }),
    new winston.transports.File({
      filename: "./src/log/error.log",
      level: "error",
    }),
    // new winston.transports.File({ filename: "./src/log/combined.log" }),
    new Loggly({
      token: `${process.env.LOGGLY_TOKEN}`,
      subdomain: "alkashotta",
      tags: ["aval-server"],
      json: true,
    }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}

export const stream = {
  write: (message: string) => {
    logger.info(message);
  },
};
