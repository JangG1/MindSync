from vosk import Model, KaldiRecognizer
import wave
import json

def transcribe_audio(audio_file_path: str):
    # 모델 로딩
    model = Model("model")  # 모델 경로 설정

    with wave.open(audio_file_path, "rb") as wf:
        recognizer = KaldiRecognizer(model, wf.getframerate())
        results = []

        while True:
            data = wf.readframes(4000)
            if len(data) == 0:
                break
            if recognizer.AcceptWaveform(data):
                results.append(recognizer.Result())

        final_result = recognizer.FinalResult()
        response_data = json.loads(final_result)
        return response_data["text"]
