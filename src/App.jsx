import { useState, useCallback, useEffect, useRef } from "react";
import axios from "axios";
import DataMatrixScanner from "./components/DataMatrixScanner";
import "./App.css";

function App() {
  const [logs, setLogs] = useState([]);
  const cameraTrackRef = useRef(null);
  const cameraCapabilitiesRef = useRef(null);
  const currentZoomRef = useRef(null);
  const currentFocusDistanceRef = useRef(null);

  // Обработчик получения видеотрека от сканера
  const handleCameraTrackReady = useCallback((track) => {
    cameraTrackRef.current = track;
    const capabilities = track.getCapabilities();
    const settings = track.getSettings();
    cameraCapabilitiesRef.current = capabilities;
    const app = window.dataMatrixApp;
    app.on.camCapabilities?.(capabilities);

    // Инициализируем начальные значения
    if (capabilities.zoom) {
      currentZoomRef.current = settings.zoom ?? null;
    }
    if (capabilities.focusDistance) {
      currentFocusDistanceRef.current = settings.focusDistance ?? null;
    }

    handleLog("capabilities", capabilities);
    handleLog("initial-settings", {
      zoom: currentZoomRef.current,
      focusDistance: currentFocusDistanceRef.current,
    });
  }, []);

  // Регистрируем колбэки для глобального управления камерой
  useEffect(() => {
    if (window.dataMatrixApp) {
      // Управление зумом камеры через MediaStream API
      window.dataMatrixApp.setCameraZoom = async (percent, loop = false) => {
        const track = cameraTrackRef.current;
        const capabilities = cameraCapabilitiesRef.current;
        if (!track || !capabilities) return;

        try {
          // Проверяем поддержку зума камерой
          if (!capabilities.zoom) {
            handleLog(
              "camera-error",
              "Камера не поддерживает управление зумом",
            );
            console.warn("Камера не поддерживает управление зумом");
            return;
          }

          const minZoom = capabilities.zoom?.min || 1;
          const maxZoom = capabilities.zoom?.max || 1;
          const step = capabilities.zoom?.step || 0.1;
          const currentZoom = currentZoomRef.current ?? minZoom;

          // Вычисляем новый уровень зума
          let newZoom = currentZoom + (percent / 100) * (maxZoom - minZoom);

          // Округляем до шага
          newZoom = Math.round(newZoom / step) * step;

          // Зацикленность: если вышли за границы, переключаемся на противоположный конец
          if (loop) {
            if (newZoom > maxZoom) {
              newZoom = minZoom;
            } else if (newZoom < minZoom) {
              newZoom = maxZoom;
            }
          } else {
            newZoom = Math.max(minZoom, Math.min(maxZoom, newZoom));
          }

          // Сохраняем новое значение
          currentZoomRef.current = newZoom;

          handleLog("camera-zoom-changed", { newZoom, loop });

          await track.applyConstraints({
            advanced: [{ zoom: newZoom }],
          });
        } catch (err) {
          handleLog("camera-error", {
            message: "Ошибка управления зумом камеры",
            err,
          });
          console.error("Ошибка управления зумом камеры:", err);
        }
      };

      // Управление фокусом камеры через MediaStream API
      window.dataMatrixApp.setCameraFocus = async (percent, loop = false) => {
        const track = cameraTrackRef.current;
        const capabilities = cameraCapabilitiesRef.current;
        if (!track || !capabilities) return;

        try {
          // Проверяем поддержку фокуса камерой
          if (!capabilities.focusDistance) {
            handleLog(
              "camera-error",
              "Камера не поддерживает управление фокусом",
            );
            console.warn("Камера не поддерживает управление фокусом");
            return;
          }

          const minFocus = capabilities.focusDistance?.min || 0;
          const maxFocus = capabilities.focusDistance?.max || 1;
          const step = capabilities.focusDistance?.step || 0.01;

          if (percent !== 0) {
            const currentFocusDistance =
              currentFocusDistanceRef.current ?? minFocus;

            // Нормализуем значение от 0 до 1 в диапазон камеры
            let newFocus =
              currentFocusDistance + (percent / 100) * (maxFocus - minFocus);

            // Округляем до шага
            newFocus = Math.round(newFocus / step) * step;

            // Зацикленность: если вышли за границы, переключаемся на противоположный конец
            if (loop) {
              if (newFocus > maxFocus) {
                newFocus = minFocus;
              } else if (newFocus < minFocus) {
                newFocus = maxFocus;
              }
            } else {
              newFocus = Math.max(minFocus, Math.min(maxFocus, newFocus));
            }

            // Сохраняем новое значение
            currentFocusDistanceRef.current = newFocus;

            handleLog("camera-focus-changed", {
              currentFocusDistance,
              step,
              newFocus,
              minFocus,
              maxFocus,
              loop,
            });

            await track.applyConstraints({
              advanced: [
                {
                  focusMode: "manual",
                  focusDistance: newFocus,
                },
              ],
            });
          } else {
            // Автофокус - сбрасываем сохраненное значение
            currentFocusDistanceRef.current = null;
            handleLog("camera-focus-changed", "Автофокус");

            await track.applyConstraints({
              advanced: [
                {
                  focusMode: "continuous",
                },
              ],
            });
          }
        } catch (err) {
          handleLog("camera-error", {
            message: "Ошибка управления фокусом камеры",
            name: err.name,
            msg: err.message,
          });
          console.error("Ошибка управления фокусом камеры:", err);
        }
      };
    }
  }, []);

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
