const fs = require("fs");
const xlsx = require("node-xlsx").default;
const {
  getSurnamesByCountry,
  setSurnamesByCountry
} = require(`${__dirname}/../scripts/helpers.js`);
const ArgumentParser = require('argparse').ArgumentParser;

const parser = new ArgumentParser({
  version: "1.0.0",
  addHelp: true,
  description: "Scans given excel file for surnames of given country"
});
parser.addArgument(["--excelPath"], {
  required: true,
  help: "full path to excel file"
});
parser.addArgument(["--excelOutputPath"], {
  help: "full path to output excel file"
});
parser.addArgument(["--country"], {
  required: true,
  help: "country code for the surnames that should be used"
});
var args = parser.parseArgs();

const countryCode = args.country;
const workSheetsFromFile = xlsx.parse(args.excelPath);

const matcherSurnames = getSurnamesByCountry(countryCode);
const sheet = workSheetsFromFile[0];

const hitsFromSheet = sheet.data
  .filter(row => {
    const nameLine = row[row.length - 1].replace(/\*/g, '').trim();
    const lastname = nameLine.split(" ")[0];
    return matcherSurnames.includes(lastname);
  })
  .map(addressArray => ({
    house: addressArray[0].toString().trim(),
    street: addressArray[1].toString().trim(),
    city: addressArray[2].toString().trim(),
    addressString: `${addressArray[0].toString().trim()} ${addressArray[1].toString().trim()}, ${addressArray[2].toString().trim()}`,
    name: addressArray[3].toString().replace(/\*/g, '').trim()
  }));

console.log(
  `Found ${hitsFromSheet.length} hits in list for ${countryCode.toUpperCase()}`
);

if (args.excelOutputPath) {

  // create excel file in memory
  const excelData = hitsFromSheet.map(a => ([
    a.house, a.street, a.city, a.addressString, a.name
  ]));

  const excelBuffer = xlsx.build([{
    name: countryCode, data: excelData
  }]);

  // write buffer to file
  const fileHandle = fs.openSync(args.excelOutputPath, 'wx');
  fs.writeSync(fileHandle, excelBuffer);

  console.log('Excel file written in ', args.excelOutputPath);
} else {
  setSurnamesByCountry(
    hitsFromSheet,
    `${countryCode}-excel-parse-${Date.now().toString()}`
  );  
}