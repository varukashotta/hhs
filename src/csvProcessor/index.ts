import axios from "axios";
import {
  csvToJson,
  getUniqueColumnValuesFromCsv,
  readLocalFile
} from "../utils/index";
import graphqlClient from "../utils/GraphQLRequest";

const sleep = (waitTimeInMs: number) =>
  new Promise(resolve => setTimeout(resolve, waitTimeInMs));

const getCountryIDQuery = `query($name: String!){
    country_region(where: {name: {_eq: $name}}){
        id
      }
}`;

const addNewCountryQuery = `mutation($name: String!){
    insert_country_region(objects: {name: $name}) {
        returning{
            id
          }
      }
}`;

const getCountryFromDB = async (row: any, db: string) => {
  let country: any;

  let queryResult = await graphqlClient.request(getCountryIDQuery, {
    name: row.Country_Region
  });

  queryResult = queryResult[db];

  if (typeof queryResult !== "undefined" && queryResult.length > 0) {
    country = queryResult;
  } else {
    const result = await graphqlClient.request(addNewCountryQuery, {
      name: row.Country_Region
    });

    country = result;
  }

  return country;
};

const addRegionCoordinates = `mutation($coordinates: Point!, $countryRegionID: String, $provinceStateName: String!) {
    insert_geo_coordinates(objects: {coordinates: $coordinates, country_region_id: $countryRegionID, province_state: {data: {name: $provinceStateName}}}) {
      affected_rows
    }
  }`;

const checkProvinceSaveToDB = async (countryID: any, row: any) => {
  const { Province_State, Lat, Long_ } = row;
  if (Province_State) {
    const result = await graphqlClient.request(addRegionCoordinates, {
        coordinates: `point(${Lat} ${Long_})`,
      countryRegionID: countryID[0].id,
      provinceStateName: Province_State
    });

    console.log(result);
  }
};

const addRowsToDB = (rows: any) => {
  return new Promise((resolve, reject) => {
    rows.map(async (row: any) => {
      if (row.Country_Region) {
        try {
          const countryID = await getCountryFromDB(row, "country_region");

          await checkProvinceSaveToDB(countryID, row);

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
      "../datasources/04-01-2020.csv"
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

export const addCountryToDB = async (name: string) => {
  try {
    const result = await graphqlClient.request(addNewCountryQuery, { name });

    console.log(result.insert_country_region.returning);
  } catch (e) {
    console.log(e.response.errors);
  }
};

const iterateColumnsToDB = (columnValues: string[]) => {
  (async () => {
    for (const columnValue of columnValues) {
      const result = await addCountryToDB(columnValue);
      await sleep(1000);

      // do something with s and with fruitToLoad here
    }
  })();
};

export const addColumnValuesToDB = () => {
  axios
    .get(
      "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/03-31-2020.csv"
    )
    .then(async response => {
      // handle success
      try {
        const convertedResult = getUniqueColumnValuesFromCsv(response.data, 3);

        await iterateColumnsToDB(convertedResult);

        // addCountryToDB("namehy");
      } catch (error) {
        console.log(error);
      }
    })
    .catch(error => {
      // handle error
      console.log(error);
    });
};
