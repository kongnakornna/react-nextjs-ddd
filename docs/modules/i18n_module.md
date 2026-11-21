# i18n — คำแปล IoT Monitoring / SmartHome / iotdashboard template

> ไฟล์แปล: `public/i18n/{en,th,zh,ja,ko,vi,ms,my,km,lo}.json` (10 ภาษา)
> Service: `src/core/services/i18n.service.tsx` (`useI18n()`), helper `src/core/ui/tf.ts`
> Date: 2026-11-21

## 1. Key ที่เพิ่ม (52 key × 10 ภาษา)

| กลุ่ม | จำนวน | ใช้ที่ |
|---|---|---|
| `nav.iotMonitoring`, `nav.iotDashboard` | 2 | เมนู IoT Monitoring (`nav-menu.config.ts`) |
| `iotDashboard.*` | 14 | `src/features/iotdashboard/presentation/pages/iot-dashboard.tsx` |
| `smarthome.menu.*` | 7 | เมนูด้านข้าง SmartHome (`smarthome.config.ts` → `labelKey`) |
| `smarthome.*` | 21 | แผงสถานะ, slider, สวิตช์ประตู, ปุ่ม, toast (`features/smarthome/presentation/**`) |
| `iotLayout.*` | 8 | header ของ iotdashboard template |

footer ของ template ใช้ key เดิม `layout.footer.copyright`, `layout.footer.allRightsReserved`, `app.name`

### ตัวอย่าง (en / th)

| Key | en | th |
|---|---|---|
| `nav.iotMonitoring` | IoT Monitoring | ติดตาม IoT |
| `nav.iotDashboard` | IoT Dashboard | แดชบอร์ด IoT |
| `iotDashboard.healthyRate` | Healthy rate | อัตราปกติ |
| `iotDashboard.controlsOn` | IO Control ON | อุปกรณ์ควบคุมที่เปิด |
| `iotDashboard.noAlerts` | No active alerts | ไม่มีการแจ้งเตือน |
| `smarthome.menu.configuration` | Configuration | ตั้งค่าหน้าจอ |
| `smarthome.mainDoor` | Main Door | ประตูหลัก |
| `smarthome.cardOpacity` | Card Opacity | ความทึบของการ์ด |
| `smarthome.turnedOn` | {name} turned ON | เปิด {name} แล้ว |
| `smarthome.controlFailed` | Failed to control {name} | ควบคุม {name} ไม่สำเร็จ |
| `iotLayout.logoutConfirm` | Do you want to sign out? | ต้องการออกจากระบบหรือไม่? |

รายการครบทุก key ดูในไฟล์ `public/i18n/en.json` (object `iotDashboard`, `smarthome`, `iotLayout`)

> ภาษา zh, ja, ko, vi, ms, my, km, lo แปลโดย Claude — ควรให้ผู้ใช้ภาษานั้นตรวจทาน (โดยเฉพาะ my, km, lo)

## 2. วิธีใช้ใน component

```tsx
import { useI18n } from '@/src/core/services/i18n.service';
import { tf } from '@/src/core/ui/tf';

const { t } = useI18n();
const L = (k: string, f: string, p?: Record<string, string | number>) => tf(t, `smarthome.${k}`, f, p);

L('mainDoor', 'Main Door');                                 // → "ประตูหลัก"
L('turnedOn', `${name} turned ON`, { name });               // → "เปิด Fan แล้ว"
```

- `tf(t, key, fallback)` — ถ้าไม่มี key ในภาษานั้น (และใน en) ใช้ `fallback`
- `{name}` ในข้อความถูกแทนด้วย `params`
- เมนูแนวนอนใช้ `labelKey` + `label` (fallback) ผ่าน `tr()` ใน `horizontal-menu.tsx`

## 3. เพิ่ม key ใหม่

1. เพิ่ม key ใน **ทุก** ไฟล์ `public/i18n/*.json` (อย่างน้อย `en` — ภาษาอื่นจะ fallback เป็น en)
2. ไฟล์เป็น JSON indent 2 ช่อง, บรรทัดแบบ CRLF — ใช้ editor/สคริปต์ที่ไม่เปลี่ยนรูปแบบทั้งไฟล์
3. ใช้ `tf()` พร้อม fallback ภาษาอังกฤษเสมอ เพื่อไม่ให้แสดงเป็นชื่อ key
4. ภาษาโหลดจาก `localStorage['icmon_language']` หลัง mount → ข้อความแรกที่ render เป็นภาษาเริ่มต้น
   (เลี่ยง hydration mismatch) แล้วเปลี่ยนเป็นภาษาที่เลือก

## 4. ตรวจสอบ

เปิดด้วยภาษา th และ ja (headless Edge) — `/iotmonitoring/iotdashboard` และ `/monitoring/smarthome`
แสดงเป็นภาษาที่เลือกครบ ไม่มี error / hydration warning
