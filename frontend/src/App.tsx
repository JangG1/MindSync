import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import "./App.css";
import AOS from "aos";
import "aos/dist/aos.css";
import Home from "./components/Home";
import ImageGenerator from "./components/ImageGenerator";
import ToDo from "./components/ToDo";
import Calendar from "./components/Calendar";
import Board from "./components/Board";
import BoardWrite from "./components/BoardWrite";
import BoardContent from "./components/BoardContent";
import Chatbot from "./components/Chatbot";

// BurgerModal 상태를 관리하는 타입
type BurgerModalState = boolean;

const App: React.FC = () => {
  const [isBurgerModalVisible, setIsBurgerModalVisible] =
    useState<BurgerModalState>(false);

  // AOS 초기화
  useEffect(() => {
    AOS.init();
  }, []);

  // 버거 메뉴를 토글하는 함수
  const toggleBurgerModal = (): void => {
    setIsBurgerModalVisible((prev) => !prev);
  };

  return (
    <Router>
      <div className="appContainer">
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
            <Route path="/ToDo" element={<ToDo />} />
            <Route path="/Calendar" element={<Calendar />} />
            <Route path="/Chatbot" element={<Chatbot />} />
            <Route path="/Board" element={<Board />} />
            <Route path="/BoardWrite" element={<BoardWrite />} />
            <Route path="/BoardContent/:boardNo" element={<BoardContent />} />
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
              <Link to="/ImageGenerator" onClick={toggleBurgerModal}>
                Image Generator
              </Link>
            </div>
            <br />
            <div className="burgerLinkLink">
              <Link to="/ToDo" onClick={toggleBurgerModal}>
                To-Do
              </Link>
            </div>
            <br />
            <div className="burgerLinkLink">
              <Link to="/Calendar" onClick={toggleBurgerModal}>
                Calendar
              </Link>
            </div>
            <br />
            <div className="burgerLinkLink">
              <Link to="/Chatbot" onClick={toggleBurgerModal}>
                Chatbot
              </Link>
            </div>
            <br />
            <div className="burgerLinkLink">
              <Link to="/Board" onClick={toggleBurgerModal}>
                Board
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Router>
  );
};

export default App;
