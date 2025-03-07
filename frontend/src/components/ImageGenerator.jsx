import React, { useState } from "react";
import axios from "axios";
import "./ImageGenerator.css";

const App = () => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [prompt, setPrompt] = useState(""); // 사용자 입력을 위한 state

  const handleInputChange = (e) => {
    setPrompt(e.target.value);
  };

  const generateImage = async () => {
    setLoading(true);
    try {
      // FastAPI 백엔드 호출
      const response = await axios.post(
        "http://localhost:8000/generate-image",
        {
          prompt: prompt, // 사용자가 입력한 프롬프트를 FastAPI로 전달
        },
        {
          responseType: "blob", // 바이너리 이미지 데이터로 응답 받기
        }
      );

      // URL.createObjectURL을 사용하여 이미지 URL 생성
      const imageUrl = URL.createObjectURL(response.data);
      setImage(imageUrl);
    } catch (error) {
      console.error("Error fetching image:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      generateImage();
    }
  };

  return (
    <div>
      <h1 className="igTitle">IMAGE GENERATOR</h1>
      <input
        className="igTextBar"
        type="text"
        value={prompt}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
      />
      <button className="igBtn" onClick={generateImage} disabled={loading}>
        {loading ? "변환중..." : "변환하기"}
      </button>
      <div>
        {image && <img src={image} alt="Generated" className="createImage" />}
      </div>
    </div>
  );
};

export default App;
