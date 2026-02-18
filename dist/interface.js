window.dataMatrixConfig = {
  /**
   * Таймаут повторной обработки одинаковых событий (мс)
   * По умолчанию 3000 мс (3 секунды)
   */
  duplicateTimeout: 3000,

  /**
   * Показывать консоль поверх экрана
   * По умолчанию true
   */
  showConsole: true,

  /**
   * Вызывается при ошибке доступа к камере (техническая ошибка)
   * @param {Error} error - объект ошибки
   */
  camAccessError: function (error) {
    console.log("camAccessError:", error);
  },

  /**
   * Вызывается при успешном доступе к камере
   * @param {Object} cameraData - данные камеры
   */
  camAccessSuccess: function (cameraData) {
    console.log("camAccessSuccess:", cameraData);
  },

  /**
   * Вызывается при начале запуска камеры
   */
  camStarting: function () {
    console.log("camStarting");
  },

  /**
   * Вызывается при остановке камеры
   */
  camStopped: function () {
    console.log("camStopped");
  },

  /**
   * Вызывается при успешном считывании DataMatrix кода
   * @param {Object} codeData - данные кода из UScanner
   */
  dataMatrixSuccess: function (codeData) {
    console.log("dataMatrixSuccess:", codeData);
  },

  /**
   * Вызывается при ошибке считывания кода
   * @param {Error} error - объект ошибки
   */
  dataMatrixError: function (error) {
    console.log("dataMatrixError:", error);
  },
};
