# SOS Map — Backend

Favqulodda yordam platformasi backend: Express + PostgreSQL + Prisma + JWT + Groq AI.

## Ishga tushirish

```bash
cd backend
cp .env.example .env     # .env ichiga haqiqiy qiymatlarni yozing
npm install
npx prisma migrate dev
node prisma/seed.js       # admin yaratish
npm run dev               # yoki npm start
```

## Muhim ma'lumotlar

- **Admin kirish:** `admin@sosmap.uz` / `admin1234` (seed yaratadi)
- **Swagger UI:** `http://localhost:5000/api-docs`
- **Hujjat:** `docs/API.md`

## Imkoniyatlar

- **Auth:** JWT access token (15 daqiqa) + refresh token (7 kun, httpOnly cookie, rotatsiya bilan). Parollar bcrypt 12 round.
- **SOS:** rasm upload, joylashuv, kategoriya, AI og'irlik bahosi (Groq vision model), statuslar.
- **AI:** `POST /api/sos` — AI matn/rasmni analiz qilib `severity`, `aiScore`, `aiSummary` beradi.
- **2-daqiqa qoidasi:** admin 2 daqiqada qabul qilmasa, AI avtomatik yordam yuboradi (`AUTO_DISPATCHED`).
- **Admin panel API:** SOS ro'yxati, stats, assignments, ai-logs, messages.

## Tuzilma

```
src/
├── server.js            # Server class — bootstrap
├── app.js               # Express app
├── config/              # AppConfig (env), prisma
├── middlewares/         # auth, adminOnly, validate, errorHandler
├── services/            # auth, token, ai, sos, autoDispatch, upload
├── controllers/
├── routes/
├── validations/         # Zod schema
├── docs/swagger.js
```

## API (qisqacha)

| Metod | Route | Izoh |
|---|---|---|
| POST | /api/auth/register | Ro'yxatdan o'tish |
| POST | /api/auth/login | Kirish (user) |
| POST | /api/auth/admin/login | Kirish (admin) |
| POST | /api/auth/refresh | Token rotatsiya |
| POST | /api/auth/logout | Chiqish |
| GET | /api/auth/me | Joriy user/admin |
| POST | /api/sos | SOS yaratish (+ rasm, AI analiz) |
| GET | /api/sos | SOS ro'yxati (admin, filter) |
| GET | /api/sos/:id | Tafsilot |
| PATCH | /api/sos/:id | Status o'zgartirish (admin) |
| POST | /api/sos/:id/assign | Yordam yuborish (admin) |
| POST | /api/sos/:id/analyze | AI qayta analiz (admin) |
| DELETE | /api/sos/:id | O'chirish (admin) |
| POST | /api/messages | Contact xabari (ochiq) |
| GET | /api/messages | Xabarlar (admin) |
| PATCH | /api/messages/:id | O'qilgan deb belgilash |
| GET | /api/assignments | Yordamlar (admin) |
| GET | /api/stats | Dashboard stats (admin) |
| GET | /api/ai-logs | AI kundalik (admin) |
