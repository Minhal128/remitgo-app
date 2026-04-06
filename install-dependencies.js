#!/usr/bin/env node

/**
 * Install Missing Dependencies Script
 * This script installs the required dependencies for biometric authentication and image compression
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Installing missing dependencies for RemitGo...\n');

const missingDependencies = [
  'expo-image-manipulator',
  'expo-file-system'
];

const missingDevDependencies = [
  '@types/react-native'
];

function installDependencies() {
  try {
    // Install main dependencies
    if (missingDependencies.length > 0) {
      console.log('📦 Installing main dependencies...');
      const installCommand = `npm install ${missingDependencies.join(' ')}`;
      console.log(`Running: ${installCommand}`);
      execSync(installCommand, { stdio: 'inherit' });
      console.log('✅ Main dependencies installed successfully!\n');
    }

    // Install dev dependencies
    if (missingDevDependencies.length > 0) {
      console.log('🔧 Installing dev dependencies...');
      const installDevCommand = `npm install --save-dev ${missingDevDependencies.join(' ')}`;
      console.log(`Running: ${installDevCommand}`);
      execSync(installDevCommand, { stdio: 'inherit' });
      console.log('✅ Dev dependencies installed successfully!\n');
    }

    console.log('🎉 All dependencies installed successfully!');
    console.log('\n📋 Next steps:');
    console.log('1. Restart your development server');
    console.log('2. Test biometric authentication');
    console.log('3. Test KYC submission with image compression');
    
  } catch (error) {
    console.error('❌ Error installing dependencies:', error.message);
    console.log('\n🔧 Manual installation:');
    console.log('Run these commands in your Remit-Frontend directory:');
    
    if (missingDependencies.length > 0) {
      console.log(`npm install ${missingDependencies.join(' ')}`);
    }
    
    if (missingDevDependencies.length > 0) {
      console.log(`npm install --save-dev ${missingDevDependencies.join(' ')}`);
    }
  }
}

// Check if package.json exists
const packageJsonPath = path.join(__dirname, 'package.json');
if (!fs.existsSync(packageJsonPath)) {
  console.error('❌ package.json not found. Please run this script from the Remit-Frontend directory.');
  process.exit(1);
}

// Run installation
installDependencies();
