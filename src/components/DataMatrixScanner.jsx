import { useEffect, useRef, useState, useCallback } from "react";
import { UScanner } from "@utrace/u-scanner";

function DataMatrixScanner({
  onEvent,
  onLog,
  videoVisible = true,
  config = {},
  onCameraTrackReady,
}) {
  const videoRef = useRef(null);
  const uscannerRef = useRef(null);
  const [isReady, setIsReady] = useState(false);
  const [isUIHidden, setIsUIHidden] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const onEventRef = useRef(onEvent);
  const onLogRef = useRef(onLog);
  const onCameraTrackReadyRef = useRef(onCameraTrackReady);

  // Реф для отслеживания последних событий
  const lastEventRef = useRef({ key: null, timestamp: 0 });

  // Обновляем refs при изменении пропсов
  useEffect(() => {
    onEventRef.current = onEvent;
    onLogRef.current = onLog;
    onCameraTrackReadyRef.current = onCameraTrackReady;
  }, [onEvent, onLog, onCameraTrackReady]);

  // Сообщаем наружу о готовности видеотрека
  const emitCameraTrack = useCallback(() => {
    const video = videoRef.current;
    if (video?.srcObject && onCameraTrackReadyRef.current) {
      const tracks = video.srcObject.getVideoTracks();
      if (tracks.length > 0) {
        onCameraTrackReadyRef.current(tracks[0]);
      }
    }
  }, []);

  useEffect(() => {
    const initScanner = async () => {
      if (!videoRef.current) {
        return;
      }

      const duplicateTimeout = config?.duplicateTimeout ?? 3000;
      const catchOnce = config?.catchOnce !== false;

      try {
        const scanner = new UScanner({
          videoOutput: videoRef.current,
        });

        uscannerRef.current = scanner;

        // Событие успешного сканирования
        scanner.on("scan-success", ({ codeData }) => {
          const key = "success:" + JSON.stringify(codeData);
          const now = Date.now();

          if (
            lastEventRef.current.key === key &&
            now - lastEventRef.current.timestamp < duplicateTimeout
          ) {
            return;
          }
          lastEventRef.current = { key, timestamp: now };

          onEventRef.current?.("dataMatrixSuccess", codeData);
          onLogRef.current?.("scan-success", codeData);

          if (catchOnce) {
            scanner.stop();
          }
        });

        // Ошибка в процессе сканирования
        scanner.on("scan-error", ({ error }) => {
          if (
            !error ||
            (typeof error === "object" && Object.keys(error).length === 0)
          ) {
            return;
          }

          const key = "error:" + (error.message || error.toString());
          const now = Date.now();

          if (
            lastEventRef.current.key === key &&
            now - lastEventRef.current.timestamp < duplicateTimeout
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
          setIsReady(true);
          setIsScanning(true);
          // Сообщаем о готовности трека
          setTimeout(emitCameraTrack, 0);
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
          onLogRef.current?.("zoom-changed", { value });
        });

        // Включение/выключение вспышки
        scanner.on("flash-toggle", ({ value }) => {
          onLogRef.current?.("flash-toggle", { value });
        });

        // Запуск сканера
        await scanner.start;
      } catch (err) {
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
  }, [config, emitCameraTrack]);

  useEffect(() => {
    const applyStyle = () => {
      const host = document.querySelector("scanner-ui");

      if (host && host.shadowRoot) {
        const style = document.createElement("style");
        style.textContent = `
        .u-scanner-ui__watermark, .u-scanner-ui__control-panel { 
          display: none !important;
        }
      `;
        host.shadowRoot.appendChild(style);
        setIsUIHidden(true);
        return true;
      }
      return false;
    };

    if (!applyStyle()) {
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
