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
window.dataMatrixConfig = {
  // Таймаут повторной обработки одинаковых событий (мс)
  duplicateTimeout: 3000,
  
  // Показывать консоль поверх экрана
  showConsole: false,
  
  // URL API для отправки данных
  apiURL: '/response.json',
};

// Глобальный JWT токен
window.JWT = '';
```

### Параметры конфигурации

| Параметр | Тип | По умолчанию | Описание |
|----------|-----|--------------|----------|
| `duplicateTimeout` | number | 3000 | Таймаут повторной обработки одинаковых событий (мс) |
| `showConsole` | boolean | false | Показывать отладочную консоль поверх экрана |
| `apiURL` | string | '/response.json' | URL сервера для отправки данных сканирования |

### Глобальные переменные

| Переменная | Тип | Описание |
|------------|-----|----------|
| `window.JWT` | string | JWT токен для авторизации запросов к серверу |

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

| Поле | Тип | Описание |
|------|-----|----------|
| `result` | string | Статус выполнения: `"OK"` или `"ERROR"` |
| `errorText` | string | Текст ошибки (пустой при успехе) |
| `data` | object | Дополнительные данные ответа |
| `JWT` | string | Новый JWT токен (опционально) |

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
window.JWT = 'your-jwt-token-here';
```

### Изменение API URL

```javascript
window.dataMatrixConfig.apiURL = 'https://your-api.com/scan';
```

### Отключение консоли

```javascript
window.dataMatrixConfig.showConsole = false;
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
