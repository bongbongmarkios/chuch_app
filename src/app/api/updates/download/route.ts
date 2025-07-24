import { NextRequest, NextResponse } from 'next/server';

// Configure for static export
export const dynamic = 'force-static';
export const revalidate = false;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { version, platform = 'web' } = body;

    if (!version) {
      return NextResponse.json({
        success: false,
        error: 'Version is required',
      }, { status: 400 });
    }

    if (platform === 'web') {
      // For web apps, trigger service worker update
      return await handleWebUpdate(version);
    } else {
      // For mobile apps, provide download information
      return await handleMobileUpdate(version, platform);
    }

  } catch (error) {
    console.error('Error handling update download:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process update download',
    }, { status: 500 });
  }
}

async function handleWebUpdate(version: string) {
  try {
    // In a real implementation, you would:
    // 1. Verify the version is valid
    // 2. Check if the update is available
    // 3. Trigger service worker update
    
    return NextResponse.json({
      success: true,
      message: 'Service worker update triggered',
      version,
      updateType: 'web',
      // The actual update will be handled by the service worker
    });
    
  } catch (error) {
    console.error('Error handling web update:', error);
    throw error;
  }
}

async function handleMobileUpdate(version: string, platform: string) {
  try {
    // In a real implementation, you would:
    // 1. Verify the version is valid
    // 2. Generate a signed download URL
    // 3. Return the download information
    
    const downloadUrl = `https://your-cdn.com/updates/app-${version}-${platform}.zip`;
    const checksum = 'sha256:abc123...'; // This would be the actual checksum
    
    return NextResponse.json({
      success: true,
      message: 'Update package ready for download',
      version,
      platform,
      downloadUrl,
      checksum,
      size: '3.1MB',
      updateType: 'mobile',
    });
    
  } catch (error) {
    console.error('Error handling mobile update:', error);
    throw error;
  }
}

// GET endpoint for direct download (optional)
export async function GET(request: NextRequest) {
  try {
    const version = request.nextUrl.searchParams.get('version');
    const platform = request.nextUrl.searchParams.get('platform') || 'web';

    if (!version) {
      return NextResponse.json({
        success: false,
        error: 'Version parameter is required',
      }, { status: 400 });
    }

    // This would typically redirect to the actual download URL
    // or serve the file directly
    const downloadUrl = `https://your-cdn.com/updates/app-${version}-${platform}.zip`;
    
    return NextResponse.redirect(downloadUrl);
    
  } catch (error) {
    console.error('Error handling direct download:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process download request',
    }, { status: 500 });
  }
} 