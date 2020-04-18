import { gitHub } from "../csvProcessor/getData";
import { logger } from "../log";
import fs from "fs";
import axios from "axios";
import moment from "moment";

const csvFolder = `${__dirname}/../data/`;
const COVID_CSV_REPO =
  "https://raw.githubusercontent.com/CSSEGISandData/COVID-19/master/csse_covid_19_data/csse_covid_19_daily_reports/";
interface IProps {
  fileName: string;
  lastCommittedTime: string;
}

let result: IProps;

const listCSVDirectory = () => {
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
        resolve("fileFound");
      } else {
        const toast = await getFileFromServer();
        resolve(toast);
      }
    } catch (e) {
      reject(e);
    }
  });
};

// TODO: Make temp folder, store scv, process  , save to DB , create matching csvs
export const getFileFromServer = async () => {
  const { fileName, lastCommittedTime } = result;
  const csvFileDate = moment(fileName).format("MM-DD-YYYY");
  return new Promise(async (resolve, reject) => {
    let resp: any;
    try {
      resp = await axios.get(`${COVID_CSV_REPO + csvFileDate}.csv`);
      const saveFile = await writeToFile(resp);
      resolve(saveFile);
    } catch (e) {
      reject(new Error("Could not write csv to file!"));
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
  return new Promise(async (resolve, reject) => {
    let files = await listCSVDirectory();
    console.log(files)
    resolve("Wadeda");
  });
};

const unleashDragon = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      result = await gitHub();
      const {lastCommittedTime } = result;
      if (lastCommittedTime) {
        const files = await checkIfMatchingCSVExists();
        resolve(files);
      } else {
        logger.error("Error retrieving data from github!");
        reject(new Error("Error retrieving data from github!"));
      }
      resolve(lastCommittedTime);
    } catch (e) {
      logger.error(e);
      reject(e);
    }
  });
};

export default unleashDragon;
