import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";
import AOS from "aos";
import "aos/dist/aos.css";
import Home from "./components/Home";
import ImageGenerator from "./components/ImageGenerator";

function App() {
  const [isBurgerModalVisible, setIsBurgerModalVisible] = useState(false);

  useEffect(() => {
    AOS.init();
  }, []);

  // 버거 메뉴를 토글하는 함수
  const toggleBurgerModal = () => {
    setIsBurgerModalVisible((prev) => !prev);
  };

  return (
    <div className="appContainer">
      <Router>
        {/* 네비게이션 바 */}
        <div className="menuBar">
          <img
            src="/image/burgerBtn.png"
            className="burgerMenuBtn"
            onClick={toggleBurgerModal}
            alt="메뉴 버튼"
          />

          <div>
            <a href="/">
              <img src="/image/logo.jpg" className="logo" alt="로고" />
            </a>
          </div>
        </div>

        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/ImageGenerator" element={<ImageGenerator />} />
          </Routes>
        </main>

        {/* 배경을 클릭하면 메뉴 닫기 */}
        {isBurgerModalVisible && (
          <div
            className="overlay"
            onClick={() => setIsBurgerModalVisible(false)}
          />
        )}

        {/* 버거 메뉴 모달 */}
        <div className={`burgerMenu ${isBurgerModalVisible ? "show" : "hide"}`}>
          <div className="menuBar">
            {/* 내부 햄버거 버튼 클릭 시 닫기 */}
            <img
              src="/image/burgerBtn.png"
              className="burgerMenuBtn"
              onClick={toggleBurgerModal}
              alt="닫기 버튼"
            />

            <div>
              <a href="/">
                <img src="/image/logo.jpg" className="logo" alt="로고" />
              </a>
            </div>
          </div>

          <div className="burgerLinkList">
            <div className="burgerLinkLink">
              <Link to="/ImageGenerator">ImageGenerator</Link>
            </div>
            <br />
            <div className="burgerLinkLink">
              <Link to="/Memo">Memo</Link>
            </div>
            <br />
            <div className="burgerLinkLink">
              <Link to="/Memo">Memo</Link>
            </div>
          </div>
        </div>

        <footer>
          <div>
            <img src="/image/logo.jpg" className="footerLogo" />
            <a className="focus" href="/">
              <img src="/image/topBtn.png" className="topBtn" />
            </a>
          </div>
          <br />
          <div className="footerDesc">MingSync is comming...</div>
        </footer>
      </Router>
    </div>
  );
}

export default App;
