# SOS Map — Backend API Hujjati

Bazaviy URL: `http://localhost:5000`

## Autentifikatsiya

- **Access token** — `Authorization: Bearer <token>` header orqali. Muddati: 15 daqiqa.
- **Refresh token** — `httpOnly` cookie (`refreshToken`) orqali. Muddati: 7 kun.
- Login/register'da ikkala token javobga cookie sifatida qo'shiladi.
- Refresh token DB'da saqlanadi va har ishlatilganda **rotatsiya** qilinadi (eskisi revoke bo'ladi).
- Parollar `bcrypt` 12 round bilan hashlangan.

### Cookie parametrlari
- `refreshToken` — httpOnly, path `/`, maxAge 7 kun, secure (production'da).

---

## 1. Auth

### POST /api/auth/register
Yangi foydalanuvchi ro'yxatdan o'tadi. Access + refresh cookie qaytadi.

**Body (multipart yoki JSON):**
```json
{
  "fullName": "Ali Valiyev",
  "phone": "+998901234567",
  "email": "ali@gmail.com",
  "password": "secret123"
}
```
**201** — foydalanuvchi + cookie
```json
{
  "success": true,
  "message": "Foydalanuvchi yaratildi",
  "data": { "id": 1, "fullName": "Ali Valiyev", "phone": "...", "email": "...", "avatarUrl": null }
}
```
**409** — email yoki telefon band.

### POST /api/auth/login
Foydalanuvchi kirishi. Cookie qaytadi.

**Body:** `{ "email": "...", "password": "..." }`
**200** — user + cookie
**401** — noto'g'ri parol / topilmadi.

### POST /api/auth/admin/login
Admin kirishi. Cookie qaytadi.

**Body:** `{ "email": "...", "password": "..." }`
**200** — admin + cookie
**401** — noto'g'ri.

### POST /api/auth/refresh
Refresh token rotatsiyasi. Cookie'dan refresh olinadi, yangi access + yangi refresh qaytadi.

**200** — yangi cookie + `{ accessToken }`
**401** — yaroqsiz / revoke bo'lgan.

### POST /api/auth/logout
Chiqish. Refresh tokenni revoke qiladi, cookielarni o'chiradi.

**200** — `{ "message": "Chiqildi" }`

### GET /api/auth/me
Joriy foydalanuvchi ma'lumotlari (access token kerak).

**200** — user / admin
**401** — token yo'q/yaroqsiz.

---

## 2. SOS

### POST /api/sos
Yangi SOS chaqiruv. **auth kerak** (user). Rasmlar `multipart/form-data`.

**Form fields:**
- `latitude` (float, kerak)
- `longitude` (float, kerak)
- `address` (string, ixtiyoriy)
- `description` (string, kerak)
- `category` — `MEDICAL | FIRE | ACCIDENT | CRIME | OTHER`
- `photos` (fayllar, ko'p bo'lishi mumkin)

**201** — SOS yaratildi. AI avtomatik `ANALYZING` holatida analiz qiladi va `aiScore`, `aiSummary`, `severity` ni yangilaydi.
```json
{
  "success": true,
  "data": {
    "id": "...", "category": "MEDICAL", "severity": "HIGH",
    "status": "NEW", "latitude": 41.31, "longitude": 69.24,
    "address": "Toshkent", "description": "...",
    "photos": ["/uploads/1.jpg"], "aiScore": 85, "aiSummary": "...",
    "createdAt": "..."
  }
}
```

### GET /api/sos
Admin: barcha SOS ro'yxati. **admin kerak**.

**Query:** `status`, `category`, `severity`, `page`, `limit`, `search`
**200** — `{ items: [...], total, page, limit }`

### GET /api/sos/:id
Bitta SOS tafsiloti. **auth kerak** (egalik yoki admin).

**200** — SOS + assignments + aiLogs
**404** — topilmadi.

### PATCH /api/sos/:id
Statusni o'zgartirish. **admin kerak**.

**Body:** `{ "status": "PROCESSING" }` — `NEW | PROCESSING | RESOLVED | CANCELLED`
**200** — yangilangan SOS.

### POST /api/sos/:id/assign
SOS'ga yordam (Assignment) yaratish. **admin kerak**.

**Body:** `{ "action": "Tez yordam yuborildi", "note": "..." }`
**201** — Assignment yaratildi, SOS `PROCESSING` bo'ladi.

### POST /api/sos/:id/analyze
AI bilan og'irlikni qayta analiz qilish. **admin kerak**.

**200** — `{ severity, aiScore, aiSummary }` (Groq AI).

### DELETE /api/sos/:id
SOS'ni o'chirish. **admin kerak**.

**200** — o'chirildi.

---

## 3. AI (auto-dispatch)

### 2-daqiqa qoidasi
Yangi `NEW` holatdagi SOS 2 daqiqa ichida admin qabul qilmasa, AI avtomatik yordam yuboradi:
- `status` → `AUTO_DISPATCHED`
- `AiLog` ga `AUTO_DISPATCH` yoziladi (details: nimaga yuborildi).
- Agar SOS `RESOLVED` yoki `CANCELLED` bo'lsa, auto-dispatch to'xtaydi.

### GET /api/ai-logs
Admin: barcha AI kundaliklari. **admin kerak**.

**Query:** `page`, `limit`, `sosRequestId`
**200** — `{ items, total }`

---

## 4. Messages (Contact)

### POST /api/messages
Contact sahifasidan xabar. Ochiq (auth kerak emas).

**Body:** `{ "name", "email", "phone", "subject", "text" }`
**201** — xabar saqlandi.

### GET /api/messages
Admin: xabarlar ro'yxati. **admin kerak**.

**Query:** `isRead`, `page`, `limit`
**200** — `{ items, total }`

### PATCH /api/messages/:id
O'qilgan deb belgilash. **admin kerak**.

**Body:** `{ "isRead": true }`
**200** — yangilangan.

---

## 5. Assignments

### GET /api/assignments
Admin: barcha yordam yuborishlar. **admin kerak**.

**Query:** `page`, `limit`, `status`
**200** — `{ items, total }`

### GET /api/assignments/:id
Bitta assignment. **admin kerak**.
**200** / **404**

---

## 6. Stats (Dashboard)

### GET /api/stats
Admin: statistika. **admin kerak**.

**200**
```json
{
  "totalSos": 120,
  "byStatus": { "NEW": 5, "PROCESSING": 10, "RESOLVED": 100, "AUTO_DISPATCHED": 3, "CANCELLED": 2 },
  "byCategory": { "MEDICAL": 40, "FIRE": 10, "ACCIDENT": 20, "CRIME": 30, "OTHER": 20 },
  "bySeverity": { "LOW": 30, "MEDIUM": 40, "HIGH": 30, "CRITICAL": 20 },
  "totalMessages": 15,
  "recentSos": [ { "id": "...", "category": "...", "status": "...", "createdAt": "..." } ],
  "avgResponseMinutes": 1.5
}
```

---

## 7. Upload

### Rasmlar
- `POST /api/sos` orqali `photos` fayllari `uploads/` papkasiga saqlanadi.
- Statik: `GET /uploads/:filename` — rasmni ko'rish.

---

## Swagger
Barcha API'lar `http://localhost:5000/api-docs` da Swagger UI orqali ko'rinadi.
