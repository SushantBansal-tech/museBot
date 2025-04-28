# server/test_chatbot.py
import requests
import json
import time
import os
import sys

# Configure the API endpoint
API_URL = "http://localhost:8000/api/chat"

class MuseBotTester:
    def __init__(self):
        """Initialize the tester with a new user session"""
        self.user_id = None
        self.detected_language = "en"
        
    def send_message(self, message):
        """Send a message to the chatbot API and return the response"""
        payload = {
            "message": message,
            "user_id": self.user_id
        }
        
        try:
            print(f"\n[USER]: {message}")
            response = requests.post(API_URL, json=payload)
            
            if response.status_code == 200:
                data = response.json()
                self.user_id = data["user_id"]  # Update user_id with the one returned
                self.detected_language = data["detected_language"]
                print(f"[BOT] ({data['language_name']}): {data['response']}")
                return data
            else:
                print(f"Error: {response.status_code} - {response.text}")
                return None
        except Exception as e:
            print(f"Exception: {e}")
            return None
    
    def test_basic_conversation(self):
        """Test basic conversation capabilities"""
        print("\n=== Testing Basic Conversation ===")
        
        # Test a simple greeting
        self.send_message("Hello, how are you?")
        
        # Test a question about museums
        self.send_message("Tell me about museums in India")
        
        # Test language detection with a Hindi greeting
        self.send_message("नमस्ते, आप कैसे हैं?")
    
    def test_help_command(self):
        """Test the help command"""
        print("\n=== Testing Help Command ===")
        self.send_message("/help")
    
    def test_list_museums(self):
        """Test listing museums command"""
        print("\n=== Testing List Museums Command ===")
        self.send_message("/list_museums")
    
    def test_booking_flow(self):
        """Test the complete booking flow"""
        print("\n=== Testing Booking Flow ===")
        
        # Start booking process
        self.send_message("/book")
        
        # Select a museum (using the first one in the list)
        self.send_message("National Museum of India")
        time.sleep(1)
        
        # Enter visitor name
        self.send_message("Test User")
        time.sleep(1)
        
        # Enter email
        self.send_message("test@example.com")
        time.sleep(1)
        
        # Enter date (using a future date)
        self.send_message("2025-05-15")
        time.sleep(1)
        
        # Enter number of tickets
        self.send_message("2")
        time.sleep(1)
        
        # Select ticket type
        self.send_message("General")
        time.sleep(1)
        
        # Confirm booking
        response = self.send_message("confirm")
        
        # Extract booking ID from response if available
        if response and "response" in response:
            booking_text = response["response"]
            import re
            match = re.search(r'Booking #(\d+)', booking_text)
            if match:
                booking_id = match.group(1)
                print(f"Successfully created booking with ID: {booking_id}")
                return booking_id
        
        return None
    
    def test_check_booking(self, booking_id=None):
        """Test checking a booking"""
        print("\n=== Testing Check Booking Command ===")
        
        if booking_id:
            self.send_message(f"/check_booking {booking_id}")
        else:
            self.send_message("/check_booking")
    
    def test_cancel_booking(self, booking_id=None):
        """Test cancelling a booking"""
        print("\n=== Testing Cancel Booking Command ===")
        
        if booking_id:
            self.send_message(f"/cancel_booking {booking_id}")
        else:
            self.send_message("/cancel_booking")
    
    def run_all_tests(self):
        """Run all tests in sequence"""
        try:
            print("Starting MuseBot API tests...")
            
            # Test basic functionality
            self.test_basic_conversation()
            self.test_help_command()
            self.test_list_museums()
            
            # Test booking flow
            booking_id = self.test_booking_flow()
            
            # Test booking management
            if booking_id:
                time.sleep(1)
                self.test_check_booking(booking_id)
                time.sleep(1)
                self.test_cancel_booking(booking_id)
            
            print("\nAll tests completed!")
            
        except Exception as e:
            print(f"Test failed with error: {e}")

if __name__ == "__main__":
    # Check if the server is running
    try:
        health_check = requests.get("http://localhost:8000/")
        if health_check.status_code != 200:
            print("Error: API server is not responding correctly.")
    except:
        print("Error: API server does not seem to be running at http://localhost:8000/")
        print("Please start the server before running tests.")
        sys.exit(1)
    
    # If tests get this far, run them
    tester = MuseBotTester()
    tester.run_all_tests()