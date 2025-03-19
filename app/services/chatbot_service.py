import requests
import os
from dotenv import load_dotenv
import redis

# 환경 변수 로드
load_dotenv("app/.env")

# Hugging Face API 정보
API_URL = "https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill"
HEADERS = {"Authorization": f"Bearer {os.getenv('HUGGINGFACE_API_TOKEN')}"}

# Redis 연결 (전역)
r = redis.Redis(host='127.0.0.1', port=6379, decode_responses=True, password="1234")

def get_chatbot_response(user: str, message: str) -> dict:
    """사용자의 메시지를 처리하고 챗봇 응답을 반환"""
    print(f"User: {user}, Message: {message}")

    payload = {"inputs": message}
    user_chat_key = f"chat_history:{user}"

    try:
        # Hugging Face API 호출
        response = requests.post(API_URL, headers=HEADERS, json=payload)
        response.raise_for_status()

        # API 응답 데이터 처리
        data = response.json()
        chatbot_response = (
            data[0]["generated_text"]
            if isinstance(data, list) and len(data) > 0 and "generated_text" in data[0]
            else "죄송합니다. 답변을 생성할 수 없습니다."
        )

        # Redis에 대화 내용 저장
        r.rpush(user_chat_key, f"User: {message}")
        r.rpush(user_chat_key, f"Chatbot: {chatbot_response}")

        # 최근 100개 대화만 유지
        r.ltrim(user_chat_key, -100, -1)

        # 사용자의 전체 대화 기록 가져오기
        chat_history = get_chat_history(user)
        print(f"[{user_chat_key}] All chat List: {str(chat_history)}")

        return {"response": chatbot_response, "chat_history": chat_history}

    except requests.exceptions.RequestException as e:
        return {"error": f"서버 오류가 발생했습니다: {e}"}
    except Exception as e:
        return {"error": f"예상치 못한 오류가 발생했습니다: {e}"}


def get_chat_history(user: str) -> list:
    """Redis에서 사용자의 전체 대화 기록 가져오기"""
    user_chat_key = f"chat_history:{user}"
    return r.lrange(user_chat_key, 0, -1)
