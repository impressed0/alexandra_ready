# Cute Date — Koyeb + Neon 💗

Это версия сайта для бесплатного облака:

- frontend: HTML/CSS/JS;
- backend: Node.js + Express;
- база данных: Neon PostgreSQL;
- деплой: Koyeb;
- админка: `/admin.html`.

SQLite здесь больше не используется, поэтому ответы не должны пропадать после перезапуска сервера.

## 1. Локальный запуск

Установи Node.js 18 или новее.

```bash
npm install
```

Создай файл `.env` рядом с `server.js` и вставь туда:

```env
ADMIN_PASSWORD=мой-пароль
DATABASE_URL=postgresql://USER:PASSWORD@HOST/neondb?sslmode=require
PGSSLMODE=require
```

Потом:

```bash
npm start
```

Сайт:

```text
http://localhost:3000
```

Админка:

```text
http://localhost:3000/admin.html
```

## 2. Neon — база данных

1. Зайди на Neon.
2. Создай новый проект.
3. Нажми Connect.
4. Скопируй connection string.
5. Он должен выглядеть примерно так:

```text
postgresql://user:password@host/neondb?sslmode=require
```

Этот текст нужен как `DATABASE_URL`.

## 3. GitHub

Создай репозиторий на GitHub и отправь туда проект:

```bash
git init
git add .
git commit -m "cute date koyeb neon"
git branch -M main
git remote add origin https://github.com/USERNAME/cute-date-koyeb-neon.git
git push -u origin main
```

## 4. Koyeb — деплой сайта

На Koyeb создай Web Service из GitHub репозитория.

Настройки:

```text
Build Command: npm install
Run Command: npm start
```

Environment variables:

```text
ADMIN_PASSWORD=твой_секретный_пароль
DATABASE_URL=твой_neon_connection_string
PGSSLMODE=require
NODE_ENV=production
```

После деплоя Koyeb даст ссылку на сайт.

## 5. Проверка

Сайт:

```text
https://your-app.koyeb.app
```

Админка:

```text
https://your-app.koyeb.app/admin.html
```

Проверка backend:

```text
https://your-app.koyeb.app/api/health
```

Если `/api/health` показывает `ok: true`, значит backend и Neon база работают.

## 6. Пароль

Если ты не задашь `ADMIN_PASSWORD`, пароль будет:

```text
change-me
```

Но в облаке обязательно задай свой пароль.
