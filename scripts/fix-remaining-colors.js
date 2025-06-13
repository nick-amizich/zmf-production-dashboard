#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Specific fixes for remaining hardcoded colors
const specificFixes = [
  // Main gradient colors
  { from: 'from-\\[#8B4513\\] to-\\[#d4a574\\]', to: 'from-theme-brand-secondary to-theme-brand-primary' },
  { from: 'bg-\\[#d4a574\\]', to: 'bg-theme-brand-primary' },
  { from: 'text-\\[#1a0d08\\]', to: 'text-theme-bg-secondary' },
  { from: 'bg-\\[#c49564\\]', to: 'bg-theme-brand-primary' },
  { from: 'bg-\\[#2a1810\\]', to: 'bg-theme-bg-tertiary' },
  { from: 'border-\\[#1a0d08\\]', to: 'border-theme-bg-secondary' },
  
  // Orange/indigo/violet colors
  { from: 'border-orange-500/50', to: 'border-theme-status-warning/50' },
  { from: 'text-orange-400', to: 'text-theme-status-warning' },
  { from: 'hover:bg-orange-500/20', to: 'hover:bg-theme-status-warning/20' },
  { from: 'border-indigo-500/50', to: 'border-theme-status-info/50' },
  { from: 'text-indigo-400', to: 'text-theme-status-info' },
  { from: 'hover:bg-indigo-500/20', to: 'hover:bg-theme-status-info/20' },
  { from: 'border-violet-500/50', to: 'border-purple-500/50' },
  { from: 'text-violet-400', to: 'text-purple-400' },
  { from: 'hover:bg-violet-500/20', to: 'hover:bg-purple-500/20' },
  
  // More gradient patterns
  { from: 'from-green-600 to-teal-600', to: 'from-theme-status-success to-teal-600' },
  { from: 'from-blue-600 to-purple-600', to: 'from-theme-status-info to-purple-600' },
  { from: 'from-orange-600 to-red-600', to: 'from-theme-status-warning to-theme-status-error' },
  { from: 'from-violet-600 to-purple-600', to: 'from-purple-600 to-purple-700' },
  { from: 'from-green-600 to-teal-600', to: 'from-theme-status-success to-teal-600' },
  { from: 'from-indigo-600 to-blue-600', to: 'from-indigo-600 to-theme-status-info' },
];

// Function to process a file
function processFile(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) {
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  specificFixes.forEach(({ from, to }) => {
    const regex = new RegExp(from, 'g');
    const matches = content.match(regex);
    if (matches) {
      content = content.replace(regex, to);
      modified = true;
      console.log(`✓ ${path.basename(filePath)}: Fixed ${matches.length} instances of ${from}`);
    }
  });
  
  if (modified) {
    fs.writeFileSync(filePath, content);
  }
}

// Function to recursively process directory
function processDirectory(dirPath) {
  const items = fs.readdirSync(dirPath);
  
  items.forEach(item => {
    const itemPath = path.join(dirPath, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and .next
      if (item !== 'node_modules' && item !== '.next' && !item.startsWith('.')) {
        processDirectory(itemPath);
      }
    } else if (stat.isFile()) {
      processFile(itemPath);
    }
  });
}

// Main execution
console.log('🎨 Fixing remaining hardcoded colors...\n');
processDirectory('./components');
processDirectory('./app');
console.log('\n✅ Color fixes complete!');
console.log('Note: Chart colors in visualization components are kept as-is for chart library compatibility.');