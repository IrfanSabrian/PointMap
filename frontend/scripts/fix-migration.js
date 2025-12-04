#!/usr/bin/env node
/**
 * FIXED Migration script untuk update semua state/ref references di LeafletMap.tsx
 * 
 * This version is more careful to avoid double replacements
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/LeafletMap.tsx');

console.log('🚀 Starting FIXED migration...');

let content = fs.readFileSync(filePath, 'utf8');

// Step 1: Fix double replacements that already happened
console.log('\n📋 Step 1: Fixing double replacements...');
const doubleReplacementFixes = [
  { from: /config\.config\./g, to: 'config.' },
  { from: /loading\.loading\./g, to: 'loading.' },
  { from: /ui\.ui\./g, to: 'ui.' },
  { from: /animation\.animation\./g, to: 'animation.' },
  { from: /features\.features\./g, to: 'features.' },
  { from: /routing\.routing\./g, to: 'routing.' },
  { from: /drawing\.drawing\./g, to: 'drawing.' },
  { from: /edit\.edit\./g, to: 'edit.' },
  { from: /lantai\.lantai\./g, to: 'lantai.' },
  { from: /ruangan\.ruangan\./g, to: 'ruangan.' },
  { from: /layerVisibility\.layerVisibility\./g, to: 'layerVisibility.' },
  { from: /highlight\.highlight\./g, to: 'highlight.' },
  { from: /mapRefs\.mapRefs\./g, to: 'mapRefs.' },
];

doubleReplacementFixes.forEach(fix => {
  const before = content;
  content = content.replace(fix.from, fix.to);
  if (before !== content) {
    const count = (before.match(fix.from) || []).length;
    console.log(`  ✓ Fixed ${count} double replacements: ${fix.from.source}`);
  }
});

// Step 2: Fix wrong object property syntax (e.g., "features.bangunanFeatures:" -> "bangunanFeatures:")
console.log('\n📋 Step 2: Fixing object property syntax...');
const propertyFixes = [
  { from: /features\.bangunanFeatures:/g, to: 'bangunanFeatures:' },
  { from: /features\.ruanganFeatures:/g, to: 'ruanganFeatures:' },
];

propertyFixes.forEach(fix => {
  const before = content;
  content = content.replace(fix.from, fix.to);
  if (before !== content) {
    const count = (before.match(fix.from) || []).length;
    console.log(`  ✓ Fixed ${count} property syntax issues`);
  }
});

// Write back
fs.writeFileSync(filePath, content, 'utf8');

console.log(`\n✅ Migration fixes complete!`);
console.log(`📝 File updated: ${filePath}`);
