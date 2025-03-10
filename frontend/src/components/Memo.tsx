import React, { useEffect } from "react";
import "./Home.css";
import AOS from "aos";
import "aos/dist/aos.css";

// React.FC 타입을 사용하여 함수형 컴포넌트 정의
const Memo: React.FC = () => {
  useEffect(() => {
    AOS.init({
      duration: 1000, // 애니메이션 지속 시간 (ms)
      once: true, // 스크롤 한 번만 애니메이션 실행
      easing: "ease-in-out", // 애니메이션 가속도
    });
  }, []);

  return (
    <div>
      <div className="">
        <div className="">Memo Body</div>
      </div>
    </div>
  );
};

export default Memo;
