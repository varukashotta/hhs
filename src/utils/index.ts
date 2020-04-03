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

  const headers = lines[0].split(",");

  for (let i = 1; i < lines.length; i++) {
    const obj: any = {};
    const currentLine = lines[i].split(",");

    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = currentLine[j] || null;
    }

    result.push(obj);
  }

  return result;
};

export function CSVToArray( strData:string ){
  // Check to see if the delimiter is defined. If not,
  // then default to comma.
  const strDelimiter =  ",";

  // Create a regular expression to parse the CSV values.
  const objPattern = new RegExp(
      (
          // Delimiters.
          "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

          // Quoted fields.
          "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

          // Standard fields.
          "([^\"\\" + strDelimiter + "\\r\\n]*))"
      ),
      "gi"
      );


  // Create an array to hold our data. Give the array
  // a default empty first row.
  const arrData:any[] = [[]];

  // Create an array to hold our individual pattern
  // matching groups.
  let arrMatches = null;


  // Keep looping over the regular expression matches
  // until we can no longer find a match.
  while (arrMatches = objPattern.exec( strData )){

      // Get the delimiter that was found.
      const strMatchedDelimiter = arrMatches[ 1 ];

      // Check to see if the given delimiter has a length
      // (is not the start of string) and if it matches
      // field delimiter. If id does not, then we know
      // that this delimiter is a row delimiter.
      if (
          strMatchedDelimiter.length &&
          strMatchedDelimiter !== strDelimiter
          ){

          // Since we have reached a new row of data,
          // add an empty row to our data array.
          arrData.push( [] );

      }

      let strMatchedValue;

      // Now that we have our delimiter out of the way,
      // let's check to see which kind of value we
      // captured (quoted or unquoted).
      if (arrMatches[ 2 ]){

          // We found a quoted value. When we capture
          // this value, unescape any double quotes.
          strMatchedValue = arrMatches[ 2 ].replace(
              new RegExp( "\"\"", "g" ),
              "\""
              );

      } else {

          // We found a non-quoted value.
          strMatchedValue = arrMatches[ 3 ];

      }


      // Now that we have our value string, let's add
      // it to the data array.
      arrData[ arrData.length - 1 ].push(strMatchedValue);
  }

  // Return the parsed data.
  return( arrData );
}

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
