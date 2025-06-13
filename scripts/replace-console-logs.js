#!/usr/bin/env node

/**
 * Script to replace console.log statements with logger utility
 * Run with: node scripts/replace-console-logs.js
 */

const fs = require('fs').promises;
const path = require('path');

const IGNORE_DIRS = [
  'node_modules',
  '.next',
  '.git',
  'dist',
  'build',
  'coverage',
  '__tests__',
  'scripts',
  'supabase/migrations',
  'standalone-configurator'
];

const FILE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

// Files to skip
const SKIP_FILES = [
  'logger.ts',
  'jest.setup.js',
  'replace-console-logs.js'
];

async function getAllFiles(dir, files = []) {
  const items = await fs.readdir(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = await fs.stat(fullPath);
    
    if (stat.isDirectory()) {
      if (!IGNORE_DIRS.includes(item)) {
        await getAllFiles(fullPath, files);
      }
    } else if (FILE_EXTENSIONS.includes(path.extname(item))) {
      if (!SKIP_FILES.some(skipFile => fullPath.includes(skipFile))) {
        files.push(fullPath);
      }
    }
  }
  
  return files;
}

async function replaceConsoleInFile(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf8');
    let modified = false;
    
    // Check if file already imports logger
    const hasLoggerImport = content.includes("from '@/lib/logger'") || 
                           content.includes('from "@/lib/logger"');
    
    // Patterns to replace
    const replacements = [
      {
        // console.log(...) -> logger.debug(...)
        pattern: /console\.log\s*\(/g,
        replacement: 'logger.debug(',
        needsImport: true
      },
      {
        // console.error(...) -> logger.error(...)
        pattern: /console\.error\s*\(/g,
        replacement: 'logger.error(',
        needsImport: true
      },
      {
        // console.warn(...) -> logger.warn(...)
        pattern: /console\.warn\s*\(/g,
        replacement: 'logger.warn(',
        needsImport: true
      },
      {
        // console.info(...) -> logger.info(...)
        pattern: /console\.info\s*\(/g,
        replacement: 'logger.info(',
        needsImport: true
      },
      {
        // console.debug(...) -> logger.debug(...)
        pattern: /console\.debug\s*\(/g,
        replacement: 'logger.debug(',
        needsImport: true
      }
    ];
    
    let needsImport = false;
    
    for (const { pattern, replacement, needsImport: requiresImport } of replacements) {
      if (pattern.test(content)) {
        content = content.replace(pattern, replacement);
        modified = true;
        if (requiresImport) {
          needsImport = true;
        }
      }
    }
    
    // Special handling for complex console.log statements
    // Handle multiline console.log
    const multilinePattern = /console\.(log|error|warn|info|debug)\s*\(\s*([^)]+)\s*\)/gm;
    const matches = content.match(multilinePattern);
    
    if (matches) {
      matches.forEach(match => {
        const logType = match.match(/console\.(\w+)/)[1];
        const loggerMethod = logType === 'log' ? 'debug' : logType;
        
        // Extract the arguments
        const argsMatch = match.match(/console\.\w+\s*\(\s*([^)]+)\s*\)/);
        if (argsMatch) {
          const args = argsMatch[1];
          
          // Check if it's a simple string or template literal
          if (args.startsWith("'") || args.startsWith('"') || args.startsWith('`')) {
            // Simple string, use as is
            const newLog = `logger.${loggerMethod}(${args})`;
            content = content.replace(match, newLog);
          } else {
            // Complex expression, format as message + context
            const parts = args.split(',').map(p => p.trim());
            if (parts.length === 1) {
              const newLog = `logger.${loggerMethod}('Log output', { data: ${parts[0]} })`;
              content = content.replace(match, newLog);
            } else {
              const message = parts[0];
              const context = parts.slice(1).join(', ');
              const newLog = `logger.${loggerMethod}(${message}, { data: ${context} })`;
              content = content.replace(match, newLog);
            }
          }
          modified = true;
          needsImport = true;
        }
      });
    }
    
    // Add import if needed and not already present
    if (modified && needsImport && !hasLoggerImport) {
      // Find the right place to add import
      const importRegex = /^import\s+.+\s+from\s+['"].+['"];?\s*$/gm;
      const imports = content.match(importRegex);
      
      if (imports && imports.length > 0) {
        // Add after the last import
        const lastImport = imports[imports.length - 1];
        const lastImportIndex = content.lastIndexOf(lastImport);
        const insertPosition = lastImportIndex + lastImport.length;
        
        content = content.slice(0, insertPosition) + 
                  "\nimport { logger } from '@/lib/logger'" +
                  content.slice(insertPosition);
      } else {
        // Add at the beginning of the file
        if (content.startsWith("'use client'") || content.startsWith('"use client"')) {
          const firstNewline = content.indexOf('\n');
          content = content.slice(0, firstNewline + 1) +
                    "\nimport { logger } from '@/lib/logger'\n" +
                    content.slice(firstNewline + 1);
        } else {
          content = "import { logger } from '@/lib/logger'\n\n" + content;
        }
      }
    }
    
    if (modified) {
      await fs.writeFile(filePath, content, 'utf8');
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

async function main() {
  console.log('Starting console.log replacement...');
  
  const projectRoot = path.join(__dirname, '..');
  const files = await getAllFiles(projectRoot);
  
  console.log(`Found ${files.length} files to process`);
  
  let modifiedCount = 0;
  
  for (const file of files) {
    const wasModified = await replaceConsoleInFile(file);
    if (wasModified) {
      modifiedCount++;
      console.log(`✓ Modified: ${path.relative(projectRoot, file)}`);
    }
  }
  
  console.log(`\nCompleted! Modified ${modifiedCount} files.`);
  console.log('\nNote: Please review the changes and ensure they are correct.');
  console.log('Some complex console.log statements may need manual adjustment.');
}

main().catch(console.error);