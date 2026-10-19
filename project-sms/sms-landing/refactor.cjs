const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');
const componentsDir = path.join(srcDir, 'components');
const dataDir = path.join(srcDir, 'data');
const stylesDir = path.join(srcDir, 'styles');

// Create directories
[componentsDir, dataDir, stylesDir].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Read files
const tsxContent = fs.readFileSync(path.join(srcDir, 'LandingPage.tsx'), 'utf8');
const cssContent = fs.readFileSync(path.join(srcDir, 'landing.css'), 'utf8');

// 1. Extract and write Data
const dataMatch = tsxContent.match(/\/\* ── DATA ── \*\/\n([\s\S]*?)\n\/\* ── COMPONENTS ── \*\//);
if (dataMatch) {
  let dataCode = dataMatch[1].trim();
  // We need to add 'export' to all consts
  dataCode = dataCode.replace(/^const /gm, 'export const ');
  fs.writeFileSync(path.join(dataDir, 'constants.ts'), dataCode);
}

// 2. Split CSS
const cssSections = cssContent.split(/\/\* ─────────────────────────────────────────\n   (.*)\n───────────────────────────────────────── \*\//g);
const globalCss = cssSections[0].trim();
fs.writeFileSync(path.join(stylesDir, 'global.css'), globalCss);

const cssMap = {};
for (let i = 1; i < cssSections.length; i += 2) {
  const name = cssSections[i].trim();
  const content = cssSections[i + 1].trim();
  cssMap[name] = content;
}

// 3. Extract Components
const componentsMatch = tsxContent.match(/\/\* ── COMPONENTS ── \*\/\n([\s\S]*?)\n\/\* ── MAIN EXPORT ── \*\//);
let componentNames = [];

if (componentsMatch) {
  const componentsCode = componentsMatch[1];
  const functionRegex = /function\s+([A-Z][a-zA-Z0-9_]*)\s*\(\)\s*{([\s\S]*?\n})[\s]*(?=function|$)/g;
  
  let match;
  while ((match = functionRegex.exec(componentsCode)) !== null) {
    const compName = match[1];
    let compBody = match[2];
    componentNames.push(compName);
    
    // Create component folder
    const compDir = path.join(componentsDir, compName);
    if (!fs.existsSync(compDir)) fs.mkdirSync(compDir);
    
    // Map component to CSS section name (heuristic)
    let cssKey = null;
    if (compName === 'Navbar') cssKey = 'NAVBAR';
    else if (compName === 'HeroSection') cssKey = 'HERO';
    else if (compName === 'StatsSection') cssKey = 'STATS BAR';
    else if (compName === 'ProblemSection') cssKey = 'PROBLEM → SOLUTION';
    else if (compName === 'FeaturesSection') cssKey = 'FEATURES BENTO';
    else if (compName === 'RolesSection') cssKey = 'ROLES SECTION';
    else if (compName === 'ShowcaseSection') cssKey = 'SHOWCASE';
    else if (compName === 'AnalyticsSection') cssKey = 'ANALYTICS (DARK)';
    else if (compName === 'AutomationSection') cssKey = 'AUTOMATION';
    else if (compName === 'SecuritySection') cssKey = 'SECURITY';
    else if (compName === 'IntegrationsSection') cssKey = 'INTEGRATIONS';
    else if (compName === 'PricingSection') cssKey = 'PRICING';
    else if (compName === 'TestimonialsSection') cssKey = 'TESTIMONIALS';
    else if (compName === 'FAQSection') cssKey = 'FAQ';
    else if (compName === 'FinalCTA') cssKey = 'FINAL CTA';
    else if (compName === 'Footer') cssKey = 'FOOTER';

    // Write CSS
    if (cssKey && cssMap[cssKey]) {
      fs.writeFileSync(path.join(compDir, `${compName}.css`), cssMap[cssKey]);
    } else {
      fs.writeFileSync(path.join(compDir, `${compName}.css`), '');
    }

    // Identify which constants are used
    const usedConstants = [];
    const allConstants = ['NAV_LINKS', 'STATS', 'PROBLEMS', 'SOLUTION_MODULES', 'FEATURES', 'ROLES', 'ANALYTICS_CARDS', 'FLOW_STEPS', 'AUTO_FEATS', 'SEC_LAYERS', 'INTEGRATIONS', 'PRICING_PLANS', 'TESTIMONIALS', 'FAQS'];
    for (const c of allConstants) {
      if (compBody.includes(c)) usedConstants.push(c);
    }

    let imports = `import React, { useState, useEffect } from 'react';\nimport './${compName}.css';\n`;
    if (usedConstants.length > 0) {
      imports += `import { ${usedConstants.join(', ')} } from '../../data/constants';\n`;
    }

    const tsxString = `${imports}\nexport default function ${compName}() {\n${compBody}\n`;
    fs.writeFileSync(path.join(compDir, `${compName}.tsx`), tsxString);
  }
}

// 4. Update LandingPage.tsx
const mainExportMatch = tsxContent.match(/\/\* ── MAIN EXPORT ── \*\/\n([\s\S]*)/);
if (mainExportMatch) {
  let mainCode = mainExportMatch[1];
  let imports = `import React from 'react';\nimport '../styles/global.css';\n`;
  for (const comp of componentNames) {
    imports += `import ${comp} from '../components/${comp}/${comp}';\n`;
  }
  
  const finalTsx = `${imports}\n${mainCode}`;
  // Let's create pages/LandingPage
  const pagesDir = path.join(srcDir, 'pages', 'LandingPage');
  if (!fs.existsSync(pagesDir)) fs.mkdirSync(pagesDir, { recursive: true });
  fs.writeFileSync(path.join(pagesDir, 'LandingPage.tsx'), finalTsx);
}

// Delete old files
fs.unlinkSync(path.join(srcDir, 'LandingPage.tsx'));
fs.unlinkSync(path.join(srcDir, 'landing.css'));

// Update App.tsx
const appTsx = `import LandingPage from './pages/LandingPage/LandingPage';\n\nfunction App() {\n  return (\n    <LandingPage />\n  );\n}\n\nexport default App;\n`;
fs.writeFileSync(path.join(srcDir, 'App.tsx'), appTsx);

// Update main.tsx
const mainTsxContent = fs.readFileSync(path.join(srcDir, 'main.tsx'), 'utf8');
const newMainTsx = mainTsxContent.replace("import './index.css'", "import './styles/global.css'");
fs.writeFileSync(path.join(srcDir, 'main.tsx'), newMainTsx);

console.log('Refactoring complete!');
