import React, { useState, useEffect } from "react";

const STT = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);

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

  // Web Speech API 인식 시작 함수
  const startSpeechRecognition = () => {
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = true; // 연속적인 음성 인식 활성화
    recognition.lang = "ko-KR"; // 한국어로 언어 설정

    recognition.onstart = () => {
      console.log("음성 인식 시작"); // 시작 로그 추가
      setIsRecording(true);
      setTranscript(""); // 새로 녹음할 때 텍스트 초기화
      setLoading(true);
    };

    recognition.onspeechstart = () => {
      console.log("음성 인식이 시작되었습니다"); // 음성이 시작되었을 때 로그 추가
    };

    recognition.onresult = (event: any) => {
      const currentTranscript = event.results[event.resultIndex][0].transcript;
      setTranscript(currentTranscript); // 인식된 텍스트 업데이트
    };

    recognition.onend = () => {
      console.log("음성 인식 종료"); // 종료 로그 추가
      setIsRecording(false);
      setLoading(false);
      sendAudioToVosk(); // 녹음이 끝난 후 Vosk로 음성 전송
    };

    recognition.onerror = (error: any) => {
      console.error("음성 인식 오류:", error);
      setLoading(false);
    };

    recognition.start(); // 음성 인식 시작
  };

  // 음성 인식을 중지하는 함수
  const stopRecording = () => {
    setIsRecording(false);
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
    }
  };

  return (
    <div>
      <h2>음성 메모</h2>
      <p>음성을 입력하세요. 예: "내일 3시 미팅"</p>
      <button
        onClick={startSpeechRecognition}
        disabled={isRecording || loading}
      >
        {isRecording ? "Recording..." : "Start Recording"}
      </button>
      <button onClick={stopRecording} disabled={!isRecording}>
        Stop Recording
      </button>
      <div>
        {loading ? <p>음성 변환 중...</p> : <p>변환된 텍스트: {transcript}</p>}
      </div>
    </div>
  );
};

export default STT;
