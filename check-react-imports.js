import { readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const srcDir = join(__dirname, 'src');
const filesToCheck = [];

// Find all JSX files
function findJSXFiles(dir) {
  const files = readdirSync(dir);
  
  files.forEach(file => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    
    if (stat.isDirectory()) {
      findJSXFiles(filePath);
    } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
      filesToCheck.push(filePath);
    }
  });
}

findJSXFiles(srcDir);

// Check each file for React imports and JSX usage
filesToCheck.forEach(filePath => {
  const content = readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  // Check if file contains JSX
  const hasJSX = content.match(/<[a-zA-Z][^>]*>|<\/[a-zA-Z][^>]*>|\{[^}]*\s*[{}]\s*[^}]*\}/);
  const hasReactImport = content.match(/import\s+React\b|import\s+\*\s+as\s+React\b/);
  const hasReactHooks = content.match(/useState\(|useEffect\(|useContext\(|useReducer\(|useRef\(|useMemo\(|useCallback\(/);
  const hasReactComponent = content.match(/class\s+\w+\s+extends\s+React\.Component|function\s+[A-Z]|const\s+[A-Z]\w*\s*=\s*\(/);
  
  if ((hasJSX || hasReactHooks || hasReactComponent) && !hasReactImport) {
    console.log(`\x1b[33mMissing React import in: ${filePath}\x1b[0m`);
    
    // Add React import if missing
    let newContent = content;
    if (!hasReactImport) {
      const importLine = "import React from 'react';\n";
      // Find the first import statement or add at the top
      const firstImportIndex = lines.findIndex(line => line.trim().startsWith('import'));
      
      if (firstImportIndex !== -1) {
        // Insert after the last import
        let lastImportIndex = firstImportIndex;
        while (lines[lastImportIndex + 1] && lines[lastImportIndex + 1].trim().startsWith('import')) {
          lastImportIndex++;
        }
        lines.splice(lastImportIndex + 1, 0, importLine.trim());
        newContent = lines.join('\n');
      } else {
        // No imports found, add at the top
        newContent = importLine + content;
      }
      
      // Write the fixed file
      writeFileSync(filePath, newContent);
      console.log(`\x1b[32m✓ Added React import to: ${filePath}\x1b[0m`);
    }
  }
});

console.log('\n\x1b[32m✓ Finished checking React imports\x1b[0m');
