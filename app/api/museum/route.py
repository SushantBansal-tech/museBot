from flask import Flask, request, jsonify
from pymongo import MongoClient
from bson.json_util import dumps
import json

app = Flask(__name__)

# Connect to MongoDB
def connect_db():
    client = MongoClient("mongodb+srv://sushantbansal2004:azNBhiSM5f7OL74o@cluster0.j8vxqvp.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
    db = client["your_database_name"]  # Replace with your actual database name
    return db

# GET endpoint to fetch top rated museums
@app.route('/api/museums', methods=['GET'])
def get_museums():
    try:
        db = connect_db()
        museums_collection = db["museums"]
        
        # Fetch museums from the database
        museums = list(museums_collection.find({}))
        
        # Convert ObjectId to string for JSON serialization
        museums_serializable = json.loads(dumps(museums))
        
        return jsonify({
            "success": True,
            "museums": museums_serializable
        }), 200
        
    except Exception as error:
        print(f'Error fetching museums: {error}')
        return jsonify({
            "success": False,
            "message": "Failed to fetch museums"
        }), 500

# POST endpoint to add new museums
@app.route('/api/museums', methods=['POST'])
def add_museums():
    try:
        db = connect_db()
        museums_collection = db["museums"]
        
        # Add two museums manually for demonstration
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
        
        # Insert museums into the database
        result = museums_collection.insert_many(museums)
        
        return jsonify({
            "success": True,
            "message": "Museums added successfully",
            "added": f"{len(result.inserted_ids)} museums added"
        }), 201
        
    except Exception as error:
        print(f'Error adding museums: {error}')
        return jsonify({
            "success": False,
            "message": "Failed to add museums"
        }), 500

if __name__ == '__main__':
    app.run(debug=True)