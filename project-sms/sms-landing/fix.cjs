const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const componentsDir = path.join(srcDir, 'components');
const landingPageFile = path.join(srcDir, 'pages', 'LandingPage', 'LandingPage.tsx');

// Fix LandingPage.tsx imports
let landingContent = fs.readFileSync(landingPageFile, 'utf8');
landingContent = landingContent.replace(/from '\.\.\/components/g, "from '../../components");
fs.writeFileSync(landingPageFile, landingContent);

// Fix unused imports in components
const components = fs.readdirSync(componentsDir);
for (const comp of components) {
  const tsxFile = path.join(componentsDir, comp, `${comp}.tsx`);
  if (!fs.existsSync(tsxFile)) continue;
  
  let content = fs.readFileSync(tsxFile, 'utf8');
  
  // Basic heuristic: check if useState/useEffect are used in the file text
  const usesUseState = content.split('useState').length > 2; // more than the import
  const usesUseEffect = content.split('useEffect').length > 2; // more than the import

  let imports = [];
  if (usesUseState) imports.push('useState');
  if (usesUseEffect) imports.push('useEffect');
  
  let newImportLine = '';
  if (imports.length > 0) {
    newImportLine = `import { ${imports.join(', ')} } from 'react';`;
  }
  
  content = content.replace(/import React, { useState, useEffect } from 'react';\n/, newImportLine ? newImportLine + '\n' : '');
  fs.writeFileSync(tsxFile, content);
}
console.log('Fixes applied!');
