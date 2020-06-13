import pg, {Pool, Client} from "pg";
import copyFrom from "pg-copy-streams";
import fs from "fs";
import dotenv from "dotenv";
import {millisecondsToMinutesAndSeconds} from "../datasources/utils";
import {logger} from "../log/index";

pg.defaults.ssl = true;

dotenv.config();

const connectionString = `${process.env.DB_URL}`;

export const sendToDB = async () => {
    return new Promise(async (resolve, reject) => {
        try {
            console.log("sendToBD");

            const start = Date.now();

            const pool = new pg.Pool({
                connectionString,
                ssl: {rejectUnauthorized: false},
            });

            try {

                pool.connect((err, client, done) => {

                    let truncateResult = client.query(
                        "TRUNCATE table wadedafinal RESTART IDENTITY"
                    );
                    client.release();

                    console.log(truncateResult);
                })
            } catch (e) {
                console.log(e);
            }

            pool.connect((err, client, done) => {

                const stream = client.query(copyFrom.from("COPY wadedafinal FROM STDIN"));

                console.log("here2");

                const fileStream = fs.createReadStream(
                    `${__dirname}/../data/dbImport.csv`
                );

                console.log("here3");

                stream.on("error", (e: any) => {
                    console.log(e);
                    reject(new Error(`Stream error, ${e}`));
                });

                fileStream.on("error", (e) => {
                    console.log(e);
                    reject(new Error(`File stream - Stream error, ${e}`));
                });

                stream.on("end", () => logger.info("finito la  musica"));

                const time = Date.now() - start;

                console.log("here");

                fileStream.pipe(stream);

                resolve(`pasala la fest ${millisecondsToMinutesAndSeconds(time)}`);


                fileStream.on("close", () => {
                    fs.unlink(`${__dirname}/../data/dbImport.csv`, (err) => {
                        if (err) console.log(err);
                        logger.info("successfully deleted");
                    });

                });

            })

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
//   incidence_rate text  NULL,
//   case_fatality_ratio text  NULL,
//   uuid text  NOT NULL,
//   created_at timestamp with time zone  NULL,
//   updated_at timestamp with time zone  NULL,
//     last_commit timestamp with time zone  NULL
// );
//
// CREATE OR REPLACE VIEW "public"."country_total_numbers" AS
// SELECT DISTINCT wadedafinal.last_commit,
//     wadedafinal.country_region,
//     sum(wadedafinal.active) AS active,
//     sum(wadedafinal.deaths) AS deaths,
//     sum(wadedafinal.recovered) AS recovered,
//     sum(wadedafinal.confirmed) AS confirmed,
//     min((wadedafinal.lat)::text) AS latitude,
//     min((wadedafinal.long_)::text) AS longitude
// FROM wadedafinal
// GROUP BY wadedafinal.country_region, wadedafinal.last_commit;
//
// CREATE OR REPLACE VIEW "public"."world_total_numbers" AS
// SELECT DISTINCT wadedafinal.last_commit,
//     sum(wadedafinal.active) AS active,
//     sum(wadedafinal.deaths) AS deaths,
//     sum(wadedafinal.recovered) AS recovered,
//     sum(wadedafinal.confirmed) AS confirmed
// FROM wadedafinal
// GROUP BY wadedafinal.last_commit;