# server/chatbot/__init__.py
from .model import ChatbotModel
from .language_detect import detect_language
from .translation import TranslationManager
from ticket_booking import setup_ticket_system
import asyncio
import os

class Chatbot:
    def __init__(self):
        """Initialize the chatbot with all required components"""
        self.model = ChatbotModel()
        self.translator = TranslationManager()
        
        # Setup ticket booking system - update path as needed
        csv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "indian_museums.csv")
        self.ticket_system = setup_ticket_system(csv_path)
        
        # Store user conversation state
        self.user_sessions = {}
    
    async def process_message(self, message, user_id=None):
        """
        Process incoming message and generate a response
        Now handles ticket booking commands and flows
        """
        try:
            # Detect language
            detected_lang = detect_language(message)
            language_name = self._get_language_name(detected_lang)
            
            # Check if user is in a ticket booking session
            if user_id and user_id in self.ticket_system.booking_sessions:
                # User is in the middle of booking tickets
                response = self.ticket_system.process_booking_step(user_id, message)
                response_text = self._format_ticket_response(response)
                
                # Translate response if needed
                if detected_lang != 'en':
                    response_text = self.translator.translate(response_text, 'en', detected_lang)
                
                return {
                    "text": response_text,
                    "detected_language": detected_lang,
                    "language_name": language_name
                }
            
            # Check if this is a ticket booking command
            is_command, response = self._check_ticket_commands(message, user_id, detected_lang)
            if is_command:
                return {
                    "text": response,
                    "detected_language": detected_lang,
                    "language_name": language_name
                }
            
            # If not a ticket command, process as normal message
            response = self.model.generate_response(message)
            
            return {
                "text": response,
                "detected_language": detected_lang,
                "language_name": language_name
            }
            
        except Exception as e:
            print(f"Error processing message: {e}")
            return {"error": str(e)}
    
    def _check_ticket_commands(self, message, user_id, detected_lang):
        """Check if message is a ticket-related command and process it"""
        # Translate to English for command processing if needed
        command_text = message
        if detected_lang != 'en':
            command_text = self.translator.translate(message, detected_lang, 'en')
        
        command_text = command_text.lower().strip()
        
        # Handle different ticket commands
        if command_text.startswith("/book"):
            response = self.ticket_system.handle_ticket_command(user_id, "book")
            response_text = self._format_ticket_response(response)
            
            # Translate back to original language if needed
            if detected_lang != 'en':
                response_text = self.translator.translate(response_text, 'en', detected_lang)
            
            return True, response_text
        
        elif command_text.startswith("/check_booking"):
            parts = command_text.split(maxsplit=1)
            booking_id = parts[1] if len(parts) > 1 else None
            response = self.ticket_system.handle_ticket_command(user_id, "check", {"booking_id": booking_id})
            response_text = self._format_ticket_response(response)
            
            # Translate back to original language if needed
            if detected_lang != 'en':
                response_text = self.translator.translate(response_text, 'en', detected_lang)
            
            return True, response_text
        
        elif command_text.startswith("/cancel_booking"):
            parts = command_text.split(maxsplit=1)
            booking_id = parts[1] if len(parts) > 1 else None
            response = self.ticket_system.handle_ticket_command(user_id, "cancel", {"booking_id": booking_id})
            response_text = self._format_ticket_response(response)
            
            # Translate back to original language if needed
            if detected_lang != 'en':
                response_text = self.translator.translate(response_text, 'en', detected_lang)
            
            return True, response_text
        
        elif command_text.startswith("/list_museums"):
            response = self.ticket_system.handle_ticket_command(user_id, "list_museums")
            response_text = self._format_ticket_response(response)
            
            # Translate back to original language if needed
            if detected_lang != 'en':
                response_text = self.translator.translate(response_text, 'en', detected_lang)
            
            return True, response_text

        elif command_text.startswith("/help"):
            help_text = self._get_help_message()
            
            # Translate back to original language if needed
            if detected_lang != 'en':
                help_text = self.translator.translate(help_text, 'en', detected_lang)
            
            return True, help_text
        
        # Not a ticket command
        return False, None
    
    def _format_ticket_response(self, response):
        """Format the ticket system response for the chatbot"""
        message = response.get("message", "")
        
        if response["status"] == "booking_started" and "museums" in response:
            museums_text = "\n".join([f"- {museum}" for museum in response["museums"]])
            return f"{message}\n{museums_text}"
        
        elif response["status"] == "continue" and "available_dates" in response:
            dates_text = "\n".join([f"- {date}" for date in response["available_dates"][:10]])
            return f"{message}\n{dates_text}"
        
        elif response["status"] == "confirmation":
            return message
        
        elif response["status"] == "success" and "museums" in response:
            museums_text = "\n".join([f"- {museum}" for museum in response["museums"]])
            return f"{message}\n{museums_text}"
        
        elif response["status"] == "success" and "bookings" in response:
            bookings = response["bookings"]
            if len(bookings) == 1:
                booking = bookings[0]
                return (f"Booking #{booking['booking_id']} details:\n"
                       f"Museum: {booking['museum_name']}\n"
                       f"Date: {booking['date']}\n"
                       f"Tickets: {booking['num_tickets']} ({booking['ticket_type']})\n"
                       f"Status: {booking['status']}")
            else:
                booking_list = "\n".join([f"- Booking #{b['booking_id']}: {b['museum_name']} on {b['date']}" 
                                         for b in bookings])
                return f"Your bookings:\n{booking_list}"
        
        return message
    
    def _get_help_message(self):
        """Return help message including ticket booking commands"""
        return """
                Welcome to MuseBot! I can help you with:

                - General information about museums
                - Booking tickets for museum visits

                Ticket booking commands:
                /book - Start the ticket booking process
                /check_booking [booking_id] - Check status of a booking
                /cancel_booking [booking_id] - Cancel a booking
                /list_museums - Show available museums
                /help - Show this help message

                You can ask me questions in English, Hindi, Punjabi, Marathi, or Telugu!
            """
    
    def _get_language_name(self, lang_code):
        """Get full language name from language code"""
        from .language_detect import LANGUAGE_CODES
        return LANGUAGE_CODES.get(lang_code, "unknown")