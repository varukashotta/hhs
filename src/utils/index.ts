import fs from "fs";
import path from "path";

export const readLocalFile = (file: string): string => {
  const filePath = path.join(__dirname, file);

  try {
    return String(fs.readFileSync(filePath));
  } catch (error) {
    return error;
  }
};

export const csvToJson = (csv: string) => {
  const lines = csv.split("\n");

  const commaRegex = /,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/g;

  const quotesRegex = /^"(.*)"$/g;

  const headers = lines[0]
    .split(commaRegex)
    .map((h) => h.replace(quotesRegex, "$1"));

  const result: any[] = [];

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
