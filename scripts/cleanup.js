
const fs = require('fs');
const ArgumentParser = require('argparse').ArgumentParser;
var parser = new ArgumentParser({
  version: '1.0.0',
  addHelp: true,
  description: 'Cleans up surname .json file'
});
parser.addArgument(
  [ '--country' ],
  {
    required: true,
    help: 'country code that should be cleaned up'
  }
);
var args = parser.parseArgs();

// parse country file
const country = args.country.toUpperCase();
const fileName = `${__dirname}/../surnames/${country}.json`;
if (fs.existsSync(fileName)) {
  
  // read file
  const rawContent = fs.readFileSync(fileName, 'utf8');
  
  // try to parse it
  let parsedContent;
  try {
    console.log(`Trying to parse ${fileName}`);
    parsedContent = JSON.parse(rawContent);
  } catch (e) {
    console.error(`Error while trying to parse ${country}.json`);
    return;
  }

  console.log(`Parsed ${parsedContent.length} surnames`);

  // remove empty surnames
  const withoutEmpty = parsedContent.filter(surname => surname.trim() !== "");
  console.log(`Removed ${parsedContent.length - withoutEmpty.length} empty entries`);

  // uniqify entries
  const uniqueSurnames = Array.from(new Set(withoutEmpty));
  console.log(`Removed ${withoutEmpty.length - uniqueSurnames.length} duplicate entries`);

  // sort names
  const sortedSurnames = uniqueSurnames.sort();

  // convert back into JSON
  // and write it back into the file
  try {
    const jsonContent = JSON.stringify(sortedSurnames, null, 2);
    fs.writeFileSync(fileName, jsonContent, 'utf8');
  } catch (e) {
    console.error(`Could not write back json-content into ${country}.json`);
  }
}


