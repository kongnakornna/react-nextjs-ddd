# docs/modules — เอกสาร Module

เอกสารของ module ที่ย้าย/สร้างใหม่ในโปรเจค icmon-react-nextjs
(Next.js 14 App Router + Clean Architecture: `domain` / `data` / `presentation`)

> Backend ทุก module ใช้ **FastAPI (fastapiiot) ที่ `http://localhost:8000`** ผ่าน Next proxy
> (`/api/*`, `/backend/*`, `/ws/*` → ดู `next.config.mjs` และ `.env`)

| เอกสาร | เรื่อง | Route | ที่มา |
|---|---|---|---|
| [smarthome_module.md](smarthome_module.md) | SmartHome — รูปห้อง + HUD card + ควบคุม ON/OFF | `/monitoring/smarthome`, `/monitoring/smarthome/dashboardsetting` | webiot (PHP) `modules/smarthome` |
| [iotdashboard_module.md](iotdashboard_module.md) | เมนู IoT Monitoring + IoT Dashboard (สรุปสถานะอุปกรณ์) | `/iotmonitoring/iotdashboard` | ใหม่ (UI จาก `features/dashboard`) |
| [dashboard_module.md](dashboard_module.md) | Dashboard / Analytics / Reports | `/dashboard`, `/dashboard/analytics`, `/dashboard/reports` | icmonangular `features/dashboard` |
| [iotdashboard_template.md](iotdashboard_template.md) | Template `iotdashboard` (เต็มจอ 100%) | route group `app/(iotdashboard)` | webiot `templatevertical4.php` ฯลฯ |
| [i18n_module.md](i18n_module.md) | คำแปล 10 ภาษาที่เพิ่ม + วิธีเพิ่ม key | — | — |
| [auth_session.md](auth_session.md) | ไม่ได้ login / session หมดอายุ → logout, refresh token ทุก 30 นาที | `/logout` | — |

## ภาพรวมความสัมพันธ์

```
เมนู (nav-menu.config.ts)
├── Dashboard ─────────────► /dashboard ──────────────► features/dashboard      (TablerLayout)
├── IoT Monitoring
│   ├── IoT Dashboard ─────► /iotmonitoring/iotdashboard ► features/iotdashboard (TablerLayout)
│   │                                                        │ ใช้ UI ของ features/dashboard
│   │                                                        └ ใช้ข้อมูลจาก features/smarthome
│   └── SmartHome ─────────► /monitoring/smarthome ─────► features/smarthome      (iotdashboard template)
└── Monitoring › SmartHome ► /monitoring/smarthome (เมนูเดิม ชี้ที่เดียวกัน)

features/smarthome ──► GET /backend/iot/monitordevicegroup ──► FastAPI :8000 /iot/monitordevicegroup
features/dashboard ──► /api/v1/dashboard/* , /reports  ──► ยังไม่มีใน FastAPI (ApiUnavailable)
```

## Test

```bash
npx vitest run tests/unit/features          # smarthome 12 + dashboard 10 + iotdashboard 6 = 28 tests
npx tsc --noEmit
npx next lint --dir src/features
```
