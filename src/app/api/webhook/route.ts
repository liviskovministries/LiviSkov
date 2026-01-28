import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/integrations/supabase/client';

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    error: 'This webhook endpoint is no longer used. Direct Stripe checkout URLs are used instead.' 
  }, { status: 410 });
}