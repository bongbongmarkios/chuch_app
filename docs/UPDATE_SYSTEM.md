# App Update System

This document explains how the online-offline update system works in your app.

## Overview

The app includes a comprehensive update system that allows users to:
- Check for updates automatically
- Download updates when offline
- Install updates seamlessly
- Get notified about new versions

## How It Works

### 1. Update Detection

The system automatically checks for updates in several ways:

- **Service Worker**: Checks for new versions every 6 hours
- **Manual Check**: Users can manually check for updates
- **App Launch**: Checks for updates when the app starts

### 2. Update Types

#### Web Updates
- Uses Service Worker to cache new files
- Automatic background updates
- Reload required to apply updates

#### Mobile Updates (Capacitor)
- Downloads update packages
- Installs updates using native capabilities
- Automatic app restart after installation

### 3. Offline Support

- Updates are cached for offline access
- Users can download updates when online and install when offline
- Service Worker provides offline functionality

## Components

### UpdateManager
A comprehensive UI component that shows:
- Current app version
- Available updates
- Download progress
- Update history

### UpdateNotification
A floating notification that appears when updates are available.

### UpdateService
Core service that handles:
- Version checking
- Update downloading
- Installation process

## API Endpoints

### GET /api/updates/check
Checks for available updates.

**Response:**
```json
{
  "hasUpdate": true,
  "currentVersion": "1.0.0",
  "latestVersion": "1.0.1",
  "updateType": "web",
  "downloadUrl": "/api/updates/download",
  "changelog": "Bug fixes and performance improvements",
  "size": "2.5MB",
  "mandatory": false
}
```

### POST /api/updates/download
Initiates update download.

**Request:**
```json
{
  "version": "1.0.1",
  "platform": "web"
}
```

## Deployment Process

### 1. Update Version
```bash
node scripts/deploy-update.js 1.0.1 "Bug fixes and performance improvements"
```

### 2. Build Application
The script automatically:
- Updates package.json version
- Builds the application
- Creates update packages
- Generates version.json

### 3. Deploy to CDN
Upload the generated files to your CDN:
- `out/` directory (web build)
- `updates/` directory (update packages)
- `version.json` (version information)

### 4. Update Server
Update your update server with the new version information.

## Configuration

### Environment Variables

```env
APP_VERSION=1.0.0
UPDATE_ENDPOINT=https://your-update-server.com/api/updates
```

### Service Worker Configuration

The service worker is configured in `public/sw.js`:
- Cache strategy: Cache-first with network fallback
- Update check interval: 6 hours
- Automatic update detection

## Usage Examples

### Check for Updates Manually
```typescript
import { forceCheckForUpdates } from '@/services/UpdateService';

const updateInfo = await forceCheckForUpdates();
if (updateInfo.hasUpdate) {
  // Show update notification
}
```

### Download and Install Update
```typescript
import { downloadAndApplyUpdate } from '@/services/UpdateService';

await downloadAndApplyUpdate(updateInfo, (progress) => {
  console.log(`Update progress: ${progress.progress}%`);
});
```

### Listen for Update Events
```typescript
window.addEventListener('updateAvailable', (event) => {
  const updateInfo = event.detail;
  // Show update notification
});
```

## Mobile Platform Support

### Android
- Uses Capacitor Filesystem plugin
- Downloads update packages
- Automatic installation

### iOS
- Similar to Android
- Requires proper signing
- App Store updates still recommended

## Best Practices

### 1. Version Management
- Use semantic versioning (MAJOR.MINOR.PATCH)
- Include meaningful changelogs
- Test updates thoroughly

### 2. Update Strategy
- Provide non-mandatory updates by default
- Use mandatory updates for critical fixes
- Include rollback mechanisms

### 3. User Experience
- Show clear progress indicators
- Provide update descriptions
- Allow users to postpone updates

### 4. Security
- Verify update package integrity
- Use HTTPS for all downloads
- Implement proper authentication

## Troubleshooting

### Common Issues

1. **Updates not detected**
   - Check network connectivity
   - Verify update server is accessible
   - Check service worker registration

2. **Download failures**
   - Verify CDN accessibility
   - Check file permissions
   - Validate update package integrity

3. **Installation issues**
   - Check device storage
   - Verify app permissions
   - Restart the app

### Debug Mode

Enable debug logging:
```typescript
localStorage.setItem('debug_updates', 'true');
```

## Future Enhancements

- [ ] Delta updates (only download changed files)
- [ ] Background update installation
- [ ] Update rollback functionality
- [ ] A/B testing support
- [ ] Analytics integration

## Support

For issues or questions about the update system:
1. Check the troubleshooting section
2. Review the service worker logs
3. Verify network connectivity
4. Test with a clean installation 