import { useState, useCallback } from "react";
import axios from "axios";
import DataMatrixScanner from "./components/DataMatrixScanner";
import "./App.css";

function App() {
  const [logs, setLogs] = useState([]);

  const sendToApi = useCallback(async (codeData) => {
    const config = window.dataMatrixConfig;
    if (!config?.apiURL) {
      return;
    }

    try {
      const headers = {
        "Content-Type": "application/json",
      };

      // Добавляем JWT токен в заголовок, если он есть
      if (config.JWT) {
        headers["Authorization"] = `Bearer ${config.JWT}`;
      }

      const response = await axios.post(config.apiURL, codeData, { headers });

      // Вызываем callback успешной отправки
      config.apiSuccess?.({
        result: "OK",
        errorText: "",
        data: response.data,
        JWT: config.JWT,
      });
    } catch (error) {
      // Вызываем callback ошибки отправки
      config.apiError?.({
        result: "ERROR",
        errorText: error.message,
        data: {},
        JWT: config.JWT,
      });
    }
  }, []);

  const handleEvent = useCallback((eventType, payload) => {
    // Вызываем внешние функции из window.dataMatrixConfig
    if (window.dataMatrixConfig) {
      switch (eventType) {
        case "dataMatrixSuccess":
          window.dataMatrixConfig.dataMatrixSuccess?.(payload);
          // Отправляем данные на сервер
          sendToApi(payload);
          break;
        case "dataMatrixError":
          window.dataMatrixConfig.dataMatrixError?.(payload);
          break;
        case "camAccessError":
          window.dataMatrixConfig.camAccessError?.(payload);
          break;
        case "camAccessSuccess":
          window.dataMatrixConfig.camAccessSuccess?.(payload);
          break;
        case "camStarting":
          window.dataMatrixConfig.camStarting?.();
          break;
        case "camStopped":
          window.dataMatrixConfig.camStopped?.();
          break;
      }
    }
  }, [sendToApi]);

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

  return (
    <div className="app">
      <DataMatrixScanner onEvent={handleEvent} onLog={handleLog} />
      {window.dataMatrixConfig?.showConsole && (
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
