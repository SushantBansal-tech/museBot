import pandas as pd
import os
from datetime import datetime, timedelta
import json

class TicketBookingHandler:
    def __init__(self, museum_data_manager):
        """Initialize the ticket booking handler with a museum data manager."""
        self.museum_data = museum_data_manager
    
    def get_museum_list(self):
        """Get a formatted list of museums for display in the chatbot."""
        museums = self.museum_data.get_all_museums()
        museum_list = []
        for museum in museums:
            museum_list.append(f"{museum['name']} (Located in {museum['location']}, {museum['state']})")
        return museum_list
    
    def process_booking_request(self, museum_name, visitor_name, visitor_email, date, num_tickets, ticket_type="General"):
        """Process a booking request from the chatbot."""
        # Validate input
        if not museum_name or not visitor_name or not visitor_email or not date:
            return {"status": "error", "message": "Missing required information for booking."}
        
        try:
            num_tickets = int(num_tickets)
            if num_tickets <= 0:
                return {"status": "error", "message": "Number of tickets must be greater than zero."}
        except ValueError:
            return {"status": "error", "message": "Number of tickets must be a valid number."}
        
        # Check if museum exists
        museum = self.museum_data.get_museum_by_name(museum_name)
        if not museum:
            return {"status": "error", "message": f"Museum '{museum_name}' not found."}
        
        # Create booking
        booking = self.museum_data.create_booking(
            museum_name, visitor_name, visitor_email, date, num_tickets, ticket_type
        )
        
        if booking:
            return {
                "status": "success",
                "message": f"Booking confirmed for {visitor_name} at {museum_name} on {date}.",
                "booking_details": booking
            }
        else:
            return {"status": "error", "message": "Failed to create booking. Please try again."}
    
    def get_booking_info(self, booking_id=None, email=None):
        """Get booking information by ID or email."""
        if booking_id:
            booking = self.museum_data.get_booking_by_id(int(booking_id))
            if booking:
                return {"status": "success", "booking": booking}
            return {"status": "error", "message": f"No booking found with ID: {booking_id}"}
        
        if email:
            bookings = self.museum_data.get_bookings_by_email(email)
            if bookings:
                return {"status": "success", "bookings": bookings}
            return {"status": "error", "message": f"No bookings found for email: {email}"}
        
        return {"status": "error", "message": "Please provide a booking ID or email."}
    
    def cancel_booking_request(self, booking_id):
        """Process a booking cancellation request."""
        try:
            booking_id = int(booking_id)
        except ValueError:
            return {"status": "error", "message": "Invalid booking ID."}
        
        result = self.museum_data.cancel_booking(booking_id)
        if result:
            return {"status": "success", "message": f"Booking #{booking_id} has been cancelled."}
        return {"status": "error", "message": f"No booking found with ID: {booking_id}"}
    
    def modify_booking_request(self, booking_id, date=None, num_tickets=None, ticket_type=None):
        """Process a booking modification request."""
        try:
            booking_id = int(booking_id)
        except ValueError:
            return {"status": "error", "message": "Invalid booking ID."}
        
        if num_tickets:
            try:
                num_tickets = int(num_tickets)
                if num_tickets <= 0:
                    return {"status": "error", "message": "Number of tickets must be greater than zero."}
            except ValueError:
                return {"status": "error", "message": "Number of tickets must be a valid number."}
        
        updated_booking = self.museum_data.modify_booking(booking_id, date, num_tickets, ticket_type)
        if updated_booking:
            return {
                "status": "success", 
                "message": f"Booking #{booking_id} has been updated.",
                "booking_details": updated_booking
            }
        return {"status": "error", "message": f"No booking found with ID: {booking_id}"}
    
    def get_available_dates(self, museum_name):
        """Get available dates for a specific museum."""
        museum = self.museum_data.get_museum_by_name(museum_name)
        if not museum:
            return {"status": "error", "message": f"Museum '{museum_name}' not found."}
        
        dates = self.museum_data.get_available_dates(museum_name)
        return {"status": "success", "available_dates": dates}