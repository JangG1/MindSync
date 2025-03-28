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
import News from "./components/News";

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
        <div className="menuBarOut">
          <div className="burgerMenuBtn">
            <img
              src="/image/burgerBtn.png"
              onClick={toggleBurgerModal}
              alt="메뉴 버튼"
            />
          </div>
          <div className="logo">
            <a href="/">
              <img src="/image/logo.jpg" alt="로고" />
            </a>
          </div>
        </div>

        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/ImageGenerator" element={<ImageGenerator />} />
            <Route path="/ToDo" element={<ToDo />} />
            <Route path="/Calendar" element={<Calendar />} />
            <Route path="/News" element={<News />} />
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
          {/* 내부 햄버거 버튼 클릭 시 닫기 */}
          <div className="menuBarIn">
            <div className="burgerMenuBtn">
              <img
                src="/image/burgerBtn.png"
                onClick={toggleBurgerModal}
                alt="메뉴 버튼"
              />
            </div>
            <div className="logo">
              <a href="/">
                <img src="/image/logo.jpg" alt="로고" />
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
              <Link to="/News" onClick={toggleBurgerModal}>
                News
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
