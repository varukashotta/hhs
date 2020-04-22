import pg, { Pool, Client } from "pg";
import copyFrom from "pg-copy-streams";
import fs from "fs";
import dotenv from "dotenv";
import { millisecondsToMinutesAndSeconds } from "../datasources/utils";
import { logger } from "../log/index";
pg.defaults.ssl = true;

dotenv.config();

const connectionString = `${process.env.DB_URL}`;

export const sendToDB = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const start = Date.now();

      const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false },
      });

      await client.connect();

      const stream = client.query(copyFrom.from("COPY wadeda FROM STDIN"));

      const fileStream = fs.createReadStream(
        `${__dirname}/../data/dbImport.csv`
      );

      stream.on("error", (e: any) => {
        reject(new Error(`Stream error, ${e}`));
      });

      fileStream.on("error", (e) => {
        reject(new Error(`File stream - Stream error, ${e}`));
      });

      stream.on("end", () => logger.info("finito la  musica"));

      const time = Date.now() - start;

      fileStream.on("close", () => {
        fs.unlink(`${__dirname}/../data/dbImport.csv`, (err) => {
          if (err) throw err;
          logger.info("successfully deleted");
        });

        resolve(`pasala la fest ${millisecondsToMinutesAndSeconds(time)}`);
      });

      fileStream.pipe(stream);
    } catch (e) {
      reject(e);
    }
  });
};
