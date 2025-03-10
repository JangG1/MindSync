// STT.tsx (음성 인식 및 메모 기능을 가진 컴포넌트)
import React, { useState, useEffect } from "react";
import "./ToDo.css";
import { useStore } from "../store/Store"; // Zustand 스토어 import

const STT = () => {
  const { todos, addTodo, deleteTodo } = useStore();
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string>(""); // 음성 생성 실패 시 에러 메시지 저장

  useEffect(() => {
    // 컴포넌트가 마운트될 때 사용자 미디어 스트림을 가져옴
    const getUserMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true, // 오디오만 요청
        });
        setMediaStream(stream); // 미디어 스트림을 상태에 저장
      } catch (err) {
        console.error("마이크에 접근할 수 없습니다:", err);
      }
    };

    getUserMedia();

    // 컴포넌트가 언마운트될 때 스트림 정리
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // 할 일을 추가하는 함수
  const handleAddTodo = () => {
    if (input.trim()) {
      const currentTime = new Date().toLocaleTimeString(); // 현재 시간을 "HH:MM:SS" 형식으로 저장
      addTodo({ id: Date.now(), text: input, time: currentTime });
      setInput("");
    }

    if (transcript.trim()) {
      // transcript가 있을 경우 저장
      const currentTime = new Date().toLocaleTimeString();
      addTodo({ id: Date.now(), text: transcript, time: currentTime });
      setTranscript(""); // 텍스트 저장 후 초기화
    }
  };

  // Web Speech API 인식 시작 함수
  const startSpeechRecognition = () => {
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false; // 자동 종료를 위해 false 설정
    recognition.lang = "ko-KR";

    recognition.onstart = () => {
      console.log("음성 인식 시작");
      setIsRecording(true);
      setTranscript("");
      setLoading(true);
    };

    recognition.onresult = (event: any) => {
      const currentTranscript = event.results[event.resultIndex][0].transcript;
      setTranscript(currentTranscript);
    };

    recognition.onspeechend = () => {
      console.log("음성이 멈춰서 자동 종료됨");
      recognition.stop(); // 자동으로 인식 종료
    };

    recognition.onend = () => {
      console.log("음성 인식 종료");
      setIsRecording(false);
      setLoading(false);
      sendAudioToVosk(); // Vosk 서버로 데이터 전송
    };

    recognition.onerror = (error: any) => {
      console.error("음성 인식 오류:", error);
      setLoading(false);
    };

    recognition.start();
  };

  // Vosk 서버로 오디오 데이터를 전송하는 함수
  const sendAudioToVosk = async () => {
    if (!mediaStream) {
      console.error("마이크 스트림이 없습니다");
      return;
    }

    try {
      const audioChunks: any[] = [];

      const mediaRecorder = new MediaRecorder(mediaStream, {
        mimeType: "audio/webm", // 오디오 형식 설정
      });

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data); // 음성 데이터를 수집
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        const formData = new FormData();
        formData.append("audio", audioBlob);

        // FastAPI 서버에 음성 데이터를 POST 요청으로 전송
        const response = await fetch("http://localhost:8000/stt", {
          // FastAPI는 8000번 포트에서 실행 중
          method: "POST",
          body: formData,
        });
        const data = await response.json();
        setTranscript(data.transcript); // Vosk의 결과로 받은 텍스트 업데이트
      };

      mediaRecorder.start();
    } catch (error) {
      console.error("Vosk로 음성을 전송하는 중 오류 발생:", error);
      setError("이미지를 불러오지 못했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <div className="stt">
      <div className="createInputBox">
        <div className="inputArea">
          <input
            className="sttTextBar"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="일정을 입력하세요"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleAddTodo();
              }
            }}
          />
          <button
            className="memoInputBtn"
            disabled={loading}
            onClick={handleAddTodo}
          >
            {loading ? "저장중..." : "저장하기"}
          </button>
        </div>
        <div className="todoList">
          <div className="todoListTitle">TO-DO LIST</div>
          {todos.map((todo) => (
            <div className="todoIdx" key={todo.id}>
              <div className="todoTime">{todo.time}</div>
              <div className="todoText">{todo.text}</div>

              <button
                className="todoDeleteBtn"
                onClick={() => deleteTodo(todo.id)}
              >
                X
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="conventBox">
        <button
          onClick={startSpeechRecognition}
          disabled={isRecording || loading}
          className="sttBtn"
        >
          {isRecording ? "음성 변환중..." : "음성 변환하기"}
        </button>
        {!transcript ? (
          <button className="sttSaveDisBtn">음성 저장하기</button>
        ) : (
          <button
            disabled={!transcript}
            className="sttSaveBtn"
            onClick={() => {
              handleAddTodo(); // 음성을 저장하는 함수 호출
              setTranscript(""); // 저장 후 텍스트 초기화
            }}
          >
            음성 저장하기
          </button>
        )}
      </div>

      <div className="createImageBox">
        {loading && (
          <div className="loadingBox">
            <img
              src="/image/logo.jpg"
              alt="Loading..."
              className="loadingImage"
            />
            <p>음성을 생성하고 있습니다...</p>
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
        {!loading && !error && (
          <div className="createVoice">
            {transcript ? (
              <div className="createVoiceAfter">{transcript}</div>
            ) : (
              <div className="createVoiceBefore">
                <h1 className="sttTitle">SPEECH TO MEMO</h1>
                <h3>음성을 생성해주세요.</h3>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default STT;
