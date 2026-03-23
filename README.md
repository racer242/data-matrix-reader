# DataMatrix Scanner

Сканер кодов маркировки "Честный знак" на основе библиотеки [@utrace/u-scanner](https://github.com/uTrace/u-scanner).

## Описание работы

Приложение сканирует DataMatrix коды через камеру устройства и отправляет распознанные данные на сервер для верификации.

### Принцип работы

1. **Инициализация** — при загрузке страницы инициализируется конфигурация `window.dataMatrixConfig` и глобальный JWT-токен `window.JWT`
2. **Запуск камеры** — сканер автоматически запрашивает доступ к камере и начинает сканирование
3. **Сканирование** — при обнаружении DataMatrix кода данные передаются в обработчик `dataMatrixSuccess`
4. **Отправка на сервер** — распознанные данные автоматически отправляются POST-запросом на `apiURL`
5. **Обновление JWT** — если сервер вернул новый токен, он сохраняется в `window.JWT` для последующих запросов

## Настройка

### Конфигурация (public/interface.js)

```javascript
// Конфигурация и управление через window.dataMatrixApp
window.dataMatrixApp = {
  config: {
    duplicateTimeout: 3000,  // Таймаут повторной обработки событий (мс)
    showConsole: false,      // Показывать отладочную консоль
    apiURL: '/response.json' // URL API для отправки данных
  },
  JWT: '',  // JWT токен для авторизации
  on: {     // Обработчики событий
    dataMatrixSuccess: function(codeData) { ... },
    dataMatrixError: function(error) { ... },
    // ... другие обработчики
  },
  activate: function() { ... },    // Запустить приложение
  deactivate: function() { ... },  // Остановить приложение
  restart: function() { ... }      // Перезапустить приложение
};

// Алиас для обратной совместимости
window.dataMatrixConfig = window.dataMatrixApp.config;
```

### Параметры конфигурации

| Параметр           | Тип     | По умолчанию     | Описание                                            |
| ------------------ | ------- | ---------------- | --------------------------------------------------- |
| `duplicateTimeout` | number  | 3000             | Таймаут повторной обработки одинаковых событий (мс) |
| `showConsole`      | boolean | false            | Показывать отладочную консоль поверх экрана         |
| `apiURL`           | string  | '/response.json' | URL сервера для отправки данных сканирования        |

### Глобальные переменные

| Переменная                    | Тип    | Описание                                     |
| ----------------------------- | ------ | -------------------------------------------- |
| `window.dataMatrixApp.JWT`    | string | JWT токен для авторизации запросов к серверу |
| `window.dataMatrixApp.config` | object | Конфигурация приложения                      |

## События и обработчики

### События камеры

#### camAccessSuccess(cameraData)

Вызывается при успешном доступе к камере.

**Параметры:**

- `cameraData` — данные камеры (объект CameraData из UScanner)

#### camAccessError(error)

Вызывается при ошибке доступа к камере.

**Параметры:**

- `error` — объект ошибки

#### camStarting()

Вызывается при начале запуска камеры.

#### camStopped()

Вызывается при остановке камеры.

### События сканирования

#### dataMatrixSuccess(codeData)

Вызывается при успешном считывании DataMatrix кода.

**Параметры:**

- `codeData` — данные кода:
  ```javascript
  {
    raw: string,        // Исходная строка кода
    code: string,       // Распарсенный код
    gtin: string,       // GTIN товара
    serial: string,     // Серийный номер
    cryptoTail: string, // Криптографический хвост
    // ... другие поля
  }
  ```

#### dataMatrixError(error)

Вызывается при ошибке считывания кода.

**Параметры:**

- `error` — объект ошибки

### События API

#### apiSuccess(response)

Вызывается при успешной отправке данных на сервер.

**Параметры:**

- `response` — ответ сервера (см. формат ниже)

#### apiError(error)

Вызывается при ошибке отправки данных.

**Параметры:**

- `error` — объект ошибки Axios

## Формат данных

### Запрос на сервер

Отправляется POST-запросом на `apiURL` в формате JSON:

```json
{
  "raw": "(01)04607624640022(21)ABC123(91)1234567890",
  "code": "ABC123",
  "gtin": "04607624640022",
  "serial": "ABC123"
}
```

**Заголовки:**

```
Content-Type: application/json
Authorization: Bearer <JWT>
```

### Ответ сервера (response.json)

```json
{
  "result": "OK",
  "errorText": "",
  "data": {},
  "JWT": "new-jwt-token-from-server"
}
```

| Поле        | Тип    | Описание                                |
| ----------- | ------ | --------------------------------------- |
| `result`    | string | Статус выполнения: `"OK"` или `"ERROR"` |
| `errorText` | string | Текст ошибки (пустой при успехе)        |
| `data`      | object | Дополнительные данные ответа            |
| `JWT`       | string | Новый JWT токен (опционально)           |

### Пример response.json

```json
{
  "result": "OK",
  "errorText": "",
  "data": {
    "productName": "Товар",
    "verified": true
  },
  "JWT": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Быстрый старт

### Установка зависимостей

```bash
npm install
```

### Запуск разработки

```bash
npm run dev
```

### Сборка

```bash
npm run build
```

## Интеграция

### Установка JWT токена

```javascript
// До инициализации сканера
window.dataMatrixApp.JWT = "your-jwt-token-here";
```

### Изменение API URL

```javascript
window.dataMatrixApp.config.apiURL = "https://your-api.com/scan";
```

### Отключение консоли

```javascript
window.dataMatrixApp.config.showConsole = false;
```

### Переопределение обработчиков событий

```javascript
// Переопределить обработчик dataMatrixSuccess
window.dataMatrixApp.on.dataMatrixSuccess = function (codeData) {
  console.log("Пользовательский обработчик:", codeData);
};

// Переопределить обработчик apiSuccess
window.dataMatrixApp.on.apiSuccess = function (response) {
  console.log("Ответ сервера:", response);
};
```

## Интеграция в другие проекты

Приложение подготовлено для интеграции в существующие страницы без конфликтов стилей и скриптов.

### Принцип работы

1. **При загрузке страницы** — приложение НЕ запускается автоматически, только инициализирует объект `window.dataMatrixApp`
2. **При вызове `activate()`** — приложение рендерится в элементе `#root`
3. **При вызове `deactivate()`** — приложение очищает контейнер и освобождает ресурсы

### Управление жизненным циклом

```javascript
// Активировать приложение (рендеринг)
window.dataMatrixApp.activate();

// Деактивировать приложение (очистка контейнера)
window.dataMatrixApp.deactivate();

// Перезапустить приложение
window.dataMatrixApp.restart();
```

### Пример интеграции в поп-ап

```html
<!-- Кнопка открытия сканера -->
<button onclick="openScanner()">Открыть сканер</button>

<!-- Контейнер для сканера (скрыт по умолчанию) -->
<div id="scanner-popup" style="display: none;">
  <div id="root"></div>
  <button onclick="closeScanner()">Закрыть</button>
</div>

<script>
  function openScanner() {
    // Настройка перед запуском
    window.dataMatrixApp.JWT = "your-jwt-token";
    window.dataMatrixApp.config.apiURL = "https://your-api.com/scan";

    // Показать поп-ап и активировать приложение
    document.getElementById("scanner-popup").style.display = "block";
    window.dataMatrixApp.activate();
  }

  function closeScanner() {
    // Деактивировать приложение и скрыть поп-ап
    window.dataMatrixApp.deactivate();
    document.getElementById("scanner-popup").style.display = "none";
  }
</script>
```

### Настройка перед активацией

```javascript
// Установить JWT токен
window.dataMatrixApp.JWT = "your-jwt-token";

// Настроить API URL
window.dataMatrixApp.config.apiURL = "https://your-api.com/scan";

// Включить консоль для отладки
window.dataMatrixApp.config.showConsole = true;

// После настройки вызвать активацию
window.dataMatrixApp.activate();
```

### Получение корневого элемента

Функция `window.dataMatrixApp.getAppRoot()` возвращает корневой элемент приложения:

```javascript
const rootElement = window.dataMatrixApp.getAppRoot();
// Возвращает document.getElementById('root')
```

### Динамическое добавление/удаление из DOM

Приложение автоматически определяет наличие элемента `#root` в DOM. При удалении элемента из DOM вызовите `deactivate()`, при добавлении — `activate()`.

```javascript
// Добавление в DOM
const container = document.createElement("div");
container.id = "root";
document.body.appendChild(container);
window.dataMatrixApp.activate();

// Удаление из DOM
window.dataMatrixApp.deactivate();
document.body.removeChild(container);
```

### Отключение автозапуска (для отладки)

В `index.html` добавлен скрипт автозапуска для отладки. Для интеграции в другие проекты удалите этот скрипт:

```html
<!-- Удалить этот блок -->
<script>
  window.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
      if (window.dataMatrixApp?.activate) {
        window.dataMatrixApp.activate();
      }
    }, 100);
  });
</script>
```

## Технологии

- **React 19** — UI библиотека
- **Vite** — Сборщик проекта
- **@utrace/u-scanner** — Библиотека сканирования DataMatrix
- **Axios** — HTTP клиент для отправки запросов

## Структура проекта

```
├── public/
│   ├── interface.js      # Конфигурация и обработчики
│   └── response.json     # JSON-заглушка для тестирования
├── src/
│   ├── App.jsx           # Основной компонент
│   ├── App.css           # Стили
│   └── components/
│       └── DataMatrixScanner.jsx  # Компонент сканера
└── package.json
```
