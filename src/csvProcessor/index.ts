import { csvToJson, readLocalFile } from "../utils/index";
import graphqlClient from "../utils/GraphQLRequest";
import moment from "moment";

const saveRow = `mutation($admin: String!, $active: Int!, $combinedKey: String!, $confirmed: Int!, $coordinates: point!, $countryRegion: String!, $lastUpdated: date!, $deaths: Int!, $fips: Int!, $provinceState: String!, $recovered: Int!){
    insert_recorded(objects: {admin: $admin, active: $active, combined_key: $combinedKey, confirmed: $confirmed, coordinates: $coordinates,
        country_region: $countryRegion, last_updated: $lastUpdated, deaths: $deaths, fips: $fips, province_state: $provinceState, recovered: $recovered}, on_conflict: {constraint: recorded_pkey, update_columns: [deaths, active, recovered, confirmed]}) {
      returning {
        country_region
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

    const convertedResult = await csvToJson(String(result));

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
    console.log(e);
  }
};

async function runShow(rows: any) {
  for (const row of rows) {
    if (row.Country_Region) {
      console.log(row);
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
          Recovered
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
          fips: parseInt(FIPS) ? parseInt(FIPS) : 0
        };
        const result: any = await addCountryToDB(input);
        console.log(result);
      } catch (e) {
        console.log(e);
      }
    }
  }
}
