import { gitHub } from "../csvProcessor/getGithubData";
import { logger } from "../log";
import fs from "fs";
import axios from "axios";
import moment from "moment";
import { cleanUpCSV } from "../csvProcessor/csvCleanerForBulkImport";
import { readLocalFile } from "../utils";
import { sendToDB } from "../csvProcessor/bulkImport";
import { startManualImport } from "../csvProcessor/manualImport";

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
    } catch (error) {
      reject(new Error(error));
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
    } catch (error) {
      reject(new Error(error));
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
    } catch (error) {
      reject(new Error(error));
    }
  });
};

export const writeToFile = async (data: any) => {
  const { fileName, lastCommittedTime } = result;

  return new Promise(async (resolve, reject) => {
    try {
      const writingFile = await fs.writeFileSync(
        `${csvFolder}${fileName}-${lastCommittedTime}.csv`,
        String(data.data)
      );

      const comparedCSV = await checkCSVDates();
      resolve(comparedCSV);
    } catch (error) {
      reject(new Error(error));
    }
  });
};

export const checkCSVDates = async () => {
  const { fileName } = result;
  return new Promise(async (resolve, reject) => {
    const files: string[] = await listCSVDirectory();

    if (files[0].includes(fileName) && files.length > 1) {
      // Compare the csv files
      const comparison = await compareCSVFiles();

      resolve(comparison);
    } else {
      const file = files.filter((csvFile) => csvFile.includes(fileName));

      await cleanUpCSV(file[0]);

      const finalProcess = await convertCSVtoTSVImportToDB();

      // Create new records and delete existing file
      resolve(finalProcess);
    }
  });
};

export const compareCSVFiles = async () => {
  return new Promise(async (resolve, reject) => {
    const { lastCommittedTime } = result;
    try {
      const files = await listCSVDirectory();

      let existingCSV: string = "";
      let latestCSV: string = "";

      files.map((file) => {
        if (file.includes(lastCommittedTime)) {
          latestCSV = file;
        } else {
          existingCSV = file;
        }
      });

      if (
        (existingCSV && existingCSV !== "") ||
        (latestCSV && latestCSV !== "")
      ) {
        const createdComparisonArray = await createCSVUpdateFile({
          existingCSV,
          latestCSV,
        });

        resolve(createdComparisonArray);
      } else {
        reject(new Error("No files found to compare!"));
      }
    } catch (error) {
      reject(new Error(error));
    }
  });
};

export const createCSVUpdateFile = async ({
  existingCSV,
  latestCSV,
}: {
  existingCSV: string;
  latestCSV: string;
}) => {
  return new Promise(async (resolve, reject) => {
    try {
      const oldCSV = fs.readFileSync(`${__dirname}/data/${existingCSV}`);

      const newCSV = fs.readFileSync(`${__dirname}/data/${latestCSV}`);

      const array1 = String(oldCSV).split("\n");

      const array2 = String(newCSV).split("\n");

      const newCSVArray: any = [];

      newCSVArray.push(array1[0]);

      for (let i = 0; i < array1.length; i++) {
        const diff = array1[i] === array2[i];
        if (!diff) newCSVArray.push(array2[i]);
      }

      const tempFileWritten = await writeTempCSVFile(newCSVArray);

      resolve(tempFileWritten);
    } catch (error) {
      reject(new Error(error));
    }
  });
};

export const writeTempCSVFile = (data: any) => {
  return new Promise(async (resolve, reject) => {
    try {
      await fs.writeFileSync(`${__dirname}/temp/temp.csv`, data, "utf8");

      resolve("File written");
      // await startManualImport();
    } catch (error) {
      reject(new Error(error));
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

      fs.writeFileSync(`${csvFolder}dbImport.csv`, cleanedCSV, "utf8");

      const DBSaveResult = await sendToDB();

      resolve(DBSaveResult);
    } catch (error) {
      reject(new Error(error));
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
    } catch (error) {
      reject(new Error(error));
    }
  });
};

export default unleashDragon;
