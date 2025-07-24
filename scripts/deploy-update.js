#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const CONFIG = {
  versionFile: 'version.json',
  buildDir: 'out',
  updateDir: 'updates',
  platforms: ['web', 'android', 'ios'],
};

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
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

// Create version.json file
function createVersionFile(version, changelog = '') {
  const versionData = {
    version,
    timestamp: new Date().toISOString(),
    changelog,
    platforms: CONFIG.platforms.reduce((acc, platform) => {
      acc[platform] = {
        downloadUrl: `https://your-cdn.com/updates/app-${version}-${platform}.zip`,
        size: '3.1MB', // This would be calculated from actual file size
        checksum: 'sha256:abc123...', // This would be calculated from actual file
      };
      return acc;
    }, {}),
  };

  try {
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
    execSync('npm run build', { stdio: 'inherit' });
    success('Application built successfully');
  } catch (error) {
    error('Build failed');
  }
}

// Build for Capacitor (mobile)
function buildMobile() {
  info('Building for mobile platforms...');
  try {
    execSync('npx cap sync', { stdio: 'inherit' });
    success('Mobile build prepared');
  } catch (error) {
    warn('Mobile build failed, continuing with web only');
  }
}

// Create update packages
function createUpdatePackages(version) {
  info('Creating update packages...');
  
  // Ensure updates directory exists
  if (!fs.existsSync(CONFIG.updateDir)) {
    fs.mkdirSync(CONFIG.updateDir, { recursive: true });
  }

  // Create web update package
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
  CONFIG.platforms.filter(p => p !== 'web').forEach(platform => {
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

// Deploy to CDN (placeholder)
function deployToCDN(version) {
  info('Deploying to CDN...');
  // In a real implementation, you would upload files to your CDN
  // For now, we'll just log what would happen
  log(`Would upload version ${version} to CDN`, colors.cyan);
  success('Deployment completed (simulated)');
}

// Main deployment function
function deploy(newVersion, changelog = '') {
  log('🚀 Starting deployment process...', colors.bright);
  
  const currentVersion = getCurrentVersion();
  info(`Current version: ${currentVersion}`);
  info(`New version: ${newVersion}`);

  if (newVersion === currentVersion) {
    error('New version must be different from current version');
  }

  // Update version
  updateVersion(newVersion);

  // Build application
  buildApp();

  // Build for mobile
  buildMobile();

  // Create version file
  createVersionFile(newVersion, changelog);

  // Create update packages
  createUpdatePackages(newVersion);

  // Deploy to CDN
  deployToCDN(newVersion);

  log('🎉 Deployment completed successfully!', colors.bright);
  info('Next steps:');
  info('1. Upload the update packages to your CDN');
  info('2. Update your update server with the new version information');
  info('3. Test the update process in your app');
}

// CLI argument parsing
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    log('Usage: node deploy-update.js <new-version> [changelog]', colors.bright);
    log('Example: node deploy-update.js 1.0.1 "Bug fixes and performance improvements"', colors.cyan);
    process.exit(1);
  }

  const newVersion = args[0];
  const changelog = args[1] || '';

  // Validate version format (simple semver check)
  if (!/^\d+\.\d+\.\d+$/.test(newVersion)) {
    error('Version must be in semver format (e.g., 1.0.1)');
  }

  deploy(newVersion, changelog);
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { deploy, getCurrentVersion, updateVersion }; 