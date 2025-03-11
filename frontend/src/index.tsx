import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css"; // 스타일 파일
import App from "./App"; // App 컴포넌트
import reportWebVitals from "./reportWebVitals";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
); // React 18 이상에서 권장
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals(); // 성능 측정 (선택 사항)
