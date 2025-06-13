#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Color mappings for migration
const colorMappings = [
  // Backgrounds
  { from: 'bg-\\[#0a0a0a\\]', to: 'bg-theme-bg-primary' },
  { from: 'bg-\\[#1a0d08\\]', to: 'bg-theme-bg-secondary' },
  { from: 'bg-\\[#2a1510\\]', to: 'bg-theme-bg-tertiary' },
  { from: 'from-\\[#0a0a0a\\]', to: 'from-theme-bg-primary' },
  { from: 'to-\\[#1a0d08\\]', to: 'to-theme-bg-secondary' },
  
  // Borders
  { from: 'border-\\[#8B4513\\]/30', to: 'border-theme-border-primary' },
  { from: 'border-\\[#8B4513\\]/20', to: 'border-theme-border-secondary' },
  { from: 'border-\\[#8B4513\\]/50', to: 'border-theme-border-primary' },
  { from: 'border-\\[#8B4513\\]', to: 'border-theme-border-active' },
  
  // Text colors
  { from: 'text-white', to: 'text-theme-text-primary' },
  { from: 'text-\\[#d4a574\\]', to: 'text-theme-text-secondary' },
  { from: 'text-gray-400', to: 'text-theme-text-tertiary' },
  { from: 'text-gray-300', to: 'text-theme-text-tertiary' },
  { from: 'text-gray-500', to: 'text-theme-text-tertiary' },
  
  // Brand colors
  { from: 'text-\\[#8B4513\\]', to: 'text-theme-brand-secondary' },
  { from: 'bg-\\[#8B4513\\]', to: 'bg-theme-brand-secondary' },
  { from: 'bg-\\[#8B4513\\]/80', to: 'bg-theme-brand-hover' },
  { from: 'bg-\\[#8B4513\\]/20', to: 'bg-theme-brand-secondary/20' },
  { from: 'bg-\\[#8B4513\\]/10', to: 'bg-theme-brand-secondary/10' },
  { from: 'hover:bg-\\[#8B4513\\]/80', to: 'hover:bg-theme-brand-hover' },
  { from: 'hover:bg-\\[#8B4513\\]/20', to: 'hover:bg-theme-brand-secondary/20' },
  { from: 'hover:bg-\\[#8B4513\\]/10', to: 'hover:bg-theme-brand-secondary/10' },
  
  // Status colors - partial matches
  { from: 'text-green-400', to: 'text-theme-status-success' },
  { from: 'text-green-500', to: 'text-theme-status-success' },
  { from: 'text-amber-400', to: 'text-theme-status-warning' },
  { from: 'text-amber-500', to: 'text-theme-status-warning' },
  { from: 'text-red-400', to: 'text-theme-status-error' },
  { from: 'text-red-500', to: 'text-theme-status-error' },
  { from: 'text-blue-400', to: 'text-theme-status-info' },
  { from: 'text-blue-500', to: 'text-theme-status-info' },
  
  { from: 'bg-green-500', to: 'bg-theme-status-success' },
  { from: 'bg-amber-500', to: 'bg-theme-status-warning' },
  { from: 'bg-red-500', to: 'bg-theme-status-error' },
  { from: 'bg-blue-500', to: 'bg-theme-status-info' },
  
  { from: 'border-green-500', to: 'border-theme-status-success' },
  { from: 'border-amber-500', to: 'border-theme-status-warning' },
  { from: 'border-red-500', to: 'border-theme-status-error' },
  { from: 'border-blue-500', to: 'border-theme-status-info' },
];

// Function to process a file
function processFile(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) {
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  colorMappings.forEach(({ from, to }) => {
    const regex = new RegExp(from, 'g');
    const matches = content.match(regex);
    if (matches) {
      content = content.replace(regex, to);
      modified = true;
      console.log(`✓ ${path.basename(filePath)}: Replaced ${matches.length} instances of ${from}`);
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
const targetPath = process.argv[2] || './components';
console.log(`🎨 Starting theme migration in ${targetPath}...`);
processDirectory(targetPath);
console.log('✅ Theme migration complete!');