const fs = require('fs');
const path = require('path');

const READINGS_FILE = path.join(__dirname, 'src/data/readings.ts');
const RESPONSIVE_DIR = path.join(__dirname, 'hymnals/Responsive Reading');
const BATCH_SIZE = 3;
const START_ID = 20003; // After 20002

function getReadingsFileContent() {
  return fs.readFileSync(READINGS_FILE, 'utf8');
}

function writeReadingsFileContent(content) {
  fs.writeFileSync(READINGS_FILE, content, 'utf8');
}

function getResponsiveFiles() {
  return fs.readdirSync(RESPONSIVE_DIR)
    .filter(f => f.match(/^\d+\.txt$/))
    .sort((a, b) => parseInt(a) - parseInt(b));
}

function getInsertedIds(content) {
  // Find all ids in the readings file that are in the 20003+ range
  const regex = /id:\s*'2\d{4}'/g;
  const matches = content.match(regex) || [];
  return matches.map(m => parseInt(m.match(/'([0-9]+)'/)[1], 10));
}

function getLastInsertedFile(content) {
  // Find the last inserted pageNumber in the 219+ range
  const regex = /pageNumber:\s*'([0-9]+)'/g;
  const matches = [...content.matchAll(regex)]
    .map(m => parseInt(m[1], 10))
    .filter(n => n >= 219)
    .sort((a, b) => b - a);
  return matches[0] || 218;
}

function main() {
  let readingsContent = getReadingsFileContent();
  const files = getResponsiveFiles();
  const lastInsertedPage = getLastInsertedFile(readingsContent);
  const nextFiles = files.filter(f => parseInt(f) > lastInsertedPage).slice(0, BATCH_SIZE);

  if (nextFiles.length === 0) {
    console.log('No new responsive readings to import.');
    return;
  }

  // Find where to insert (after id '20002')
  const insertAfterId = '20002';
  const insertRegex = new RegExp(`id:\s*'${insertAfterId}'[\s\S]*?},`);
  const match = readingsContent.match(insertRegex);
  if (!match) {
    console.error(`Could not find id '${insertAfterId}' in readings.ts`);
    return;
  }
  const insertPos = readingsContent.indexOf(match[0]) + match[0].length;

  // Find the next available id
  const usedIds = getInsertedIds(readingsContent);
  let nextId = START_ID;
  while (usedIds.includes(nextId)) nextId++;

  // Build new reading objects
  let newReadings = '';
  for (const file of nextFiles) {
    const pageNumber = path.basename(file, '.txt');
    const lyrics = fs.readFileSync(path.join(RESPONSIVE_DIR, file), 'utf8').replace(/`/g, '\u0060');
    newReadings += `\n  {\n    id: '${nextId}',\n    title: 'Responsive Reading ${pageNumber}',\n    lyrics: \
\`${lyrics}\`,\n    category: 'responsive-reading',\n    pageNumber: '${pageNumber}',\n  },\n`;
    nextId++;
  }

  // Insert new readings
  const updatedContent = readingsContent.slice(0, insertPos) + newReadings + readingsContent.slice(insertPos);
  writeReadingsFileContent(updatedContent);
  console.log(`Imported ${nextFiles.length} responsive readings: ${nextFiles.map(f => f.replace('.txt','')).join(', ')}`);
  console.log('Review and run the script again for the next batch.');
}

main(); 