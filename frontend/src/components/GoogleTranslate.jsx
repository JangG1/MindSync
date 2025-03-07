import React, { useEffect } from "react";

const GoogleTranslate = () => {
  useEffect(() => {
    // Google 번역 위젯을 초기화하는 스크립트 로딩
    const script = document.createElement("script");
    script.src =
      "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    script.async = true;
    document.head.appendChild(script);

    // Google 번역 위젯 초기화 함수
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        {
          pageLanguage: "ko", // 기본 언어 설정
          includedLanguages: "ko,en,jp", // 번역 가능한 언어 목록 설정
          autoDisplay: false, // 자동으로 번역되지 않도록 설정
        },
        "google_translate_element" // 위젯을 표시할 HTML 요소 ID
      );
    };
  }, []);

  return (
    <div>
      <div
        id="google_translate_element"
        style={{ display: "inline-block" }}
      ></div>
    </div>
  );
};

export default GoogleTranslate;
