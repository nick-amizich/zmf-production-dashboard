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
  
  // Borders - including hover states
  { from: 'hover:border-\\[#d4a574\\]/50', to: 'hover:border-theme-text-secondary/50' },
  { from: 'hover:border-\\[#d4a574\\]', to: 'hover:border-theme-text-secondary' },
  { from: 'border-\\[#d4a574\\]/50', to: 'border-theme-text-secondary/50' },
  { from: 'border-\\[#d4a574\\]', to: 'border-theme-text-secondary' },
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
  { from: 'text-gray-600', to: 'text-theme-text-tertiary' },
  
  // Brand colors
  { from: 'text-\\[#8B4513\\]', to: 'text-theme-brand-secondary' },
  { from: 'bg-\\[#8B4513\\]', to: 'bg-theme-brand-secondary' },
  { from: 'bg-\\[#8B4513\\]/80', to: 'bg-theme-brand-hover' },
  { from: 'bg-\\[#8B4513\\]/20', to: 'bg-theme-brand-secondary/20' },
  { from: 'bg-\\[#8B4513\\]/10', to: 'bg-theme-brand-secondary/10' },
  { from: 'hover:bg-\\[#8B4513\\]/80', to: 'hover:bg-theme-brand-hover' },
  { from: 'hover:bg-\\[#8B4513\\]/20', to: 'hover:bg-theme-brand-secondary/20' },
  { from: 'hover:bg-\\[#8B4513\\]/10', to: 'hover:bg-theme-brand-secondary/10' },
  
  // Status colors - all shades
  { from: 'text-green-400', to: 'text-theme-status-success' },
  { from: 'text-green-500', to: 'text-theme-status-success' },
  { from: 'text-green-600', to: 'text-theme-status-success' },
  { from: 'text-amber-400', to: 'text-theme-status-warning' },
  { from: 'text-amber-500', to: 'text-theme-status-warning' },
  { from: 'text-amber-600', to: 'text-theme-status-warning' },
  { from: 'text-red-400', to: 'text-theme-status-error' },
  { from: 'text-red-500', to: 'text-theme-status-error' },
  { from: 'text-red-600', to: 'text-theme-status-error' },
  { from: 'text-blue-400', to: 'text-theme-status-info' },
  { from: 'text-blue-500', to: 'text-theme-status-info' },
  { from: 'text-blue-600', to: 'text-theme-status-info' },
  
  { from: 'bg-green-400', to: 'bg-theme-status-success' },
  { from: 'bg-green-500', to: 'bg-theme-status-success' },
  { from: 'bg-green-600', to: 'bg-theme-status-success' },
  { from: 'bg-amber-400', to: 'bg-theme-status-warning' },
  { from: 'bg-amber-500', to: 'bg-theme-status-warning' },
  { from: 'bg-amber-600', to: 'bg-theme-status-warning' },
  { from: 'bg-red-400', to: 'bg-theme-status-error' },
  { from: 'bg-red-500', to: 'bg-theme-status-error' },
  { from: 'bg-red-600', to: 'bg-theme-status-error' },
  { from: 'bg-blue-400', to: 'bg-theme-status-info' },
  { from: 'bg-blue-500', to: 'bg-theme-status-info' },
  { from: 'bg-blue-600', to: 'bg-theme-status-info' },
  
  { from: 'border-green-400', to: 'border-theme-status-success' },
  { from: 'border-green-500', to: 'border-theme-status-success' },
  { from: 'border-green-600', to: 'border-theme-status-success' },
  { from: 'border-amber-400', to: 'border-theme-status-warning' },
  { from: 'border-amber-500', to: 'border-theme-status-warning' },
  { from: 'border-amber-600', to: 'border-theme-status-warning' },
  { from: 'border-red-400', to: 'border-theme-status-error' },
  { from: 'border-red-500', to: 'border-theme-status-error' },
  { from: 'border-red-600', to: 'border-theme-status-error' },
  { from: 'border-blue-400', to: 'border-theme-status-info' },
  { from: 'border-blue-500', to: 'border-theme-status-info' },
  { from: 'border-blue-600', to: 'border-theme-status-info' },
  
  // Gray backgrounds
  { from: 'bg-gray-100', to: 'bg-theme-bg-tertiary' },
  { from: 'bg-gray-200', to: 'bg-theme-bg-tertiary' },
  { from: 'bg-gray-800', to: 'bg-theme-bg-secondary' },
  { from: 'bg-gray-900', to: 'bg-theme-bg-primary' },
  
  // Additional common patterns
  { from: 'bg-black', to: 'bg-theme-bg-primary' },
  { from: 'text-black', to: 'text-theme-text-primary' },
  { from: 'border-gray-200', to: 'border-theme-border-secondary' },
  { from: 'border-gray-300', to: 'border-theme-border-primary' },
  
  // Fill colors for SVGs
  { from: 'fill-\\[#d4a574\\]', to: 'fill-theme-text-secondary' },
  { from: 'fill-\\[#8B4513\\]', to: 'fill-theme-brand-secondary' },
];

// Additional patterns to find and report (but not auto-replace)
const reportPatterns = [
  // Any remaining hex colors
  { pattern: 'bg-\\[#[0-9a-fA-F]{3,6}\\]', type: 'background' },
  { pattern: 'text-\\[#[0-9a-fA-F]{3,6}\\]', type: 'text' },
  { pattern: 'border-\\[#[0-9a-fA-F]{3,6}\\]', type: 'border' },
  { pattern: 'fill-\\[#[0-9a-fA-F]{3,6}\\]', type: 'fill' },
  { pattern: 'stroke-\\[#[0-9a-fA-F]{3,6}\\]', type: 'stroke' },
  // Chart colors
  { pattern: '[\'"]#[0-9a-fA-F]{3,6}[\'"]', type: 'chart/string' },
];

// Function to process a file
function processFile(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) {
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  const unreplacedPatterns = [];
  
  // Apply replacements
  colorMappings.forEach(({ from, to }) => {
    const regex = new RegExp(from, 'g');
    const matches = content.match(regex);
    if (matches) {
      content = content.replace(regex, to);
      modified = true;
      console.log(`✓ ${path.basename(filePath)}: Replaced ${matches.length} instances of ${from}`);
    }
  });
  
  // Report remaining patterns
  reportPatterns.forEach(({ pattern, type }) => {
    const regex = new RegExp(pattern, 'g');
    const matches = content.match(regex);
    if (matches) {
      unreplacedPatterns.push({ type, count: matches.length, examples: [...new Set(matches)].slice(0, 3) });
    }
  });
  
  if (unreplacedPatterns.length > 0) {
    console.log(`⚠️  ${path.basename(filePath)} has remaining hardcoded colors:`);
    unreplacedPatterns.forEach(({ type, count, examples }) => {
      console.log(`   - ${count} ${type} colors: ${examples.join(', ')}`);
    });
  }
  
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
console.log(`🎨 Starting enhanced theme migration in ${targetPath}...`);
console.log('This will replace common patterns and report remaining hardcoded colors.\n');
processDirectory(targetPath);
console.log('\n✅ Theme migration complete!');
console.log('Note: Some colors (like in charts) may need manual migration.');