import { gitHub } from "../csvProcessor/getData";
import { logger } from "../log";
import fs from "fs";

const csvFolder = `${__dirname}/../data/`;

const checkCsvFile = (committedDate:string) => {
  return new Promise(async (resolve, reject) => {
    try {
      const files:string[] = await fs.readdirSync(csvFolder);

      if (Array.isArray(files)) {
        const fileSearchResult = await checkIfMatchingCSVExists(files, committedDate)
        resolve(fileSearchResult);
      } else {
        reject( new Error("Error looking for files in local folder!"));
      }
    } catch (e) {
      reject(e);
    }
  });
};

const unleashDragon = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const lastCommitted:string = await gitHub();
      if (lastCommitted) {
        const files = await checkCsvFile(lastCommitted);
        console.log(files);
      } else {
        logger.error("Error retrieving data from github!");
        reject(new Error('Error retrieving data from github!'));
      }
      resolve(lastCommitted);
    } catch (e) {
      console.log(e);
      logger.error(e);
      reject(e);
    }
  });
};

const checkIfMatchingCSVExists = async (files:string[], commitDate: string) => {
  return new Promise((resolve, reject) => {
    const fileFound = files.filter(file => file.includes(commitDate));
    if(fileFound.length > 0){
      resolve(fileFound);
    } else{
      reject(new Error('File does not exist'));
      throw new Error('File does not exist');
    }
  });
};

//TODO: Make temp folder, store scv, process  , save to DB , create matching csvs
export const getFileFromServer = async(commitDate:string) => {
  return new Promise((resolve, reject) => {
      resolve('To be done')
  })  
}

export default unleashDragon;
