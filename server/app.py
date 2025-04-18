# backend/app.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from chatbot import Chatbot
import uvicorn

app = FastAPI(title="MuseBot API", description="Multilingual Chatbot API")

# Initialize chatbot
chatbot = Chatbot()

class MessageRequest(BaseModel):
    message: str
    user_id: str = None

class MessageResponse(BaseModel):
    response: str
    detected_language: str
    language_name: str

@app.post("/api/chat", response_model=MessageResponse)
async def chat_endpoint(request: MessageRequest):
    """
    Process a chat message and return a response
    """
    if not request.message or request.message.strip() == "":
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    
    # Process the message
    result = await chatbot.process_message(request.message, request.user_id)
    
    if "error" in result:
        raise HTTPException(status_code=500, detail=result["error"])
    
    return {
        "response": result["text"],
        "detected_language": result["detected_language"],
        "language_name": result["language_name"]
    }

if __name__ == "__main__":
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)