# backend/test_chatbot.py
import asyncio
from chatbot import Chatbot

async def test_chatbot():
    bot = Chatbot()
    
    # Test different languages
    test_messages = [
        "Hello, how are you?",  # English
        "नमस्ते, आप कैसे हैं?",   # Hindi
        # "ਸਤ ਸ੍ਰੀ ਅਕਾਲ, ਤੁਸੀ ਕਿਵੇਂ ਹੋ?",  # Punjabi
        # "नमस्कार, तुम्ही कसे आहात?",  # Marathi
        # "నమస్కారం, మీరు ఎలా ఉన్నారు?",  # Telugu
    ]
    
    for message in test_messages:
        print(f"\nInput: {message}")
        response = await bot.process_message(message)
        print(f"Language: {response['language_name']}")
        print(f"Response: {response['text']}")

if __name__ == "__main__":
    asyncio.run(test_chatbot())