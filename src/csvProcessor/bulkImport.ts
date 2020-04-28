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
      console.log('sendToBD');

      const start = Date.now();

      const client = new Client({
        connectionString,
        ssl: { rejectUnauthorized: false },
      });

      await client.connect();

      const stream = client.query(copyFrom.from("COPY wadedafinal FROM STDIN"));

      console.log('here2');

      const fileStream = fs.createReadStream(
        `${__dirname}/../data/dbImport.csv`
      );

      console.log('here3');

      stream.on("error", (e: any) => {
        reject(new Error(`Stream error, ${e}`));
      });

      fileStream.on("error", (e) => {
        reject(new Error(`File stream - Stream error, ${e}`));
      });

      stream.on("end", () => logger.info("finito la  musica"));

      const time = Date.now() - start;

      console.log('here');

      fileStream.on("close", () => {
        fs.unlink(`${__dirname}/../data/dbImport.csv`, (err) => {
          if (err) console.log(err);
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


// CREATE TABLE public.wadedafinal (
//   fips character varying(50)  NULL,
//   admin2 character varying(50)  NULL,
//   province_state character varying(50)  NULL,
//   country_region character varying(50)  NULL,
//   last_update timestamp with time zone  NULL,
//   lat character varying(50)  NULL,
//   long_ character varying(50)  NULL,
//   confirmed integer  NULL,
//   deaths integer  NULL,
//   recovered integer  NULL,
//   active integer  NULL,
//   combined_key text  NULL,
//   uuid text  NOT NULL,
//   created_at timestamp with time zone  NULL,
//   updated_at timestamp with time zone  NULL
// );
