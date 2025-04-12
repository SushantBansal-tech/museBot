# backend/chatbot/translation.py
from indicnlp.transliterate.unicode_transliterate import UnicodeIndicTransliterator
from transformers import MarianMTModel, MarianTokenizer
import os

class TranslationManager:
    def __init__(self):
        # Cache for loaded models to avoid reloading
        self.models = {}
        self.tokenizers = {}
        
        # Define model names for different language pairs
        self.model_names = {
            'en-hi': 'Helsinki-NLP/opus-mt-en-hi',
            'hi-en': 'Helsinki-NLP/opus-mt-hi-en',
            'en-pa': 'Helsinki-NLP/opus-mt-en-pa',  # For Punjabi
            'pa-en': 'Helsinki-NLP/opus-mt-pa-en',
            'en-mr': 'Helsinki-NLP/opus-mt-en-mr',  # For Marathi
            'mr-en': 'Helsinki-NLP/opus-mt-mr-en',
            'en-te': 'Helsinki-NLP/opus-mt-en-te',  # For Telugu
            'te-en': 'Helsinki-NLP/opus-mt-te-en',
        }
    
    def _load_model_and_tokenizer(self, lang_pair):
        """Load translation model and tokenizer on demand"""
        if lang_pair not in self.model_names:
            raise ValueError(f"Translation for {lang_pair} not supported")
        
        if lang_pair not in self.models:
            model_name = self.model_names[lang_pair]
            try:
                self.tokenizers[lang_pair] = MarianTokenizer.from_pretrained(model_name)
                self.models[lang_pair] = MarianMTModel.from_pretrained(model_name)
                print(f"Loaded model for {lang_pair}")
            except Exception as e:
                print(f"Error loading model for {lang_pair}: {e}")
                return None, None
                
        return self.models[lang_pair], self.tokenizers[lang_pair]
    
    def translate(self, text, source_lang, target_lang):
        """Translate text from source language to target language"""
        if source_lang == target_lang:
            return text  # No translation needed
            
        lang_pair = f"{source_lang}-{target_lang}"
        
        model, tokenizer = self._load_model_and_tokenizer(lang_pair)
        if not model or not tokenizer:
            return text  # Return original if model loading failed
        
        try:
            # Prepare the text for translation
            batch = tokenizer([text], return_tensors="pt", padding=True)
            
            # Generate translation
            translated = model.generate(**batch)
            result = tokenizer.batch_decode(translated, skip_special_tokens=True)
            
            return result[0]
        except Exception as e:
            print(f"Translation error: {e}")
            return text  # Return original text on error