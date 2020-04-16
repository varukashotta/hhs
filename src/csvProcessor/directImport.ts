import { readLocalFile } from "../utils";
import { csvToJson } from "../utils/index";
import { logger } from "../log";
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const fs = require('fs');

export const cleanUpCSV = async () => {

  const file: any = await readLocalFile("../data/04-02-2020.csv");

  let csv:string = String(file);

  const lines = csv.split("\n");

  const commaRegex = /,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/g;

  const quotesRegex = /^"(.*)"$/g;

  const headers = lines[0]
    .split(commaRegex)
    .map(h => h.replace(quotesRegex, "$1").trim());

   const header =  headers.map((line) => {
      return {
        id: line.toLowerCase().trim(), title: line.toLowerCase().trim()
      }
    })


 lines.shift();

 let newLines = lines;

  const result = [];

  for (let i = 1; i < newLines.length; i++) {
    const obj: any = {};
    const currentline = newLines[i].split(commaRegex);

    for (let j = 0; j < headers.length; j++) {
      if (currentline[j]) {
        obj[headers[j].toLowerCase().trim()] = currentline[j].replace(quotesRegex, "$1");
      }
    }

    result.push(obj);
  }

  writeToCsv(header, result)
};

export const writeToCsv = async (header:any, data:any) => {
  const csvWriter = createCsvWriter({
    path: "./src/data/date.csv",
    header,
  });;

  csvWriter
    .writeRecords(data)
    .then(() => logger.info({message: "The CSV file was written successfully"}));

};
