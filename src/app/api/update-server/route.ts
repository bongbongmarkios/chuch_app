import { NextRequest, NextResponse } from 'next/server';

const CURRENT_VERSION = '1.0.1'; // Update this dynamically in real use
const UPDATE_PACKAGE_URL = 'https://your-cdn.com/updates/app-1.0.1.zip'; // Replace with your hosted update package URL

export async function GET(request: NextRequest) {
  try {
    const clientVersion = request.headers.get('x-app-version') || CURRENT_VERSION;

    if (compareVersions(CURRENT_VERSION, clientVersion) > 0) {
      return NextResponse.json({
        hasUpdate: true,
        currentVersion: clientVersion,
        latestVersion: CURRENT_VERSION,
        downloadUrl: UPDATE_PACKAGE_URL,
        changelog: 'Bug fixes and improvements',
        mandatory: false,
      });
    } else {
      return NextResponse.json({
        hasUpdate: false,
        currentVersion: clientVersion,
        latestVersion: CURRENT_VERSION,
        message: 'You are running the latest version',
      });
    }
  } catch (error) {
    return NextResponse.json({
      hasUpdate: false,
      currentVersion: CURRENT_VERSION,
      latestVersion: CURRENT_VERSION,
      error: 'Failed to check for updates',
    }, { status: 500 });
  }
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
