# backend/chatbot/__init__.py
from .model import ChatbotModel
from .language_detect import detect_language, LANGUAGE_CODES

class Chatbot:
    def __init__(self):
        self.model = ChatbotModel()
        
    async def process_message(self, message, user_id=None):
        """
        Process a user message and return a response
        - Manages conversation state if user_id is provided
        - Returns response in the same language as input
        """
        try:
            # Detect language of input
            language = detect_language(message)
            
            # Get response from model
            response = self.model.generate_response(message)
            
            # Return response with metadata
            return {
                "text": response,
                "detected_language": language,
                "language_name": LANGUAGE_CODES.get(language, "unknown")
            }
        except Exception as e:
            print(f"Error processing message: {e}")
            return {
                "text": "Sorry, I couldn't process your message.",
                "error": str(e)
            }