import axios from "axios";
import { csvToJson, getUniqueColumnValuesFromCsv } from '../utils/index';
import graphqlClient from "../utils/GraphQLRequest";

export const getCSV = () => {
  axios
    .get(
      "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/03-31-2020.csv"
    )
    .then(async response => {
      // handle success
      try {
        let convertedResult = csvToJson(response.data);

        console.log(convertedResult);
      } catch (error) {
        console.log(error);
      }
    })
    .catch(error => {
      // handle error
      console.log(error);
    });
};

const query = `mutation($name: String!){
    insert_country_region(objects: {name: $name}) {
        affected_rows
      }
}`;

export const addCountryToDB = async(name:string) => {
  try {
    await graphqlClient.request(query, { name});
  } catch (e) {
    console.log(e);
  }
};

const iterateColumnsToDB = (columnValues:string[]) => {
    (async () => {
        for (let columnValue of columnValues) {
            addCountryToDB(columnValue);
            // do something with s and with fruitToLoad here
        }
    
    })();
}

export const addColumnValuesToDB = () => {
  axios
    .get(
      "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/03-31-2020.csv"
    )
    .then(async response => {
      // handle success
      try {
        let convertedResult = getUniqueColumnValuesFromCsv(response.data, 3);

        iterateColumnsToDB(convertedResult);

        console.log(convertedResult);
      } catch (error) {
        console.log(error);
      }
    })
    .catch(error => {
      // handle error
      console.log(error);
    });
};
