import os
from dotenv import load_dotenv
import redis
import cohere

# 환경 변수 로드
load_dotenv()  # 기본적으로 .env 파일에서 로드

# Cohere 클라이언트 초기화
COHERE_API_KEY = os.getenv("COHERE_API_KEY")
co = cohere.Client(api_key=COHERE_API_KEY)  # 최신 버전에서 Client 사용

# Redis 연결
r = redis.Redis(host='127.0.0.1', port=6379, decode_responses=True, password="1234")

def get_chatbot_response(chatNo: str, message: str) -> dict:
    """사용자의 한글 메시지를 처리하고 Cohere를 통해 챗봇 응답을 반환"""
    user_chat_key = f"chat_history:{chatNo}"

    try:
        # Redis에서 이전 대화 불러오기
        chat_history = r.lrange(user_chat_key, 0, -1)
        # 메시지 리스트 구성 (최신 5개 대화 유지)
        messages = []
        for chat in chat_history[-5:]:
            role, content = chat.split(": ", 1)
            # Cohere Chat API는 role 없이 prompt 형식으로 처리하므로 단순히 대화를 이어붙임
            messages.append(f"{role}: {content}")
        # 마지막에 사용자 입력 추가
        messages.append(f"user: {message}")
        prompt = "\n".join(messages)

        # Cohere Chat 호출 (message 파라미터 사용)
        response = co.chat(
            model="command-a-03-2025",  # 최신 모델(2025/04/27 기준)
            message=prompt,
            temperature=0.7,
            max_tokens=2000
        )
        
        # 'choices'에서 첫 번째 응답을 받아오는 방식으로 수정
        answer = response.text.strip()

        # Redis에 대화 저장
        r.rpush(user_chat_key, f"User: {message}")
        r.rpush(user_chat_key, f"Chatbot: {answer}")
        # 최근 100개 대화만 유지
        r.ltrim(user_chat_key, -100, -1)

        # 전체 대화 기록 반환
        return {"response": answer, "chat_history": r.lrange(user_chat_key, 0, -1)}

    except Exception as e:  # 일반적인 예외 처리로 변경
        return {"error": f"예상치 못한 오류가 발생했습니다: {e}"}

def get_chat_history(chatNo: str) -> list:
    """Redis에서 사용자의 전체 대화 기록 가져오기"""
    user_chat_key = f"chat_history:{chatNo}"
    return r.lrange(user_chat_key, 0, -1)
