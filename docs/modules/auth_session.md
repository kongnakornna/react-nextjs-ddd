# Auth Session — redirect logout + refresh token ทุก 30 นาที

> Date: 2026-11-21 · Backend: FastAPI `:8000` (access token 15 นาที, refresh token 7 วัน, cookie HttpOnly `Path=/`)

## 1. พฤติกรรม

| สถานการณ์ | ใครตรวจ | ผล |
|---|---|---|
| ไม่ได้ login / cookie หมดอายุ (browser ลบ cookie แล้ว) | `middleware.ts` | `/logout?reason=unauthenticated&next=<หน้าเดิม>` → `/sign-in` + "กรุณาเข้าสู่ระบบเพื่อใช้งานต่อ" |
| cookie ยังอยู่ แต่ token ใช้ไม่ได้ (หมดอายุ / ถูก revoke) | API client: 401 → refresh → 401 | `/logout?reason=expired` → `/sign-in` + "เซสชันหมดอายุแล้ว กรุณาเข้าสู่ระบบอีกครั้ง" |
| ครบ 30 นาที | `SessionKeeper` → `PATCH /api/v1/authentication/refresh` | สำเร็จ → ได้ access token ใหม่ · 401/403 → `/logout?reason=expired` |
| backend ล่ม (network error / 5xx) | API client / `SessionKeeper` | **ไม่ logout** — ลองใหม่รอบถัดไป (1 นาที) |
| login สำเร็จ | `sign-in/page.tsx` | กลับไปหน้า `next` (ค่าเริ่มต้น `/dashboard`) และเริ่มนับ 30 นาทีใหม่ |

## 2. ไฟล์

| ไฟล์ | หน้าที่ |
|---|---|
| `middleware.ts` | ไม่มี cookie `access_token` / `refresh_token` / `auth_session` → redirect `/logout`; `/logout` อยู่ใน `PUBLIC_PATHS` |
| `app/logout/route.ts` | `GET /logout` — `DELETE /api/v1/authentication/logout` (best effort, timeout 5s), ยกเลิก local session, ลบ cookie ทั้งหมด (`Max-Age=0`), redirect `/sign-in?reason=&next=` · `next` รับเฉพาะ path ภายใน (กัน open redirect) |
| `src/core/http/api-client.ts` | `refreshSessionStatus()` → `ok` / `expired` (401, 403) / `error`; `redirectToLogout()` (เรียกครั้งเดียว, ไม่ทำงานบน `/sign-in`, `/logout`) |
| `src/core/services/session.service.ts` | `useSessionKeeper()`, `checkSession()`, `resetSessionClock()`, `SESSION_REFRESH_MINUTES` |
| `app/_components/auth/session-keeper.tsx` | `<SessionKeeper/>` — mount ใน `TablerLayout` และ `IotDashboardLayout` |
| `app/(auth)/sign-in/page.tsx` | แสดงเหตุผล (`login.sessionExpired`, `login.pleaseSignIn`), กลับไปหน้า `next` |
| `public/i18n/*.json` | `login.sessionExpired`, `login.pleaseSignIn` (10 ภาษา) |

## 3. Session keeper

- ตื่นทุก 1 นาที + เมื่อกลับมาที่แท็บ → refresh ถ้าครบ **30 นาที** นับจากครั้งล่าสุด
- เวลาล่าสุดเก็บใน `localStorage['icmon_session_refreshed_at']` — หลายแท็บใช้ร่วมกัน จึง refresh รอบละครั้ง
- เปิดหน้าครั้งแรกโดยไม่มีบันทึกเวลา (browser ใหม่) → ตรวจทันที
- ช่วงระหว่าง refresh access token (15 นาที) อาจหมดก่อน → API client refresh อัตโนมัติเมื่อเจอ 401 แล้วส่งซ้ำ

ปรับรอบได้ด้วย env:

```env
NEXT_PUBLIC_SESSION_REFRESH_MINUTES=30
```

> หมายเหตุ: ถ้าต้องการให้ access token ไม่หมดระหว่างรอบเลย ตั้งค่าให้ **น้อยกว่า** `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` ของ FastAPI (15)

## 4. Flow

```
หน้าใดก็ได้ (signed-in layout)
 ├─ middleware: ไม่มี cookie ───────────────► /logout?reason=unauthenticated ─┐
 ├─ apiRequest 401 → refresh 401/403 ───────► /logout?reason=expired ─────────┤
 └─ SessionKeeper (30 นาที) → refresh 401/403 ► /logout?reason=expired ───────┤
                                                                              ▼
                     /logout: DELETE backend session · ลบ cookie · 307 → /sign-in?reason=…&next=…
                                                                              ▼
                     sign-in: แสดงข้อความ · login → resetSessionClock() → router.push(next)
```

## 5. Test

```bash
npx vitest run tests/unit/core/session.test.ts   # 9 tests
```

ครอบคลุม: รอบ 30 นาที, ข้ามเมื่อยังไม่ครบ, 401 → `/logout?reason=expired&next=…`, network error / 503 ไม่ logout,
401 → refresh → ส่งซ้ำสำเร็จ, ไม่ redirect บนหน้า `/sign-in`

ทดสอบจริงบน `:1003` (headless Edge, ภาษาไทย):

| กรณี | ผล |
|---|---|
| ไม่มี cookie เปิด `/monitoring/smarthome` | → `/sign-in?reason=unauthenticated&next=%2Fmonitoring%2Fsmarthome` + ข้อความไทย |
| token ปลอม/หมดอายุ เปิด `/iotmonitoring/iotdashboard` | → `/sign-in?reason=expired&next=%2Fiotmonitoring%2Fiotdashboard` + ข้อความไทย, cookie ถูกลบหมด |
| `/logout?next=//evil.example` | → `/sign-in?reason=logout` (ไม่พาออกนอกเว็บ) |
