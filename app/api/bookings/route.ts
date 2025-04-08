// File: app/api/bookings/route.ts
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Booking from '@/models/bookings';
import Museum from '@/models/museums';

// Connect to MongoDB
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  
  return mongoose.connect("mongodb+srv://sushantbansal2004:azNBhiSM5f7OL74o@cluster0.j8vxqvp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
};

// POST endpoint to create a new booking
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const body = await req.json();
    
    // Validate required fields
    if (!body.museumId || !body.visitorCount || !body.visitDate) {
      return NextResponse.json({
        success: false,
        message: "Missing required fields"
      }, { status: 400 });
    }
    
    // For demo purposes, we'll create a dummy user ID
    // In a real app, you'd get this from authentication
    const userId = new mongoose.Types.ObjectId();
    
    // Get museum to calculate total amount
    const museum = await Museum.findById(body.museumId);
    
    if (!museum) {
      return NextResponse.json({
        success: false,
        message: "Museum not found"
      }, { status: 404 });
    }
    
    // Calculate total amount
    const totalAmount = museum.ticketPrice * body.visitorCount;
    
    // Create the booking
    const booking = new Booking({
      userId,
      museumId: body.museumId,
      bookingDate: new Date(body.visitDate),
      visitorCount: body.visitorCount,
      totalAmount,
      status: 'confirmed',
      chatSessionId: body.chatSessionId || "web-session"
    });
    
    await booking.save();
    
    return NextResponse.json({
      success: true,
      message: "Booking created successfully",
      booking
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to create booking'
    }, { status: 500 });
  }
}

// GET endpoint to fetch bookings
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    // Get the query parameters
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');
    
    let query = {};
    
    if (userId) {
      query = { userId };
    }
    
    // Find bookings
    const bookings = await Booking.find(query)
      .populate('museumId')
      .sort({ bookingDate: -1 });
    
    return NextResponse.json({
      success: true,
      bookings
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch bookings'
    }, { status: 500 });
  }
}