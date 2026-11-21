# IoT Monitoring / IoT Dashboard Module

> Target: `src/features/iotdashboard` + เมนู **IoT Monitoring**
> UI: นำมาจาก `src/features/dashboard` (main-dashboard) · ข้อมูล: `src/features/smarthome`
> Date: 2026-11-21

## สารบัญ

1. [สรุป](#1-สรุป)
2. [เมนู IoT Monitoring](#2-เมนู-iot-monitoring)
3. [API / ข้อมูล](#3-api--ข้อมูล)
4. [โครงสร้าง Folder](#4-โครงสร้าง-folder)
5. [การคำนวณ (summarize)](#5-การคำนวณ-summarize)
6. [หน้าจอ](#6-หน้าจอ)
7. [Test](#7-test)
8. [งานที่ยังไม่ได้ทำ](#8-งานที่ยังไม่ได้ทำ)

---

## 1. สรุป

หน้าสรุปสถานะอุปกรณ์ IoT ของ 1 bucket — **ใช้งานได้จริงกับ FastAPI `:8000`**
(ต่างจาก `/dashboard` ที่ backend ยังไม่มี API)

| Route | ไฟล์ | Layout |
|---|---|---|
| `/iotmonitoring` | `app/(dashboard)/iotmonitoring/page.tsx` → redirect | — |
| `/iotmonitoring/iotdashboard` | `app/(dashboard)/iotmonitoring/iotdashboard/page.tsx` | `TablerLayout` |

สิทธิ์: `/iotmonitoring` → `admin`, `user` (`middleware.ts`, `route-permissions.config.ts`)

---

## 2. เมนู IoT Monitoring

```
IoT Monitoring            (icon MonitorDot, nav.iotMonitoring)
├── IoT Dashboard  → /iotmonitoring/iotdashboard   (nav.iotDashboard)
└── SmartHome      → /monitoring/smarthome          (nav.smarthome)
```

| ไฟล์ | ใช้กับ | หมายเหตุ |
|---|---|---|
| `src/core/config/nav-menu.config.ts` → `HORIZONTAL_MENU` | **เมนูแนวนอนใน header ที่ใช้งานจริง** (`TablerHeader`) | วางต่อจากเมนู IoT |
| `src/core/config/menu.config.ts` → `MENU_CONFIG` | sidebar เดิม (`app/_components/layout/sidebar.tsx`) — ไม่ได้ใช้ในหน้าปัจจุบัน | เพิ่มไว้ให้ตรงกัน |

ป้ายเมนูแปลผ่าน `labelKey` → ดู [i18n_module.md](i18n_module.md)

---

## 3. API / ข้อมูล

ใช้ use case `GetDeviceGroupsUseCase` ของ feature smarthome (feature → feature อนุญาตใน eslint `boundaries`)

```
IotDashboardPage
  └─ iotDashboard.getSummary  (GetIotDashboardUseCase)
       └─ smarthome.getDeviceGroups
            └─ GET /backend/iot/monitordevicegroup?bucket=ICMON001&lang=th
                 └─ FastAPI :8000  /iot/monitordevicegroup
       └─ summarize(snapshot) → IotDashboardSummary
```

- bucket เริ่มต้น = `SMARTHOME_LOCATION.bucket` (`ICMON001`, env `NEXT_PUBLIC_SMARTHOME_BUCKET`)
- พิมพ์ bucket อื่นในช่องด้านขวาบนแล้วกด "โหลด"
- refresh ทุก **10 วินาที** (หยุดเมื่อแท็บถูกซ่อน)

---

## 4. โครงสร้าง Folder

```
src/features/iotdashboard/
├── index.ts
├── domain/
│   ├── entities/iot-dashboard.entity.ts       ← IotDashboardSummary, IotGroupSummary, IotAlertDevice
│   ├── services/summarize.ts                  ← summarize(), healthyRate(), percent()
│   └── use-cases/get-iot-dashboard.use-case.ts← GetIotDashboardUseCase(getDeviceGroups)
└── presentation/
    ├── iotdashboard.container.ts              ← ผูกกับ smarthome.getDeviceGroups
    └── pages/iot-dashboard.tsx                ← UI จาก features/dashboard/main-dashboard

app/(dashboard)/iotmonitoring/
├── page.tsx                                   ← redirect → /iotmonitoring/iotdashboard
└── iotdashboard/page.tsx

tests/unit/features/iotdashboard/iotdashboard.test.ts
```

ใช้ของจาก feature อื่น:

| จาก | ใช้อะไร |
|---|---|
| `features/smarthome` | `GetDeviceGroupsUseCase`, `DeviceGroupSnapshot`, `isControllable`, `isOn`, `SMARTHOME_LOCATION` |
| `features/dashboard` | `WelcomeIllustration`, รูปแบบการ์ด/ตาราง/progress ของ main-dashboard |

---

## 5. การคำนวณ (summarize)

```ts
interface IotDashboardSummary {
  bucket; timestamp;
  totalDevices; normalDevices; warningDevices; alarmDevices;
  controllable;   // อุปกรณ์ IO Control (hardware_id 3) ที่มี topic + on/off
  controlsOn;     // ในนั้นที่สถานะ ON
  groups: { key; name; total; normal; warning; alarm }[];
  alerts: { id; name; group; display; level; title; timestamp }[];  // alarm ก่อน warning
}
```

| ค่า | ที่มา (`alarm_status` จาก backend) |
|---|---|
| warning | `1` |
| alarm | `2` |
| normal | อื่น ๆ (`3`, `4`, `5`) |
| `healthyRate` | `normalDevices / totalDevices` เป็น % (0 ถ้าไม่มีอุปกรณ์) |

---

## 6. หน้าจอ

| ส่วน (เทียบ main-dashboard) | IoT Dashboard แสดง |
|---|---|
| Page header | "ติดตาม IoT" / "แดชบอร์ด IoT" + ช่อง bucket + ปุ่มไป SmartHome |
| Welcome card + illustration | bucket, เวลา, อัตราปกติ, จำนวนปกติ / ทั้งหมด |
| Stat cards 4 ใบ | อุปกรณ์ทั้งหมด · เตือน · แจ้งเหตุ · อุปกรณ์ควบคุมที่เปิด (ON / ทั้งหมด) |
| Job status → **Device groups** | แถบ 3 สี (ปกติ/เตือน/แจ้งเหตุ) ต่อกลุ่ม |
| Top parts → **Active alerts** | ตารางอุปกรณ์ที่เตือน/แจ้งเหตุ สูงสุด 10 รายการ |

backend error → กล่อง `ApiErrorView` ด้านบน · ไม่มีอุปกรณ์ → ตัวเลข 0 และ "ไม่มีข้อมูล"

---

## 7. Test

```bash
npx vitest run tests/unit/features/iotdashboard   # 6 tests
```

ครอบคลุม: นับตามระดับ, สรุปต่อกลุ่ม, alarm มาก่อน warning, bucket ว่าง, `healthyRate`/`percent`, use case ส่ง query ต่อ

---

## 8. งานที่ยังไม่ได้ทำ

- ยังไม่ได้ทดสอบกับอุปกรณ์จริง (DB ในเครื่องตอนทดสอบไม่มีอุปกรณ์ใน bucket `ICMON001`)
- bucket ยังไม่จำค่า (รีเฟรชหน้าแล้วกลับเป็นค่า default) — อาจเก็บใน query string `?bucket=`
- ยังไม่มีตัวเลือกหลาย location / bucket แบบ dropdown
