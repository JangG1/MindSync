import React, { useEffect } from "react";
import "./Home.css";
import AOS from "aos";
import "aos/dist/aos.css";
function Home() {
  useEffect(() => {
    AOS.init({
      duration: 1000, // 애니메이션 지속 시간 (ms)
      once: true, // 스크롤 한 번만 애니메이션 실행
      easing: "ease-in-out", // 애니메이션 가속도
    });
  }, []);

  return (
    <div>
      <div className="homeBody">
        <div
          className="homeBodyAOS"
          data-aos="fade-down"
          data-aos-duration="1300"
        >
          <div className="homeBodyText">Home Body</div>
        </div>
      </div>
    </div>
  );
}

export default Home;
