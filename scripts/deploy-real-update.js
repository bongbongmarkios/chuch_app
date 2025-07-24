#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  versionFile: 'public/version.json',
  buildDir: 'out',
  updateDir: 'updates',
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function error(message) {
  log(`❌ ${message}`, colors.red);
  process.exit(1);
}

function success(message) {
  log(`✅ ${message}`, colors.green);
}

function info(message) {
  log(`ℹ️  ${message}`, colors.blue);
}

function warn(message) {
  log(`⚠️  ${message}`, colors.yellow);
}

// Get current version from package.json
function getCurrentVersion() {
  try {
    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    return packageJson.version;
  } catch (error) {
    error('Failed to read package.json');
  }
}

// Update version in package.json
function updateVersion(newVersion) {
  try {
    const packageJsonPath = 'package.json';
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    packageJson.version = newVersion;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    success(`Updated package.json version to ${newVersion}`);
  } catch (error) {
    error(`Failed to update package.json: ${error.message}`);
  }
}

// Create version.json file for the update system
function createVersionFile(version, changelog = '') {
  const versionData = {
    version,
    timestamp: new Date().toISOString(),
    changelog,
    buildDate: new Date().toISOString(),
    platforms: {
      web: {
        downloadUrl: `/api/updates/download?version=${version}&platform=web`,
        size: '2.5MB',
        checksum: 'sha256:web-update-hash',
      },
      android: {
        downloadUrl: `https://your-cdn.com/updates/app-${version}-android.zip`,
        size: '3.1MB',
        checksum: 'sha256:android-update-hash',
      },
      ios: {
        downloadUrl: `https://your-cdn.com/updates/app-${version}-ios.zip`,
        size: '3.1MB',
        checksum: 'sha256:ios-update-hash',
      },
    },
  };

  try {
    // Ensure public directory exists
    if (!fs.existsSync('public')) {
      fs.mkdirSync('public', { recursive: true });
    }
    
    fs.writeFileSync(CONFIG.versionFile, JSON.stringify(versionData, null, 2));
    success(`Created ${CONFIG.versionFile} with version ${version}`);
  } catch (error) {
    error(`Failed to create version file: ${error.message}`);
  }
}

// Build the application
function buildApp() {
  info('Building application...');
  try {
    execSync('npm run build:mobile', { stdio: 'inherit' });
    success('Application built successfully');
  } catch (error) {
    error('Build failed');
  }
}

// Create update packages
function createUpdatePackages(version) {
  info('Creating update packages...');
  
  // Ensure updates directory exists
  if (!fs.existsSync(CONFIG.updateDir)) {
    fs.mkdirSync(CONFIG.updateDir, { recursive: true });
  }

  // Create web update package (copy build files)
  try {
    const webUpdatePath = path.join(CONFIG.updateDir, `app-${version}-web.zip`);
    // In a real implementation, you would zip the build directory
    // For now, we'll create a placeholder
    fs.writeFileSync(webUpdatePath, `Web update package for version ${version}`);
    success(`Created web update package: ${webUpdatePath}`);
  } catch (error) {
    warn(`Failed to create web update package: ${error.message}`);
  }

  // Create mobile update packages
  ['android', 'ios'].forEach(platform => {
    try {
      const mobileUpdatePath = path.join(CONFIG.updateDir, `app-${version}-${platform}.zip`);
      // In a real implementation, you would create platform-specific packages
      fs.writeFileSync(mobileUpdatePath, `${platform} update package for version ${version}`);
      success(`Created ${platform} update package: ${mobileUpdatePath}`);
    } catch (error) {
      warn(`Failed to create ${platform} update package: ${error.message}`);
    }
  });
}

// Update environment variables
function updateEnvironmentVariables(version) {
  info('Updating environment variables...');
  
  const envContent = `# Update System Configuration
APP_VERSION=${version}
UPDATE_ENDPOINT=https://your-cdn.com/api/updates

# Replace 'your-cdn.com' with your actual CDN domain
# Examples:
# UPDATE_ENDPOINT=https://cdn.yourdomain.com/api/updates
# UPDATE_ENDPOINT=https://your-bucket.s3.amazonaws.com/api/updates
# UPDATE_ENDPOINT=https://your-vercel-app.vercel.app/api/updates
`;

  try {
    fs.writeFileSync('.env.local', envContent);
    success('Updated .env.local with new version');
  } catch (error) {
    warn(`Failed to update .env.local: ${error.message}`);
  }
}

// Main deployment function
function deploy(newVersion, changelog = '') {
  log('🚀 Starting real update deployment...', colors.bright);
  
  const currentVersion = getCurrentVersion();
  info(`Current version: ${currentVersion}`);
  info(`New version: ${newVersion}`);

  if (newVersion === currentVersion) {
    error('New version must be different from current version');
  }

  // Update version
  updateVersion(newVersion);

  // Update environment variables
  updateEnvironmentVariables(newVersion);

  // Build application
  buildApp();

  // Create version file
  createVersionFile(newVersion, changelog);

  // Create update packages
  createUpdatePackages(newVersion);

  log('🎉 Real update deployment completed!', colors.bright);
  info('Next steps:');
  info('1. Upload the update packages to your CDN');
  info('2. Update your CDN URLs in the version.json file');
  info('3. Deploy the updated app to your hosting platform');
  info('4. Test the update process in your app');
  
  log('📝 Update Summary:', colors.cyan);
  log(`   Version: ${newVersion}`, colors.cyan);
  log(`   Changelog: ${changelog || 'No changelog provided'}`, colors.cyan);
  log(`   Build Date: ${new Date().toLocaleString()}`, colors.cyan);
}

// CLI argument parsing
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    log('Usage: node deploy-real-update.js <new-version> [changelog]', colors.bright);
    log('Example: node deploy-real-update.js 1.0.2 "Bug fixes and new features"', colors.cyan);
    process.exit(1);
  }

  const newVersion = args[0];
  const changelog = args[1] || '';

  // Validate version format (simple semver check)
  if (!/^\d+\.\d+\.\d+$/.test(newVersion)) {
    error('Version must be in semver format (e.g., 1.0.2)');
  }

  deploy(newVersion, changelog);
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { deploy, getCurrentVersion, updateVersion }; 