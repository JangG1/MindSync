import os
from dotenv import load_dotenv
import requests
import logging
import time
from PIL import Image
import io

# 환경 변수 로드 (app 폴더 내 .env 파일 지정)
load_dotenv(dotenv_path="app/.env")

# Hugging Face API 토큰 (환경변수로 설정되어 있어야 함)
API_TOKEN = os.getenv("HUGGINGFACE_API_TOKEN")

# 사용할 모델
MODEL_NAME = "black-forest-labs/FLUX.1-dev"

# API endpoint
endpoint = f"https://api-inference.huggingface.co/models/{MODEL_NAME}"

# HTTP 요청 헤더
headers = {
    "Authorization": f"Bearer {API_TOKEN}",
    "Content-Type": "application/json"
}

def generate_image_from_huggingface(prompt: str, retries: int = 5, delay: int = 5) -> bytes:
    """
    Hugging Face API를 호출해 이미지를 생성하고, PNG 포맷의 바이트 데이터를 반환합니다.
    """
    try:
        data = {"inputs": prompt}
        
        for attempt in range(retries):
            logging.info(f"Attempt {attempt + 1} - Sending request to Hugging Face API...")
            response = requests.post(endpoint, headers=headers, json=data)
            
            logging.info(f"Attempt {attempt + 1} - Response Status Code: {response.status_code}")
            logging.info(f"Response Text: {response.text}")
            
            if response.status_code == 200:
                logging.info("Image generated successfully!")
                image_bytes = response.content
                
                # 이미지 데이터를 PIL Image로 열어서 유효성 검증
                try:
                    image = Image.open(io.BytesIO(image_bytes))
                    # 이미지 파일을 로컬에 저장 (디버깅용, 원하지 않으면 주석 처리 가능)
                    output_path = "output.png"
                    image.save(output_path)
                    logging.info(f"✅ Image saved as {output_path}")
                    
                    # 이미지 객체를 PNG 포맷의 바이트 데이터로 변환하여 반환
                    with io.BytesIO() as output:
                        image.save(output, format="PNG")
                        return output.getvalue()
                except Exception as e:
                    logging.error("Failed to process generated image.")
                    raise Exception("Image processing failed: " + str(e))
            elif response.status_code == 500:
                logging.warning(f"Server error 500 encountered. Retrying in {delay} seconds...")
                time.sleep(delay)
            elif response.status_code == 503:
                logging.warning(f"Service unavailable (503). Retrying in {delay} seconds...")
                time.sleep(delay)
            else:
                raise Exception(f"Failed to generate image after {attempt + 1} attempts: {response.status_code}, {response.text}")
        
        raise Exception(f"Failed to generate image after {retries} attempts.")
    
    except requests.exceptions.RequestException as e:
        logging.error(f"Error during image generation: {str(e)}")
        raise Exception(f"Error during image generation: {str(e)}")
        
# 테스트 실행 (직접 실행할 경우)
if __name__ == "__main__":
    test_prompt = "A scenic mountain landscape at sunrise"
    result = generate_image_from_huggingface(test_prompt)
    if result:
        logging.info("Test image generation succeeded.")
