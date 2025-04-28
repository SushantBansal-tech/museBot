from flask import Flask, request, jsonify
from pymongo import MongoClient
from bson.objectid import ObjectId
from bson.json_util import dumps
import json
from datetime import datetime

app = Flask(__name__)

# Connect to MongoDB
def connect_db():
    client = MongoClient("mongodb+srv://sushantbansal2004:azNBhiSM5f7OL74o@cluster0.j8vxqvp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
    db = client["your_database_name"]  # Replace with your actual database name
    return db

# POST endpoint to create a new booking
@app.route('/api/bookings', methods=['POST'])
def create_booking():
    try:
        db = connect_db()
        bookings_collection = db["bookings"]
        museums_collection = db["museums"]
        
        body = request.json
        
        # Validate required fields
        if not body.get('museumId') or not body.get('visitorCount') or not body.get('visitDate'):
            return jsonify({
                "success": False,
                "message": "Missing required fields"
            }), 400
        
        # For demo purposes, we'll create a dummy user ID
        # In a real app, you'd get this from authentication
        userId = str(ObjectId())
        
        # Get museum to calculate total amount
        museum = museums_collection.find_one({"_id": ObjectId(body['museumId'])})
        
        if not museum:
            return jsonify({
                "success": False,
                "message": "Museum not found"
            }), 404
        
        # Calculate total amount
        total_amount = museum['ticketPrice'] * body['visitorCount']
        
        # Create the booking
        booking = {
            "userId": userId,
            "museumId": ObjectId(body['museumId']),
            "bookingDate": datetime.fromisoformat(body['visitDate'].replace('Z', '+00:00')),
            "visitorCount": body['visitorCount'],
            "totalAmount": total_amount,
            "status": 'confirmed',
            "chatSessionId": body.get('chatSessionId', "web-session"),
            "createdAt": datetime.now()
        }
        
        result = bookings_collection.insert_one(booking)
        
        # Add the _id to the booking object
        booking['_id'] = result.inserted_id
        
        # Convert to JSON-serializable format
        booking_serializable = json.loads(dumps(booking))
        
        return jsonify({
            "success": True,
            "message": "Booking created successfully",
            "booking": booking_serializable
        }), 201
        
    except Exception as error:
        print(f'Error creating booking: {error}')
        return jsonify({
            "success": False,
            "message": 'Failed to create booking'
        }), 500

# GET endpoint to fetch bookings
@app.route('/api/bookings', methods=['GET'])
def get_bookings():
    try:
        db = connect_db()
        bookings_collection = db["bookings"]
        
        # Get the query parameters
        userId = request.args.get('userId')
        
        query = {}
        
        if userId:
            query = {"userId": userId}
        
        # Find bookings
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
        
        return jsonify({
            "success": True,
            "bookings": bookings_serializable
        }), 200
        
    except Exception as error:
        print(f'Error fetching bookings: {error}')
        return jsonify({
            "success": False,
            "message": 'Failed to fetch bookings'
        }), 500

if __name__ == '__main__':
    app.run(debug=True)