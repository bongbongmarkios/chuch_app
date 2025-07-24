import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Just consume the data to measure upload speed
    const data = await request.arrayBuffer();
    
    // Return a simple response
    return NextResponse.json({ 
      success: true, 
      receivedBytes: data.byteLength 
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: 'Upload test failed' 
    }, { status: 500 });
  }
} 