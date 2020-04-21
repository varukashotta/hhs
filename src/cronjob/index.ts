import { gitHub } from "../csvProcessor/getData";
import { logger } from "../log";
import fs from "fs";
import axios from "axios";
import moment from "moment";
import { cleanUpCSV } from "../csvProcessor/directImport";
import { readLocalFile } from "../utils";
import { sendToDB } from "../csvProcessor/dbImport";

const csvFolder = `${__dirname}/../data/`;

const COVID_CSV_REPO =
  "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/";
interface IProps {
  fileName: string;
  lastCommittedTime: string;
}

let result: IProps;

const listCSVDirectory = (): Promise<string[]> => {
  return new Promise(async (resolve, reject) => {
    try {
      const files: string[] = await fs.readdirSync(csvFolder);
      resolve(files);
    } catch (e) {
      reject(e);
    }
  });
};

const checkIfMatchingCSVExists = async (): Promise<any> => {
  const { lastCommittedTime } = result;
  return new Promise(async (resolve, reject) => {
    try {
      const filesStored: any = await listCSVDirectory();
      const fileFound =
        filesStored &&
        filesStored.filter((file: any) => file.includes(lastCommittedTime));
      if (fileFound && fileFound.length > 0) {
        resolve("Nothing to update, records have not changed!");
      } else {
        const gitHubResponse = await getFileFromServer();
        resolve(gitHubResponse);
      }
    } catch (e) {
      reject(e);
    }
  });
};

// TODO: Make temp folder, store scv, process  , save to DB , create matching csv
export const getFileFromServer = async () => {
  const { fileName } = result;
  const csvFileDate = moment(fileName).format("MM-DD-YYYY");
  return new Promise(async (resolve, reject) => {
    let resp: any;
    try {
      resp = await axios.get(`${COVID_CSV_REPO + csvFileDate}.csv`);
      const saveFile = await writeToFile(resp);
      resolve(saveFile);
    } catch (e) {
      reject(new Error(`${e}`));
    }
  });
};

export const writeToFile = async (data: any) => {
  const { fileName, lastCommittedTime } = result;

  return new Promise(async (resolve, reject) => {
    try {
      const writingFile = await fs.writeFileSync(
        `${__dirname}/../data/${fileName}-${lastCommittedTime}.csv`,
        String(data.data)
      );

      const comparedCSV = await checkCSVDates();
      resolve(comparedCSV);
    } catch (error) {
      reject(error);
    }
  });
};

export const checkCSVDates = async () => {
  const { fileName } = result;
  return new Promise(async (resolve, reject) => {
    const files: string[] = await listCSVDirectory();

    if (files[0].includes(fileName) && files.length > 1) {
      // Compare the csv files and update existinxg records
      resolve("Compare");
    } else {
      const file = files.filter((csvFile) => csvFile.includes(fileName));

      await cleanUpCSV(file[0]);

      const finalProcess = await convertCSVtoTSVImportToDB();

      // Create new records and delete existing file
      resolve(finalProcess);
    }
  });
};

export const convertCSVtoTSVImportToDB = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const file: any = await readLocalFile(`../data/dbImport.csv`);

      let array: string[];

      array = file.split("\n");

      array.pop();

      let csv: string = "";

      array.map((arr) => {
        if (arr.indexOf("confirmed") === -1) {
          csv += arr + "\n";
        }
      });

      let cleanedCSV = csv.replace(/,/g, "\t");

      cleanedCSV = cleanedCSV.replace(/"[^"]+"/g, (v: string) => {
        return v.replace(/\t/g, ",");
      });

      fs.writeFileSync(`${__dirname}/../data/dbImport.csv`, cleanedCSV, "utf8");

      const DBSaveResult = await sendToDB();

      resolve(DBSaveResult);
    } catch (error) {
      reject(error);
    }
  });
};

const unleashDragon = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      result = await gitHub();
      const { lastCommittedTime } = result;
      if (lastCommittedTime) {
        const files = await checkIfMatchingCSVExists();
        resolve(files);
      } else {
        reject(new Error("Error retrieving data from github!"));
      }
    } catch (e) {
      logger.error(e);
      reject(e);
    }
  });
};

export default unleashDragon;
