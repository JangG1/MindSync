import React, { useState, useEffect, useRef } from "react";
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
    getInChat,
    removeChatRoom,
    setActiveChat,
    createNewChatRoom,
  } = useChatStore();

  const [chatHistory, setChatHistory] = useState<{ [key: string]: string[] }>({
    1: [],
  });

  useEffect(() => {
    //getInChat(false);
    console.log("waitingForNewChat : ", waitingForNewChat);
    if (!waitingForNewChat) {
      setActiveChat(chatRooms.length + 1);
    }

    console.log("chatRooms : ", chatRooms);
    console.log("chatRooms.length : ", chatRooms.length);
    console.log("초기 activeChat : ", activeChat);

    if (chatRooms.length !== 0) {
      // 채팅방이 1개라도 있는 경우
    }

    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatRooms.length]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
  };

  // 채팅 히스토리를 서버에서 가져오는 함수
  const getChat = async (roomNo: number) => {
    setLoading(true);
    setError("");

    getInChat(true);

    try {
      const res = await axios.post(`http://127.0.0.1:8000/api/getChat`, {
        chatNo: "Chat" + roomNo,
      });

      console.log(`기존 채팅 내용 (${roomNo}) 조회:`, res.data.chat_history);

      setChatHistory((prev) => ({
        ...prev,
        [roomNo]: res.data.chat_history || [],
      }));

      // 데이터가 로드되었으므로 activeChat을 설정합니다.
      setActiveChat(roomNo);

      if (res.data.chat_history && res.data.chat_history.length > 0) {
        setTimeout(() => {
          if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      }
      console.log("chatHistory : " + chatHistory[roomNo]);
      console.log("현재 activeChat : " + activeChat);
    } catch (error) {
      console.error("Error fetching chatbot response:", error);
      setError("챗봇 응답을 가져오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 메시지 전송 함수
  const handleSendMessage = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`http://127.0.0.1:8000/api/chatbot`, {
        chatNo: "Chat" + activeChat,
        message: prompt,
      });

      getInChat(true);

      const newChatId: number = Math.max(...chatRooms, 0) + 1;
      console.log("newChatId : " + newChatId);
      console.log(
        `새로운 채팅 내용 (${activeChat}) 조회:`,
        res.data.response.chat_history
      );

      if (activeChat === newChatId) {
        console.log("activeChat === newChatId 일치함");

        createNewChatRoom(newChatId); // 새로운 채팅방 생성

        setChatHistory((prev) => ({
          ...prev,
          [newChatId]: res.data.response.chat_history,
        }));
      } else {
        console.log("기존방[" + activeChat + "]에서 추가 대화");
        setChatHistory((prev) => ({
          ...prev,
          [activeChat]: res.data.response.chat_history || [],
        }));
      }

      console.log("chatHistory : " + chatHistory[newChatId]);

      setPrompt("");

      if (
        res.data.response.chat_history &&
        res.data.response.chat_history.length > 0
      ) {
        setTimeout(() => {
          if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      }

      console.log("현재 activeChat : " + activeChat);
    } catch (error) {
      setError("챗봇 응답을 가져오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 엔터키로 메시지 전송
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  // 채팅방 추가 함수
  const handleAddChatRoom = () => {
    getInChat(false);
    const newChatId = Math.max(...chatRooms, 0) + 1;
    console.log("handleAddChatRoom : " + newChatId);
    setActiveChat(newChatId);
    if (activeChat - 1 === chatRooms.length) {
      createNewChatRoom(newChatId);
    }
  };

  const handleRemoveChatRoom = (chatId: number) => {
    removeChatRoom(chatId);
    if (activeChat === chatId) {
      getInChat(true);
    }
  };

  return (
    <div className="cb">
      {/* 채팅방 목록 */}
      <div className="chatList">
        <button className="addChatRoom" onClick={handleAddChatRoom}>
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
                  getChat(room);
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
      {!waitingForNewChat ? (
        <div className="cbPlaceholder">
          <img
            src="/image/MS_Icon.png"
            className="cbPlaceholderImg"
            alt="placeholderImg"
          />
          <h2>오늘은 무슨일이 있었나요?</h2>

          <div className="inputContainer1">
            <input
              className="cbTextBar1"
              type="text"
              value={prompt}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="질문/인사를 해주세요"
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

          {!loading ? (
            <div className="cbResBox">
              {chatHistory[activeChat]?.length
                ? chatHistory[activeChat].map((chat, index) => {
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
                          {chat
                            .replace("User:", "")
                            .replace("Chatbot:", "")
                            .trim()}
                        </div>
                      </div>
                    );
                  })
                : null}
            </div>
          ) : (
            <div className="cbPlaceholder">
              <img
                src="/image/MS_Icon.png"
                className="cbPlaceholderImg"
                alt="placeholderImg"
              />
              <p>응답을 생성하고 있습니다.</p>
            </div>
          )}

          <div className="inputContainer2">
            <input
              className="cbTextBar2"
              type="text"
              value={prompt}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="질문/인사를 해주세요"
            />
            <img
              src="/image/cbSendBtn.PNG"
              alt="전송"
              onClick={handleSendMessage}
              className={loading ? "cbSendBtnLoading2" : "cbSendBtnNotLoading2"}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
