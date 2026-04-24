import { useEffect, useRef, useState } from "react";
import { UScanner } from "@utrace/u-scanner";

function DataMatrixScanner({ onEvent, onLog, videoVisible = true }) {
  const videoRef = useRef(null);
  const uscannerRef = useRef(null);
  const zoomLevelRef = useRef(1);
  const [isReady, setIsReady] = useState(false);
  const [isUIHidden, setIsUIHidden] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const onEventRef = useRef(onEvent);
  const onLogRef = useRef(onLog);

  // Реф для отслеживания последних событий
  const lastEventRef = useRef({ key: null, timestamp: 0 });

  // Обновляем ref при изменении onEvent и onLog
  useEffect(() => {
    onEventRef.current = onEvent;
    onLogRef.current = onLog;
  }, [onEvent, onLog]);

  useEffect(() => {
    const initScanner = async () => {
      if (!videoRef.current) {
        return;
      }

      try {
        const scanner = new UScanner({
          videoOutput: videoRef.current,
        });

        uscannerRef.current = scanner;

        // Событие успешного сканирования
        scanner.on("scan-success", ({ codeData }) => {
          const key = "success:" + JSON.stringify(codeData);
          const now = Date.now();
          const timeout =
            window.dataMatrixApp?.config?.duplicateTimeout || 3000;

          // Пропускаем дубликат в пределах таймаута
          if (
            lastEventRef.current.key === key &&
            now - lastEventRef.current.timestamp < timeout
          ) {
            return;
          }
          lastEventRef.current = { key, timestamp: now };

          onEventRef.current?.("dataMatrixSuccess", codeData);
          onLogRef.current?.("scan-success", codeData);

          // Остановить сканер после первого успешного сканирования
          if (window.dataMatrixApp?.config?.catchOnce !== false) {
            scanner.stop();
          }
        });

        // Ошибка в процессе сканирования (не останавливает сканирование)
        scanner.on("scan-error", ({ error }) => {
          // Игнорируем пустые объекты ошибок
          if (
            !error ||
            (typeof error === "object" && Object.keys(error).length === 0)
          ) {
            return;
          }

          const key = "error:" + (error.message || error.toString());
          const now = Date.now();
          const timeout =
            window.dataMatrixApp?.config?.duplicateTimeout || 3000;

          // Пропускаем дубликат в пределах таймаута
          if (
            lastEventRef.current.key === key &&
            now - lastEventRef.current.timestamp < timeout
          ) {
            return;
          }
          lastEventRef.current = { key, timestamp: now };

          onEventRef.current?.("dataMatrixError", error);
          onLogRef.current?.("scan-error", error);
        });

        // Ошибка запуска сканера
        scanner.on("scanner-start-error", (event) => {
          onEventRef.current?.("camAccessError", event);
          onLogRef.current?.("scanner-start-error", event);
        });

        // Сканер успешно запущен
        scanner.on("scanner-started", ({ cameraData, scanEngine }) => {
          onEventRef.current?.("camAccessSuccess", cameraData);
          onLogRef.current?.("scanner-started", { cameraData, scanEngine });
          // Сохраняем объект камеры для управления зумом
          if (cameraData?.camera) {
            uscannerRef.current._camera = cameraData.camera;
          }
          setIsReady(true);
          setIsScanning(true);
        });

        // Сканер начинает запуск
        scanner.on("scanner-starting", () => {
          onEventRef.current?.("camStarting");
          onLogRef.current?.("scanner-starting");
          setIsReady(false);
        });

        // Сканер остановлен
        scanner.on("scanner-stopped", () => {
          onEventRef.current?.("camStopped");
          onLogRef.current?.("scanner-stopped");
          setIsScanning(false);
        });

        // Изменение региона захвата кода
        scanner.on("scan-region-changed", ({ value }) => {
          onLogRef.current?.("scan-region-changed", { value });
        });

        // Изменение зума
        scanner.on("zoom-changed", ({ value }) => {
          zoomLevelRef.current = value;
          onLogRef.current?.("zoom-changed", { value });
        });

        // Включение/выключение вспышки
        scanner.on("flash-toggle", ({ value }) => {
          onLogRef.current?.("flash-toggle", { value });
        });

        // Запуск сканера
        await scanner.start;
      } catch (err) {
        // Обработка ошибок инициализации
        onLogRef.current?.("init-error", err);
        onEventRef.current?.("camAccessError", err);
      }
    };

    initScanner();

    return () => {
      if (uscannerRef.current) {
        uscannerRef.current.destroy();
        uscannerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const applyStyle = () => {
      // Ищем элемент по тегу
      const host = document.querySelector("scanner-ui");

      if (host && host.shadowRoot) {
        const style = document.createElement("style");
        style.textContent = `
        /* :host выбирает сам корень scanner-ui внутри shadow dom */
        .u-scanner-ui__watermark, .u-scanner-ui__control-panel { 
          display: none !important;
        }
      `;
        host.shadowRoot.appendChild(style);
        setIsUIHidden(true);
        return true; // Стиль применен
      }
      return false;
    };

    // Пробуем применить сразу
    if (!applyStyle()) {
      // Если элемента еще нет, проверяем каждые 500мс (на случай долгой загрузки)
      const interval = setInterval(() => {
        if (applyStyle()) clearInterval(interval);
      }, 500);
      return () => clearInterval(interval);
    }
  }, []);

  return (
    <div
      className="scanner-container"
      style={{
        visibility:
          isReady && isUIHidden && videoVisible ? "visible" : "hidden",
      }}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="scanner-video"
      ></video>
    </div>
  );
}

export default DataMatrixScanner;
