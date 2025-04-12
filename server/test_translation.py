# test_translation.py
from chatbot.translation import TranslationManager

translator = TranslationManager()

# Test cases: (source_lang, target_lang, input_text)
test_cases = [
    ('en', 'hi', "Hello, how are you?"),
    ('hi', 'en', "आप कैसे हैं?"),
    ('en', 'pa', "I am going to the market."),
    ('pa', 'en', "ਮੈਂ ਬਾਜ਼ਾਰ ਜਾ ਰਿਹਾ ਹਾਂ।"),
    ('en', 'mr', "What is your name?"),
    ('mr', 'en', "तुमचं नाव काय आहे?"),
    ('en', 'te', "It is raining outside."),
    ('te', 'en', "బయట వర్షం పడుతోంది.")
]

for src, tgt, text in test_cases:
    print(f"🔁 Translating ({src} → {tgt})")
    translated = translator.translate(text, src, tgt)
    print(f"Input: {text}\nTranslated: {translated}\n")
