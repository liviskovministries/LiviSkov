import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession } from '@/app/actions/checkout';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { courseId, userId, userEmail } = body;

    if (!courseId || !userId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Create checkout session and redirect URL
    const result = await createCheckoutSession(userId, courseId, userEmail);
    
    if ('error' in result) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    // This will redirect, but we need to return the session URL
    return NextResponse.json({ 
      success: true,
      message: 'Checkout session created'
    });

  } catch (error) {
    console.error('API checkout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}