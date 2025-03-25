import requests
import os
from dotenv import load_dotenv
import redis

# 환경 변수 로드
load_dotenv("app/.env")

# API 정보
API_URL = "https://router.huggingface.co/hf-inference/models/skt/kogpt2-base-v2"
HEADERS = {"Authorization": f"Bearer {os.getenv('HUGGINGFACE_API_TOKEN')}"}

# 요청을 보낼 데이터
def generate_text(prompt: str):
    payload = {
        "inputs": prompt,
        "options": {"use_cache": False}  # 캐시를 사용하지 않도록 설정
    }

    response = requests.post(API_URL, headers=HEADERS, json=payload)

    if response.status_code == 200:
        result = response.json()
        return result[0]['generated_text']
    else:
        return f"Error: {response.status_code}, {response.text}"

# 예시 사용
prompt = "안녕하세요, 오늘 날씨는 어때요?"
res = generate_text(prompt)
print(res)
