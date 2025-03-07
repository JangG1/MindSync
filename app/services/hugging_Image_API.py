import os
from dotenv import load_dotenv
import requests

# 환경 변수 로드
load_dotenv(dotenv_path="app/.env")  # app 폴더 내 .env 파일 지정

# Hugging Face API 토큰 (환경변수로 설정되어 있어야 함)
API_TOKEN = os.getenv("HUGGINGFACE_API_TOKEN")

# Hugging Face에서 사용할 모델
MODEL_NAME = "Lykon/dreamshaper-8"

# API endpoint
endpoint = f"https://api-inference.huggingface.co/models/{MODEL_NAME}"

# HTTP 요청 헤더
headers = {
    "Authorization": f"Bearer {API_TOKEN}",
    "Content-Type": "application/json"
}

def generate_image_from_huggingface(prompt: str):
    print("여기는 서비스 : " + prompt)
    try:
        # 사용자 입력 받은 프롬프트로 이미지 생성 요청
        data = {
            "inputs": prompt  # 프롬프트를 'inputs'로 전달
        }

        response = requests.post(endpoint, headers=headers, json=data)

        # 응답 코드가 200일 때 이미지 처리
        if response.status_code == 200:
            # 이미지 데이터를 바이너리로 반환
            return response.content
        else:
            raise Exception(f"Failed to generate image: {response.status_code}, {response.text}")
    
    except Exception as e:
        raise Exception(f"Error during image generation: {str(e)}")
