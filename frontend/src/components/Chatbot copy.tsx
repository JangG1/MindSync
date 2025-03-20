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
    console.log("번역전:", text);
    try {
      const response = await axios.get(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ko&dt=t&q=${encodeURIComponent(
          text
        )}`
      );
      console.log("번역후1:", response.data);
      console.log("번역후2:", response.data[0][0][0]);
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
      //console.log("챗봇 채팅 내역:", res.data.response.chat_history);

      // chat_history 배열의 각 항목을 번역하여 새로운 배열에 저장
      let translatedMessages = await Promise.all(
        res.data.response.chat_history.map(
          async (chat: { user: string; message: string }) => {
            const translatedMessage = await translateToKorean(chat.message);
            return { ...chat, message: translatedMessage }; // 원본 user와 message를 유지하면서 번역된 message 적용
          }
        )
      );

      console.log("번역된 채팅 내역:", translatedMessages);

      setPrompt("");
      setResponseText(
        translatedMessages.map((chat) => chat.message).join("\n")
      );
      setChatHistory((prev) => [
        ...prev,
        { user: "User1", message: prompt },
        ...translatedMessages, // 번역된 메시지 배열 추가
      ]);
      console.log("chatHistory:", chatHistory);
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
