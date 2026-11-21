# API Flow

ทุก request จากหน้าเว็บ (`localhost:1003`) วิ่งเข้า Next.js ที่ `/api/...` ก่อน แล้ว Next.js ตัดสินว่าจะตอบเองด้วย route handler หรือ proxy ต่อไปที่ backend FastAPI (`fastapiiot`, `localhost:8000`)

ไฟล์ที่เกี่ยวข้อง:

| ไฟล์ | หน้าที่ |
|---|---|
| `next.config.mjs` | rewrite `/api/*` และ `/ws/*` ไป backend (`API_TARGET_URL`) |
| `middleware.ts` | ตรวจ `SESSION_COOKIE` สำหรับหน้าเว็บ (ข้าม `/api` และไฟล์ static) |
| `.env` | `API_TARGET_URL`, `NEXT_PUBLIC_USE_PROXY`, `NEXT_PUBLIC_API_TARGET_URL` |
| `src/core/config/environment.ts` | อ่านค่า env ฝั่ง client (`useProxy`, `apiTargetUrl`) |
| `src/core/config/api.config.ts` | `API_ENDPOINTS` (path ต่อจาก `/api/v1`) |
| `src/features/auth/data/datasources/auth.api.datasource.ts` | เรียก backend: base URL, form/json, unwrap envelope, error |
| `src/features/auth/data/repositories/auth.repository.impl.ts` | แปลง DTO ↔ Entity |
| `app/api/**/route.ts` | Route handler ใน Next (local) |

---

## 1. ภาพรวม: request เดินทางไปไหน

```mermaid
flowchart LR
  B["Browser<br/>localhost:1003"] --> MW{"middleware.ts<br/>matcher"}
  MW -- "/api/*, /img, /assets,<br/>static files → ข้าม" --> R{"มีไฟล์<br/>app/api/.../route.ts ?"}
  MW -- "หน้าเว็บอื่น ๆ" --> S{"มี SESSION_COOKIE ?"}
  S -- "ไม่มี" --> SI["redirect /sign-in"]
  S -- "มี" --> PG["render page"]
  R -- "มี" --> L["Next Route Handler<br/>/api/auth/sign-in · sign-out · sign-up<br/>/api/todos"]
  L --> DI["di/container<br/>controller → use case"]
  DI --> REPO[("repository<br/>in-file / sqlite<br/>ตาม PERSISTENCE")]
  R -- "ไม่มี<br/>(afterFiles rewrite)" --> PX["next.config.mjs<br/>/api/:path* → API_TARGET_URL/api/:path*"]
  PX --> BE["FastAPI :8000<br/>/api/v1/..."]
  B -. "/ws/* (beforeFiles)" .-> BE
```

- `afterFiles` แปลว่า Next เช็คไฟล์ใน `app/api` ก่อน ถ้าไม่เจอจึงส่งต่อ backend
- `beforeFiles` (`/ws/*`) ส่งไป backend เสมอ
- middleware ข้าม `/api` ทั้งหมด จึงไม่ตรวจ session ให้ — backend ต้องตรวจสิทธิ์เอง
- `API_TARGET_URL` ถูกอ่านตอน dev server เริ่ม และ `NEXT_PUBLIC_*` ถูกฝังใน bundle — แก้ `.env` แล้วต้อง restart `npm run dev`

```js
// next.config.mjs
const API_TARGET = process.env.API_TARGET_URL || 'http://localhost:8000';

rewrites() {
  return {
    beforeFiles: [{ source: '/ws/:path*',  destination: `${API_TARGET}/ws/:path*` }],
    afterFiles:  [{ source: '/api/:path*', destination: `${API_TARGET}/api/:path*` }],
  };
}
```

---

## 2. เลือก base URL: proxy หรือยิงตรง

```mermaid
flowchart LR
  DS["AuthApiDataSource<br/>getBaseUrl()"] --> Q{"NEXT_PUBLIC_USE_PROXY"}
  Q -- "true (ค่าปัจจุบัน)" --> P["'/api/v1' (same-origin)<br/>→ Next proxy → :8000"]
  Q -- "false" --> D["'http://localhost:8000/api/v1'<br/>ยิงจาก browser ตรง"]
  D --> C["ต้องผ่าน CORS ของ backend<br/>SECURITY_ALLOW_ORIGINS ตอนนี้มีแค่ :8000"]
```

```ts
// auth.api.datasource.ts
const API_PREFIX = '/api/v1';

function getBaseUrl(): string {
  return environment.useProxy ? API_PREFIX : `${environment.apiTargetUrl}${API_PREFIX}`;
}
```

- ใช้ proxy (`true`) ดีกว่า: cookie อยู่ origin เดียวกับหน้าเว็บ และไม่ต้องตั้ง CORS
- ถ้าตั้ง `false` ต้องเพิ่ม `http://localhost:1003` ใน `SECURITY_ALLOW_ORIGINS` ของ backend

---

## 3. หน้า `/sign-in`: URL จริงคือ Next route (ไม่ไป backend)

```ts
// app/(auth)/sign-in/page.tsx
const response = await fetch('/api/auth/sign-in', { method: 'POST', body: JSON.stringify({ username, password }) });
```

URL จริงคือ **`http://localhost:1003/api/auth/sign-in`** — Next.js ตอบเอง ไม่ถึง `:8000`

```mermaid
sequenceDiagram
  autonumber
  participant UI as sign-in/page.tsx
  participant NX as Next :1003
  participant RT as app/api/auth/sign-in/route.ts
  participant DI as di/container
  participant FS as in-file-users.local.json

  UI->>NX: POST /api/auth/sign-in (JSON { username, password })
  Note over NX: middleware ข้าม /api/*<br/>เจอไฟล์ route.ts → ไม่ใช้ rewrite afterFiles
  NX->>RT: POST(request)
  RT->>DI: getInjection('ISignInApiController')
  DI->>FS: use case → repository (PERSISTENCE=in-file)
  FS-->>DI: user / ผิดพลาด
  DI-->>RT: { status, body, init, cookie }
  RT-->>UI: 200 { success: true } + Set-Cookie SESSION_COOKIE<br/>หรือ 400/401 { error }
  UI->>NX: router.push('/dashboard')
  Note over NX: middleware ตรวจ SESSION_COOKIE → ผ่าน
```

1. `fetch('/api/auth/sign-in')` เป็น path แบบ relative → browser เติม origin ของหน้า → `http://localhost:1003/api/auth/sign-in`
2. `middleware.ts` matcher ข้าม `api` จึงไม่ตรวจอะไร
3. มีไฟล์ `app/api/auth/sign-in/route.ts` → Next ใช้ route นี้ก่อน กฎ proxy (`afterFiles`) ใช้เฉพาะเมื่อ**ไม่มี**ไฟล์ตรงกัน
4. route เรียก `ISignInApiController` จาก `di/container` → repository แบบ in-file → ตั้ง `SESSION_COOKIE` ที่ `middleware.ts` ใช้ตรวจ

ตรวจด้วย request จริง: `POST localhost:1003/api/auth/sign-in` ได้ `400 {"error":"Invalid data"}` พร้อม header `vary: RSC, Next-Router-State-Tree` = รูปแบบของ Next route (FastAPI จะตอบเป็น envelope `{ code, details: {...} }`)

### เทียบกับ login ของ backend

| | URL | Body | ข้อมูลผู้ใช้จาก | Cookie |
|---|---|---|---|---|
| หน้า `/sign-in` ตอนนี้ | `POST localhost:1003/api/auth/sign-in` | JSON `{ username, password }` | in-file (Next) | `SESSION_COOKIE` |
| Login ของ backend | `POST localhost:1003/api/v1/authentication/login` → proxy → `localhost:8000/api/v1/authentication/login` | form-urlencoded `grant_type=password&username&password` | FastAPI (Postgres) | `access_token`, `refresh_token` |

ผู้ใช้ที่ login ผ่านหน้า `/sign-in` ได้ตอนนี้ คือผู้ใช้ใน in-file ของ Next **ไม่ใช่**ผู้ใช้ในฐานข้อมูล backend

---

## 4. Login กับ backend แล้วดึงข้อมูลผู้ใช้

```mermaid
sequenceDiagram
  autonumber
  participant UI as หน้าเว็บ
  participant DS as AuthApiDataSource
  participant NX as Next :1003 (proxy)
  participant BE as FastAPI :8000

  UI->>DS: login(username, password)
  DS->>NX: POST /api/v1/authentication/login<br/>x-www-form-urlencoded<br/>grant_type=password&username&password
  NX->>BE: rewrite → :8000/api/v1/authentication/login
  BE-->>NX: 200 { code, details: { message, data: { access_token, refresh_token, token_info, info } } }<br/>Set-Cookie: access_token, refresh_token (HttpOnly)
  NX-->>DS: ส่งต่อ response + cookie (โดเมน localhost)
  DS-->>UI: unwrap(details.data) → toLoginResponse()

  UI->>DS: getCurrentUser()
  DS->>NX: GET /api/v1/user/me (credentials: include)
  NX->>BE: ส่ง cookie access_token ไปด้วย
  BE-->>NX: 200 { code, details: { message, data: MeResponse } }
  NX-->>DS: response
  DS-->>UI: unwrap(details.data) → toUserDto()
```

- ยืนยันตัวตนด้วย **cookie** (`access_token`, `refresh_token` แบบ HttpOnly) ไม่ใช้ header `Authorization` เพราะ refresh จะยกเลิก access token เดิมทันที
- ไม่มี `grant_type=password` backend ตอบ **422**
- เรียก path แบบ**ไม่มี `/` ท้าย** เพราะ Next redirect 308 `/path/` → `/path` ก่อนถึง proxy (backend รับทั้งสองแบบ)

### รูปแบบ response ของ backend

```jsonc
// สำเร็จ
{ "code": 200, "method": "GET", "path": "/api/v1/user/me", "timestamp": "...",
  "details": { "message": "Request processed successfully", "data": { /* payload */ } } }

// ผิดพลาด
{ "code": 401, "method": "POST", "path": "/api/v1/authentication/login", "timestamp": "...",
  "details": { "message": "Unauthorized access",
               "data": { "errors": "Invalid credentials for login.",
                         "errors_th": "ข้อมูลเข้าสู่ระบบไม่ถูกต้อง" } } }
```

`handleResponse()` ใน datasource:
- สำเร็จ → คืน `details.data` (ถ้าไม่มี envelope คืน body ตรง ๆ — กันไว้เฉย ๆ ทุก endpoint ที่เจอมี envelope)
- ผิดพลาด → ใช้ข้อความ `errors_th` → `errors` → `details.message` ตามลำดับ

> OpenAPI (`/openapi.json`) แสดงแค่ schema ข้างใน เช่น `LoginResponse` แต่ response จริงถูกห่อด้วย envelope เสมอ

### ตัวอย่าง response จริงของ login

```jsonc
// POST localhost:8000/api/v1/authentication/login  (token ตัดออก)
{
  "code": 200,
  "method": "POST",
  "path": "/api/v1/authentication/login",
  "timestamp": "2026-11-21T04:12:36.781432Z",
  "details": {
    "message": "User logged in successfully",
    "data": {
      "access_token": "eyJhbGciOiJFQ0RILUVTK0EyNTZLVyIs…",   // JWE (เข้ารหัส) ไม่ใช่ JWT ธรรมดา
      "refresh_token": "eyJhbGciOiJFQ0RILUVTK0EyNTZLVyIs…",
      "token_info": {
        "created_at": "2026-11-21T01:12:36.743090-03:00",
        "expires_at": "2026-11-21T01:27:36.743090-03:00",  // access token อายุ 15 นาที
        "claims": {
          "iss": "fastapi-clean-architecture-ddd-template",
          "sub": "10000000004",          // user id
          "aud": "fastapi-clean-architecture-ddd-template",
          "iat": 1795234356, "nbf": 1795234356, "exp": 1795235256,
          "jti": "e342d6df-…",
          "grant_id": "admin@example.com",
          "scope": "admin"               // = role
        }
      },
      "info": {
        "first_name": "admin", "last_name": "admin", "preferred_name": "admin",
        "gender": "other", "birthdate": "1990-01-01",
        "email": "admin@example.com", "phone": "+555472664275",
        "role": "admin",
        "created_at": "2026-09-29T05:25:56.449029+00:00"
      }
    }
  }
}
```

`toLoginResponse()` แปลงเป็น `LoginResponseDto`:

| field ใน response | → `LoginResponseDto` |
|---|---|
| `access_token` | `accessToken` |
| `refresh_token` | `refreshToken` |
| — | `tokenType = 'bearer'` |
| `token_info.expires_at` − ตอนนี้ | `expiresIn` (วินาที, ~900) |
| `info` | `user` |

- access token อายุ **15 นาที** (`exp − iat = 900`) ต้อง refresh ด้วย `PATCH /api/v1/authentication/refresh` ก่อนหมดอายุ
- token เป็น **JWE** (`alg: ECDH-ES+A256KW`, `enc: A256GCM`) ฝั่ง frontend ถอดอ่าน claims เองไม่ได้ ให้ใช้ `token_info.claims` / `info` จาก response แทน
- `info` ไม่มี `id` — ถ้าต้องการ id ให้ใช้ `token_info.claims.sub` หรือเรียก `GET /api/v1/user/me`

---

## 5. ชั้นของโค้ดใน feature (DDD)

```mermaid
flowchart LR
  PG["Presentation<br/>app/(auth)/sign-up/page.tsx"] --> UC["Use case<br/>signUpUseCase(repo)"]
  UC --> RI["Repository impl<br/>AuthRepositoryImpl<br/>map DTO ↔ Entity"]
  RI --> DS["Datasource<br/>AuthApiDataSource<br/>fetch + unwrap + error"]
  DS --> CFG["API_ENDPOINTS<br/>src/core/config/api.config.ts"]
  DS --> NET["fetch('/api/v1/...')"]
```

- **Datasource** รู้จักรูปแบบ HTTP ของ backend: path, method, form/json, envelope `details.data`, ข้อความ error `errors_th`
- **Repository** แปลง `UserResponseDto` เป็น entity `User` ให้ use case ใช้ โดยไม่รู้เรื่อง HTTP
- **Use case** เรียกผ่าน interface `IAuthRepository`

---

## 6. สถานะ endpoint

| ใช้ทำอะไร | เรียก | ไปที่ | สถานะ |
|---|---|---|---|
| หน้า `/sign-in` | `POST /api/auth/sign-in` (= `localhost:1003/api/auth/sign-in`) | Next route → in-file | local (ดูหัวข้อ 3) |
| Login | `POST /api/v1/authentication/login` | FastAPI | ✅ มีใน backend |
| สมัครสมาชิก (หน้า `/sign-up`) | `POST /api/v1/authentication/sign-up` | FastAPI | ✅ มีใน backend |
| Logout | `DELETE /api/v1/authentication/logout` | FastAPI | ✅ มีใน backend |
| Refresh token | `PATCH /api/v1/authentication/refresh` | FastAPI | ✅ มีใน backend |
| ลืม / ตั้งรหัสผ่านใหม่ | `POST /api/v1/authentication/forgot-password`, `reset-password` | FastAPI | ✅ มีใน backend |
| ข้อมูลผู้ใช้ปัจจุบัน | `GET /api/v1/user/me` | FastAPI | ✅ มีใน backend |
| สร้างผู้ใช้ | `POST /api/v1/user` | FastAPI | ✅ มีใน backend |
| รายชื่อ / แก้ไข / ลบผู้ใช้ | `/api/users`, `/api/v1/user/list` | FastAPI | ❌ 404 ไม่มี |
| Roles / Permissions | `/api/roles`, `/api/v1/roles` | FastAPI | ❌ 404 ไม่มี |
| Alarms | `/api/alarms` | FastAPI | ❌ 404 ไม่มี |

รายการ endpoint ทั้งหมดของ backend ดูได้ที่ `http://localhost:8000/openapi.json` หรือ Postman collection
`c:\github\fastapiiot\docs\postman\FastAPI Clean Architecture and DDD Template.postman_collection.json`

---

## 7. ค่าใน `.env`

```env
API_TARGET_URL=http://localhost:8000              # ปลายทางของ proxy (server)
NEXT_PUBLIC_API_TARGET_URL=http://localhost:8000  # ใช้เมื่อ USE_PROXY=false (browser)
NEXT_PUBLIC_USE_PROXY=true                        # true = เรียกผ่าน /api/v1 same-origin
NEXT_PUBLIC_API_PRIMARY=http://localhost:8000     # ยังไม่ถูกใช้ (fallback ยังไม่ได้ต่อ)
```

ค่าส่วนตัวให้ใส่ใน `.env.local` (git-ignore และ override `.env`)

---

## 8. ยังไม่เชื่อมกัน

- หน้า `/sign-in` ยัง login กับ Next route (in-file) และ `middleware.ts` ตรวจแค่ `SESSION_COOKIE`
- หน้า `/sign-up` และ `AuthApiDataSource` ใช้ backend ที่ตั้ง cookie `access_token`
- ถ้าจะใช้ backend อย่างเดียว ต้องเปลี่ยนหน้า sign-in ให้เรียก `AuthApiDataSource.login()` และให้ middleware ตรวจ `access_token`
- หน้า user list / edit / profile / role-list เรียก `/api/users`, `/api/roles` ซึ่ง backend ยังไม่มี
