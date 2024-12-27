"use client";

import { useEffect, useState } from "react";

export default function Home() {
    const [time, setTime] = useState(null); // Для демонстрації клієнтського значення
    const [isRecording, setIsRecording] = useState(false);
    const [stream, setStream] = useState(null);
    const [audioUrl, setAudioUrl] = useState(null);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [audioChunks, setAudioChunks] = useState([]);

    // Використання useEffect для клієнтських даних
    useEffect(() => {
        setTime(new Date().toLocaleString()); // Установка клієнтського часу
    }, []);

    const handleStartCapture = async () => {
        try {
            console.log("Запит доступу до вкладки зі звуком...");
            const displayStream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true,
            });
    
            const audioTracks = displayStream.getAudioTracks();
            if (audioTracks.length === 0) {
                console.error("Аудіо-треки відсутні в потоці.");
                alert("Аудіо не виявлено у вкладці. Переконайтеся, що у вкладці є звук.");
                return;
            }
    
            console.log("Аудіо-треки знайдено:", audioTracks);
    
            const recorder = new MediaRecorder(displayStream);
            const audioChunks = [];
    
            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunks.push(event.data);
                }
            };
    
            recorder.onstop = async () => {
                if (audioChunks.length > 0) {
                    const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
                    const audioUrl = URL.createObjectURL(audioBlob);
                    setAudioUrl(audioUrl); // Зберігаємо URL аудіо для відображення плеєра
                    console.log("Аудіо успішно записано.");
                } else {
                    console.warn("Жодного аудіо-фрагмента не записано.");
                }
                setIsRecording(false); // Зупиняємо стан запису
            };
    
            recorder.start(1000); // Запис фрагментами кожну секунду
            setMediaRecorder(recorder);
            setStream(displayStream);
            setIsRecording(true);
            console.log("Запис розпочато.");
        } catch (error) {
            console.error("Помилка доступу до аудіо:", error);
            alert(`Не вдалося отримати доступ до звуку. Помилка: ${error.message}`);
        }
    };
    
    const handleStopCapture = () => {
        if (mediaRecorder) {
            console.log("Зупинка запису...");
            mediaRecorder.stop(); // Зупиняємо запис
        } else {
            console.warn("MediaRecorder не знайдено.");
        }
    
        if (stream) {
            stream.getTracks().forEach((track) => track.stop()); // Зупиняємо всі треки (аудіо/відео)
            setStream(null); // Очищуємо стан потоку
        }
    
        setMediaRecorder(null); // Очищуємо стан MediaRecorder
    };
    

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h1>Привіт, NextOffer!</h1>
        <button
            onClick={isRecording ? handleStopCapture : handleStartCapture}
            style={{ padding: "10px 20px", fontSize: "16px", marginTop: "20px" }}
        >
            {isRecording ? "Зупинити запис" : "Почати захоплення звуку"}
        </button>
        {audioUrl && (
            <div style={{ marginTop: "20px" }}>
                <h2>Відтворити записаний звук:</h2>
                <audio controls src={audioUrl}></audio>
            </div>
        )}
    </div>    
    );
}
