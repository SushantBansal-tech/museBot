import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Museum from '@/models/museums'; // Import your Museum model

// Connect to MongoDB
const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) return;
  
  return mongoose.connect("mongodb+srv://sushantbansal2004:azNBhiSM5f7OL74o@cluster0.j8vxqvp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
};

// GET endpoint to fetch top rated museums
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    // Fetch museums from the database
    const museums = await Museum.find({});
    
    return NextResponse.json({
      success: true,
      museums
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error fetching museums:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch museums'
    }, { status: 500 });
  }
}

// POST endpoint to add a new museum
// POST endpoint to add a new museum
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    // Remove this line since you're not using the body
    // const body = await req.json();
    
    // Add two museums manually for demonstration
    const museums = [
      {
        name: "National Gallery of Modern Art",
        description: "A premier art gallery showcasing modern and contemporary Indian art with over 14,000 works from the 1850s onwards.",
        location: "New Delhi, Delhi",
        ticketPrice: 150,
        types: ["Art", "Cultural"],
        timeStart: "10:00",
        timeEnd: "18:00",
        ratings: 4.7
      },
      {
        name: "Salar Jung Museum",
        description: "One of the three National Museums of India, housing a vast collection of sculptures, paintings, carvings, and artifacts from around the world.",
        location: "Hyderabad, Telangana",
        ticketPrice: 120,
        types: ["History", "Art", "Cultural"],
        timeStart: "09:00",
        timeEnd: "17:00",
        ratings: 4.8
      }
    ];
    
    // Insert museums into the database
    const result = await Museum.insertMany(museums);
    
    return NextResponse.json({
      success: true,
      message: "Museums added successfully",
      added: result
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error adding museums:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to add museums'
    }, { status: 500 });
  }
}