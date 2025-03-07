// ImageGenerator.tsx
import React, { useState } from "react";
import axios from "axios";
import "./ImageGenerator.css";

const App: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [prompt, setPrompt] = useState<string>(""); // 사용자 입력을 위한 state
  const [error, setError] = useState<string>(""); // 이미지 로딩 실패 시 에러 메시지 저장

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
  };

  const isKorean = (text: string): boolean => /[\uAC00-\uD7A3]/.test(text);

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

  const generateImage = async () => {
    setLoading(true);
    setImage(null);
    setError("");

    try {
      let finalPrompt = prompt;
      if (isKorean(prompt)) {
        finalPrompt = await translateToEnglish(prompt);
      }

      const response = await axios.post(
        "http://localhost:8000/generate-image",
        { prompt: finalPrompt },
        { responseType: "blob" }
      );

      const imageUrl = URL.createObjectURL(response.data);
      setImage(imageUrl);
    } catch (error) {
      console.error("Error fetching image:", error);
      setError("이미지를 불러오지 못했습니다. 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
          placeholder="생성할 이미지 설명을 입력하세요..."
        />
        <button className="igBtn" onClick={generateImage} disabled={loading}>
          {loading ? "변환중..." : "변환하기"}
        </button>
        {/* 설명 추가 부분 */}
        <div className="createDesc">
          <h3>📝 이미지 생성기 사용법</h3>
          1️⃣ 이미지 설명 입력 <br />
          <li>생성하고 싶은 이미지를 설명하는 단어 또는 문장을 입력하세요.</li>
          <li>
            예시: "나무", "접시 위의 케이크", "해변에서 맥주를 마시고 있는
            미국인".
          </li>
          <br />
          2️⃣ 자동 번역 (한글 → 영어) <br />
          <li>한글로 입력하면 자동으로 영어로 번역됩니다. </li>
          <li>영어로 입력하면 그대로 사용됩니다.</li>
          <br />
          3️⃣ 이미지 생성 <br />
          <li>Enter 키를 누르거나 변환하기 버튼을 클릭하세요.</li>
          <li>이미지가 생성될 때까지 기다려 주세요.</li>
          <br />
          4️⃣ 결과 확인 <br />
          <li>생성된 이미지는 화면에 표시됩니다.</li>
          <li>새로운 이미지를 원하면 다시 설명을 입력하고 변환하세요. </li>
          <br />
          ⚠️ 주의사항
          <li>명확하고 자세한 설명일수록 더 좋은 이미지를 얻을 수 있습니다.</li>
          <li>
            한글 입력 시 자동 번역되므로, 번역 결과를 확인하고 싶다면 영어로
            입력하세요.
          </li>
          <h4>🚀 이제 원하는 이미지를 직접 만들어 보세요!</h4>
        </div>
      </div>
      <div className="createImageBox">
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
        {!loading && error && (
          <div className="placeholder">
            <img
              src="/image/logo.jpg"
              className="placeholderImage"
              alt="Placeholder"
            />
            <p>{error}</p>
          </div>
        )}
        {!loading &&
          !error &&
          (image ? (
            <img src={image} alt="Generated" className="createImage" />
          ) : (
            <div className="placeholder">
              <img
                src="/image/logo.jpg"
                className="placeholderImage"
                alt="Placeholder"
              />
              <p>이미지가 생성되면 이곳에 표시됩니다.</p>
            </div>
          ))}
      </div>
    </div>
  );
};

export default App;
