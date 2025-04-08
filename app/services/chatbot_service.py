import requests
import os
from dotenv import load_dotenv
import redis

# 환경 변수 로드
load_dotenv("app/.env")

# API 정보
TRANSLATION_API_URL = "https://api.mymemory.translated.net/get"  # 번역 API
#CHATBOT_API_URL = "https://api-inference.huggingface.co/models/facebook/blenderbot-3B"
CHATBOT_API_URL = "https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill"
HEADERS = {"Authorization": f"Bearer {os.getenv('HUGGINGFACE_API_TOKEN')}"}

# Redis 연결
r = redis.Redis(host='127.0.0.1', port=6379, decode_responses=True, password="1234")


def translate(text: str, src: str, dest: str) -> str:
    """텍스트를 번역 (예: 한글 → 영어, 영어 → 한글)"""
    params = {"q": text, "langpair": f"{src}|{dest}"}
    try:
        response = requests.get(TRANSLATION_API_URL, params=params)
        response.raise_for_status()
        data = response.json()
        return data["responseData"]["translatedText"]
    except requests.exceptions.RequestException:
        return text  # 번역 실패 시 원본 반환


def get_chatbot_response(chatNo: str, message: str) -> dict:
    """사용자의 한글 메시지를 처리하고 챗봇 응답을 한글로 반환"""

    user_chat_key = f"chat_history:{chatNo}"

    try:
        # 1. 한글 → 영어 번역
        translated_message = translate(message, "ko", "en")

        # 2. 챗봇 API 요청 (영어)
        payload = {"inputs": translated_message}
        response = requests.post(CHATBOT_API_URL, headers=HEADERS, json=payload)
        response.raise_for_status()
        data = response.json()

        chatbot_response_en = (
            data[0]["generated_text"]
            if isinstance(data, list) and len(data) > 0 and "generated_text" in data[0]
            else "Sorry, I can't generate a response."
        )
        
        # 3. 챗봇 응답을 한글로 번역
        chatbot_response_ko = translate(chatbot_response_en, "en", "ko")

        # 4. Redis에 저장
        r.rpush(user_chat_key, f"User: {message}")
        r.rpush(user_chat_key, f"Chatbot: {chatbot_response_ko}")

        # 최근 100개 대화만 유지
        r.ltrim(user_chat_key, -100, -1)

        # 5. 대화 기록 반환
        chat_history = get_chat_history(chatNo)

        return {"response": chatbot_response_ko, "chat_history": chat_history}

    except requests.exceptions.RequestException as e:
        return {"error": f"서버 오류가 발생했습니다: {e}"}
    except Exception as e:
        return {"error": f"예상치 못한 오류가 발생했습니다: {e}"}


def get_chat_history(chatNo: str) -> list:
    """Redis에서 사용자의 전체 대화 기록 가져오기"""
    user_chat_key = f"chat_history:{chatNo}"
    return r.lrange(user_chat_key, 0, -1)