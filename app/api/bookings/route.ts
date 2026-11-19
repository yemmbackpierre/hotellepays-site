import { NextResponse } from 'next/server';
import { bookingsService } from '@/app/services/bookings.service';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const result = await bookingsService.createBooking(payload);
    return NextResponse.json({ success: true, data: result });
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('API /bookings error:', err);
    return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 400 });
  }
}

