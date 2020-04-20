import pg, { Pool, Client } from "pg";
import copyFrom from "pg-copy-streams";
import fs from "fs";
import dotenv from "dotenv";
import { millisecondsToMinutesAndSeconds } from '../datasources/utils';
pg.defaults.ssl = true;

dotenv.config();


const connectionString = `${process.env.DB_URL}`;

export const sendToDB = async () => {
const start = Date.now();
  try {
    const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });

    await client.connect()

    const stream =  await client.query(copyFrom.from("COPY wadeda FROM STDIN"));

    const fileStream = fs.createReadStream(`world.csv`);

    stream.on('error', (e) => console.log(e));

    fileStream.on('error', (e) => console.log(e))

    stream.on('end', (e: any) => console.log('finito la  musica', e));

    fileStream.on('close', (e: any) => console.log('pasala la fest', e))

    await fileStream.pipe(stream);


  } catch (e) {
    console.log(e);
  }

  let time = Date.now() - start;

  console.log(millisecondsToMinutesAndSeconds(time));

};
 