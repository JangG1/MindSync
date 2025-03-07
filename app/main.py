# main.py
from fastapi import FastAPI, HTTPException, Request
from fastapi.templating import Jinja2Templates
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
import io
from app.services.hugging_Image_API import generate_image_from_huggingface
from pydantic import BaseModel
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
import uvicorn
from vosk import Model, KaldiRecognizer
import wave
import json

# 환경 변수 로드
load_dotenv(dotenv_path="app/.env")  # app 폴더 내 .env 파일 지정

# FastAPI 애플리케이션 생성
app = FastAPI()

# 정적 파일 제공 설정
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# 템플릿 디렉터리 설정
templates = Jinja2Templates(directory="app/templates")

# CORS 미들웨어 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 모든 도메인에서 요청을 허용
    allow_credentials=True,
    allow_methods=["*"],  # 모든 HTTP 메소드 (GET, POST 등) 허용
    allow_headers=["*"],  # 모든 헤더 허용
)

# 사용자 입력을 위한 Pydantic 모델 정의
class Prompt(BaseModel):
    prompt: str  # 사용자가 입력한 프롬프트

# 기본 페이지 렌더링
@app.get("/", response_class=HTMLResponse)
def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request, "message": "MindSync"})


@app.post("/generate-image")
async def generate_image(prompt: Prompt):
    print(prompt)
    try:
        # hugging.py에서 이미지 생성 함수 호출, 사용자 입력(prompt) 사용
        image_data = generate_image_from_huggingface(prompt.prompt)
        
        # 이미지 데이터를 StreamingResponse로 리턴
        return StreamingResponse(io.BytesIO(image_data), media_type="image/png")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
# Vork STT Model 경로(한국어 모델)
model_path = os.path.abspath("app/model/vosk-model-small-ko-0.22")
model = Model(model_path)


@app.post("/stt")
async def stt(audio: UploadFile = File(...)):
    try:
        # 클라이언트에서 전달한 오디오 파일을 받음
        audio_data = await audio.read()

        # 파일을 Wave로 변환하여 Vosk에 전달
        with wave.open(audio_data, "rb") as wf:
            recognizer = KaldiRecognizer(model, wf.getframerate())
            results = []
            while True:
                data = wf.readframes(4000)
                if len(data) == 0:
                    break
                if recognizer.AcceptWaveform(data):
                    results.append(recognizer.Result())

            # 변환된 텍스트 반환
            final_result = recognizer.FinalResult()
            response_data = json.loads(final_result)
            return JSONResponse(content={"transcript": response_data["text"]})
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=400)


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)