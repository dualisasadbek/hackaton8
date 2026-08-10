# SOS Map — Frontend AI Prompt

Bu promptni boshqa AI'ga berib, frontendni shu backend bilan 100% ishlaydigan qilib qurishini so'rang.

---

## LOYIHA HAQIDA

Siz "SOS Map" deb nomlangan favqulodda yordam platformasining frontendini qurasiz. Bu hackathon loyihasi. Platforma foydalanuvchiga bir tugma bilan SOS yuborish, joylashuvini avtomatik yuborish, AI orqali vaziyat og'irligini baholash va admin panel orqali yordam yuborish imkonini beradi.

Backend TAYYOR va ishlaydi. Siz faqat frontendni qurasiz. Barcha API'lar quyida.

## TEXNOLOGIYA

- React + Vite (mavjud `frontend/` papkasi)
- Vite proxy: `/api` → `http://localhost:5000` (CORS cookie uchun)
- Axios yoki fetch (cookie `credentials: 'include'` bilan!)
- React Router (sahifalar uchun)
- Ikonkalar: lucide-react yoki heroicons

## DIZAYN (JUDA MUHIM — hakamlar hayratda qolishi kerak)

- **Asosiy rang: `#FFFFE0`** (och sariq/krem) — barcha fonlarda
- Minimalistik, toza, iliq (warm) uslub
- **Blur/glassmorphism effektlari KO'P bo'ladi** — oynali (glass) kartalar, `backdrop-filter: blur()`, yarim shaffof oq/sariq fonlar
- Yumaloq burchaklar, silliq animatsiyalar, hover effektlari
- Ikonkalar ko'p ishlatiladi
- **Kok yashil (blue/green) asosiy rang bo'lmaydi** — asosiy #FFFFE0, aksent sifatida iliq to'q sariq/amber tonlari
- Katta, o'qish oson shriftlar, ko'p white-space
- Har sahifa bir-biridan ajralib turishi kerak, zerikarli shablon emas
- Yengil "neon-ish" sariq blur glow'lar, yumshoq gradientlar

## SAHIFALAR (7 ta)

1. **Landing / Hero** — "Dukais (Dulais): No Risk, No Story" — katta sarlavha, CTA tugma "SOS Yuborish"
2. **Loyha nomi / Kirish** — SOS Map nomi, "Kirish" (login/register)
3. **Muammolar** — 4 muammo kartalarda (tez yordamga qo'ng'iroq vaqt ketishi, yordam bir joyda emasligi, sekinlik, manzilni aniq bera olmaslik)
4. **Yechimlar** — 4 yechim (tez yordam, bir joyda, tezlik, Google orqali joylashuv)
5. **Fishkalar** — AI yordamchi, AI o'zi yordam chaqirishi, AI admin o'rniga ishlashi
6. **Bizning loyha** — AI tafsilotlari, 2-daqiqa qoidasi
7. **Contact** — forma (POST /api/messages)

## API TO'LIQ RO'YXATI

Bazaviy: `http://localhost:5000`

### Auth (cookielar avtomatik saqlanadi, `credentials: 'include'`)
- `POST /api/auth/register` — body: `{fullName, phone, email, password}` → response: `{success, data, accessToken}` + cookie
- `POST /api/auth/login` — `{email, password}` → `{success, data, accessToken}`
- `POST /api/auth/admin/login` — `{email, password}` → `{success, data, accessToken}` (admin uchun)
- `POST /api/auth/refresh` — cookie bilan → yangi tokenlar (server avtomatik)
- `POST /api/auth/logout`
- `GET /api/auth/me` — header `Authorization: Bearer <accessToken>` → `{success, data:{type:'user'|'admin', ...}}`

**Muhim:** Access token'ni `localStorage` da saqlang, har request'ga `Authorization: Bearer <token>` qo'shing. Cookie'lar `credentials: 'include'` bilan avtomatik yuboriladi. 401 bo'lsa `/api/auth/refresh` chaqirib yangilang, keyin qaytaring.

### SOS
- `POST /api/sos` — multipart/form-data: `latitude, longitude, address, description, category(MEDICAL/FIRE/ACCIDENT/CRIME/OTHER), photos(fayl)` — auth (user). AI avtomatik baholaydi → `{severity, aiScore, aiSummary}` qaytadi
- `GET /api/sos?status=&category=&severity=&search=&page=&limit=` — admin
- `GET /api/sos/:id` — auth
- `PATCH /api/sos/:id` — `{status: NEW|PROCESSING|RESOLVED|CANCELLED}` — admin
- `POST /api/sos/:id/assign` — `{action, note}` — admin (yordam yuborish)
- `POST /api/sos/:id/analyze` — admin (AI qayta analiz)
- `DELETE /api/sos/:id` — admin

### Messages
- `POST /api/messages` — `{name, email, phone?, subject, text}` — OCHIQ (auth kerak emas)
- `GET /api/messages?isRead=&page=&limit=` — admin
- `PATCH /api/messages/:id` — `{isRead}` — admin

### Admin panel
- `GET /api/stats` — `{totalSos, byStatus, byCategory, bySeverity, totalMessages, recentSos, avgResponseMinutes}` — admin
- `GET /api/assignments` — admin
- `GET /api/assignments/:id` — admin
- `GET /api/ai-logs?sosRequestId=&page=&limit=` — admin

### Rasm
- `GET /uploads/:filename` — yuklangan rasmlar

## STATUSLAR
`NEW` (yangi), `ANALYZING` (AI tekshirmoqda), `PROCESSING` (yordam yo'lda), `RESOLVED` (hal bo'ldi), `AUTO_DISPATCHED` (AI o'zi yubordi), `CANCELLED`

## OG'IRLIK
`LOW`, `MEDIUM`, `HIGH`, `CRITICAL` (qizil urg'u)

## ADMIN KIRISH
Email: `admin@sosmap.uz`, Parol: `admin1234`

## FOYDALANUVCHI (test)
Email: `ali@gmail.com`, Parol: `secret123`

## ADMIN PANEL FUNKSIYALARI
- Dashboard: stats kartalar, so'nggi 10 SOS
- SOS ro'yxati (filter: status/kategoriya), batafsil ko'rish
- SOS ni qabul qilish (status → PROCESSING)
- Yordam yuborish (assign)
- Hal qilish (RESOLVED)
- AI loglar ko'rish (hakamlar uchun muhim!)
- Xabarlar (contact) o'qish

## TALABLAR
1. 100% ishlaydigan, haqiqiy API'ga ulangan
2. Xatolarni chiroyli ko'rsatish (toast/alert)
3. Loading state'lar
4. Responsive (mobil — SOS ko'p telefonda ishlatiladi)
5. Zamonaviy, glassmorphism, #FFFFE0 asosiy
6. Tugma bosishdan kuchli haptik UX (animatsiyalar)
