from fastapi import FastAPI, HTTPException, Request, APIRouter
from fastapi.templating import Jinja2Templates
from fastapi.responses import JSONResponse, HTMLResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
from pydantic import BaseModel
import uvicorn
import io
from app.services.hugging_Image_API import generate_image_from_huggingface
from app.services.chatbot_service import get_chatbot_response  # 서비스 로직 분리

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
    allow_origins=["*"],  # 모든 도메인에서 요청을 허용
    allow_credentials=True,
    allow_methods=["*"],  # 모든 HTTP 메소드 (GET, POST 등) 허용
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
    user: str
    message: str

@api_router.post("/chatbot")
async def chat(message: Message):
    try:
        response = get_chatbot_response(message.user, message.message)  # 서비스 로직 분리
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# '/api/' 접두어로 라우터 포함
app.include_router(api_router, prefix="/api")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
