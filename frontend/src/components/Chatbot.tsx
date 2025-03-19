import React, { useState } from "react";
import axios from "axios";
import "./Chatbot.css";

const Chatbot = () => {
  const [responseText, setResponseText] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [prompt, setPrompt] = useState<string>(""); // 사용자 입력을 위한 state
  const [resPrompt, setResPrompt] = useState<string>(""); // 사용자 입력을 위한 state
  const [error, setError] = useState<string>(""); // 이미지 로딩 실패 시 에러 메시지 저장

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
  };

  const isKorean = (text: string): boolean => /[\uAC00-\uD7A3]/.test(text);

  // 번역 함수 (한글 -> 영어)
  const translateToEnglish = async (text: string): Promise<string> => {
    try {
      const response = await axios.get(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ko&tl=en&dt=t&q=${encodeURIComponent(
          text
        )}`
      );
      return response.data[0][0][0];
    } catch (error) {
      console.error("번역 오류:", error);
      return text;
    }
  };

  // 번역 함수 (영어 -> 한글)
  const translateToKorean = async (text: string): Promise<string> => {
    try {
      const response = await axios.get(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ko&dt=t&q=${encodeURIComponent(
          text
        )}`
      );
      return response.data[0][0][0];
    } catch (error) {
      console.error("번역 오류:", error);
      return text;
    }
  };

  const handleSendMessage = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError(""); // 에러 초기화

    let finalPrompt = prompt;
    if (isKorean(prompt)) {
      finalPrompt = await translateToEnglish(prompt);
    }

    setResPrompt(prompt);

    try {
      const res = await axios.post(`https://mindsync.site:8000/api/chatbot`, {
        prompt: finalPrompt,
      });
      let translatedResponse = await translateToKorean(res.data.response); // 응답을 한글로 변환

      setPrompt("");
      setResponseText(translatedResponse);
    } catch (error) {
      console.error("Error fetching chatbot response:", error);
      setResponseText("서버 오류가 발생했습니다.");
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
      {!responseText && (
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

            {loading ? (
              <img
                src="/image/cbSendBtn.PNG"
                alt=""
                className="cbSendBtnLoading"
              />
            ) : (
              <img
                src="/image/cbSendBtn.PNG"
                alt=""
                onClick={handleSendMessage}
                className="cbSendBtnNotLoading"
              />
            )}
          </div>
        </div>
      )}

      {responseText && (
        <div className="cbResBox">
          {error && (
            <div style={{ color: "red", marginTop: "10px" }}>
              <strong>오류:</strong> {error}
            </div>
          )}

          <div className="cbUserMessage">{resPrompt}</div>

          <div className="cbBotMessage">{responseText}</div>

          <div className="inputContainer2">
            <input
              className="cbTextBar"
              type="text"
              value={prompt}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="질문을 입력하세요"
            />

            {loading ? (
              <img
                src="/image/cbSendBtn.PNG"
                alt=""
                className="cbSendBtnLoading"
              />
            ) : (
              <img
                src="/image/cbSendBtn.PNG"
                alt=""
                onClick={handleSendMessage}
                className="cbSendBtnNotLoading"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
