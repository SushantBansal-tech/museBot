import pandas as pd 
import os 
import json
from datetime import datetime, timedelta
from typing import List, Dict, Any
from pathlib import Path


class MuseumDataManager:
    def __init__(self, csv_file_path):
        """Initialize the museum data manager with the path to the CSV file."""
        self.csv_file_path = csv_file_path
        self.museums_df = pd.read_csv(csv_file_path)
        self.tickets_file = "tickets_database.json"
        self.load_tickets_data()
        
    def load_tickets_data(self):
        """Load existing ticket data or create a new tickets database."""
        if os.path.exists(self.tickets_file):
            with open(self.tickets_file, 'r') as f:
                self.tickets_data = json.load(f)
        else:
            self.tickets_data = {
                "bookings": [],
                "next_booking_id": 1
            }
            self.save_tickets_data()
    
    def save_tickets_data(self):
        """Save ticket data to the JSON file."""
        with open(self.tickets_file, 'w') as f:
            json.dump(self.tickets_data, f, indent=2)
    
    def get_all_museums(self):
        """Return a list of all museums."""
        museums = self.museums_df.to_dict('records')
        return museums
    
    def get_museum_by_name(self, name):
        """Find a museum by name."""
        museum = self.museums_df[self.museums_df['name'].str.lower() == name.lower()]
        if len(museum) > 0:
            return museum.iloc[0].to_dict()
        return None
    
    def create_booking(self, museum_name, visitor_name, visitor_email, date, num_tickets, ticket_type="General"):
        """
        Create a new booking for a museum.
        
        Args:
            museum_name: Name of the museum
            visitor_name: Name of the visitor
            visitor_email: Email of the visitor
            date: Visit date (YYYY-MM-DD)
            num_tickets: Number of tickets
            ticket_type: Type of ticket (General, Student, Senior, etc.)
            
        Returns:
            Booking information if successful, None otherwise
        """
        museum = self.get_museum_by_name(museum_name)
        if not museum:
            return None
        
        # Generate booking ID
        booking_id = self.tickets_data["next_booking_id"]
        self.tickets_data["next_booking_id"] += 1
        
        # Calculate price (simplified example)
        price_per_ticket = 10  # Default price
        if ticket_type == "Student":
            price_per_ticket = 5
        elif ticket_type == "Senior":
            price_per_ticket = 7
        
        total_price = price_per_ticket * num_tickets
        
        # Create booking record
        booking = {
            "booking_id": booking_id,
            "museum_name": museum_name,
            "museum_location": museum["location"],
            "museum_state": museum["state"],
            "visitor_name": visitor_name,
            "visitor_email": visitor_email,
            "date": date,
            "num_tickets": num_tickets,
            "ticket_type": ticket_type,
            "total_price": total_price,
            "booking_date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "status": "confirmed"
        }
        
        # Add to database
        self.tickets_data["bookings"].append(booking)
        self.save_tickets_data()
        
        return booking
    
    def get_booking_by_id(self, booking_id):
        """Retrieve a booking by ID."""
        for booking in self.tickets_data["bookings"]:
            if booking["booking_id"] == booking_id:
                return booking
        return None
    
    def get_bookings_by_email(self, email):
        """Retrieve all bookings for a specific email."""
        return [b for b in self.tickets_data["bookings"] if b["visitor_email"].lower() == email.lower()]
    
    def cancel_booking(self, booking_id):
        """Cancel a booking by ID."""
        for booking in self.tickets_data["bookings"]:
            if booking["booking_id"] == booking_id:
                booking["status"] = "cancelled"
                self.save_tickets_data()
                return True
        return False

    def modify_booking(self, booking_id, date=None, num_tickets=None, ticket_type=None):
        """Modify an existing booking."""
        for booking in self.tickets_data["bookings"]:
            if booking["booking_id"] == booking_id:
                if date:
                    booking["date"] = date
                if num_tickets:
                    booking["num_tickets"] = num_tickets
                    # Recalculate price
                    price_per_ticket = 10
                    if booking["ticket_type"] == "Student":
                        price_per_ticket = 5
                    elif booking["ticket_type"] == "Senior":
                        price_per_ticket = 7
                    booking["total_price"] = price_per_ticket * num_tickets
                if ticket_type:
                    booking["ticket_type"] = ticket_type
                    # Recalculate price
                    price_per_ticket = 10
                    if ticket_type == "Student":
                        price_per_ticket = 5
                    elif ticket_type == "Senior":
                        price_per_ticket = 7
                    booking["total_price"] = price_per_ticket * booking["num_tickets"]
                
                self.save_tickets_data()
                return booking
        return None

    def get_available_dates(self, museum_name, days_ahead=30):
        """Get available dates for booking (simplified example)."""
        today = datetime.now().date()
        available_dates = []
        
        for i in range(1, days_ahead + 1):
            date = today + timedelta(days=i)
            # Skip Mondays (assuming museums are closed on Mondays)
            if date.weekday() != 0:  
                available_dates.append(date.strftime("%Y-%m-%d"))
        
        return available_dates