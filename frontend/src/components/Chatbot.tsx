import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "./Chatbot.css";

const Chatbot: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [prompt, setPrompt] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<string[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null); // 스크롤을 맨 아래로 이동할 참조

  useEffect(() => {
    // chatHistory가 변경될 때마다 스크롤을 맨 아래로 이동
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
  };

  const handleSendMessage = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError("");
    setImageUrl(null);

    try {
      const res = await axios.post(`http://127.0.0.1:8000/api/chatbot`, {
        user: "User1",
        message: prompt,
      });

      console.log("챗봇 응답:", res.data.response);
      setChatHistory(res.data.response.chat_history || []);
      setPrompt("");
    } catch (error) {
      console.error("Error fetching chatbot response:", error);
      setError("챗봇 응답을 가져오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError("");

    try {
      const res = await axios.post(
        "http://127.0.0.1:8000/api/generate-image",
        { prompt },
        { responseType: "arraybuffer" }
      );

      const imageBlob = new Blob([res.data], { type: "image/png" });
      const imageUrl = URL.createObjectURL(imageBlob);
      setImageUrl(imageUrl);
    } catch (error) {
      console.error("Error generating image:", error);
      setError("이미지 생성 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="cb">
      {chatHistory.length === 0 && !imageUrl && (
        <div className="cbPlaceholder">
          <img
            src="/image/MS_Icon.png"
            className="cbPlaceholderImg"
            alt="placeholderImg"
          />
          <h2>무엇을 도와드릴까요?</h2>

          <div className="inputContainer1">
            <input
              className="cbTextBar"
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
              className={loading ? "cbSendBtnLoading" : "cbSendBtnNotLoading"}
            />
            <button onClick={handleGenerateImage}>이미지 생성</button>
          </div>
        </div>
      )}

      {chatHistory.length > 0 && (
        <div className="cbResBox">
          {error && <div className="error">{error}</div>}

          {chatHistory.map((chat, index) => {
            const isUser = chat.startsWith("User:");
            return (
              <div
                key={index}
                className={`chatMessage ${
                  isUser ? "userMessage" : "botMessage"
                }`}
              >
                <div
                  className={`bubble ${isUser ? "userBubble" : "botBubble"}`}
                >
                  {chat.replace("User:", "").replace("Chatbot:", "").trim()}
                </div>
              </div>
            );
          })}

          <div className="inputContainer2">
            <input
              className="cbTextBar"
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
              className={loading ? "cbSendBtnLoading" : "cbSendBtnNotLoading"}
            />
            <button onClick={handleGenerateImage}>이미지 생성</button>
          </div>
        </div>
      )}

      {imageUrl && (
        <div className="cbImageBox">
          <img src={imageUrl} alt="Generated" className="cbGeneratedImage" />
        </div>
      )}

      {/* 대화 영역이 끝나는 지점에 이 div를 추가합니다. */}
      <div ref={chatEndRef} />
    </div>
  );
};

export default Chatbot;
