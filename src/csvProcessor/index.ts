import { csvToJson, readLocalFile } from "../utils/index";
import graphqlClient from "../utils/GraphQLRequest";
import moment from "moment";
import { searchDoc } from "../search/elasticsearch";
import { millisecondsToMinutesAndSeconds } from "../datasources/utils";
import { logger } from "../log";

const saveRow = `mutation($admin: String!, $active: Int!, $combinedKey: String!, $confirmed: Int!, $coordinates: point!, $countryRegion: String!, $lastUpdated: date!, $deaths: Int!, $fips: Int!, $provinceState: String!, $recovered: Int!){
    insert_recorded(objects: {admin: $admin, active: $active, combined_key: $combinedKey, confirmed: $confirmed, coordinates: $coordinates,
        country_region: $countryRegion, last_updated: $lastUpdated, deaths: $deaths, fips: $fips, province_state: $provinceState, recovered: $recovered}, on_conflict: {constraint: recorded_pkey, update_columns: [deaths, active, recovered, confirmed]}) {
      returning {
        active
        admin
        combined_key
        confirmed
        coordinates
        country_region
        deaths
        last_updated
        id
        updated_at
        province_state
        created_at
        recovered
      }
    }
  }
  `;

const addRowsToDB = (rows: any) => {
  (async () => {
    await runShow(rows);
  })();
};

export const getCSV = async () => {
  try {
    const result: string | void = await readLocalFile("../data/04-02-2020.csv");

    const convertedResult = csvToJson(String(result));

    addRowsToDB(convertedResult);
  } catch (error) {
    // handle error
    return error;
  }
};

export const addCountryToDB = async (params: any) => {
  try {
    const result = await graphqlClient.request(saveRow, params);
    return result;
  } catch (e) {
    logger.error(e);
  }
};

async function runShow(rows: any) {
  const start = new Date().getTime();
  let i = 0;

  for (const row of rows) {
    i++;

    const loopStart = new Date().getTime();

    if (row.Country_Region) {
      try {
        const {
          Province_State,
          Lat,
          Long_,
          Country_Region,
          Admin2,
          Deaths,
          Confirmed,
          Active,
          Combined_Key,
          Last_Update,
          FIPS,
          Recovered,
        } = row;
        const input = {
          countryRegion: Country_Region,
          admin: Admin2 || "",
          provinceState: Province_State || "",
          coordinates: `${Lat || 0}, ${Long_ || 0}`,
          // tslint:disable-next-line: radix
          deaths: parseInt(Deaths) || 0,
          // tslint:disable-next-line: radix
          recovered: parseInt(Recovered) ? parseInt(Recovered) : 0,
          // tslint:disable-next-line: radix
          active: parseInt(Active) || 0,
          // tslint:disable-next-line: radix
          confirmed: parseInt(Confirmed) ? parseInt(Confirmed) : 0,
          combinedKey: Combined_Key || "",
          lastUpdated: moment(new Date(Last_Update)).format(),
          // tslint:disable-next-line: radix
          fips: parseInt(FIPS) ? parseInt(FIPS) : 0,
        };
        const addedRowResult = await addCountryToDB(input);

        logger.info(addedRowResult.insert_recorded.returning[0].id);

        if (addedRowResult) {
          await new Promise(async (resolve, reject) => {
            if (
              addedRowResult &&
              addedRowResult.insert_recorded.returning.length > 0
            ) {
              const {
                last_updated,
                combined_key,
              } = addedRowResult.insert_recorded.returning[0];

              const updatedRecord = await searchDoc(
                last_updated,
                combined_key,
                addedRowResult.insert_recorded.returning[0]
              );


              // logger.info({ updatedRecord });

              console.log({ updatedRecord });


              resolve(true);
            } else {
              reject(new Error(`Could not add ${addedRowResult.insert_recorded.returning[0].id} to search queue`));
            }
          });
        }
      } catch (e) {
        logger.error(e);
      }
    }
    logger.info({ message: i });
    const end = new Date().getTime();
    const time = end - start;
    const loopTime = end - loopStart;

    logger.info("Loop Execution time: " + millisecondsToMinutesAndSeconds(loopTime));
    logger.info("Execution time: " + millisecondsToMinutesAndSeconds(time));
  }
  const end = new Date().getTime();
  const time = end - start;
  logger.info("Execution time: " + millisecondsToMinutesAndSeconds(time));
}
