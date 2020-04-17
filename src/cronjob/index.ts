import { gitHub } from "../csvProcessor/getData";
import { logger } from "../log";
import fs from "fs";
import axios from "axios";

const csvFolder = `${__dirname}/../data/`;

const checkCsvFile = (committedDate: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      const files: string[] = await fs.readdirSync(csvFolder);

      if (Array.isArray(files)) {
        const fileSearchResult = await checkIfMatchingCSVExists(
          files,
          committedDate
        );
        resolve(fileSearchResult);
      } else {
        reject(new Error("Error looking for files in local folder!"));
      }
    } catch (e) {
      reject(e);
    }
  });
};

const unleashDragon = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const lastCommitted: string = await gitHub();
      if (lastCommitted) {
        const files = await checkCsvFile(lastCommitted);
        resolve(files);
      } else {
        logger.error("Error retrieving data from github!");
        reject(new Error("Error retrieving data from github!"));
      }
      resolve(lastCommitted);
    } catch (e) {
      console.log(e);
      logger.error(e);
      reject(e);
    }
  });
};

const checkIfMatchingCSVExists = async (
  files: string[],
  commitDate: string
) => {
  return new Promise(async (resolve, reject) => {
    const fileFound = files.filter((file) => file.includes(commitDate));
    if (fileFound.length > 0) {
      resolve("fileFound");
    } else {
      let toast = await getFileFromServer(commitDate);

      console.log(toast);

      resolve(toast);
    }
  });
};

//TODO: Make temp folder, store scv, process  , save to DB , create matching csvs
export const getFileFromServer = async (commitDate: string) => {
  return new Promise(async (resolve, reject) => {
    let resp: any;
    try {
      resp = await axios.get(
        "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/04-16-2020.csv"
      );

      let saveFile = await writeToFile(resp);

      console.log(saveFile);
      
      resolve(saveFile);
    } catch (e) {
      logger.error(e);
      reject(new Error("Could not write csv to file!"));
    }
  });
};

export const writeToFile = async (data: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      const writingFileError = await fs.writeFileSync(
        `${__dirname}/../data/yes.csv`,
        String(data.data)
      );

      resolve(writingFileError);
    } catch (error) {
      reject(error);
    }
  });
};

export default unleashDragon;
