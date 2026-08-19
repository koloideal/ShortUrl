# Контракт API

Все запросы и ответы — `application/json; charset=utf-8`, кроме перехода по короткой ссылке.

## Ручки

| Метод | Путь | Назначение |
| --- | --- | --- |
| `GET` | `/` | Главная страница (`static/index.html`) |
| `POST` | `/api/links` | Создание короткой ссылки |
| `GET` | `/<code>` | Переход на исходный адрес |
| `GET` | `/health` | Healthcheck |

## POST /api/links

### Запрос

```json
{
  "url": "https://example.com/some/long/path"
}
```

Требования к полю `url`:

- обязательное;
- строка;
- схема только `http` или `https`;
- непустой хост.

### Ответ

```http
201 Created
```

```json
{
  "code": "aB3xYz",
  "short_url": "http://localhost:8000/aB3xYz",
  "target_url": "https://example.com/some/long/path"
}
```

| Поле | Тип | Описание |
| --- | --- | --- |
| `code` | string | Короткий идентификатор ссылки |
| `short_url` | string | Абсолютный `http`/`https` адрес короткой ссылки |
| `target_url` | string | Исходный адрес |

## GET /`<code>`

```http
302 Found
Location: https://example.com/some/long/path
```

Если код не найден — `404` с телом в формате ошибки.

## GET /health

```http
200 OK
```

```json
{
  "status": "ok"
}
```

## Формат ошибок

Все ошибки возвращаются в одном виде:

```json
{
  "error": {
    "code": "invalid_url",
    "message": "Введите корректный URL с протоколом http или https"
  }
}
```

`code` — машинно-читаемый идентификатор, `message` — текст для человека.

| HTTP | `error.code` | Когда возникает |
| --- | --- | --- |
| `400` | `invalid_json` | Тело запроса не является корректным JSON |
| `422` | `invalid_url` | Поле `url` отсутствует или не прошло валидацию |
| `429` | `rate_limit_exceeded` | Превышен лимит запросов |
| `404` | `not_found` | Ручка или короткий код не найдены |
| `500` | `internal_error` | Внутренняя ошибка сервиса |
