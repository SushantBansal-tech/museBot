# test_language_detect.py
from chatbot.language_detect import detect_language

test_sentences = {
    "en": "Hello, how are you?",
    "hi": "आप कैसे हैं?",
    "pa": "ਤੁਸੀਂ ਕਿਵੇਂ ਹੋ?",
    "mr": "तुमचे नाव काय आहे?",
    "te": "మీరు ఎలా ఉన్నారు?",
}

for lang, sentence in test_sentences.items():
    detected = detect_language(sentence)
    print(f"Input: {sentence}\nExpected: {lang}, Detected: {detected}\n")
