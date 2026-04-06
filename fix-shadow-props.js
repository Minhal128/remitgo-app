const fs = require('fs');
const path = require('path');

// Function to recursively find all .tsx and .ts files
function findTsxFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.includes('node_modules') && !file.includes('.git')) {
      findTsxFiles(filePath, fileList);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Function to fix shadow* props in a file
function fixShadowProps(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Check if Platform is imported
    const hasPlatformImport = content.includes('Platform') && content.includes('from \'react-native\'');
    
    // Add Platform import if not present
    if (!hasPlatformImport && (content.includes('shadowColor') || content.includes('shadowOffset') || content.includes('shadowOpacity') || content.includes('shadowRadius'))) {
      const importMatch = content.match(/import\s*\{([^}]+)\}\s*from\s*['"]react-native['"];?/);
      if (importMatch) {
        const imports = importMatch[1].split(',').map(imp => imp.trim());
        if (!imports.includes('Platform')) {
          imports.push('Platform');
          const newImport = `import {\n  ${imports.join(',\n  ')}\n} from 'react-native';`;
          content = content.replace(importMatch[0], newImport);
          modified = true;
        }
      }
    }
    
    // Replace shadow* props with Platform.select pattern
    const shadowPropsRegex = /(\s*)(shadowColor:\s*['"][^'"]+['"],?\s*shadowOffset:\s*\{[^}]+\},?\s*shadowOpacity:\s*[^,}]+,?\s*shadowRadius:\s*[^,}]+,?)/g;
    
    if (shadowPropsRegex.test(content)) {
      content = content.replace(shadowPropsRegex, (match, indent, shadowProps) => {
        // Extract shadow values for web boxShadow
        const shadowColorMatch = shadowProps.match(/shadowColor:\s*['"]([^'"]+)['"]/);
        const shadowOffsetMatch = shadowProps.match(/shadowOffset:\s*\{[^}]+\}/);
        const shadowOpacityMatch = shadowProps.match(/shadowOpacity:\s*([^,}]+)/);
        const shadowRadiusMatch = shadowProps.match(/shadowRadius:\s*([^,}]+)/);
        
        let boxShadow = '';
        if (shadowColorMatch && shadowOffsetMatch && shadowOpacityMatch && shadowRadiusMatch) {
          const color = shadowColorMatch[1];
          const offset = shadowOffsetMatch[0];
          const opacity = shadowOpacityMatch[1];
          const radius = shadowRadiusMatch[1];
          
          // Parse offset values
          const offsetMatch = offset.match(/width:\s*([^,]+),\s*height:\s*([^,}]+)/);
          if (offsetMatch) {
            const x = offsetMatch[1].trim();
            const y = offsetMatch[2].trim();
            boxShadow = `${x}px ${y}px ${radius}px ${color.replace('#', 'rgba(').replace(')', '')}, ${opacity})`;
          }
        }
        
        return `${indent}...Platform.select({\n${indent}  web: {\n${indent}    boxShadow: '${boxShadow || '0px 2px 8px rgba(0, 0, 0, 0.1)'}',\n${indent}  },\n${indent}  default: {\n${indent}    elevation: 5,\n${indent}  },\n${indent}),`;
      });
      modified = true;
    }
    
    // Write back to file if modified
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed: ${filePath}`);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    return false;
  }
}

// Main execution
console.log('🔧 Starting to fix deprecated shadow* props...\n');

const projectRoot = __dirname;
const tsxFiles = findTsxFiles(projectRoot);

console.log(`📁 Found ${tsxFiles.length} TypeScript/TSX files to process\n`);

let fixedCount = 0;
tsxFiles.forEach(filePath => {
  if (fixShadowProps(filePath)) {
    fixedCount++;
  }
});

console.log(`\n🎉 Completed! Fixed ${fixedCount} out of ${tsxFiles.length} files.`);
console.log('\n📝 Note: Some files may need manual review if they have complex shadow configurations.');
