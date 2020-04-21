import { readLocalFile } from "../utils";
import { logger } from "../log";
import { createObjectCsvWriter } from "csv-writer";
import { v4 as uuidv4 } from "uuid";
export const cleanUpCSV = async (filePath: string) => {
  const file: any = await readLocalFile(
    "../data/1587312000000-2020-04-20T23:50:01Z.csv"
  );

  let csv: string = String(file);

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

  let newLines = lines;

  const result = [];

  for (let i = 1; i < newLines.length; i++) {
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

    if (obj.country_region !== ""|| obj.country_region != "country_region") {
      console.log(obj.country_region)
      result.push(obj);
    }
  }

  return writeToCsv(header, result);
};

export const writeToCsv = async (header: any, data: any) => {
  const csvWriter = createObjectCsvWriter({
    path: `${__dirname}/albert.csv`,
    header,
  });

  csvWriter
    .writeRecords(data)
    .then(() =>
      logger.info({ message: "The CSV file was written successfully" })
    );
};
