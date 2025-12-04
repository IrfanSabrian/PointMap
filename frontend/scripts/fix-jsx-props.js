#!/usr/bin/env node
/**
 * Fix JSX prop syntax - remove category prefixes from JSX props
 */

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/LeafletMap.tsx');

console.log('🔧 Fixing JSX prop syntax...');

let content = fs.readFileSync(filePath, 'utf8');

// Pattern: category.propName={value} in JSX context
// We need to be careful to only replace in JSX prop positions
const propFixes = [
  // Config props
  { from: /(\s+)config\.isSatellite=/g, to: '$1isSatellite=' },
  { from: /(\s+)config\.layerVisible=/g, to: '$1layerVisible=' },
  { from: /(\s+)config\.basemap=/g, to: '$1basemap=' },
  
  // Loading props
  { from: /(\s+)loading\.isSaving=/g, to: '$1isSaving=' },
  { from: /(\s+)loading\.isLoadingData=/g, to: '$1isLoadingData=' },
  { from: /(\s+)loading\.isCalculatingRoute=/g, to: '$1isCalculatingRoute=' },
  
  // Features props  
  { from: /(\s+)features\.selectedFeature=/g, to: '$1selectedFeature=' },
  { from: /(\s+)features\.bangunanFeatures=/g, to: '$1bangunanFeatures=' },
  { from: /(\s+)features\.ruanganFeatures=/g, to: '$1ruanganFeatures=' },
  
  // Lantai props
  { from: /(\s+)lantai\.selectedLantaiFilter=/g, to: '$1selectedLantaiFilter=' },
  { from: /(\s+)lantai\.selectedLantaiForRuangan=/g, to: '$1selectedLantaiForRuangan=' },
  { from: /(\s+)lantai\.lantaiGambarData=/g, to: '$1lantaiGambarData=' },
  
  // Ruangan props
  { from: /(\s+)ruangan\.selectedRuanganForEdit=/g, to: '$1selectedRuanganForEdit=' },
  { from: /(\s+)ruangan\.ruanganForm=/g, to: '$1ruanganForm=' },
  { from: /(\s+)ruangan\.ruanganList=/g, to: '$1ruanganList=' },
];

let totalFixes = 0;

propFixes.forEach(fix => {
  const before = content;
  content = content.replace(fix.from, fix.to);
  const count = (before.match(fix.from) || []).length;
  if (count > 0) {
    console.log(`  ✓ Fixed ${count} instances of ${fix.from.source}`);
    totalFixes += count;
  }
});

fs.writeFileSync(filePath, content, 'utf8');

console.log(`\n✅ Fixed ${totalFixes} JSX prop syntax issues!`);
