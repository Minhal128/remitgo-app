const fs = require('fs');
const path = require('path');

// Function to convert shadow properties to boxShadow
function convertShadowToBoxShadow(shadowColor, shadowOffset, shadowOpacity, shadowRadius) {
  // Extract color value
  const colorMatch = shadowColor.match(/['"]([^'"]+)['"]/);
  const color = colorMatch ? colorMatch[1] : '#000';
  
  // Extract offset values
  const offsetMatch = shadowOffset.match(/width:\s*([^,]+),\s*height:\s*([^}]+)/);
  const offsetX = offsetMatch ? parseFloat(offsetMatch[1]) : 0;
  const offsetY = offsetMatch ? parseFloat(offsetMatch[2]) : 0;
  
  // Extract opacity and radius
  const opacity = parseFloat(shadowOpacity) || 0.25;
  const radius = parseFloat(shadowRadius) || 3.84;
  
  // Convert to boxShadow format
  const boxShadow = `${offsetX}px ${offsetY}px ${radius}px rgba(0, 0, 0, ${opacity})`;
  
  return boxShadow;
}

// Function to process a file
function processFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    
    // Pattern to match shadow properties
    const shadowPattern = /(\s*)(shadowColor:\s*['"][^'"]+['"],?\s*shadowOffset:\s*\{[^}]+\},?\s*shadowOpacity:\s*[^,}]+,?\s*shadowRadius:\s*[^,}]+,?)/g;
    
    content = content.replace(shadowPattern, (match, indent, shadowProps) => {
      // Extract individual properties
      const shadowColorMatch = shadowProps.match(/shadowColor:\s*['"]([^'"]+)['"]/);
      const shadowOffsetMatch = shadowProps.match(/shadowOffset:\s*\{([^}]+)\}/);
      const shadowOpacityMatch = shadowProps.match(/shadowOpacity:\s*([^,}]+)/);
      const shadowRadiusMatch = shadowProps.match(/shadowRadius:\s*([^,}]+)/);
      
      if (shadowColorMatch && shadowOffsetMatch && shadowOpacityMatch && shadowRadiusMatch) {
        const boxShadow = convertShadowToBoxShadow(
          shadowColorMatch[0],
          shadowOffsetMatch[0],
          shadowOpacityMatch[0],
          shadowRadiusMatch[0]
        );
        
        modified = true;
        return `${indent}...Platform.select({\n${indent}  web: {\n${indent}    boxShadow: '${boxShadow}',\n${indent}  },\n${indent}  default: {\n${indent}    ${shadowProps}\n${indent}  },\n${indent}),`;
      }
      
      return match;
    });
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ Fixed shadow styles in: ${filePath}`);
    }
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

// Function to recursively find and process files
function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      processDirectory(filePath);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.js')) {
      processFile(filePath);
    }
  });
}

// Main execution
console.log('🔧 Fixing shadow style warnings...');
processDirectory('./app');
console.log('✅ Shadow style fixes completed!');
