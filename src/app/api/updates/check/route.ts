import { NextRequest, NextResponse } from 'next/server';

// Configure for static export
export const dynamic = 'force-static';
export const revalidate = false;

// Get the actual app version from package.json or environment
const CURRENT_VERSION = process.env.APP_VERSION || '1.0.1';

export async function GET(request: NextRequest) {
  try {
    const userAgent = request.headers.get('user-agent') || '';
    const clientVersion = request.headers.get('x-app-version') || 
                          request.nextUrl.searchParams.get('version') || 
                          CURRENT_VERSION;
    
    // Check if it's a mobile app (Capacitor)
    const isMobileApp = userAgent.includes('Capacitor') || 
                       userAgent.includes('Android') || 
                       userAgent.includes('iOS') ||
                       request.headers.get('x-platform') === 'mobile';
    
    if (isMobileApp) {
      return await checkMobileUpdates(clientVersion, userAgent);
    } else {
      return await checkWebUpdates(clientVersion);
    }
    
  } catch (error) {
    console.error('Error checking for updates:', error);
    return NextResponse.json({
      hasUpdate: false,
      currentVersion: CURRENT_VERSION,
      latestVersion: CURRENT_VERSION,
      updateType: 'none',
      error: 'Failed to check for updates',
    }, { status: 500 });
  }
}

async function checkMobileUpdates(clientVersion: string, userAgent: string) {
  try {
    const platform = getPlatform(userAgent);
    
    // In a real implementation, you would check against your actual update server
    // For now, we'll check if the client version is older than the current version
    const hasUpdate = compareVersions(CURRENT_VERSION, clientVersion) > 0;
    
    if (hasUpdate) {
      return NextResponse.json({
        hasUpdate: true,
        currentVersion: clientVersion,
        latestVersion: CURRENT_VERSION,
        updateType: 'mobile',
        downloadUrl: `https://your-cdn.com/updates/app-${CURRENT_VERSION}-${platform}.zip`,
        changelog: 'New version available',
        size: '3.1MB',
        mandatory: false,
      });
    }
    
    return NextResponse.json({
      hasUpdate: false,
      currentVersion: clientVersion,
      latestVersion: clientVersion,
      updateType: 'mobile',
      message: 'You are running the latest version',
    });
    
  } catch (error) {
    console.error('Error checking mobile updates:', error);
    throw error;
  }
}

async function checkWebUpdates(clientVersion: string) {
  try {
    // Check if the client version is older than the current version
    const hasUpdate = compareVersions(CURRENT_VERSION, clientVersion) > 0;
    
    if (hasUpdate) {
      return NextResponse.json({
        hasUpdate: true,
        currentVersion: clientVersion,
        latestVersion: CURRENT_VERSION,
        updateType: 'web',
        downloadUrl: '/api/updates/download',
        changelog: 'New version available',
        size: '2.5MB',
        mandatory: false,
      });
    }
    
    // Check if service worker needs update (this would be more sophisticated in production)
    const hasServiceWorkerUpdate = await checkServiceWorkerUpdate(clientVersion);
    
    if (hasServiceWorkerUpdate) {
      return NextResponse.json({
        hasUpdate: true,
        currentVersion: clientVersion,
        latestVersion: CURRENT_VERSION,
        updateType: 'web',
        downloadUrl: '/api/updates/download',
        changelog: 'Service worker update available',
        size: '1.2MB',
        mandatory: false,
      });
    }
    
    return NextResponse.json({
      hasUpdate: false,
      currentVersion: clientVersion,
      latestVersion: clientVersion,
      updateType: 'web',
      message: 'You are running the latest version',
    });
    
  } catch (error) {
    console.error('Error checking web updates:', error);
    throw error;
  }
}

async function checkServiceWorkerUpdate(clientVersion: string): Promise<boolean> {
  // In a real implementation, you would:
  // 1. Check your deployment system for new builds
  // 2. Compare build hashes or timestamps
  // 3. Check if the service worker file has changed
  
  // For now, we'll return false to avoid false positives
  return false;
}

function getPlatform(userAgent: string): string {
  if (userAgent.includes('Android')) return 'android';
  if (userAgent.includes('iOS')) return 'ios';
  return 'web';
}

function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] || 0;
    const part2 = parts2[i] || 0;
    
    if (part1 > part2) return 1;
    if (part1 < part2) return -1;
  }
  
  return 0;
} 