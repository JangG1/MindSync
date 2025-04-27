from fastapi import FastAPI, HTTPException, Request, APIRouter
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from pydantic import BaseModel
import uvicorn
import io
import logging
from app.services.huggingFace_ImageGenerator_API import generate_image_from_huggingface
from app.services.chatbot_service import get_chatbot_response  # 서비스 로직 분리
import redis

# 환경 변수 로드 (app 폴더 내 .env 파일 지정)
load_dotenv(dotenv_path="app/.env")

# FastAPI 애플리케이션 생성
app = FastAPI()

# API 라우터 설정 (경로 접두어)
api_router = APIRouter()

# 정적 파일 제공 설정
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# 템플릿 디렉터리 설정
templates = Jinja2Templates(directory="app/templates")

# CORS 미들웨어 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 모든 출처 허용 (필요에 따라 조정)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 사용자 입력을 위한 Pydantic 모델
class Prompt(BaseModel):
    prompt: str  # 사용자로부터 전달받은 프롬프트

# 기본 페이지 렌더링
@api_router.get("/", response_class=HTMLResponse)
def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request, "message": "MindSync"})

# 이미지 생성 API 엔드포인트
@api_router.post("/generate-image")
async def generate_image(prompt: Prompt):
    logging.info(f"Received prompt: {prompt.prompt}")
    try:
        # 이미지 생성 함수 호출
        image_data = generate_image_from_huggingface(prompt.prompt)
        
        # StreamingResponse로 이미지 바이트 데이터를 반환 (media_type을 PNG로 지정)
        return StreamingResponse(io.BytesIO(image_data), media_type="image/png")
    except Exception as e:
        logging.error(f"Error in generate_image: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# 챗봇 및 채팅 관련 엔드포인트 (기존 코드 그대로)
class Message(BaseModel):
    chatNo: str
    message: str

@api_router.post("/chatbot")
async def chat(message: Message):
    try:
        response = get_chatbot_response(message.chatNo, message.message)
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ChatRequest(BaseModel):
    chatNo: str

@api_router.post("/getChat")
async def getChat(request: ChatRequest):
    chat_no = request.chatNo
    try:
        r = redis.Redis(host="127.0.0.1", port=6379, decode_responses=True, password="1234")
        r.ping()  # Redis 연결 확인

        # 최근 100개 대화만 유지
        r.ltrim(f"chat_history:{chat_no}", -100, -1)
        chat_history = r.lrange(f"chat_history:{chat_no}", 0, -1)
        return {"chat_history": chat_history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Redis 오류 발생: {str(e)}")

@api_router.post("/deleteChat")
async def delete_chat(request: ChatRequest):
    chat_no = request.chatNo
    try:
        r = redis.Redis(host="127.0.0.1", port=6379, decode_responses=True, password="1234")
        r.ping()  # Redis 연결 확인
        result = r.delete(f"chat_history:{chat_no}")
        if result:
            return {"message": f"채팅 {chat_no}가 삭제되었습니다."}
        else:
            raise HTTPException(status_code=404, detail="채팅을 찾을 수 없습니다.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Redis 오류 발생: {str(e)}")

# '/msAPI' 접두어로 라우터 포함
app.include_router(api_router, prefix="/msAPI")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
