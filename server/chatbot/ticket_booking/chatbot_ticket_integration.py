from .ticket_booking_handler import TicketBookingHandler
from .museum_data import MuseumDataManager

class ChatbotTicketIntegration:
    def __init__(self, ticket_handler):
        """Initialize the chatbot integration with a ticket booking handler."""
        self.ticket_handler = ticket_handler
        self.booking_sessions = {}  # To store ongoing booking sessions
    
    def start_booking_session(self, user_id):
        """Start a new booking session for a user."""
        self.booking_sessions[user_id] = {
            "state": "museum_selection",
            "museum_name": None,
            "visitor_name": None,
            "visitor_email": None,
            "date": None,
            "num_tickets": None,
            "ticket_type": "General"
        }
        museums = self.ticket_handler.get_museum_list()
        return {
            "status": "booking_started",
            "message": "Let's book tickets for a museum visit! Please select a museum from the list:",
            "museums": museums
        }
    
    def process_booking_step(self, user_id, user_input):
        """Process the current step in the booking flow."""
        if user_id not in self.booking_sessions:
            return {"status": "error", "message": "No active booking session. Please start a new booking."}
        
        session = self.booking_sessions[user_id]
        current_state = session["state"]
        
        # State machine for booking flow
        if current_state == "museum_selection":
            # Find museum by approximate name match
            museums = self.ticket_handler.museum_data.get_all_museums()
            selected_museum = None
            for museum in museums:
                if user_input.lower() in museum['name'].lower():
                    selected_museum = museum['name']
                    break
            
            if not selected_museum:
                return {
                    "status": "retry",
                    "message": "I couldn't find that museum. Please select one from the list:",
                    "museums": self.ticket_handler.get_museum_list()
                }
            
            session["museum_name"] = selected_museum
            session["state"] = "visitor_name"
            return {
                "status": "continue",
                "message": f"Great! You selected {selected_museum}. Please enter your full name:"
            }
        
        elif current_state == "visitor_name":
            session["visitor_name"] = user_input
            session["state"] = "visitor_email"
            return {
                "status": "continue",
                "message": "Thank you! Now please enter your email address:"
            }
        
        elif current_state == "visitor_email":
            # Simple email validation
            if "@" not in user_input or "." not in user_input:
                return {
                    "status": "retry",
                    "message": "That doesn't look like a valid email address. Please try again:"
                }
            
            session["visitor_email"] = user_input
            session["state"] = "visit_date"
            
            # Get available dates
            dates_response = self.ticket_handler.get_available_dates(session["museum_name"])
            if dates_response["status"] == "error":
                return dates_response
            
            return {
                "status": "continue",
                "message": "Great! Please select a date for your visit (YYYY-MM-DD):",
                "available_dates": dates_response["available_dates"]
            }
        
        elif current_state == "visit_date":
            # Simple date validation
            try:
                date_parts = user_input.split("-")
                if len(date_parts) != 3:
                    raise ValueError
                year, month, day = map(int, date_parts)
                if not (2023 <= year <= 2026 and 1 <= month <= 12 and 1 <= day <= 31):
                    raise ValueError
            except ValueError:
                return {
                    "status": "retry",
                    "message": "Please enter a valid date in YYYY-MM-DD format:"
                }
            
            session["date"] = user_input
            session["state"] = "num_tickets"
            return {
                "status": "continue",
                "message": "How many tickets would you like to book?"
            }
        
        elif current_state == "num_tickets":
            try:
                num_tickets = int(user_input)
                if num_tickets <= 0:
                    raise ValueError
            except ValueError:
                return {
                    "status": "retry",
                    "message": "Please enter a valid number of tickets:"
                }
            
            session["num_tickets"] = num_tickets
            session["state"] = "ticket_type"
            return {
                "status": "continue",
                "message": "Please select ticket type (General, Student, or Senior):",
                "ticket_types": ["General", "Student", "Senior"]
            }
        
        elif current_state == "ticket_type":
            ticket_type = user_input.capitalize()
            if ticket_type not in ["General", "Student", "Senior"]:
                return {
                    "status": "retry",
                    "message": "Please select a valid ticket type (General, Student, or Senior):"
                }
            
            session["ticket_type"] = ticket_type
            session["state"] = "confirmation"
            
            # Calculate price
            price_per_ticket = 10
            if ticket_type == "Student":
                price_per_ticket = 5
            elif ticket_type == "Senior":
                price_per_ticket = 7
            
            total_price = price_per_ticket * session["num_tickets"]
            
            return {
                "status": "confirmation",
                "message": f"Please confirm your booking details:\n"
                          f"Museum: {session['museum_name']}\n"
                          f"Name: {session['visitor_name']}\n"
                          f"Email: {session['visitor_email']}\n"
                          f"Date: {session['date']}\n"
                          f"Tickets: {session['num_tickets']} ({session['ticket_type']})\n"
                          f"Total Price: ${total_price}\n\n"
                          f"Type 'confirm' to complete your booking or 'cancel' to start over."
            }
        
        elif current_state == "confirmation":
            if user_input.lower() == "confirm":
                # Process the booking
                booking_result = self.ticket_handler.process_booking_request(
                    session["museum_name"],
                    session["visitor_name"],
                    session["visitor_email"],
                    session["date"],
                    session["num_tickets"],
                    session["ticket_type"]
                )
                
                # Clean up session
                del self.booking_sessions[user_id]
                
                if booking_result["status"] == "success":
                    booking_id = booking_result["booking_details"]["booking_id"]
                    return {
                        "status": "completed",
                        "message": f"Booking successful! Your booking ID is #{booking_id}. "
                                  f"A confirmation has been sent to {session['visitor_email']}. "
                                  f"Thank you for your reservation!"
                    }
                else:
                    return {
                        "status": "error",
                        "message": f"Booking failed: {booking_result['message']}"
                    }
            
            elif user_input.lower() == "cancel":
                # Cancel the booking process
                del self.booking_sessions[user_id]
                return {
                    "status": "cancelled",
                    "message": "Booking process cancelled. You can start a new booking when you're ready."
                }
            
            else:
                return {
                    "status": "retry",
                    "message": "Please type 'confirm' to complete your booking or 'cancel' to start over."
                }
        
        return {"status": "error", "message": "Unknown booking state."}
    
    def handle_ticket_command(self, user_id, command, params=None):
        """Handle ticket-related commands."""
        if command == "book":
            return self.start_booking_session(user_id)
        
        elif command == "check":
            if not params or (not params.get("booking_id") and not params.get("email")):
                return {
                    "status": "error",
                    "message": "Please provide a booking ID or email to check your booking."
                }
            
            return self.ticket_handler.get_booking_info(
                params.get("booking_id"), params.get("email")
            )
        
        elif command == "cancel":
            if not params or not params.get("booking_id"):
                return {
                    "status": "error",
                    "message": "Please provide a booking ID to cancel."
                }
            
            return self.ticket_handler.cancel_booking_request(params.get("booking_id"))
        
        elif command == "modify":
            if not params or not params.get("booking_id"):
                return {
                    "status": "error",
                    "message": "Please provide a booking ID to modify."
                }
            
            return self.ticket_handler.modify_booking_request(
                params.get("booking_id"),
                params.get("date"),
                params.get("num_tickets"),
                params.get("ticket_type")
            )
        
        elif command == "list_museums":
            museums = self.ticket_handler.get_museum_list()
            return {
                "status": "success",
                "message": "Here are the available museums:",
                "museums": museums
            }
        
        elif command == "available_dates":
            if not params or not params.get("museum_name"):
                return {
                    "status": "error",
                    "message": "Please provide a museum name to check available dates."
                }
            
            return self.ticket_handler.get_available_dates(params.get("museum_name"))
        
        return {
            "status": "error",
            "message": f"Unknown ticket command: {command}"
        }


# Example usage in your chatbot:
def setup_ticket_system(csv_file_path):
    """Set up the ticket booking system for your chatbot."""
    museum_data = MuseumDataManager(csv_file_path)
    ticket_handler = TicketBookingHandler(museum_data)
    ticket_integration = ChatbotTicketIntegration(ticket_handler)
    return ticket_integration