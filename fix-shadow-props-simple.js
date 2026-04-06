const fs = require('fs');

// Files to fix with their specific shadow* props issues
const filesToFix = [
  {
    path: 'app/screens/KYCStartScreen.tsx',
    fixes: [
      {
        old: `shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,`,
        new: `elevation: 8,`
      },
      {
        old: `shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,`,
        new: `elevation: 8,`
      },
      {
        old: `shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,`,
        new: `elevation: 8,`
      }
    ]
  },
  {
    path: 'app/screens/KYCScreen.tsx',
    fixes: [
      {
        old: `shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,`,
        new: `elevation: 3,`
      },
      {
        old: `shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,`,
        new: `elevation: 12,`
      },
      {
        old: `shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,`,
        new: `elevation: 8,`
      },
      {
        old: `shadowColor: THEME_BLUE,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,`,
        new: `elevation: 8,`
      },
      {
        old: `shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,`,
        new: `elevation: 20,`
      },
      {
        old: `shadowColor: '#007bff',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,`,
        new: `elevation: 8,`
      }
    ]
  },
  {
    path: 'app/screens/HomePage.tsx',
    fixes: [
      {
        old: `shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,`,
        new: `elevation: 4,`
      }
    ]
  },
  {
    path: 'app/screens/HelpCenterScreen.tsx',
    fixes: [
      {
        old: `shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 2,`,
        new: `elevation: 2,`
      },
      {
        old: `shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 2,`,
        new: `elevation: 2,`
      }
    ]
  },
  {
    path: 'app/screens/VirtualCard.tsx',
    fixes: [
      {
        old: `shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,`,
        new: `elevation: 8,`
      },
      {
        old: `shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,`,
        new: `elevation: 8,`
      },
      {
        old: `shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,`,
        new: `elevation: 10,`
      }
    ]
  },
  {
    path: 'app/components/OAuthButtons.tsx',
    fixes: [
      {
        old: `shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,`,
        new: `elevation: 2,`
      }
    ]
  },
  {
    path: 'app/components/BiometricTester.tsx',
    fixes: [
      {
        old: `shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,`,
        new: `elevation: 8,`
      }
    ]
  },
  {
    path: 'app/components/BiometricPrompt.tsx',
    fixes: [
      {
        old: `shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,`,
        new: `elevation: 12,`
      }
    ]
  },
  {
    path: 'app/screens/LegalResourcesScreen.tsx',
    fixes: [
      {
        old: `shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 2,`,
        new: `elevation: 2,`
      }
    ]
  },
  {
    path: 'app/screens/KYCPendingScreen.tsx',
    fixes: [
      {
        old: `shadowColor: THEME_BLUE,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,`,
        new: `elevation: 8,`
      }
    ]
  },
  {
    path: 'components/WebBiometricTester.tsx',
    fixes: [
      {
        old: `shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,`,
        new: `elevation: 4,`
      }
    ]
  }
];

// Function to fix a file
function fixFile(filePath, fixes) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;

    // Check if Platform is imported
    const hasPlatformImport = content.includes('Platform') && content.includes('from \'react-native\'');
    
    // Add Platform import if not present
    if (!hasPlatformImport) {
      const importMatch = content.match(/import\s*\{([^}]+)\}\s*from\s*['"]react-native['"];?/);
      if (importMatch) {
        const imports = importMatch[1].split(',').map(imp => imp.trim());
        if (!imports.includes('Platform')) {
          imports.push('Platform');
          const newImport = `import {\n  ${imports.join(',\n  ')}\n} from 'react-native';`;
          content = content.replace(importMatch[0], newImport);
          modified = true;
          console.log(`  ✅ Added Platform import`);
        }
      }
    }

    // Apply fixes
    fixes.forEach((fix, index) => {
      if (content.includes(fix.old)) {
        content = content.replace(fix.old, fix.new);
        modified = true;
        console.log(`  ✅ Fixed shadow props ${index + 1}`);
      }
    });

    // Write back to file if modified
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
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

let totalFixed = 0;
filesToFix.forEach(fileInfo => {
  console.log(`📁 Processing: ${fileInfo.path}`);
  if (fixFile(fileInfo.path, fileInfo.fixes)) {
    totalFixed++;
    console.log(`  ✅ File fixed successfully`);
  } else {
    console.log(`  ⚠️  No changes needed or file not found`);
  }
  console.log('');
});

console.log(`🎉 Completed! Fixed ${totalFixed} out of ${filesToFix.length} files.`);
