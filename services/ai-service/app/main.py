from fastapi import FastAPI
from pydantic import BaseModel
import datetime
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

@app.post("/api/v1/ai/chat")
def chat_with_ai(request: ChatRequest):
    # 1. Türkçe karakterleri güvenli küçültme (İ -> i, I -> ı)
    msg = request.message.replace('İ', 'i').replace('I', 'ı').lower()
    
    cities = ["kütahya", "istanbul", "ankara", "izmir", "bursa", "antalya"]
    
    # 2. Şehir yakalama zekası
    found_cities = []
    for word in msg.split():
        for city in cities:
            if city in word and city not in found_cities:
                found_cities.append(city)

    target_date = datetime.date.today()
    if "yarın" in msg:
        target_date = target_date + datetime.timedelta(days=1)
        
    if len(found_cities) >= 2:
        # 3. Şehir İsimlerini Veritabanı Formatına Çevirme (Mapping)
        # Sadece capitalize() yetmez, Türkçe karakterli şehirleri elle düzeltelim
        city_map = {
            "istanbul": "İstanbul",
            "izmir": "İzmir",
            "ankara": "Ankara",
            "antalya": "Antalya",
            "bursa": "Bursa",
            "kütahya": "Kütahya"
        }
        
        origin = city_map.get(found_cities[0], found_cities[0].capitalize())
        destination = city_map.get(found_cities[1], found_cities[1].capitalize())
        
        return {
            "reply": f"Harika! Sizin için hemen {origin} - {destination} seferlerini buluyorum... 🚌✨",
            "action": {
                "type": "SEARCH_TRIPS",
                "params": {
                    "origin": origin,
                    "destination": destination,
                    "date": target_date.strftime("%Y-%m-%d")
                }
            }
        }
    else:
        return {
            "reply": "Nereden nereye gitmek istediğinizi tam anlayamadım. Bana 'Yarın Kütahya'dan İstanbul'a bilet bul' demeyi dener misiniz? 🤖",
            "action": None
        }

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "ai-service"}