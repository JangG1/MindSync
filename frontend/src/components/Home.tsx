import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./Home.css";
import { useChatStore } from "../store/Store";
import AOS from "aos";

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
    createFirstChatRoom,
    createNewChatRoom,
  } = useChatStore();

  const [chatHistory, setChatHistory] = useState<{ [key: string]: string[] }>({
    1: [],
  });

  useEffect(() => {
    console.log("activeChat : " + activeChat);
    AOS.init({
      once: true, // 스크롤 한 번만 애니메이션 실행
    });

    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory]);

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

      setChatHistory((prev) => ({
        ...prev,
        [roomNo]: res.data.chat_history || [],
      }));

      setActiveChat(roomNo);

      if (res.data.chat_history && res.data.chat_history.length > 0) {
        setTimeout(() => {
          if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      }
    } catch (error) {
      console.error("Error fetching chatbot response:", error);
      setError(
        "⚠ 챗봇 응답을 가져오는 중 오류가 발생했습니다. 다시 시도해주세요."
      );
    } finally {
      setLoading(false);
    }
  };

  // 메시지 전송 함수 (새로운 채팅)
  const handleSendMessage1 = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");
    try {
      getInChat(true);
      let roomNo = 1;

      if (chatRooms.length === 0) {
        // 최초 채팅방 생성 (roomNo 1)
        const res = await axios.post(`http://127.0.0.1:8000/api/chatbot`, {
          chatNo: "Chat" + roomNo,
          message: prompt,
        });

        if (res.data.response.error) {
          return setError(
            "⚠ 챗봇 응답을 가져오는 중 오류가 발생했습니다. 다시 시도해주세요."
          );
        }

        createFirstChatRoom(roomNo);
        setChatHistory((prev) => ({
          ...prev,
          [roomNo]: res.data.response.chat_history,
        }));
      } else {
        // 새로운 채팅방 생성
        roomNo = Math.max(...chatRooms.map((room) => room.roomNo)) + 1;

        const res = await axios.post(`http://127.0.0.1:8000/api/chatbot`, {
          chatNo: "Chat" + roomNo,
          message: prompt,
        });

        if (res.data.response.error) {
          return setError(
            "⚠ 챗봇 응답을 가져오는 중 오류가 발생했습니다. 다시 시도해주세요."
          );
        }

        createNewChatRoom(roomNo);
        setChatHistory((prev) => ({
          ...prev,
          [roomNo]: res.data.response.chat_history,
        }));
      }
      setPrompt("");
    } catch (error) {
      setError(
        "⚠ 챗봇 응답을 가져오는 중 오류가 발생했습니다. 다시 시도해주세요."
      );
    } finally {
      setLoading(false);
    }
  };

  // 메시지 전송 함수 (선택 채팅방 유지)
  const handleSendMessage2 = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`http://127.0.0.1:8000/api/chatbot`, {
        chatNo: "Chat" + activeChat,
        message: prompt,
      });

      if (res.data.response.error) {
        return setError(
          "⚠ 챗봇 응답을 가져오는 중 오류가 발생했습니다. 다시 시도해주세요."
        );
      }

      setChatHistory((prev) => ({
        ...prev,
        [activeChat]: res.data.response.chat_history,
      }));

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
    } catch (error) {
      setError(
        "⚠ 챗봇 응답을 가져오는 중 오류가 발생했습니다. 다시 시도해주세요."
      );
    } finally {
      setLoading(false);
    }
  };

  // 채팅 삭제 함수
  const deleteChat = async (roomNo: number) => {
    setLoading(true);
    setError("");

    getInChat(false);

    try {
      const res = await axios.post(`http://127.0.0.1:8000/api/deleteChat`, {
        chatNo: "Chat" + roomNo,
      });

      // 삭제 후 채팅방 목록 및 내역 제거
      removeChatRoom(roomNo);
      setChatHistory((prev) => {
        const newHistory = { ...prev };
        delete newHistory[roomNo];
        return newHistory;
      });
      console.log(`채팅방 ${roomNo} 삭제 완료`);
    } catch (error) {
      console.error("Error deleting chat:", error);
      setError("⚠ 채팅 삭제 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  // 엔터키로 메시지 전송
  const handleKeyDown1 = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage1();
    }
  };
  const handleKeyDown2 = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage2();
    }
  };

  // 채팅방 추가 함수
  const handleAddChatRoom = () => {
    getInChat(false);
  };

  return (
    <div className="cb">
      {/* 채팅방 목록 */}
      <div className="chatList">
        <button className="addChatRoom" onClick={handleAddChatRoom}>
          새 채팅방 열기
        </button>
        <div className="cbChatList">
          <div className="cbChatListImg">
            <img src="/image/MS_Icon.png" alt="placeholderImg" />
          </div>
          <div className="cbChatListText">
            <span>채팅 기록</span>
          </div>
        </div>
        <br />
        {chatRooms.length > 0 &&
          chatRooms
            .sort((a, b) => b.roomNo - a.roomNo) // roomNo에 의한 숫자 정렬
            .map((room) => (
              <div key={room.roomNo} className="chatRoomWrapper">
                <button
                  className={`chatRoomButton ${
                    room.roomNo === activeChat ? "active" : ""
                  }`}
                  onClick={() => getChat(room.roomNo)}
                >
                  {room.roomNo} (생성일: {room.createdAt})
                  <button
                    className="removeChatRoomButton"
                    onClick={() => deleteChat(room.roomNo)}
                  >
                    X
                  </button>
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
            data-aos="fade-right"
            data-aos-duration="1500"
          />
          <h2>오늘은 무슨일이 있었나요?</h2>

          <div className="inputContainer1">
            <input
              className="cbTextBar1"
              type="text"
              value={prompt}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown1}
              placeholder="질문/인사를 해주세요"
            />
            <img
              src="/image/cbSendBtn.PNG"
              alt="전송"
              onClick={handleSendMessage1}
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
                        {!isUser && (
                          <img
                            src="/image/MS_Icon.png"
                            alt="챗봇 아이콘"
                            className="chatBotIcon"
                          />
                        )}
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
            <div className="cbLoading">
              <img
                src="/image/MS_Icon.png"
                className="cbLoadingImg"
                alt="로딩 아이콘"
              />
              <div>챗봇이 답변을 준비 중입니다...</div>
            </div>
          )}

          <div className="inputContainer2">
            <input
              className="cbTextBar2"
              type="text"
              value={prompt}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown2}
              placeholder="질문/인사를 해주세요"
            />
            <img
              src="/image/cbSendBtn.PNG"
              alt="전송"
              onClick={handleSendMessage2}
              className={loading ? "cbSendBtnLoading2" : "cbSendBtnNotLoading2"}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
