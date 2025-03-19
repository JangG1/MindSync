import React, { useState } from "react";
import axios from "axios";
import "./Chatbot.css";

const Chatbot = () => {
  const [responseText, setResponseText] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [prompt, setPrompt] = useState<string>(""); // 사용자 입력을 위한 state
  const [resPrompt, setResPrompt] = useState<string>(""); // 사용자 입력을 위한 state
  const [error, setError] = useState<string>(""); // 이미지 로딩 실패 시 에러 메시지 저장
  const [imageUrl, setImageUrl] = useState<string | null>(null); // 이미지 URL을 저장할 상태
  const [chatHistory, setChatHistory] = useState<
    { user: string; message: string }[]
  >([]);

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
    setError("");
    setImageUrl(null);

    let finalPrompt = prompt;
    if (isKorean(prompt)) {
      finalPrompt = await translateToEnglish(prompt);
    }

    setResPrompt(prompt);

    try {
      const res = await axios.post(`http://127.0.0.1:8000/api/chatbot`, {
        user: "User1",
        message: finalPrompt,
      });

      console.log("챗봇 응답:", res.data.response);
      console.log("챗봇 채팅 내역:", res.data.response.chat_history);

      let translatedResponse = await translateToKorean(
        res.data.response.chat_history
      );

      // 객체가 아니라 문자열로 저장되도록 변환
      translatedResponse =
        typeof translatedResponse === "object"
          ? JSON.stringify(translatedResponse)
          : translatedResponse.toString();

      setPrompt("");
      setResponseText(translatedResponse);
      setChatHistory((prev) => [
        ...prev,
        { user: "User1", message: prompt },
        { user: "Bot", message: translatedResponse },
      ]);
    } catch (error) {
      console.error("Error fetching chatbot response:", error);
      setResponseText("서버 오류가 발생했습니다.");
      setError("챗봇 응답을 가져오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 이미지 생성 처리
  const handleGenerateImage = async () => {
    if (!prompt.trim()) return;

    setLoading(true);
    setError(""); // 에러 초기화

    let finalPrompt = prompt;
    if (isKorean(prompt)) {
      finalPrompt = await translateToEnglish(prompt);
    }

    try {
      // 이미지 생성 요청
      const res = await axios.post(
        "http://127.0.0.1:8000/api/generate-image",
        { prompt: finalPrompt },
        { responseType: "arraybuffer" } // 이미지 데이터를 ArrayBuffer로 받기
      );

      // 이미지 데이터 처리
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
      {!responseText && !imageUrl && (
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
            <button onClick={handleGenerateImage}>이미지 생성</button>
          </div>
        </div>
      )}

      {responseText && !imageUrl && (
        <div className="cbResBox">
          {error && (
            <div style={{ color: "red", marginTop: "10px" }}>
              <strong>오류:</strong> {error}
            </div>
          )}

          {chatHistory.map((chat, index) => (
            <div
              key={index}
              className={
                chat.user === "User1" ? "cbUserMessage" : "cbBotMessage"
              }
              style={{
                textAlign: index % 2 === 0 ? "right" : "left", // 짝수 인덱스는 오른쪽, 홀수 인덱스는 왼쪽
              }}
            >
              {chat.message}
            </div>
          ))}

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
            <button onClick={handleGenerateImage}>이미지 생성</button>
          </div>
        </div>
      )}

      {imageUrl && (
        <div className="cbImageBox">
          <img src={imageUrl} alt="Generated" className="cbGeneratedImage" />
        </div>
      )}
    </div>
  );
};

export default Chatbot;
