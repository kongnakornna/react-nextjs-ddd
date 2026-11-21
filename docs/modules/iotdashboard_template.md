# iotdashboard Template

> Source: webiot (PHP) `application/views/template/`
> Target: `app/_components/layout/iotdashboard/` + route group `app/(iotdashboard)/`
> Date: 2026-11-21

Template เต็มจอสำหรับหน้า dashboard IoT (รูปห้อง / canvas) — **ไม่มีเมนูแนวนอน**
และ **กว้าง 100% เสมอ** ใช้ร่วมกับ `TablerLayout` เดิมได้ (คนละ route group)

---

## 1. Mapping PHP → React

| PHP | React | หมายเหตุ |
|---|---|---|
| `templatevertical4.php` | `iotdashboard-layout.tsx` (`IotDashboardLayout`) | ตรวจ token → ใช้ `middleware.ts` แทน |
| `header_vertical2.php` | `app/layout.tsx` + `app/globals.scss` | Tabler CSS, font, script ตั้ง theme ก่อน hydrate |
| `pagewrapper_dasdboard_iot.php` | `iotdashboard-header.tsx` (`IotDashboardHeader`) | logo → home, ภาษา, dark/light, เมนูผู้ใช้ |
| `footer_vertical4m.php` | `iotdashboard-footer.tsx` (`IotDashboardFooter`) + `<ThemeBuilder/>` | copyright + ปุ่มลอย Theme Builder |
| `theme_builder.php` | `app/_components/auth/theme-builder.tsx` (เดิม) | localStorage `tabler-*` key เดียวกัน |

---

## 2. โครงสร้าง

```
app/_components/layout/iotdashboard/
├── index.ts
├── iotdashboard-layout.tsx     ← .page.page-iot-fullwidth > .page-wrapper > header / main / footer
├── iotdashboard-header.tsx     ← logo · LanguageSelector · dark/light · user dropdown · logout confirm
└── iotdashboard-footer.tsx     ← layout.footer.* (ปี พ.ศ. เมื่อเป็นภาษาไทย)

app/(iotdashboard)/
├── layout.tsx                  ← <IotDashboardLayout home="/monitoring/smarthome">
└── monitoring/smarthome/...    ← หน้า SmartHome
```

```tsx
<div className="page page-iot-fullwidth">
  <div className="page-wrapper">
    <IotDashboardHeader home={home} />
    <main className="page-body mt-0" id="content">
      <div className="container-fluid px-0">{children}</div>
    </main>
    <IotDashboardFooter />
  </div>
  <div className="settings"><ThemeBuilder /></div>
</div>
```

### Header — เมนูผู้ใช้

| รายการ | ลิงก์ | i18n key |
|---|---|---|
| Overview | `/dashboard` | `iotLayout.overview` |
| Profile | `/user/listdata` | `iotLayout.profile` |
| History log | `/reports/logs-control` | `iotLayout.historyLog` |
| Settings | `/settings` | `iotLayout.settings` |
| Logout (ยืนยันก่อน) | `signOutAction()` | `iotLayout.logout`, `iotLayout.logoutConfirm`, `iotLayout.cancel` |

ชื่อ/ตำแหน่งผู้ใช้มาจาก `GET /api/v1/user/me` (ไม่ได้ login → "Cmon" / "Cmon user")

---

## 3. ความกว้าง 100%

| สิ่งที่ทำให้แคบ (เดิม) | แก้ |
|---|---|
| เนื้อหามี padding ซ้าย-ขวา 8px (`px-2`) | `container-fluid px-0` — canvas ชิดขอบจอ |
| Theme Builder ตั้ง layout = **Boxed** → Tabler จำกัด `.page` ที่ 1320px และใส่ `padding: 1rem` ให้ `<body>` | class `page-iot-fullwidth` + CSS ใน `app/globals.scss` |

```scss
// app/globals.scss
body.layout-boxed:has(.page-iot-fullwidth) {
  padding: 0;
  background: var(--tblr-body-bg);
}
.layout-boxed .page.page-iot-fullwidth {
  max-width: none;
  margin: 0;
  border: 0;
  border-radius: 0;
}
```

- มีผลเฉพาะหน้าที่ใช้ template นี้ — หน้าอื่น (`TablerLayout`) ยังทำตามค่า Boxed
- header / footer ยังมี padding 16px เพื่อไม่ให้ logo / ข้อความชิดขอบ
- `:has()` รองรับ Chrome/Edge 105+, Safari 15.4+, Firefox 121+

ผลทดสอบ (`/monitoring/smarthome`):

| Layout | ความกว้างจอ | `.page` | scroll แนวนอน |
|---|---|---|---|
| Fluid | 1600 | 0 – 1600 | ไม่มี |
| Boxed | 1600 | 0 – 1600 | ไม่มี |
| Boxed | 1920 | 0 – 1920 | ไม่มี |
| Fluid (มือถือ) | 390 | 0 – 390 | ไม่มี |
| `/dashboard` (TablerLayout) Boxed | 1600 | 140 – 1460 | ไม่มี (ไม่เปลี่ยน) |

---

## 4. ใช้กับหน้าใหม่

วางหน้าไว้ใต้ `app/(iotdashboard)/` — จะได้ header / footer / Theme Builder / เต็มจอ ทันที

```
app/(iotdashboard)/monitoring/smartcity/page.tsx   → /monitoring/smartcity
```

> URL เดียวกันมีได้ใน route group เดียว — ถ้ามี `app/(dashboard)/monitoring/smartcity/page.tsx`
> อยู่แล้ว ต้องลบก่อน (Next.js ไม่ยอมให้ 2 route group มี path ซ้ำ)

ปรับลิงก์ของ logo ที่ `home` ใน `app/(iotdashboard)/layout.tsx` (default ของ header = `/dashboard`)

---

## 5. ข้อควรรู้

- ข้อความ hydration error ที่มี `injected.js` / `installHook.js` ใน stack มักมาจาก browser extension
  ที่แทรก element เข้าหน้า (ทดสอบด้วยหน้าต่าง InPrivate)
- ถ้าเห็น "missing required error components, refreshing..." → `.next` เสีย:
  หยุด dev server, `Remove-Item -Recurse -Force .next`, แล้ว `npm run dev` ใหม่
  (อย่ารัน `next dev` 2 ตัวในโฟลเดอร์เดียวกัน — ใช้ `.next` ร่วมกันแล้วเสีย)
