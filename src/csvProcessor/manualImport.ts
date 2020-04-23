import { csvToJson, readLocalFile } from "../utils/index";
import graphqlClient from "../utils/GraphQLRequest";
import moment from "moment";
import { searchDoc } from "../search/elasticsearch";
import { millisecondsToMinutesAndSeconds } from "../datasources/utils";
import { logger } from "../log";

const saveRow = `
  mutation MyMutation($combinedKey: String!, $lastUpdatedKey: timestamptz!, $lastUpdated: timestamptz!, $active: Int!, $deaths: Int!, $confirmed: Int!, $recovered: Int!) {
    update_wadedafinal(where: {combined_key: {_eq: $combinedKey}, last_update: {_eq: $lastUpdatedKey}}, _set: {active: $active, deaths: $deaths, last_update: $lastUpdated, confirmed: $confirmed, recovered: $recovered}) {
      affected_rows
      returning {
        active
        admin2
        combined_key
        confirmed
        country_region
        created_at
        deaths
        fips
        last_update
        lat
        long_
        province_state
        recovered
        updated_at
        uuid
      }
    }
  }
  `;

export const startManualImport = async (lastUpdatedCSVDateTime:string) => {
  return new Promise(async (resolve, reject) => {
    try {
      const result: string | void = readLocalFile(`../tmp/temp.csv`);

      const numberOfRows = String(result).split("\n");

      if(numberOfRows.length > 1){

      const convertedResult = csvToJson(String(result));

      const updateResult = updateDatabase(convertedResult, lastUpdatedCSVDateTime);

      resolve(updateResult);
      } else {
        reject(new Error('Nothing to update!'));
      }
    } catch (error) {
      reject(new Error(error));
    }
  });
};

export const addCountryToDB = async (params: any): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await graphqlClient.request(saveRow, params);

      // const addedToSearchQueue = await updateItemInSearch(result);

      resolve(JSON.stringify(result));
    } catch (e) {
      reject(new Error(e));
    }
  });
};

export const updateDatabase = async (rows: any, lastUpdatedCSVDateTime:string) => {
  return new Promise(async (resolve, reject) => {
    try {
      resolve('Here now!')
      for (const row of rows) {
        if (row.Country_Region) {
          const {
            Deaths,
            Confirmed,
            Active,
            Combined_Key,
            Last_Update,
            Recovered,
          } = row;
          const input = {
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

            lastUpdatedKey: lastUpdatedCSVDateTime
            // tslint:disable-next-line: radix
          };
          const addedRowResult = await addCountryToDB(input);

          resolve(addedRowResult);
        }
      }
    } catch (error) {
      reject(new Error(error));
    }
  });
};

export const updateItemInSearch = async (addedRowResult: any) => {
  return new Promise(async (resolve, reject) => {
    if (addedRowResult && addedRowResult.insert_recorded.returning.length > 0) {
      try {
        const {
          last_updated,
          combined_key,
        } = addedRowResult.insert_recorded.returning[0];

        const updatedRecord = await searchDoc(
          last_updated,
          combined_key,
          addedRowResult.insert_recorded.returning[0]
        );

        console.log({ updatedRecord });
        resolve(`Added ${combined_key} record to search queue!`);
      } catch (error) {
        reject(new Error(error));
      }
    } else {
      reject(
        new Error(
          `Could not add ${addedRowResult.insert_recorded.returning[0].id} to search queue`
        )
      );
    }
  });
};
