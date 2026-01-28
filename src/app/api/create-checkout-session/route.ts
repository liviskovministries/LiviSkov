import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    error: 'This endpoint is no longer used. Direct Stripe checkout URLs are used instead.' 
  }, { status: 410 });
}