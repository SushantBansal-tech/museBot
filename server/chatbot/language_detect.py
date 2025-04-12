# server/chatbot/language_detect.py
import langdetect
from langdetect import DetectorFactory
import re

# For reproducibility
DetectorFactory.seed = 0

# ISO language codes for our supported languages
LANGUAGE_CODES = {
    'en': 'english',
    'hi': 'hindi',
    'pa': 'punjabi',
    'mr': 'marathi',
    'te': 'telugu'
}

def clean_text(text):
    """Remove special characters and extra spaces"""
    return re.sub(r'[^\w\s]', '', text).strip()

def detect_language(text):
    """
    Detect the language of the input text
    Returns ISO language code
    """
    try:
        cleaned_text = clean_text(text)
        if not cleaned_text:
            return 'en'  # Default to English if text is empty after cleaning
        
        # Use langdetect to identify the language
        lang_code = langdetect.detect(cleaned_text)
        
        # If detected language is in our supported list, return it
        if lang_code in LANGUAGE_CODES:
            return lang_code
        else:
            # Fall back to English for unsupported languages
            return 'en'
    except Exception as e:
        print(f"Language detection error: {e}")
        return 'en'  # Default to English on error