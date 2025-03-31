import React, { useState } from "react";
import axios from "axios";
import "./BoardWrite.css";
import { Link } from "react-router-dom";

function LoadingOverlay() {
  return (
    <div className="loadingOverlay">
      <div className="loadingContent">
        <img
          src="/image/MS_Icon.png"
          alt="Loading..."
          className="loadingImage"
        />
        <p>게시글 작성 중입니다...</p>
      </div>
    </div>
  );
}

function BoardWrite() {
  const [message1, setMessage1] = useState("");
  const [message2, setMessage2] = useState("");
  const [message3, setMessage3] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = () => {
    const pw = process.env.REACT_APP_ADMIN_PASSWORD;
    const EX_IP = process.env.REACT_APP_API_URL_JAVA;

    if (message1 === "관리자") {
      const password = prompt("비밀번호를 입력하세요:");
      if (pw === password) {
        setIsLoading(true);
        axios
          .post(EX_IP + "/clushAPI/boardSave", {
            nickname: message1,
            title: message2,
            content: message3,
          })
          .then((response) => {
            alert("게시물이 작성되었습니다.");
            window.location.href = "/Board";
          })
          .catch((error) => {
            console.error("Error sending message:", error);
          })
          .finally(() => {
            setIsLoading(false);
          });
      }
    } else {
      setIsLoading(true);
      axios
        .post(EX_IP + "/clushAPI/boardSave", {
          nickname: message1,
          title: message2,
          content: message3,
        })
        .then((response) => {
          alert("게시물이 작성되었습니다.");
          window.location.href = "/Board";
        })
        .catch((error) => {
          console.error("Error sending message:", error);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  return (
    <div>
      {isLoading && <LoadingOverlay />}
      <div className="boardTop"></div>
      <img src="/image/MS_Icon.png" className="boardWriteClushLogo" />
      <div>
        <button className="toBoardBtnByBW">
          <Link to="/Board">뒤로가기</Link>
        </button>
      </div>

      <div className="boardWriteBody">
        <div className="boardWriteBodyTitle1">
          <div>작성자</div>
          <input
            className="boardWriteBody1"
            type="text"
            value={message1}
            onChange={(e) => setMessage1(e.target.value)}
          />
        </div>
        <div className="boardWriteBodyTitle2">
          <div>제목</div>
          <input
            className="boardWriteBody2"
            type="text"
            value={message2}
            onChange={(e) => setMessage2(e.target.value)}
          />
        </div>
        <div className="boardWriteBodyTitle3">
          <div>내용</div>
          <textarea
            className="boardWriteBody3"
            value={message3}
            onChange={(e) => setMessage3(e.target.value)}
          />
        </div>
      </div>

      <button className="sendBoard" onClick={handleSendMessage}>
        작성하기
      </button>
    </div>
  );
}

export default BoardWrite;
