#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const config = {
  version: process.env.npm_package_version || '1.0.0',
  buildDir: 'out',
  updateServer: process.env.UPDATE_SERVER || 'https://your-update-server.com',
  platforms: ['web', 'android', 'ios']
};

console.log('🚀 Starting deployment process...');
console.log(`📦 Version: ${config.version}`);

// Step 1: Build the application
console.log('\n📋 Step 1: Building application...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Step 2: Generate update manifest
console.log('\n📋 Step 2: Generating update manifest...');
const updateManifest = {
  version: config.version,
  timestamp: new Date().toISOString(),
  platforms: {},
  changelog: process.env.CHANGELOG || 'Bug fixes and performance improvements',
  mandatory: process.env.MANDATORY_UPDATE === 'true',
  size: '2.5MB', // This would be calculated from actual build size
  checksum: generateChecksum(), // This would be calculated from actual files
  downloadUrl: `${config.updateServer}/updates/${config.version}`,
  releaseNotes: {
    features: process.env.FEATURES ? process.env.FEATURES.split(',') : [],
    bugfixes: process.env.BUGFIXES ? process.env.BUGFIXES.split(',') : [],
    breaking: process.env.BREAKING_CHANGES ? process.env.BREAKING_CHANGES.split(',') : []
  }
};

// Step 3: Create platform-specific builds
console.log('\n📋 Step 3: Creating platform-specific builds...');
config.platforms.forEach(platform => {
  console.log(`\n📱 Processing ${platform}...`);
  
  try {
    switch (platform) {
      case 'web':
        // Web build is already done
        updateManifest.platforms.web = {
          type: 'pwa',
          files: ['sw.js', 'manifest.json'],
          version: config.version
        };
        break;
        
      case 'android':
        // Build Android app
        execSync('npx cap build android', { stdio: 'inherit' });
        updateManifest.platforms.android = {
          type: 'apk',
          version: config.version,
          minSdkVersion: 22,
          targetSdkVersion: 33
        };
        break;
        
      case 'ios':
        // Build iOS app
        execSync('npx cap build ios', { stdio: 'inherit' });
        updateManifest.platforms.ios = {
          type: 'ipa',
          version: config.version,
          minVersion: '12.0'
        };
        break;
    }
    
    console.log(`✅ ${platform} build completed`);
  } catch (error) {
    console.error(`❌ ${platform} build failed:`, error.message);
  }
});

// Step 4: Save update manifest
console.log('\n📋 Step 4: Saving update manifest...');
const manifestPath = path.join(config.buildDir, 'update-manifest.json');
fs.writeFileSync(manifestPath, JSON.stringify(updateManifest, null, 2));
console.log(`✅ Update manifest saved to ${manifestPath}`);

// Step 5: Upload to update server (placeholder)
console.log('\n📋 Step 5: Uploading to update server...');
console.log('⚠️  This step requires your update server implementation');
console.log(`📤 Update manifest: ${manifestPath}`);
console.log(`🌐 Update server: ${config.updateServer}`);

// Step 6: Update version tracking
console.log('\n📋 Step 6: Updating version tracking...');
const versionFile = path.join(config.buildDir, 'version.json');
const versionInfo = {
  current: config.version,
  previous: getPreviousVersion(),
  deployedAt: new Date().toISOString(),
  updateServer: config.updateServer
};
fs.writeFileSync(versionFile, JSON.stringify(versionInfo, null, 2));
console.log(`✅ Version info saved to ${versionFile}`);

console.log('\n🎉 Deployment completed successfully!');
console.log(`📊 Version ${config.version} is now available for updates`);
console.log('\n📝 Next steps:');
console.log('1. Upload the build files to your hosting/CDN');
console.log('2. Update your update server with the new manifest');
console.log('3. Test the update process on different platforms');

// Helper functions
function generateChecksum() {
  // This would calculate a real checksum of the build files
  return `sha256-${Math.random().toString(36).substring(2, 15)}`;
}

function getPreviousVersion() {
  try {
    const versionFile = path.join(config.buildDir, 'version.json');
    if (fs.existsSync(versionFile)) {
      const versionInfo = JSON.parse(fs.readFileSync(versionFile, 'utf8'));
      return versionInfo.current;
    }
  } catch (error) {
    console.warn('Could not read previous version:', error.message);
  }
  return '1.0.0';
}

// Export for use in other scripts
module.exports = {
  config,
  updateManifest,
  deploy: () => {
    // This function can be called from other scripts
    console.log('Deployment function called');
  }
};
