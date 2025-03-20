import redis

# Redis 연결
r = redis.Redis(host='127.0.0.1', port=6379, decode_responses=True, password="1234")

# key "1"의 값 출력
print("key1:", r.get("1"))

# 최근 100개 대화만 유지
r.ltrim("chat_history", -100, -1)

# Redis에서 대화 목록 가져오기
chat_history = r.lrange("chat_history:User1", 0, -1)

# 결과 출력
print("chat list:")
for chat in chat_history:
    print(chat)
