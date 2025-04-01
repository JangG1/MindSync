import os
from dotenv import load_dotenv
import requests
import logging
import time

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

# 이미지 생성 함수
def generate_image_from_huggingface(prompt: str, retries: int = 5, delay: int = 5):
    try:
        data = {"inputs": prompt}
        
        for attempt in range(retries):
            response = requests.post(endpoint, headers=headers, json=data)

            logging.info(f"Attempt {attempt + 1} - Response Status Code: {response.status_code}")
            logging.info(f"Response Text: {response.text}")

            if response.status_code == 200:
                logging.info("Image generated successfully!")
                return response.content
            elif response.status_code == 500:  # Server-side error, may need more retries
                logging.warning(f"Server error 500 encountered. Retrying in {delay} seconds...")
                time.sleep(delay)
            elif response.status_code == 503:  # Service unavailable, maybe retry
                logging.warning(f"Service unavailable (503). Retrying in {delay} seconds...")
                time.sleep(delay)
            else:
                raise Exception(f"Failed to generate image after {attempt + 1} attempts: {response.status_code}, {response.text}")
        
        # If we exhausted all attempts
        raise Exception(f"Failed to generate image after {retries} attempts.")
    
    except requests.exceptions.RequestException as e:
        logging.error(f"Error during image generation: {str(e)}")
        raise Exception(f"Error during image generation: {str(e)}")
