from fastapi import FastAPI, HTTPException, Request, APIRouter
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from pydantic import BaseModel
import uvicorn
import io
from app.services.huggingFace_ImageGenerator_API import generate_image_from_huggingface
from app.services.chatbot_service import get_chatbot_response  # 서비스 로직 분리
import redis

# 환경 변수 로드
load_dotenv(dotenv_path="app/.env")  # app 폴더 내 .env 파일 지정

# FastAPI 애플리케이션 생성
app = FastAPI()

# API 라우터 설정 (경로 접두어 설정)
api_router = APIRouter()

# 정적 파일 제공 설정
app.mount("/static", StaticFiles(directory="app/static"), name="static")

# 템플릿 디렉터리 설정
templates = Jinja2Templates(directory="app/templates")

# CORS 미들웨어 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # React 클라이언트만 허용
    allow_credentials=True,
    allow_methods=["*"], # 불필요한 DELETE, PUT 제한
    allow_headers=["*"],  # 모든 헤더 허용
)

# 사용자 입력을 위한 Pydantic 모델 정의
class Prompt(BaseModel):
    prompt: str  # 사용자가 입력한 프롬프트

# 기본 페이지 렌더링
@api_router.get("/", response_class=HTMLResponse)
def read_root(request: Request):
    return templates.TemplateResponse("index.html", {"request": request, "message": "MindSync"})

# 이미지 생성 API
@api_router.post("/generate-image")
async def generate_image(prompt: Prompt):
    print(prompt)
    try:
        # hugging.py에서 이미지 생성 함수 호출, 사용자 입력(prompt) 사용
        image_data = generate_image_from_huggingface(prompt.prompt)
        
        # 이미지 데이터를 StreamingResponse로 리턴
        return StreamingResponse(io.BytesIO(image_data), media_type="image/png")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 대화 내용 저장을 위한 모델
class Message(BaseModel):
    chatNo: str
    message: str

@api_router.post("/chatbot")
async def chat(message: Message):
    try:
        response = get_chatbot_response(message.chatNo, message.message)  # 서비스 로직 분리
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

        # 최근 100개 대화만 유지 (현재 위치 문제)
        r.ltrim(f"chat_history:{chat_no}", -100, -1)

        chat_history = r.lrange(f"chat_history:{chat_no}", 0, -1)

        return {"chat_history": chat_history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Redis 오류 발생: {str(e)}")

    
@api_router.post("/deleteChat")
async def delete_chat(request: ChatRequest):
    chat_no = request.chatNo
    print(chat_no)
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


# '/api/' 접두어로 라우터 포함
app.include_router(api_router, prefix="/msAPI")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)