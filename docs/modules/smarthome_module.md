# Smarthome Module — Migration webiot (PHP) → icmon-react-nextjs

> Source: `C:\xampp\htdocs\webiot\application\modules\smarthome` (CodeIgniter HMVC)
> Target: `src/features/smarthome` + template `iotdashboard` (`app/_components/layout/iotdashboard`)
> Date: 2026-11-21

## สารบัญ

1. [สรุป](#1-สรุป)
2. [API — เดิม vs ใหม่](#2-api--เดิม-vs-ใหม่)
3. [โครงสร้าง Folder](#3-โครงสร้าง-folder)
4. [Flow การทำงาน](#4-flow-การทำงาน)
5. [iotdashboard template](#5-iotdashboard-template)
6. [Mapping PHP → React](#6-mapping-php--react)
7. [Config / รูปภาพ](#7-config--รูปภาพ)
8. [Test](#8-test)
9. [งานที่ยังไม่ได้ทำ](#9-งานที่ยังไม่ได้ทำ)

---

## 1. สรุป

หน้าหลักของ smarthome เดิมคือ `views/dashboardsetting/dashboardcontainer.php`
(~3,950 บรรทัด: PHP + jQuery + jQuery UI) แสดงผล:

- **รูปห้อง** (`home1.png` ประตูปิด / `home2.png` ประตูเปิด)
- **HUD card** ต่อ 1 กลุ่มอุปกรณ์ (Sensor, IO Sensor, IO Control, Critical Sensor) วางทับบนรูป ลากย้ายได้
- **จุดเป้าหมาย + เส้นนำ (SVG)** จาก card ไปยังตำแหน่งอุปกรณ์ในห้อง
- **แถบด้านขวา**: เมนู, รายการสถานะอุปกรณ์ + สวิตช์ ON/OFF (IO Control), slider ความทึบของ card / ความสว่าง, สวิตช์ประตู
- **Polling ทุก 5 วินาที** และสีกะพริบตาม `alarm_status` (1 = warning, 2 = alarm)
- หน้า `dashboardsetting` = แบบเดียวกัน แต่ใช้จัดตำแหน่ง + ดู JSON + บันทึก

ใน React ได้แยกเป็น feature `smarthome` (Clean Architecture: domain / data / presentation)
ตามแบบเดียวกับ `src/features/iot` และ `src/features/monitoring`
และสร้าง template ใหม่ชื่อ **iotdashboard** (เต็มจอ ไม่มีเมนูแนวนอน) แยกจาก `TablerLayout`

| Route ใหม่ | PHP เดิม | สิทธิ์ (`middleware.ts`) |
|---|---|---|
| `/monitoring/smarthome` | `smarthome/index` | admin, user |
| `/monitoring/smarthome/dashboardsetting` | `smarthome/dashboardsetting` | admin, user ⚠️ |

> ⚠️ `middleware.ts` อนุญาต `admin, user` แต่ `src/core/config/route-permissions.config.ts` ระบุ `admin` —
> ค่าที่มีผลจริงตอนเปิดหน้าคือ `middleware.ts` (PHP เดิมให้เฉพาะ role 1, 2) ควรตั้งให้ตรงกัน

เข้าจากเมนูได้ 2 ทาง: **IoT Monitoring › SmartHome** และ **Monitoring › SmartHome**
(ดู [iotdashboard_module.md](iotdashboard_module.md))

> URL `/monitoring/smarthome` เดิมเป็นหน้า stub (`MonitoringDashboardPage module="smarthome"` ใต้ `(dashboard)`) — ถูกแทนที่ด้วยหน้านี้ซึ่งใช้ template iotdashboard
> หน้า monitoring อื่น (`smartcity`, `industry`, …) ยังใช้ `(dashboard)/monitoring/layout.tsx` เหมือนเดิม

---

## 2. API — เดิม vs ใหม่

**API ทั้งหมดใช้ FastAPI (fastapiiot) ที่ port 8000** — ไม่ใช้ `:3004` / `:5000` ของ PHP เดิมแล้ว

| ตั้งค่า (`.env`) | ค่า | ใช้ที่ |
|---|---|---|
| `API_TARGET_URL` | `http://localhost:8000` | `next.config.mjs` — proxy `/api/*`, `/backend/*`, `/ws/*` |
| `NEXT_PUBLIC_API_TARGET_URL` | `http://localhost:8000` | `environment.ts` (ใช้เมื่อ `NEXT_PUBLIC_USE_PROXY=false`) |
| `NEXT_PUBLIC_API_PRIMARY` | `http://localhost:8000` | `environment.ts` |
| `NEXT_PUBLIC_WS_URL` | `ws://localhost:8000/bigo/ws/stream` | `websocket.service.ts` |

Browser เรียกผ่าน Next proxy เสมอ (`/backend/iot/...` → `http://localhost:8000/iot/...`)
mapper ยังอ่านรูปแบบ response เดิม (`statusCode` / `payload`) ได้ เผื่อข้อมูลเก่า แต่ไม่ได้เรียก API เดิมแล้ว

| การทำงาน | PHP เดิม | ใหม่ (FastAPI `:8000`) | Browser เรียก |
|---|---|---|---|
| ข้อมูลอุปกรณ์แบบกลุ่ม | `GET mqtt3/monitordevicegroup?bucket=ICMON001&layout=1\|2&lang=` | `GET /iot/monitordevicegroup?bucket=&location_id=&lang=` | `/backend/iot/monitordevicegroup` |
| สั่ง ON/OFF | `GET mqtt3/control?topic=&message=` | `POST /iot/control {topic,message}` (ต้อง login) | `/backend/iot/control` |
| อ่าน layout | `GET settings/dashboardconfig?location_id=` | **ยังไม่มีใน backend** | fallback → `localStorage` |
| บันทึก layout | `POST settings/dashboardconfig` / `smarthome/savesettings` (เขียนไฟล์ JSON) | **ยังไม่มีใน backend** | fallback → `localStorage` |
| Export CSV alarm | `smarthome/export_csv` → `settings/alarmlogpaginate` | ใช้หน้า `/reports/alarm` ที่มีอยู่ | — |

> Response FastAPI ถูกห่อด้วย envelope `{ code, details: { data } }` — `api-client.ts` แกะให้อัตโนมัติ

### รูปแบบข้อมูล `monitordevicegroup` (FastAPI)

```json
{
  "bucket": "ICMON001",
  "device_count": 2,
  "data": [
    { "group_id": 1, "group_name": "Sensor", "count": 1,
      "devices": [{ "device_id": 1, "device_name": "Temp", "hardware_id": 1,
                    "value_data": "25.10", "unit": "°C", "devicedata": "25.10 °C",
                    "alarm_status": 1, "alarm_title": "Warning",
                    "mqtt_data_control": "", "mqtt_control_on": "", "mqtt_control_off": "",
                    "timestamp": "..." }] }
  ]
}
```

### รูปแบบ layout config (เหมือน PHP เดิมทุกประการ)

```json
{
  "name": "ICMON001",
  "location_id": 3,
  "config": {
    "updated_at": "2026-11-21T10:00:00.000Z",
    "door_status": "closed",
    "global_settings": { "card_opacity": 40, "screen_brightness": 100 },
    "groups": [
      { "group_id": "group1",
        "card_pos":   { "top": "40px",  "left": "40px" },
        "target_pos": { "top": "200px", "left": "160px" } }
    ]
  }
}
```

---

## 3. โครงสร้าง Folder

```
icmon-react-nextjs/
├── app/
│   ├── (dashboard)/monitoring/                 ← smartcity, industry, … (TablerLayout เดิม)
│   ├── (iotdashboard)/                         ← route group ใช้ template iotdashboard
│   │   ├── layout.tsx                          ← <IotDashboardLayout home="/monitoring/smarthome">
│   │   └── monitoring/smarthome/
│   │       ├── _components/
│   │       │   └── smarthome-client.tsx        ← ผูก toast ของ app เข้ากับหน้า feature
│   │       ├── page.tsx                        ← /monitoring/smarthome                  (mode="view")
│   │       └── dashboardsetting/
│   │           └── page.tsx                    ← /monitoring/smarthome/dashboardsetting (mode="setting")
│   └── _components/layout/
│       └── iotdashboard/                       ← template ใหม่ (port จาก PHP)
│           ├── index.ts
│           ├── iotdashboard-layout.tsx         ← templatevertical4.php
│           ├── iotdashboard-header.tsx         ← pagewrapper_dasdboard_iot.php
│           └── iotdashboard-footer.tsx         ← footer_vertical4m.php
│                                                 (theme_builder.php → ใช้ ThemeBuilder เดิม)
├── src/features/smarthome/
│   ├── index.ts                                ← barrel export
│   ├── domain/                                 ← ไม่พึ่ง React / HTTP
│   │   ├── entities/smarthome.entity.ts        ← SmartDevice, DeviceGroup, DashboardLayoutConfig …
│   │   ├── repositories/smarthome.repository.ts← ISmarthomeRepository (port)
│   │   ├── services/alarm-level.ts             ← alarm_status→level, สี, icon, ตำแหน่ง default, เส้น SVG
│   │   └── use-cases/smarthome.use-cases.ts    ← GetDeviceGroups, ToggleDevice, GetLayout, SaveLayout
│   ├── data/
│   │   ├── dtos/smarthome.dto.ts               ← รูปแบบ response FastAPI + API เดิม + config PHP
│   │   ├── mappers/smarthome.mapper.ts         ← DTO ⇄ entity
│   │   ├── datasources/
│   │   │   ├── smarthome.api.datasource.ts     ← /backend/iot/* (FastAPI)
│   │   │   └── smarthome.local.datasource.ts   ← localStorage (layout fallback)
│   │   └── repositories/smarthome.repository.impl.ts
│   └── presentation/
│       ├── smarthome.config.ts                 ← location / bucket / รูป / เมนู
│       ├── smarthome.container.ts              ← DI wiring
│       ├── hooks/
│       │   ├── use-device-groups.ts            ← polling 5s + toggle
│       │   └── use-dashboard-layout.ts         ← load / move / save layout
│       ├── components/
│       │   ├── room-canvas.tsx                 ← รูปห้อง + HUD card + จุด + เส้น SVG (ลากได้)
│       │   ├── device-status-panel.tsx         ← รายการสถานะ + สวิตช์ ON/OFF
│       │   ├── display-settings.tsx            ← สวิตช์ประตู + slider opacity/brightness
│       │   ├── smarthome-menu.tsx              ← เมนูด้านข้าง
│       │   └── device-icon.tsx
│       ├── pages/smarthome-dashboard.tsx       ← หน้าเดียว 2 โหมด: view / setting
│       └── styles/smarthome.module.scss        ← CSS จาก <style> ของ PHP
├── public/room/                                ← รูปห้อง (dashboard3/home1.png, home2.png …)
├── tests/unit/features/smarthome/smarthome.test.ts
└── docs/modules/smarthome_module.md            ← เอกสารนี้
```

### Dependency (Clean Architecture)

```
app/(iotdashboard)/monitoring/smarthome/*  ──►  features/smarthome/presentation
                                          │  hooks → container
                                          ▼
                                   domain/use-cases ──► domain/repositories (interface)
                                          ▲
                                   data/repositories.impl ──► datasources ──► core/http/api-client
                                                                          └─► localStorage
```

`presentation` ห้าม import จาก `app/` (eslint `boundaries`) — toast จึงส่งเข้ามาเป็น prop `notify`

---

## 4. Flow การทำงาน

```
/monitoring/smarthome
  └─ IotDashboardLayout (header + footer + ThemeBuilder)
      └─ SmarthomeClient (useToast)
          └─ SmarthomeDashboardPage(mode)
              ├─ useDeviceGroups ──► GetDeviceGroupsUseCase ──► GET /backend/iot/monitordevicegroup
              │      ทุก 5 วินาที (หยุดเมื่อ tab ซ่อน)
              ├─ useDashboardLayout ─► GetLayoutUseCase ──► (API ยังไม่มี) → localStorage
              │                                               → ไม่มี → ตำแหน่ง default
              ├─ RoomCanvas       รูป (ประตูปิด/เปิด) + card + เส้น
              │      mode=setting → ลาก card / จุด (pointer events) → move()
              ├─ DeviceStatusPanel  สวิตช์ → ToggleDeviceUseCase → POST /backend/iot/control
              │                                → refresh หลัง 1 วินาที (เหมือน PHP)
              └─ (setting) JSON Preview + Save → SaveLayoutUseCase (clamp ค่า) → localStorage
```

**ระดับ alarm** (`alarm_status`) → สี / กะพริบ

| alarm_status | level | สี | กะพริบ |
|---|---|---|---|
| 1 | warning | `#F59E0B` (หรือ `color_warning`) | ✓ |
| 2 | alarm | `#EF4444` (หรือ `color_alert`) | ✓ |
| 3 | minor | `#3B82F6` | – |
| 4 | info | `#8B5CF6` | – |
| 5 / อื่นๆ | normal | `#22C55E` | – |

สีของกลุ่ม = ระดับที่แย่ที่สุดของอุปกรณ์ในกลุ่ม (alarm > warning > normal)
สวิตช์ ON/OFF แสดงเฉพาะ `hardware_id = 3` ที่มี topic + on + off ครบ

---

## 5. iotdashboard template

| PHP | React | หมายเหตุ |
|---|---|---|
| `templatevertical4.php` | `iotdashboard-layout.tsx` | ตรวจ token → ใช้ `middleware.ts` แทน |
| `header_vertical2.php` | `app/layout.tsx` + `globals.scss` | Tabler CSS, Inter font, theme script โหลดอยู่แล้ว |
| `pagewrapper_dasdboard_iot.php` | `iotdashboard-header.tsx` | logo → home, ภาษา, dark/light, เมนูผู้ใช้ (Overview, Profile, History log, Settings, Logout) |
| `footer_vertical4m.php` | `iotdashboard-footer.tsx` + `<ThemeBuilder/>` ใน `.settings` | ปุ่มลอย Theme Builder |
| `theme_builder.php` | `app/_components/auth/theme-builder.tsx` (เดิม) | key `tabler-*` ใน localStorage เหมือนกัน |

- **กว้าง 100% เสมอ** — เนื้อหาไม่มี padding ซ้าย-ขวา และไม่ถูกจำกัดแม้ Theme Builder ตั้ง layout เป็น Boxed
  (class `page-iot-fullwidth` + CSS ใน `app/globals.scss`)
- ข้อความใน header / footer แปลได้ (`iotLayout.*`, `layout.footer.*`)

รายละเอียดเต็ม (โครงสร้าง, CSS, ผลทดสอบความกว้าง, วิธีใช้กับหน้าใหม่) → [iotdashboard_template.md](iotdashboard_template.md)

### คำแปล

ทุกข้อความของ SmartHome แปลได้ 10 ภาษา (`smarthome.*`, `smarthome.menu.*`) — เมนูด้านข้างใช้
`labelKey` ใน `SMARTHOME_MENU` → ดู [i18n_module.md](i18n_module.md)

---

## 6. Mapping PHP → React

| PHP (`dashboardcontainer.php`) | React |
|---|---|
| `DASHBOARD_CONFIG` (PHP echo) | `SMARTHOME_LOCATION` ใน `smarthome.config.ts` |
| `DashboardApp.updateDeviceData` + `setInterval(5000)` | `useDeviceGroups` |
| `updateMenuDisplay` | `DeviceStatusPanel` |
| `updateCardDisplay` / `.hud-overlay` | `RoomCanvas` (card) |
| `updateLines` / `#svg-layer` | `RoomCanvas` (svg) + `leaderPath()` |
| jQuery UI `.draggable()` | pointer events ใน `RoomCanvas` (`editable`) |
| `handleDeviceControl` | `ToggleDeviceUseCase` |
| `loadConfig` / `applyConfig` | `GetLayoutUseCase` + `fromConfigDto` |
| `updateJSON` / `autoSave1` / `savesettings` | `toConfigDto` + `SaveLayoutUseCase` |
| `setupDoorSwitch` (สลับ BG_CLOSED/BG_OPENED) | `DisplaySettings` → `layout.doorOpened` |
| `updateHUDOpacity` / `updateBrightness` | `cardOpacity` / `screenBrightness` |
| icon ตามชื่อ (`temp`, `humi`, `fan`, `door`) | `deviceIconKey()` + `@tabler/icons-react` |
| `role_id_api == 1 \|\| 2` เห็นเมนู Configuration | `middleware.ts` (`/monitoring/smarthome/dashboardsetting`) — ดูหมายเหตุสิทธิ์ในข้อ 1 |
| ข้อความ PHP `$this->lang->line()` | `useI18n()` + `tf()` (`smarthome.*`) |

เมนูอื่นของ smarthome (Analysis Chart, Alarm Log, Alarm Configuration, Schedule, Control Device)
ชี้ไปยังหน้าที่มีอยู่แล้วในโปรเจค (`/iot/reports`, `/reports/alarm`, `/settings/alarm`,
`/settings/schedule`, `/settings/devices`) — แก้ได้ที่ `SMARTHOME_MENU`

---

## 7. Config / รูปภาพ

รูปอยู่ที่ `public/room/**` → URL `/room/**`

| ค่า | default | env |
|---|---|---|
| location_id | `3` | `NEXT_PUBLIC_SMARTHOME_LOCATION_ID` |
| bucket | `ICMON001` | `NEXT_PUBLIC_SMARTHOME_BUCKET` |
| ชื่อ | `ICMON001` | `NEXT_PUBLIC_SMARTHOME_NAME` |
| รูปประตูปิด | `/room/dashboard3/home1.png` | แก้ใน `smarthome.config.ts` |
| รูปประตูเปิด | `/room/dashboard3/home2.png` | แก้ใน `smarthome.config.ts` |

(ตรงกับ PHP `location_id_3`, `location_name_3`, `config_image_dashboard3_1/2`)
location อื่นใน PHP (`dashboard1`…`dashboard9`) มีรูปอยู่ใน `public/room/` แล้ว

---

## 8. Test

```bash
npx vitest run tests/unit/features/smarthome     # 12 tests
npm run dev                                      # http://localhost:1003/monitoring/smarthome
```

ครอบคลุม: alarm level, worst level, icon, เส้น SVG, mapper (FastAPI + API เดิม),
config round-trip (รูปแบบ PHP), ตำแหน่ง default, Toggle ON/OFF, clamp ค่า, fallback localStorage

---

## 9. งานที่ยังไม่ได้ทำ

- **Backend**: เพิ่ม `GET/POST /api/v1/settings/dashboardconfig` ใน FastAPI แล้วแก้
  `smarthome.api.datasource.ts` (ตอนนี้ `notAvailable` → layout เก็บใน browser เท่านั้น
  ไม่แชร์ข้ามเครื่อง)
- **WebSocket**: PHP มี `views/socket.php`; ตอนนี้ใช้ polling 5 วินาที
  (มี `src/features/websocket` และ proxy `/ws/*` พร้อมแล้ว)
- **หลาย location**: ตอนนี้ fix location 3; ถ้าต้องการเลือกได้ ให้อ่าน `?location_id=` แล้ว map ไปยัง config
- **หน้า Analysis Chart / Schedule เฉพาะ smarthome**: ตอนนี้ลิงก์ไปหน้ากลางที่มีอยู่
- **สิทธิ์หน้า dashboardsetting**: `middleware.ts` (admin, user) ไม่ตรงกับ `route-permissions.config.ts` (admin)
- ยังไม่ได้ทดสอบกับข้อมูลอุปกรณ์จริง (DB ในเครื่องตอนทดสอบไม่มีอุปกรณ์ใน bucket ใดเลย)
