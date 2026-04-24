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
 * Управление зумом камеры
 * @param {number} value - положительное значение для приближения, отрицательное для удаления
 */
window.dataMatrixApp.camZoom = (value) => {
  const app = window.dataMatrixApp;
  if (app?.setCameraZoom && typeof value === "number") {
    app.setCameraZoom(value);
  }
};

/**
 * Управление фокусом камеры
 * @param {number} focusDistance - расстояние фокуса от 0 до 1
 */
window.dataMatrixApp.camFocus = (focusDistance) => {
  const app = window.dataMatrixApp;
  if (app?.setCameraFocus && typeof focusDistance === "number") {
    app.setCameraFocus(focusDistance);
  }
};

// Экспорт для внешнего использования (опционально)
export { initApp };
