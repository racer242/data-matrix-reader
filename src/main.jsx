import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// Внутренняя переменная для хранения экземпляра root
let appRoot = null;

// Инициализируем глобальный объект, если еще не создан
window.dataMatrixApp = window.dataMatrixApp || {};

/**
 * Инициализация приложения
 * @returns {object|null} Экземпляр root или null при ошибке
 */
const initApp = () => {
  const rootElement = window.dataMatrixApp?.getAppRoot?.();
  if (!rootElement) {
    console.error("DataMatrix Scanner: корневой элемент #root не найден в DOM");
    return null;
  }

  // Очищаем контейнер перед рендерингом
  rootElement.innerHTML = "";

  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );

  appRoot = root;
  return root;
};

/**
 * Активировать приложение (рендеринг)
 */
window.dataMatrixApp.activate = () => {
  if (!appRoot) {
    initApp();
  }
};

/**
 * Деактивировать приложение (очистка контейнера)
 */
window.dataMatrixApp.deactivate = () => {
  appRoot.unmount();
  const rootElement = window.dataMatrixApp?.getAppRoot?.();
  if (rootElement) {
    rootElement.innerHTML = "";
  }
  appRoot = null;
};

/**
 * Перезапустить приложение
 */
window.dataMatrixApp.restart = () => {
  window.dataMatrixApp.deactivate();
  setTimeout(window.dataMatrixApp.activate, 0);
};

/**
 * тест камеры - управляет видимостью видео и зумом камеры
 * @param {boolean|object} [options] - параметры:
 *   - boolean: переключает видимость
 *   - object: { visible?: boolean, zoom?: number }
 */
window.dataMatrixApp.camTest = (options) => {
  const app = window.dataMatrixApp;
  if (!app) return;

  // Управление видимостью
  if (typeof options === "boolean") {
    app.setVideoVisible?.(options);
  } else if (typeof options === "object") {
    if ("visible" in options) {
      app.setVideoVisible?.(options.visible);
    }
    // Управление зумом (приближение на указанный процент)
    if ("zoom" in options && app.setCameraZoom) {
      app.setCameraZoom(options.zoom);
    }
  } else {
    // Переключаем текущее состояние видимости
    app.setVideoVisible?.(!app.videoVisible);
  }
};

// Экспорт для внешнего использования (опционально)
export { initApp };
