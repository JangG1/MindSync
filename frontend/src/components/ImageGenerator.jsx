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
    setImage(null); // 새로운 요청이 들어오면 기존 이미지 초기화

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
    <div className="ig">
      <div className="createInputBox">
        <h1 className="igTitle">IMAGE GENERATOR</h1>
        <br />
        <input
          className="igTextBar"
          type="text"
          value={prompt}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder="생성할 이미지에 대한 설명을 입력하세요..."
        />
        <button className="igBtn" onClick={generateImage} disabled={loading}>
          {loading ? "변환중..." : "변환하기"}
        </button>
        <div className="createInputDesc">
          사용법: 원하는 이미지 설명을 입력하고 Enter를 누르세요.
        </div>
      </div>

      <div className="createImageBox">
        {/* 로딩 중이면 로딩 이미지 표시 */}

        {loading && (
          <div className="loadingBox">
            <img
              src="/image/logo.jpg"
              alt="Loading..."
              className="loadingImage"
            />
            <p>이미지를 생성하고 있습니다...</p>
          </div>
        )}

        {/* 이미지가 있을 경우 이미지 표시, 없으면 기본 이미지 표시 */}
        {!loading &&
          (image ? (
            <img src={image} alt="Generated" className="createImage" />
          ) : (
            <div className="placeholder">
              <img src="/image/logo.jpg" className="placeholderImage" />
              <p>이미지가 생성되면 이곳에 표시됩니다.</p>
            </div>
          ))}
      </div>
    </div>
  );
};

export default App;
