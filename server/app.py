# backend/app.py
from fastapi import FastAPI, HTTPException, Depends, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from chatbot import Chatbot
import uvicorn
from typing import List, Optional
from pymongo import MongoClient
from bson.objectid import ObjectId
from bson.json_util import dumps, loads
import json
from datetime import datetime

app = FastAPI(title="MuseBot API", description="Multilingual Chatbot API")

# Add CORS middleware to allow frontend requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Initialize chatbot
chatbot = Chatbot()

# MongoDB Connection
def get_db():
    client = MongoClient("mongodb+srv://sushantbansal2004:azNBhiSM5f7OL74o@cluster0.j8vxqvp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
    db = client["your_database_name"]  # Replace with your actual database name
    return db

# Pydantic models for request/response validation
class MessageRequest(BaseModel):
    message: str
    user_id: Optional[str] = None

class MessageResponse(BaseModel):
    response: str
    detected_language: str
    language_name: str

class BookingCreate(BaseModel):
    museumId: str
    visitorCount: int
    visitDate: str
    chatSessionId: Optional[str] = None

class Museum(BaseModel):
    name: str
    description: str
    location: str
    ticketPrice: float
    types: List[str]
    timeStart: str
    timeEnd: str
    ratings: float

# Chatbot endpoint
@app.post("/api/museum/chat", response_model=MessageResponse)
async def chat_endpoint(request: MessageRequest):
    """
    Process a chat message and return a response
    """
    if not request.message or request.message.strip() == "":
        raise HTTPException(status_code=400, detail="Message cannot be empty")
        
    # Process the message
    result = await chatbot.process_message(request.message, request.user_id)
        
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
        
    return {
        "response": result["text"],
        "detected_language": result["detected_language"],
        "language_name": result["language_name"]
    }

# Museums endpoints
@app.get("/api/museum")
async def get_museums():
    """Fetch all museums"""
    try:
        db = get_db()
        museums_collection = db["museums"]
        
        museums = list(museums_collection.find({}))
        museums_serializable = json.loads(dumps(museums))
        
        return {"success": True, "museums": museums_serializable}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch museums: {str(e)}")

@app.post("/api/museum")
async def add_museums():
    """Add sample museums to the database"""
    try:
        db = get_db()
        museums_collection = db["museums"]
        
        # Sample museums data
        museums = [
            {
                "name": "National Gallery of Modern Art",
                "description": "A premier art gallery showcasing modern and contemporary Indian art with over 14,000 works from the 1850s onwards.",
                "location": "New Delhi, Delhi",
                "ticketPrice": 150,
                "types": ["Art", "Cultural"],
                "timeStart": "10:00",
                "timeEnd": "18:00",
                "ratings": 4.7
            },
            {
                "name": "Salar Jung Museum",
                "description": "One of the three National Museums of India, housing a vast collection of sculptures, paintings, carvings, and artifacts from around the world.",
                "location": "Hyderabad, Telangana",
                "ticketPrice": 120,
                "types": ["History", "Art", "Cultural"],
                "timeStart": "09:00",
                "timeEnd": "17:00",
                "ratings": 4.8
            }
        ]
        
        result = museums_collection.insert_many(museums)
        
        return {
            "success": True,
            "message": "Museums added successfully",
            "added": f"{len(result.inserted_ids)} museums added"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add museums: {str(e)}")

# Bookings endpoints
@app.post("/api/bookings")
async def create_booking(request: Request):
    """Create a new museum booking"""
    try:
        db = get_db()
        bookings_collection = db["bookings"]
        museums_collection = db["museums"]
        
        # Get the request body
        body = await request.json()
        
        # Validate required fields
        if not body.get('museumId') or not body.get('visitorCount') or not body.get('visitDate'):
            raise HTTPException(status_code=400, detail="Missing required fields")
        
        # For demo purposes, create a dummy user ID
        userId = str(ObjectId())
        
        # Get museum to calculate total amount
        museum = museums_collection.find_one({"_id": ObjectId(body['museumId'])})
        
        if not museum:
            raise HTTPException(status_code=404, detail="Museum not found")
        
        # Calculate total amount
        total_amount = museum['ticketPrice'] * body['visitorCount']
        
        # Create the booking
        new_booking = {
            "userId": userId,
            "museumId": ObjectId(body['museumId']),
            "bookingDate": datetime.fromisoformat(body['visitDate'].replace('Z', '+00:00')),
            "visitorCount": body['visitorCount'],
            "totalAmount": total_amount,
            "status": 'confirmed',
            "chatSessionId": body.get('chatSessionId', "web-session"),
            "createdAt": datetime.now()
        }
        
        result = bookings_collection.insert_one(new_booking)
        
        # Add the _id to the booking object
        new_booking['_id'] = result.inserted_id
        
        # Convert to JSON-serializable format
        booking_serializable = json.loads(dumps(new_booking))
        
        return {
            "success": True,
            "message": "Booking created successfully",
            "booking": booking_serializable
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create booking: {str(e)}")

@app.get("/api/bookings")
async def get_bookings(userId: Optional[str] = Query(None)):
    """Fetch bookings with optional filtering by userId"""
    try:
        db = get_db()
        bookings_collection = db["bookings"]
        
        query = {}
        if userId:
            query = {"userId": userId}
        
        # Find bookings and populate with museum information
        pipeline = [
            {"$match": query},
            {"$lookup": {
                "from": "museums",
                "localField": "museumId",
                "foreignField": "_id",
                "as": "museumDetails"
            }},
            {"$unwind": "$museumDetails"},
            {"$sort": {"bookingDate": -1}}
        ]
        
        bookings = list(bookings_collection.aggregate(pipeline))
        
        # Convert to JSON-serializable format
        bookings_serializable = json.loads(dumps(bookings))
        
        return {
            "success": True,
            "bookings": bookings_serializable
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch bookings: {str(e)}")

if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1", port=5000, reload=True)