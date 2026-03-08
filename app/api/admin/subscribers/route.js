import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Subscriber from '@/models/Subscriber';
import { verifyAdminAuth } from '@/lib/auth';

export async function GET(req) {
  try {
    const isAuthenticated = await verifyAdminAuth();
    if (!isAuthenticated) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    
    // Sort by newest first
    const subscribers = await Subscriber.find({}).sort({ createdAt: -1 });

    return NextResponse.json({ subscribers }, { status: 200 });
  } catch (error) {
    console.error('Fetch Subscribers Error:', error);
    return NextResponse.json(
      { message: 'Failed to fetch subscribers' },
      { status: 500 }
    );
  }
}
