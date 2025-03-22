import React, { useState, useEffect, useRef, act } from "react";
import axios from "axios";
import "./Chatbot.css";
import { useChatStore } from "../store/Store";

const Chatbot: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [prompt, setPrompt] = useState<string>("");
  const [error, setError] = useState<string>("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Zustand에서 상태 가져오기
  const {
    chatRooms,
    activeChat,
    waitingForNewChat,
    startNewChat,
    removeChatRoom,
    setActiveChat,
    createNewChatRoom,
  } = useChatStore();

  const [chatHistory, setChatHistory] = useState<{ [key: string]: string[] }>({
    Chat1: [],
  });

  useEffect(() => {
    //startNewChat();
    console.log("chatRooms : " + chatRooms);
    console.log("activeChat : " + activeChat);
    console.log("waitingForNewChat : " + waitingForNewChat);
    // chatHistory가 변경될 때마다 스크롤을 맨 아래로 이동
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
  };

  const getChat = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/getChat", {
        chatNo: "Chat" + activeChat,
      });

      console.log(`채팅 내용 (${activeChat}) 조회:`, res.data.chat_history);

      setChatHistory((prev) => ({
        ...prev,
        [activeChat]: res.data.chat_history || [],
      }));
    } catch (error) {
      console.error("Error fetching chatbot response:", error);
      setError("챗봇 응답을 가져오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`http://127.0.0.1:8000/api/chatbot`, {
        chatNo: "Chat" + activeChat,
        message: prompt,
      });

      // 새로운 채팅방을 생성할 조건 (최신 채팅방 + 1)
      const newChatId = chatRooms.length + 1;
      console.log("newChatId : " + newChatId);

      // 새 채팅방을 열 때만 생성하도록 변경
      if (activeChat + 1 == newChatId) {
        createNewChatRoom(newChatId); // 새로운 채팅방 생성
        setChatHistory((prev) => ({ ...prev, [newChatId]: [] }));
        setActiveChat(newChatId); // 숫자 타입으로 활성화
      }

      setActiveChat(activeChat);
      setChatHistory((prev) => ({
        ...prev,
        [activeChat]: res.data.response.chat_history || [],
      }));
      setPrompt("");
    } catch (error) {
      setError("챗봇 응답을 가져오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  // 새로운 채팅방 추가
  const handleAddChatRoom = () => {
    setActiveChat(0);
    if (activeChat <= chatRooms.length) {
      setActiveChat(chatRooms.length + 1);
      console.log(chatRooms.length);
      console.log("현재 활성화 채팅 넘버 " + activeChat);
    }
  };

  const handleRemoveChatRoom = (chatId: number) => {
    removeChatRoom(chatId);
    if (activeChat == chatId) {
      setActiveChat(0); // 삭제한 채팅방이 활성화된 채팅방이라면 활성화된 채팅방을 초기화
    }
  };

  return (
    <div className="cb">
      {/* 채팅방 목록 */}
      <div className="chatList">
        <button
          className="addChatRoom"
          onClick={handleAddChatRoom}
          disabled={waitingForNewChat}
        >
          새 채팅방 열기
        </button>
        <br />
        {chatRooms.length > 0 &&
          chatRooms.map((room) => (
            <div key={room} className="chatRoomWrapper">
              <button
                className={`chatRoomButton ${
                  room === activeChat ? "active" : ""
                }`}
                onClick={() => {
                  setActiveChat(room);
                  getChat();
                }}
              >
                {room}
              </button>
              <button
                className="removeChatRoomButton"
                onClick={() => handleRemoveChatRoom(room)}
              >
                삭제
              </button>
            </div>
          ))}
      </div>

      {/* 기본 화면: 새 채팅 시작 안내 */}
      {!chatHistory[activeChat]?.length ? (
        <div className="cbPlaceholder">
          <img
            src="/image/MS_Icon.png"
            className="cbPlaceholderImg"
            alt="placeholderImg"
          />
          <h2>무엇을 도와드릴까요?</h2>

          <div className="inputContainer1">
            <input
              className="cbTextBar1"
              type="text"
              value={prompt}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="질문을 입력하세요"
            />
            <img
              src="/image/cbSendBtn.PNG"
              alt="전송"
              onClick={handleSendMessage}
              className={loading ? "cbSendBtnLoading1" : "cbSendBtnNotLoading1"}
            />
          </div>
        </div>
      ) : (
        <div className="cbResBox">
          {error && <div className="error">{error}</div>}

          {chatHistory[activeChat] && (
            <div className="cbResBox">
              {chatHistory[activeChat].map((chat, index) => {
                const isUser = chat.startsWith("User:");
                return (
                  <div
                    ref={chatEndRef}
                    key={index}
                    className={`chatMessage ${
                      isUser ? "userMessage" : "botMessage"
                    }`}
                  >
                    <div
                      className={`chatBubble ${
                        isUser ? "userBubble" : "botBubble"
                      }`}
                    >
                      {chat.replace("User:", "").replace("Chatbot:", "").trim()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="inputContainer2">
            <input
              className="cbTextBar2"
              type="text"
              value={prompt}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="질문을 입력하세요"
            />
            <img
              src="/image/cbSendBtn.PNG"
              alt="전송"
              onClick={() => {
                setActiveChat(activeChat);
                handleSendMessage();
              }}
              className={loading ? "cbSendBtnLoading2" : "cbSendBtnNotLoading2"}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
