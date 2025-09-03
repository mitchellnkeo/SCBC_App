const fs = require('fs');
const path = require('path');

// Read app.json
const appJsonPath = path.join(__dirname, '..', 'app.json');
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

// Read current constants file
const constantsPath = path.join(__dirname, '..', 'src', 'config', 'constants.ts');
let constantsContent = fs.readFileSync(constantsPath, 'utf8');

// Extract version and build number
const version = appJson.expo.version;
const buildNumber = appJson.expo.ios?.buildNumber || '1';

// Update constants file
constantsContent = constantsContent.replace(
  /VERSION:\s*['"][^'"]*['"]/,
  `VERSION: '${version}'`
);
constantsContent = constantsContent.replace(
  /BUILD_NUMBER:\s*['"][^'"]*['"]/,
  `BUILD_NUMBER: '${buildNumber}'`
);

// Write updated constants
fs.writeFileSync(constantsPath, constantsContent);

console.log(`✅ Updated constants.ts with version ${version} and build ${buildNumber}`);
