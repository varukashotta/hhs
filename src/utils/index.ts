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

  // const result = [];

  const commaRegex = /,(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/g;

  const quotesRegex = /^"(.*)"$/g;

  const headers = lines[0]
    .split(commaRegex)
    .map(h => h.replace(quotesRegex, "$1"));

    let final = "";

  for (let i = 1; i < lines.length; i++) {
    const obj: any = {};
    const currentline = lines[i].split(commaRegex);

    for (let j = 0; j < headers.length; j++) {
      if (currentline[j]) {
        obj[headers[j]] = currentline[j].replace(quotesRegex, "$1");
      }
    }

    if(Object.keys(obj).length !== 0 && obj.constructor == Object){
      final += '{"index":{}}' + "\n" + JSON.stringify(obj) + "\n" ;
    }
    // result.push({"index":{}})
    // result.push(obj);
  }

  return final
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


export const slugify = (word:string) => {
  const a = 'àáâäæãåāăąçćčđďèéêëēėęěğǵḧîïíīįìłḿñńǹňôöòóœøōõőṕŕřßśšşșťțûüùúūǘůűųẃẍÿýžźż·/_,:;'
  const b = 'aaaaaaaaaacccddeeeeeeeegghiiiiiilmnnnnoooooooooprrsssssttuuuuuuuuuwxyyzzz------'
  const p = new RegExp(a.split('').join('|'), 'g')

  return word.toString().toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
    .replace(/&/g, '-and-') // Replace & with 'and'
    .replace(/[^\w\-]+/g, '') // Remove all non-word characters
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, '') // Trim - from end of text
}