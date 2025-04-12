# backend/chatbot/model.py
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch
from .language_detect import detect_language
from .translation import TranslationManager

class ChatbotModel:
    def __init__(self):
        # Initialize with a multilingual or English model
        self.model_name = "facebook/blenderbot-400M-distill"
        self.tokenizer = None
        self.model = None
        self.translator = TranslationManager()
        self.load_model()
        
    def load_model(self):
        """Load the model and tokenizer"""
        try:
            print(f"Loading model: {self.model_name}")
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            self.model = AutoModelForCausalLM.from_pretrained(self.model_name)
            print("Model loaded successfully")
        except Exception as e:
            print(f"Error loading model: {e}")
            
    def generate_response(self, user_input, conversation_history=None):
        """
        Generate a response to the user input
        - Detect input language
        - Translate to English if needed
        - Generate response
        - Translate response back to user's language
        """
        if not self.model or not self.tokenizer:
            return "Model not loaded properly. Please try again later."
            
        try:
            # Detect language
            input_lang = detect_language(user_input)
            
            # Translate to English if not already in English
            if input_lang != 'en':
                english_input = self.translator.translate(user_input, input_lang, 'en')
            else:
                english_input = user_input
            
            # Prepare input for the model
            inputs = self.tokenizer(english_input, return_tensors="pt")
            
            # Generate response
            with torch.no_grad():
                outputs = self.model.generate(
                    **inputs,
                    max_length=100,
                    num_return_sequences=1,
                    temperature=0.7,
                    top_k=50,
                    top_p=0.9,
                    do_sample=True
                )
            
            # Decode response
            english_response = self.tokenizer.decode(outputs[0], skip_special_tokens=True)
            
            # Translate back to original language if needed
            if input_lang != 'en':
                final_response = self.translator.translate(english_response, 'en', input_lang)
            else:
                final_response = english_response
                
            return final_response
            
        except Exception as e:
            print(f"Error generating response: {e}")
            return "Sorry, I encountered an error processing your request."