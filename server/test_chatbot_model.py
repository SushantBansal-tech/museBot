# test_chatbot_model.py
from chatbot.model import ChatbotModel

chatbot = ChatbotModel()

# Sample multilingual inputs
test_inputs = [
    "Hello, what's your name?",            # English
    "क्या आप मेरी मदद कर सकते हैं?"         # Hindi
]

for user_input in test_inputs:
    print(f"\n Input: {user_input}")
    response = chatbot.generate_response(user_input)
    print(f"Response: {response}")
