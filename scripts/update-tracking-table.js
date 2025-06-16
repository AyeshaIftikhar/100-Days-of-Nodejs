const fs = require('fs');
const path = require('path');

const readmePath = path.resolve(__dirname, '../README.md');
const projectName = 'file-organizer-cli';
const status = 'In Progress';
const lastUpdated = new Date().toISOString().split('T')[0];

const tableStart = '<!-- PROJECT_TRACKING_TABLE_START -->';
const tableEnd = '<!-- PROJECT_TRACKING_TABLE_END -->';

const newTable = `
${tableStart}
| Project Name | Status   | Last Updated        |
| ------------ | -------- | ------------------ |
| ${projectName} | ${status} | ${lastUpdated}           |
${tableEnd}
`;

let readme = fs.readFileSync(readmePath, 'utf8');
const regex = new RegExp(`${tableStart}[\\s\\S]*?${tableEnd}`, 'm');

if (regex.test(readme)) {
  readme = readme.replace(regex, newTable.trim());
} else {
  // If not found, append at the end
  readme += `\n\n${newTable.trim()}\n`;
}

fs.writeFileSync(readmePath, readme, 'utf8');
console.log('Tracking table updated!');