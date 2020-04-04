import fs from "fs";
import path from "path";

export const readLocalFile = async (file: string) => {
  const filePath = path.join(__dirname, file);

  try {
    return await fs.readFileSync(filePath);
  } catch (error) {
    return error;
  }
};

export const csvToJson = (csv: string) => {
  const lines = csv.split("\n");

  const result = [];

  const commaRegex = /,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/g;

  const quotesRegex = /^"(.*)"$/g;

  const headers = lines[0]
    .split(commaRegex)
    .map(h => h.replace(quotesRegex, "$1"));

  for (let i = 1; i < lines.length; i++) {
    const obj: any = {};
    const currentline = lines[i].split(commaRegex);

    for (let j = 0; j < headers.length; j++) {
      if (currentline[j]) {
        obj[headers[j]] = currentline[j].replace(quotesRegex, "$1");
      }
    }

    result.push(obj);
  }
  return result;
};

export const getUniqueColumnValuesFromCsv = (
  csv: string,
  columnNumber: number
) => {
  const lines = csv.split("\n");

  const countries: string[] = [];

  lines.map(line => {
    countries.push(line.split(",")[columnNumber]);
  });

  const countriesRegion: string[] = Array.from(new Set(countries));

  const filtered = countriesRegion.filter(el => {
    if (el !== null || el !== "") return el;
  });

  filtered.shift();

  const cleanedArray = filtered;

  // tslint:disable-next-line: no-console
  console.log(JSON.stringify(cleanedArray));

  return cleanedArray;
};
