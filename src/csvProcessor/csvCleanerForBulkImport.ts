import { readLocalFile } from "../utils";
import { logger } from "../log";
import { createObjectCsvWriter } from "csv-writer";
import { v4 as uuidv4 } from "uuid";

export const cleanUpCSV = async (filePath: string) => {
  return new Promise(async (resolve, reject) => {
    try {
      const file: any = await readLocalFile(`../data/${filePath}`);

      const csv: string = String(file);

      const lines = csv.split("\n");

      const commaRegex = /,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/g;

      const quotesRegex = /^"(.*)"$/g;

      const headers = lines[0]
        .split(commaRegex)
        .map((h) => h.replace(quotesRegex, "$1").trim());

      headers.push("uuid", "created_at", "updated_at");

      const header = headers.map((line) => {
        return {
          id: line.toLowerCase().trim(),
          title: line.toLowerCase().trim(),
        };
      });

      lines.shift();

      const newLines = lines;

      const result = [];

      for (let i = 0; i < newLines.length; i++) {
        const obj: any = {};
        const currentline = newLines[i].split(commaRegex);

        for (let j = 0; j < headers.length; j++) {
          if (headers[j].toLowerCase().trim() === "uuid") {
            currentline[j] = uuidv4();
          }
          if (headers[j].toLowerCase().trim() === "updated_at") {
            currentline[j] = new Date().toISOString();
          }
          if (headers[j].toLowerCase().trim() === "created_at") {
            currentline[j] = new Date().toISOString();
          }
          if (currentline[j]) {
            obj[headers[j].toLowerCase().trim()] = currentline[j]
              .replace(quotesRegex, "$1")
              .trim();
          }
        }

        if (typeof obj.country_region !== "undefined") {
          result.push(obj);
        }
      }
      
      const fileWritten = writeToCsv(header, result);

      resolve(fileWritten);
    } catch (error) {
      reject(new Error(error));
    }
  });
};

export const writeToCsv = async (header: any, data: any) => {
  return new Promise((resolve, reject) => {
    try {
      const csvWriter = createObjectCsvWriter({
        path: `${__dirname}/../data/dbImport.csv`,
        header,
      });

      csvWriter
        .writeRecords(data)
        .then(() => resolve("The CSV file was written successfully"));
    } catch (error) {
      reject(error);
    }
  });
};
