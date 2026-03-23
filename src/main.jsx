import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// Инициализация приложения
const initApp = () => {
  const rootElement = window.getAppRoot?.();
  if (!rootElement) {
    console.error("DataMatrix Scanner: корневой элемент #root не найден в DOM");
    return null;
  }

  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );

  return root;
};

// Храним экземпляр root
let appRoot = null;

// Попытка инициализации при загрузке
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    appRoot = initApp();
  });
} else {
  appRoot = initApp();
}

// Экспорт для внешнего управления
window.dataMatrixApp = {
  /**
   * Активировать приложение (рендеринг)
   */
  activate: () => {
    if (!appRoot) {
      appRoot = initApp();
    }
  },

  /**
   * Деактивировать приложение (очистка контейнера)
   */
  deactivate: () => {
    const rootElement = window.getAppRoot?.();
    if (rootElement) {
      rootElement.innerHTML = "";
    }
    appRoot = null;
  },

  /**
   * Перезапустить приложение
   */
  restart: () => {
    window.dataMatrixApp.deactivate();
    setTimeout(window.dataMatrixApp.activate, 0);
  },
};
