import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Subscriber from '@/models/Subscriber';

export async function POST(req) {
  try {
    await dbConnect();
    
    // Check if body is empty
    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json(
        { message: 'Invalid request body' },
        { status: 400 }
      );
    }

    const { email } = body;

    // Validate email presence
    if (!email) {
      return NextResponse.json(
        { message: 'Email address is required' },
        { status: 400 }
      );
    }

    // Basic email regex validation
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Check if already subscribed
    const existingSubscriber = await Subscriber.findOne({ email: email.toLowerCase() });
    
    if (existingSubscriber) {
      if (existingSubscriber.status === 'unsubscribed') {
        // Re-subscribe them
        existingSubscriber.status = 'subscribed';
        await existingSubscriber.save();
        return NextResponse.json(
          { message: 'Welcome back! You have been successfully resubscribed.', subscriber: existingSubscriber },
          { status: 200 }
        );
      }
      
      // Tell them they're already on the list (don't fail the request though to be polite)
      return NextResponse.json(
        { message: 'You are already subscribed to our newsletter!' },
        { status: 200 } // Send 200 instead of 409 so UI doesn't treat as critical error
      );
    }

    // Create new subscriber
    const newSubscriber = await Subscriber.create({ email });

    return NextResponse.json(
      { message: 'Thank you for subscribing to our newsletter!', subscriber: newSubscriber },
      { status: 201 }
    );

  } catch (error) {
    console.error('Newsletter API Error:', error);
    return NextResponse.json(
      { message: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}
