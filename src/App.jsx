import { useState, useCallback, useEffect, useRef } from "react";
import axios from "axios";
import DataMatrixScanner from "./components/DataMatrixScanner";
import "./App.css";

function App() {
  const [logs, setLogs] = useState([]);
  const [videoVisible, setVideoVisible] = useState(true);
  const cameraTrackRef = useRef(null);

  // Обработчик получения видеотрека от сканера
  const handleCameraTrackReady = useCallback((track) => {
    cameraTrackRef.current = track;
  }, []);

  // Регистрируем колбэки для глобального управления
  useEffect(() => {
    if (window.dataMatrixApp) {
      // Управление видимостью видео
      window.dataMatrixApp.setVideoVisible = (value) => {
        setVideoVisible(typeof value === "boolean" ? value : !videoVisible);
      };

      Object.defineProperty(window.dataMatrixApp, "videoVisible", {
        get: () => videoVisible,
        configurable: true,
      });

      // Управление зумом камеры через MediaStream API
      window.dataMatrixApp.setCameraZoom = async (percent) => {
        const track = cameraTrackRef.current;
        if (!track) return;

        try {
          const capabilities = track.getCapabilities();
          const settings = track.getSettings();

          // Проверяем поддержку зума камерой
          if (!capabilities.zoom) {
            console.warn("Камера не поддерживает управление зумом");
            return;
          }

          const currentZoom = settings.zoom || 1;
          const minZoom = capabilities.zoom?.min || 1;
          const maxZoom = capabilities.zoom?.max || 1;
          const step = capabilities.zoom?.step || 0.1;

          // Вычисляем новый уровень зума
          let newZoom = currentZoom + (percent / 100) * (maxZoom - minZoom);
          newZoom = Math.max(minZoom, Math.min(maxZoom, newZoom));

          // Округляем до шага
          newZoom = Math.round(newZoom / step) * step;

          await track.applyConstraints({
            advanced: [{ zoom: newZoom }],
          });
        } catch (err) {
          console.error("Ошибка управления зумом камеры:", err);
        }
      };
    }
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

        if (window.getJWT) {
          headers["JWT"] = window.getJWT();
        } else if (window.JWT) {
          headers["JWT"] = window.JWT;
        }

        const response = await axios.post(app.config.apiURL, codeData, {
          headers,
        });

        if (response.data?.JWT) {
          if (window.setJWT) {
            window.setJWT(response.data.JWT);
          } else {
            window.JWT = response.data.JWT;
          }
        }

        handleLog("api-success", response.data);
        app.on.apiSuccess?.(response.data);
      } catch (error) {
        handleLog("api-error", error.message);
        app.on.apiError?.(error);
      }
    },
    [handleLog],
  );

  const handleEvent = useCallback(
    (eventType, payload) => {
      const app = window.dataMatrixApp;
      if (app?.on) {
        switch (eventType) {
          case "dataMatrixSuccess":
            app.on.dataMatrixSuccess?.(payload);
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

  const config = window.dataMatrixApp?.config || {};

  return (
    <div className="app">
      <DataMatrixScanner
        onEvent={handleEvent}
        onLog={handleLog}
        videoVisible={videoVisible}
        config={config}
        onCameraTrackReady={handleCameraTrackReady}
      />
      {config.showConsole && (
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
