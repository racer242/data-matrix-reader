import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import DataMatrixScanner from "./components/DataMatrixScanner";
import "./App.css";

function App() {
  const [logs, setLogs] = useState([]);
  const [videoVisible, setVideoVisible] = useState(true);

  // Регистрируем колбэк для глобального управления видимостью
  useEffect(() => {
    // Устанавливаем колбэк, который будет вызывать setVideoVisible из main.jsx
    if (window.dataMatrixApp) {
      window.dataMatrixApp._setVideoVisibleState = setVideoVisible;
    }

    // Переопределяем setVideoVisible в глобальном объекте для прямой связи
    window.dataMatrixApp.setVideoVisible = (value) => {
      setVideoVisible(
        typeof value === "function" ? value(videoVisible) : value,
      );
    };

    // Обновляем геттер для videoVisible
    Object.defineProperty(window.dataMatrixApp, "videoVisible", {
      get: () => videoVisible,
      configurable: true,
    });
  }, [videoVisible]);

  const handleLog = useCallback((type, data) => {
    const message =
      typeof data === "object"
        ? `${type}: ${JSON.stringify(data, null, 2)}`
        : `${type}: ${data}`;

    setLogs((prev) => [
      ...prev.slice(-19),
      { type: "log", message, time: new Date().toLocaleTimeString() },
    ]);
  }, []);

  const sendToApi = useCallback(
    async (codeData) => {
      const app = window.dataMatrixApp;
      if (!app?.config?.apiURL) {
        return;
      }

      try {
        const headers = {
          "Content-Type": "application/json",
        };

        // Добавляем JWT токен в заголовок, если он есть
        if (window.getJWT) {
          headers["JWT"] = window.getJWT();
        } else if (window.JWT) {
          headers["JWT"] = window.JWT;
        }

        const response = await axios.post(app.config.apiURL, codeData, {
          headers,
        });

        // Обновляем JWT из ответа сервера
        if (response.data?.JWT) {
          if (window.setJWT) {
            window.setJWT(response.data.JWT);
          } else {
            window.JWT = response.data.JWT;
          }
        }

        // Логируем успешную отправку
        handleLog("api-success", response.data);

        // Вызываем callback успешной отправки с полным объектом ответа
        app.on.apiSuccess?.(response.data);
      } catch (error) {
        // Логируем ошибку отправки
        handleLog("api-error", error.message);

        // Вызываем callback ошибки отправки
        app.on.apiError?.(error);
      }
    },
    [handleLog],
  );

  const handleEvent = useCallback(
    (eventType, payload) => {
      // Вызываем внешние функции из window.dataMatrixApp.on
      const app = window.dataMatrixApp;
      if (app?.on) {
        switch (eventType) {
          case "dataMatrixSuccess":
            app.on.dataMatrixSuccess?.(payload);
            // Отправляем данные на сервер
            sendToApi(payload);
            break;
          case "dataMatrixError":
            app.on.dataMatrixError?.(payload);
            break;
          case "camAccessError":
            app.on.camAccessError?.(payload);
            break;
          case "camAccessSuccess":
            app.on.camAccessSuccess?.(payload);
            break;
          case "camStarting":
            app.on.camStarting?.();
            break;
          case "camStopped":
            app.on.camStopped?.();
            break;
        }
      }
    },
    [sendToApi],
  );

  return (
    <div className="app">
      <DataMatrixScanner
        onEvent={handleEvent}
        onLog={handleLog}
        videoVisible={videoVisible}
      />
      {window.dataMatrixApp?.config?.showConsole && (
        <div className="console-overlay">
          {logs.map((log, index) => (
            <div key={index} className={`console-line console-${log.type}`}>
              <span className="console-time">{log.time}</span>
              <span className="console-message">{log.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
