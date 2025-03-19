import requests
import os
from dotenv import load_dotenv

# 환경 변수 로드
load_dotenv("app/.env")

# Hugging Face API 정보
API_URL = "https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill"
HEADERS = {"Authorization": f"Bearer {os.getenv('HUGGINGFACE_API_TOKEN')}"}

def get_chatbot_response(user_input: str) -> str:
    print(f"User Input: {user_input}")
    payload = {"inputs": user_input}
    
    try:
        response = requests.post(API_URL, headers=HEADERS, json=payload)
        response.raise_for_status()  # HTTP 오류 발생 시 예외 발생

        data = response.json()
        if isinstance(data, list) and len(data) > 0 and "generated_text" in data[0]:
            return data[0]["generated_text"]
        else:
            return "죄송합니다. 답변을 생성할 수 없습니다."
    except requests.exceptions.RequestException as e:
        return f"서버 오류가 발생했습니다: {e}"