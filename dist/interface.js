/**
 * Глобальный объект приложения DataMatrix Scanner
 * Предоставляет API для управления жизненным циклом и конфигурацией
 */
window.dataMatrixApp = {
  /**
   * Корневой элемент приложения
   */
  root: null,

  /**
   * Конфигурация приложения
   */
  config: {
    /**
     * Таймаут повторной обработки одинаковых событий (мс)
     * По умолчанию 3000 мс (3 секунды)
     */
    duplicateTimeout: 3000,

    /**
     * Показывать консоль поверх экрана
     * По умолчанию false
     */
    showConsole: false,

    /**
     * URL API для отправки данных сканирования
     * JSON-заглушка: /response.json
     */
    apiURL: "/response.json",
  },

  /**
   * Глобальный JWT токен для авторизации запросов
   */
  JWT: "",

  /**
   * Возвращает корневой элемент для рендеринга приложения
   * @returns {HTMLElement|null} Элемент с id="root"
   */
  getAppRoot: function () {
    return document.getElementById("root");
  },

  /**
   * Активировать приложение (рендеринг)
   */
  activate: function () {
    console.log("DataMatrix Scanner: activate() called");
    // Функция будет определена в main.jsx после загрузки модуля
  },

  /**
   * Деактивировать приложение (очистка контейнера)
   */
  deactivate: function () {
    console.log("DataMatrix Scanner: deactivate() called");
    // Функция будет определена в main.jsx после загрузки модуля
  },

  /**
   * Перезапустить приложение
   */
  restart: function () {
    console.log("DataMatrix Scanner: restart() called");
    // Функция будет определена в main.jsx после загрузки модуля
  },

  /**
   * Обработчики событий (заглушки, будут заменены в main.jsx)
   */
  on: {
    camAccessError: function (error) {
      console.log("camAccessError:", error);
    },
    camAccessSuccess: function (cameraData) {
      console.log("camAccessSuccess:", cameraData);
    },
    camStarting: function () {
      console.log("camStarting");
    },
    camStopped: function () {
      console.log("camStopped");
    },
    dataMatrixSuccess: function (codeData) {
      console.log("dataMatrixSuccess:", codeData);
    },
    dataMatrixError: function (error) {
      console.log("dataMatrixError:", error);
    },
    apiSuccess: function (response) {
      console.log("apiSuccess:", response);
    },
    apiError: function (error) {
      console.log("apiError:", error);
    },
  },
};

/**
 * Глобальный JWT токен для авторизации запросов
 */
window.JWT = "";

// Алиас для обратной совместимости
window.dataMatrixConfig = window.dataMatrixApp.config;
