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
    showConsole: true,

    /**
     * URL API для отправки данных сканирования
     * JSON-заглушка: /response.json
     */
    apiURL: "/response.json",

    /**
     * Остановить сканер после первого успешного сканирования
     * По умолчанию true
     */
    catchOnce: true,
  },

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
   * Изменить фокус камеры
   * @param step процентное значение от 1 до 100. Если 0 - переключить на автофокус
   */
  camFocus: function (step) {
    console.log("DataMatrix Scanner: camFocus() called");
    // Функция будет определена в main.jsx после загрузки модуля
  },

  /**
   * Изменить фокус камеры
   * @param step процентное значение от 0 до 100
   */
  camZoom: function (step) {
    console.log("DataMatrix Scanner: camZoom() called");
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
