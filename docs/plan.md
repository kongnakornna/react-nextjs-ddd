# แผนย้าย Features: icmonangular → react-nextjs-ddd

- ต้นทาง: `C:\github\icmonangular\src\app\features` (28 features, 744 ไฟล์, ~32,600 บรรทัด ไม่นับ spec)
- ปลายทาง: `C:\github\react-nextjs-ddd\src\features` + routes ใน `app/(dashboard)`
- Backend: **FastAPI `fastapiiot` ที่ `localhost:8000`** — ใช้เฉพาะ endpoint ที่มีจริงใน `http://localhost:8000/openapi.json`; feature ที่ backend ยังไม่มี ให้ย้าย UI + use case ครบ แต่แสดงสถานะ "ยังไม่มี API" (ดูหัวข้อ 5)
- เอกสารเกี่ยวข้อง: `docs/apiflow.md` (การเรียก API), `docs/themoption.md` (layout/theme), `docs/migration-report.md` (รอบย้ายก่อนหน้า)

> สถานะ: **กำลังดำเนินการ** — Phase 0 และ Phase 1 เสร็จ (21 พ.ย. 2026), ถัดไป Phase 2 · ลำดับ Phase ตามหัวข้อ 5 (ยืนยันแล้ว: "ทำตามแผน")

---

## 1. สรุปขนาดงาน: Angular เทียบ React ตอนนี้

นับไฟล์ `.ts/.html` (Angular) และ `.ts/.tsx` (React) ไม่รวม spec/test

| Feature | Angular ไฟล์/บรรทัด | React ไฟล์/บรรทัด | สถานะ React |
|---|---|---|---|
| schedule | 48 / 4,066 | — | ❌ ไม่มี (มีแค่ stub ใน `settings/schedule-*.tsx` 19–62 บรรทัด) |
| pages | 50 / 2,994 | — | ❌ ไม่มี |
| frontend | 42 / 2,191 | — | ❌ ไม่มี (หน้า public/marketing) |
| errors | 4 / 84 | — | ❌ ไม่มี (404 / 500 / unauthorized) |
| settings | 161 / 5,760 | 49 / 2,510 | 🟡 บาง (~44%) |
| iot | 38 / 1,647 | 15 / 555 | 🟡 บาง (~34%) |
| mqtt | 16 / 1,687 | 15 / 360 | 🟡 บาง (~21%) |
| ai-chatbot | 19 / 1,027 | 11 / 148 | 🟡 บาง (~14%) |
| user | 7 / 1,050 | 7 / 295 | 🟡 บาง (~28%) |
| auth | 71 / 2,952 | 46 / 1,132 | 🟡 บาง (~38%) |
| ai-analytics | 55 / 2,133 | 29 / 848 | 🟡 บาง (~40%) |
| dashboard | 19 / 1,017 | 10 / 242 | 🟡 บาง (~24%) |
| monitoring | 15 / 843 | 14 / 247 | 🟡 บาง (~29%) |
| job-card | 18 / 760 | 16 / 637 | 🟢 ใกล้เคียง (ไม่มี route `/jobs` ใน app) |
| report | 18 / 562 | 14 / 452 | 🟢 ใกล้เคียง |
| customer | 16 / 456 | 15 / 605 | 🟢 ครบ |
| inventory | 17 / 486 | 18 / 1,066 | 🟢 ครบ |
| payment | 16 / 443 | 14 / 720 | 🟢 ครบ |
| quotation | 16 / 383 | 15 / 991 | 🟢 ครบ |
| purchase-order | 15 / 355 | 14 / 839 | 🟢 ครบ |
| wos | 15 / 386 | 14 / 907 | 🟢 ครบ |
| document | 15 / 339 | 14 / 678 | 🟢 ครบ |
| email | 14 / 295 | 13 / 538 | 🟢 ครบ |
| batch | 14 / 232 | 13 / 414 | 🟢 ครบ |
| alarm | 8 / 193 | 11 / 310 | 🟢 ครบ |
| system | 9 / 133 | 10 / 141 | 🟢 ครบ |
| orders | 6 / 73 | 7 / 82 | 🟢 ครบ |
| websocket | 2 / 84 | 3 / 74 | 🟢 ครบ |

"ครบ" = จำนวนบรรทัดใกล้เคียงหรือมากกว่า — ยังต้องเทียบหน้าต่อหน้าก่อนปิดงาน

---

## 2. Backend: endpoint ที่ FastAPI มีจริง

Angular เรียก backend เก่า (path ใน `icmonangular/src/app/core/config/api.config.ts`) ส่วน FastAPI มี route ต่างกัน

| กลุ่ม endpoint ของ Angular | FastAPI `:8000` | ใช้กับ feature |
|---|---|---|
| `auth/*` | ✅ `/api/v1/authentication/{login,sign-up,refresh,logout,forgot-password,reset-password,lock-screen,two-step-verification,two-step-code}` | auth |
| `users/*` | 🟡 มีแค่ `POST /api/v1/user/`, `GET /api/v1/user/me/` — ไม่มี list/edit/delete/role | user |
| `iot/*` | ✅ `/iot/{device,devicebuckets,topic,topicdevicechart,controls,control,monitordevicegroup,monitordevicechart,sensercharts,devicesensercharts,locationdevice,alarmdevicestatus,alarmdevicestatuscontrol,devicestatus,deviceconfig,updatedeviceconfig,deviceiotdata,devicestats,devicedataexport,devicedatacleanup,devicemqtt,status,ws/stats}` — ชื่อตรงกับ Angular | iot, monitoring, dashboard (IoT) |
| `iot/devices/{id}/{location,history,sensors}`, `iot/devices` (register) | ❌ | iot |
| `mqtt/*` | ❌ (มีแค่ `/iot/devicemqtt`, `/iot/processmqttdata`) | mqtt |
| AI chat | ✅ `/llm/{chat,chat/stream,completions,conversations,providers,models,usage}` | ai-chatbot |
| AI analytics | 🟡 มี `/api/v1/lc/*`, `/rag/*`, `/eval/*`, `/tools/*` แต่ไม่ตรงกับหน้าของ Angular | ai-analytics |
| แจ้งเตือน | ✅ `/api/v1/notification/` (+ broadcast ผ่าน `/api/v1/websocket/connect`) | header (ตอนนี้เป็น demo), websocket |
| `system/*` | ✅ `/health/`, `/api/v1/alembic-version/` | system |
| `settings/tokens` | 🟡 ใกล้เคียง `/api/v1/key/*` (API key + rotate) | settings → tokens |
| `schedule/*`, `settings/schedules/*` | ❌ | schedule, settings |
| `settings/{locations,hardware,sensors,nodered,line,sms,hosts,api-settings}` | ❌ | settings |
| `customers, jobs, quotations, purchase-orders, products, payments, documents, email, batch, wos, orders` | ❌ | ERP features |
| `dashboard/*`, `reports/*` (webiot), `alarm/*`, `influx/*`, `roles`, `permissions` | ❌ | dashboard, report, alarm, user |

### ปัญหา proxy ที่ต้องแก้ก่อน

FastAPI วาง `/iot/*`, `/llm/*`, `/health/` **ไม่มี** prefix `/api` แต่ `next.config.mjs` proxy แค่ `/api/*` และ `/ws/*` — และ `/iot/*` ชนกับหน้า Next (`/iot/devices`, `/iot/map` …)

แนวทาง: เพิ่ม prefix แยก เช่น

```js
// next.config.mjs → rewrites().afterFiles
{ source: '/backend/:path*', destination: `${API_TARGET}/:path*` },
```

แล้ว datasource เรียก `/backend/iot/device`, `/backend/llm/chat` (cookie ไปด้วยเพราะ same-origin)

---

## 3. หลักการย้าย (ทุก feature)

| Angular | React |
|---|---|
| `features/<x>/domain/{entities,repositories,use-cases}` | `src/features/<x>/domain/...` (ชื่อเดิม) |
| `data/{datasources,dtos,repositories}` | `src/features/<x>/data/...` — datasource เรียก FastAPI ผ่าน client กลาง (หัวข้อ 4) |
| `presentation/pages/<p>/<p>.component.{ts,html}` | `src/features/<x>/presentation/pages/<p>.tsx` (client component) |
| `<x>.routes.ts` | `app/(dashboard)/<route>/page.tsx` บาง ๆ ที่ import page จาก feature |
| `presentation/layouts/*` (เช่น `schedule-layout`) | `app/(dashboard)/<route>/layout.tsx` |
| `TranslatePipe` + `public/i18n/*.json` | `useI18n().t()` — key เดิม (ไฟล์ i18n ใช้ร่วมได้) |
| `<app-page-header>` | `PageHeader` (`app/_components/layout/tabler`) |
| Tabler classes ใน template | ใช้ class เดิม (`card`, `table`, `btn` …) — ไม่แปลงเป็น Tailwind |
| `HttpClient` + `Observable` | `async/await` + `fetch` |
| `*ngIf / *ngFor / [(ngModel)]` | JSX + `useState` / controlled input |
| Bootstrap JS (`data-bs-toggle`) | React state (`useDropdown`, modal state) |

กติกา ESLint (`.eslintrc.json` boundaries): `features` → import ได้แค่ `features`, `core`; หน้าใน `app/` → import `features`, `core` ได้

---

## 4. Phase 0 — โครงพื้นฐาน (ทำก่อนทุก feature)

- [x] **API client กลาง** `src/core/http/api-client.ts`: `api.get/post/put/patch/delete`, `apiRequest` (form / query / JSON), prefix `API_PREFIX='/api/v1'` · `BACKEND_PREFIX='/backend'`, `credentials: 'include'`, unwrap `details.data`, ข้อความ `errors_th`, refresh-and-retry เมื่อ 401 (ครั้งเดียว, รวมคำขอที่ซ้อนกัน) — `auth.api.datasource.ts` ใช้ client นี้แล้ว
- [x] **proxy `/backend/*`** ใน `next.config.mjs` + ยกเว้นใน `middleware.ts` matcher (ไม่ redirect ไป /sign-in)
- [x] **สถานะ "ยังไม่มี API"**: `notAvailable(feature, endpoint)` โยน `ApiNotAvailableError` → `<ApiErrorView error/>` / `<ApiUnavailable/>` ใน `src/core/ui/api-unavailable.tsx`
- [x] **errors feature**: `src/features/errors` → `app/not-found.tsx` (404), `app/error.tsx` (500 + ลองใหม่), `app/unauthorized/page.tsx` (403)
- [x] ของใช้ซ้ำใน `src/core/ui`: `Pagination`, `useAsync`, `tf()` (แปลพร้อม fallback) — อยู่ใน `core` เพราะ ESLint boundaries ไม่ให้ `features` import `app/`
- [x] i18n: เติม key ที่มีใน Angular แต่ไม่มีใน React (ทุกภาษา, ไม่ทับค่าเดิม) + key ใหม่ของ Phase 1 (en/th)
- [ ] ฟอร์ม/ตารางที่ใช้ซ้ำอื่น ๆ จาก `icmonangular/src/app/shared` — ทำเมื่อ feature ต้องใช้

---

## 5. Phases (เรียงตามที่ backend พร้อม)

| Phase | Features | API บน FastAPI | งานหลัก |
|---|---|---|---|
| 1 | **iot**, **monitoring** | ✅ `/iot/*` | ย้ายหน้าที่ขาด, ต่อ endpoint จริง, กราฟ |
| 2 | **ai-chatbot**, notification ใน header, **websocket** | ✅ `/llm/*`, `/api/v1/notification`, ws | chat UI + stream, แจ้งเตือนจริงแทน demo |
| 3 | **auth** (lock-screen, two-step-*, forgot/reset), **user** (profile) | ✅ / 🟡 | หน้า auth ที่ขาด, refresh token อัตโนมัติ |
| 4 | **schedule** | ❌ | UI + use case ครบ 17 หน้า, แสดง "ยังไม่มี API" |
| 5 | **settings** (locations, hardware, sensors, nodered, line, sms, hosts, api, tokens→`/api/v1/key`) | ❌ (ยกเว้น tokens 🟡) | เติมหน้าที่บาง |
| 6 | **dashboard**, **mqtt**, **ai-analytics** | 🟡 / ❌ | เติมหน้าที่บาง |
| 7 | ERP ที่ "ครบ" แล้ว (customer, quotation, PO, payment, inventory, wos, document, email, batch, job-card, report, alarm, orders, system) | ❌ | เทียบหน้าต่อหน้า, เติมส่วนที่ขาด, เพิ่ม route `/jobs` |
| 8 | **pages**, **frontend** (public/marketing, showcase) | ❌ | layout แยก (frontend layout) |

### Phase 4 — schedule (รายละเอียด)

Route ใน Angular (`schedule.routes.ts`, prefix `/schedule`) → React `app/(dashboard)/schedule/...`

| Angular page | Route | React |
|---|---|---|
| schedule-list | `/schedule` | [ ] |
| schedule-create | `/schedule/create` | [ ] |
| schedule-edit | `/schedule/:id/edit` | [ ] |
| schedule-detail | `/schedule/:id/data` | [ ] |
| schedule-device | `/schedule/:id/device` | [ ] |
| group-list / create / edit | `/schedule/groups`, `/groups/create`, `/groups/:id/edit` | [ ] |
| zone-list / create / edit | `/schedule/zones`, `/zones/create`, `/zones/:id/edit` | [ ] |
| area-list / create / edit | `/schedule/areas`, `/areas/create`, `/areas/:id/edit` | [ ] |
| schedule-logs | `/schedule/logs` | [ ] |
| schedule-report | `/schedule/report` | [ ] |
| schedule-layout (tabs) | layout ของ `/schedule/*` | [ ] |

Use cases: create, update, delete, get, list, set-status, trigger (+ datasource: day-status, devices map/unmap, settings, history, report, count, groups/zones/areas CRUD)

หน้า stub เดิม `/settings/schedule/*` → redirect ไป `/schedule/*` เมื่อเสร็จ

---

## 6. Definition of Done (ต่อ feature)

- [ ] ทุก route ของ Angular มีหน้าใน React (หรือบันทึกเหตุผลที่ตัด)
- [ ] domain / data / presentation ครบตาม use case ของ Angular
- [ ] เรียก FastAPI จริงเมื่อมี endpoint; ไม่มี → แสดง "ยังไม่มี API" ไม่ error
- [ ] ข้อความผ่าน i18n (`t()`) ไม่ hardcode
- [ ] `npx tsc --noEmit` และ `npx eslint` ผ่านสำหรับไฟล์ของ feature
- [ ] เปิดใน browser (Edge profile ใหม่): หน้าโหลดได้, ไม่มี hydration error, มือถือ 400px ไม่ล้นจอ
- [ ] เมนูใน `src/core/config/nav-menu.config.ts` ชี้ route ใหม่
- [ ] อัปเดตตารางในเอกสารนี้ (หัวข้อ 7)

---

## 7. ติดตามความคืบหน้า

| Phase | Feature | สถานะ | หมายเหตุ |
|---|---|---|---|
| 0 | โครงพื้นฐาน | ✅ เสร็จ | ดูหัวข้อ 4 |
| 1 | iot, monitoring | ✅ เสร็จ | ดูหัวข้อ 7.1 |
| 2 | ai-chatbot, notification, websocket | ⬜ | |
| 3 | auth, user | ⬜ | login/logout/sign-up ต่อ backend แล้ว (ดู `docs/apiflow.md`) |
| 4 | schedule | ⬜ | |
| 5 | settings | ⬜ | |
| 6 | dashboard, mqtt, ai-analytics | ⬜ | |
| 7 | ERP features | ⬜ | |
| 8 | pages, frontend | ⬜ | |

ทำไปแล้ว (ก่อนแผนนี้): layout Tabler จาก `icmonangular/src/app/layouts` → `docs/themoption.md`

### 7.1 Phase 1 — iot, monitoring (เสร็จ)

**iot** (`src/features/iot`) — เขียนใหม่ทั้ง data/domain (ของเดิมเรียก `/api/iot/devices` ซึ่งไม่มี)

| ชั้น | ไฟล์ |
|---|---|
| entities | `domain/entities/device.entity.ts` (ตาม Angular + `MonitorDeviceGroup`, `IoTConnectionStatus`) |
| repository | `domain/repositories/iot.repository.ts` (Promise แทน Observable) |
| use cases | `domain/use-cases/iot.use-cases.ts` — 26 class ชื่อเดียวกับ Angular + `GetIoTStatusUseCase` |
| datasource | `data/datasources/iot.api.datasource.ts` → `/backend/iot/*`, ชื่อ query ตาม FastAPI (`hardware_id`, `location_id`) |
| dto / mapping | `data/dtos/iot.dto.ts` (snake_case) → `data/repositories/iot.repository.impl.ts` (camelCase) |
| wiring | `presentation/iot.container.ts` |

| หน้า | Route | API | หมายเหตุ |
|---|---|---|---|
| device-list | `/iot/devices` | `/iot/device`, `/iot/alarmdevicestatus` | ค้นหา keyword / hardware_id, แบ่งหน้า; ตัวกรอง typeId ของ Angular ตัดออก (FastAPI ไม่รับ) |
| device-detail | `/iot/devices/[id]` (ใหม่) | `/iot/devicestatus`, `/devicestats`, `/deviceconfig`, `/deviceiotdata` | Angular ใช้ข้อมูลตัวอย่าง — React ใช้ข้อมูลจริง |
| device-map | `/iot/map` | `/iot/monitordevicegroup` | จัดกลุ่มตาม location; ยังไม่มีแผนที่จริง (เหมือน Angular) |
| iot-reports | `/iot/reports` | `/iot/alarmdevicestatus`, `/devicedataexport`, `/devicedatacleanup` | Cleanup ยืนยันในหน้าแทน `prompt()` |
| iot-settings | `/iot/settings` | `/iot/deviceconfig`, `/iot/updatedeviceconfig` (`deviceId=system`) | โหลดค่าที่บันทึกไว้ทับค่า default |
| ไม่มีบน FastAPI | — | `/iot/devices` (list/register), `/iot/devices/{id}/{location,history,sensors}` | `notAvailable()` |

**monitoring** (`src/features/monitoring`)

| หน้า | Route | หมายเหตุ |
|---|---|---|
| layout | `app/(dashboard)/monitoring/layout.tsx` | แท็บ 5 module (Angular: sidebar ถูก comment ไว้) |
| smartmonitor | `/monitoring/smartmonitor` | ข้อมูลจริงจาก `/iot/monitordevicegroup`, `/iot/status`, `/iot/alarmdevicestatus` + ปุ่ม ON/OFF (`POST /iot/control`) · ตัดแผง demo ของ Angular (revenue, storage, most visited) |
| smarthome, smartcity, industry, smartsolarfarm | `/monitoring/*` | "Coming soon" เหมือน Angular + `ApiUnavailable` (`/monitoring/{module}/devices` ไม่มีบน FastAPI) |

**ทดสอบ** (Edge profile ใหม่): ทุกหน้าโหลดข้อมูลจาก FastAPI ได้ 200, ไม่มี console error / hydration error, มือถือ 400px ไม่ล้นจอ, 404 / 403 แสดงถูกต้อง · `tsc` / `eslint` ผ่าน (เหลือ error เดิมใน `di/types.ts`) · ไม่ได้ทดสอบปุ่ม ON/OFF, Save settings, Cleanup (มีผลกับ backend จริง)

**ข้อสังเกตจาก backend**: `/iot/device` คืนอุปกรณ์ซ้ำ (เช่น device_id 1 สองแถว), `/iot/alarmdevicestatus` มี `dataAlarm=0` ทุกตัวแม้ `alarm_title="Warning"`

---

## 8. ต้องตัดสินใจ

1. **ลำดับ Phase** — ตอนตกลงกันครั้งแรก Phase 1 = schedule แต่ FastAPI **ไม่มี** endpoint ของ schedule เลย ถ้าเริ่มที่ schedule จะได้ UI ที่ยังใช้ข้อมูลจริงไม่ได้ แผนนี้จึงเสนอเริ่มที่ **iot / monitoring** ซึ่ง `/iot/*` ของ FastAPI ตรงกับ Angular เกือบทั้งหมด
2. **prefix proxy** สำหรับ `/iot`, `/llm`, `/health` — เสนอ `/backend/*`
3. **ฝั่ง backend** — feature ที่ไม่มี endpoint (schedule, settings, ERP) จะเพิ่มใน fastapiiot หรือไม่ และเมื่อไร
