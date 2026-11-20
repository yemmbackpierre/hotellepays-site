import { NextRequest, NextResponse } from 'next/server';
import { verifyAndComputeBookingPricing } from '@/app/lib/pricingVerification.server';

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const verified = await verifyAndComputeBookingPricing(payload);
    return NextResponse.json({
      success: true,
      verified,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    );
  }
}
