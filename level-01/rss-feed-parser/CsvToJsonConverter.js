const CsvToJsonConverter = require("./csv-to-json");

// Convert file
CsvToJsonConverter.convertFile("input.csv", {
  delimiter: ",",
  hasHeader: true,
  outputPath: "output.json",
})
  .then((result) => console.log(`Converted ${result.length} records`))
  .catch(console.error);

// Convert string
const csvString = `name,age,active
John,25,true
Jane,30,false`;

CsvToJsonConverter.convertString(csvString)
  .then((result) => console.log(result))
  .catch(console.error);
