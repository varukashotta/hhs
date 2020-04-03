import axios from "axios";
import {
  csvToJson,
  getUniqueColumnValuesFromCsv,
  readLocalFile,
  CSVToArray
} from "../utils/index";
import graphqlClient from "../utils/GraphQLRequest";
import moment from "moment";

const sleep = (waitTimeInMs: number) =>
  new Promise(resolve => setTimeout(resolve, waitTimeInMs));

// const getCountryIDQuery = `query($name: String!){
//     country_region(where: {name: {_eq: $name}}){
//         id
//       }
// }`;

// const addNewCountryQuery = `mutation($name: String!){
//     insert_country_region(objects: {name: $name}) {
//         returning{
//             id
//           }
//       }
// }`;

// const getCountryFromDB = async (row: any, db: string) => {
//   let country: any;

//   let queryResult = await graphqlClient.request(getCountryIDQuery, {
//     name: row.Country_Region
//   });

//   queryResult = queryResult[db];

//   if (typeof queryResult !== "undefined" && queryResult.length > 0) {
//     country = queryResult;
//   } else {
//     const result = await graphqlClient.request(addNewCountryQuery, {
//       name: row.Country_Region
//     });

//     country = result;
//   }

//   return country;
// };

// const addProvinceStateCoordinates = `mutation($coordinates: point!, $countryRegionID: uuid!, $provinceStateName: String!, $admin: String) {
//     insert_geo_coordinates(objects: {coordinates: $coordinates, country_region_id: $countryRegionID, admin: $admin, province_state: {data: {name: $provinceStateName, country_id: $countryRegionID}}}) {
//           returning{
//       id
//       country_region{
//         name
//         province_states{
//           name
//         }
//       }
//     }
//     }
//   }`;

// const addCountryCoordinates = `mutation($coordinates: point!, $countryRegionID: uuid!) {
//     insert_geo_coordinates(objects: {coordinates: $coordinates, country_region_id: $countryRegionID}) {
//           returning{
//       id
//       country_region{
//         name
//         province_states{
//           name
//         }
//       }
//     }
//     }
//   }`;

const saveRow = `mutation($admin: String!, $active: Int!, $combinedKey: String!, $confirmed: Int!, $coordinates: point!, $countryRegion: String!, $lastUpdated: date!, $deaths: Int!, $fips: Int!, $provinceState: String!, $recovered: Int!){
    insert_recorded(objects: {admin: $admin, active: $active, combined_key: $combinedKey, confirmed: $confirmed, coordinates: $coordinates,
        country_region: $countryRegion, last_updated: $lastUpdated, deaths: $deaths, fips: $fips, province_state: $provinceState, recovered: $recovered}) {
      returning {
        country_region
      }
    }
  }
  `;

// const checkProvinceSaveToDB = async (countryID: any, row: any) => {
//   const { Province_State, Lat, Long_, Country_Region, Admin2 } = row;

//   console.log(Province_State, Lat, Long_, Country_Region, Admin2)

//   let result: any;

// if (Province_State) {
//     result = await graphqlClient.request(addProvinceStateCoordinates, {
//       coordinates: `${Lat}, ${Long_}`,
//       countryRegionID: countryID[0].id,
//       admin: Admin2,
//       provinceStateName: Province_State
//     });
//   }

//   console.log(result);
// };

const addRowsToDB = (rows: any) => {
  return new Promise((resolve, reject) => {
    rows.map(async (row: any) => {
      if (row) { 
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

          await addCountryToDB({
            countryRegion: Country_Region,

            admin: Admin2,

            provinceState: Province_State,

            coordinates: `${Lat || 0}, ${Long_ || 0}`,
            // tslint:disable-next-line: radix
            deaths: parseInt(Deaths) || 0,
            // tslint:disable-next-line: radix
            recovered: parseInt(Recovered) ? parseInt(Recovered) : 0,
            // tslint:disable-next-line: radix
            active: parseInt(Active) || 0,
            // tslint:disable-next-line: radix
            confirmed: parseInt(Confirmed) ? parseInt(Confirmed) : 0,

            combinedKey: Combined_Key ? Combined_Key.replace(/^,/, '') : "",

            lastUpdated: moment(new Date(Last_Update)).format(),

            // tslint:disable-next-line: radix
            fips: parseInt(FIPS) ? parseInt(FIPS) : 0
          });

          await sleep(10000);

          resolve(true);
        } catch (e) {
          console.log(e);
          await sleep(10000);

          reject(e);
        }
      }
    });
  });
};

export const getCSV = async () => {
  try {
    const result: string | void = await readLocalFile(
      "../data/04-02-2020.csv"
    );

    const convertedResult = await csvToJson(String(result));

    addRowsToDB(convertedResult);
  } catch (error) {
    // handle error
    console.log(error);
  }

  //   axios
  //     .get(
  //       "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/03-31-2020.csv"
  //     )
  //     .then(async response => {
  //       // handle success
  //       try {
  //         const convertedResult = await csvToJson(response.data);

  //         console.log("here");

  //         addRowsToDB(convertedResult);
  //       } catch (error) {
  //         console.log(error.response.data);
  //       }
  //     })
  //     .catch(error => {
  //       // handle error
  //       console.log(error);
  //     });
};

export const addCountryToDB = async (params: any) => {
  try {
    const result = await graphqlClient.request(saveRow, params);
  } catch (e) {
    console.log(e);
  }
};

// const iterateColumnsToDB = (columnValues: string[]) => {
//   (async () => {
//     for (const columnValue of columnValues) {

//       const result = await addCountryToDB();
//       await sleep(1000);

//       // do something with s and with fruitToLoad here
//     }
//   })();
// };

// export const addColumnValuesToDB = () => {
//   axios
//     .get(
//       "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/03-31-2020.csv"
//     )
//     .then(async response => {
//       // handle success
//       try {
//         const convertedResult = getUniqueColumnValuesFromCsv(response.data, 3);

//         await iterateColumnsToDB(convertedResult);

//         // addCountryToDB("namehy");
//       } catch (error) {
//         console.log(error);
//       }
//     })
//     .catch(error => {
//       // handle error
//       console.log(error);
//     });
// };
