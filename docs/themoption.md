# Theme Options & Layout

เอกสารนี้อธิบาย layout แบบ Tabler ที่แปลงมาจาก `C:\github\icmonangular\src\app\layouts` และตัวเลือก theme ทั้งหมดของหน้า dashboard

- หน้า `app/(dashboard)/**` ใช้ `TablerLayout` (header + horizontal menu + footer)
- หน้า `app/(auth)/**` (sign-in, sign-up ฯลฯ) ใช้ `AuthExtras` (ปุ่มภาษา + Theme Settings) เหมือนเดิม
- theme ทั้งสองส่วนใช้ store เดียวกัน (`useTheme()`) และ localStorage key เดียวกัน

---

## 1. Angular → React

| Angular (`icmonangular/src/app/layouts`) | React (project นี้) | หมายเหตุ |
|---|---|---|
| `app-layout/app-layout.component.*` | `app/_components/layout/tabler/tabler-layout.tsx` | ใช้ใน `app/(dashboard)/layout.tsx` |
| `header/header.component.{ts,html}` | `app/_components/layout/tabler/tabler-header.tsx` | navbar บน: แจ้งเตือน, apps, dark mode, layout mode, settings, โปรไฟล์, ภาษา |
| เมนูแนวนอนใน `header.component.html` | `app/_components/layout/tabler/horizontal-menu.tsx` | 3 ระดับ, ระดับ 2 เป็น `.dropdown-submenu` |
| `header.component.ts` (`horizontalMenu`, `apps`, `profileMenu`, `notifications`) | `src/core/config/nav-menu.config.ts` | ข้อมูลเมนูแยกออกจาก component |
| `header.icons.ts` (SVG ของ Tabler icons) | `app/_components/layout/tabler/nav-icon.tsx` | ใช้ `lucide-react` แทน อ้างด้วยชื่อ |
| `header.component.scss` | `app/globals.scss` (ส่วน "Tabler layout") | `.dropdown-submenu`, `.user-info`, `.dropdown-menu-card` |
| `footer/footer.component.*` | `app/_components/layout/tabler/tabler-footer.tsx` | ปี พ.ศ. (+543) เมื่อภาษาไทย |
| `page-header/page-header.component.*` | `app/_components/layout/tabler/page-header.tsx` | `actions` prop แทน `<ng-content select="[actions]">` |
| `layout-settings/layout-settings.component.*` | `app/_components/auth/theme-builder.tsx` (`ThemeBuilder`) | มีอยู่แล้ว — ใช้ซ้ำ |
| `core/services/layout.service.ts` | `src/core/services/theme.service.ts` (`useTheme()`) | store กลาง (`useSyncExternalStore`) |
| `sidebar/sidebar.component.*` | `app/_components/layout/sidebar.tsx` (เดิม) | Angular `app-layout` ไม่ได้ใช้ sidebar — React ก็ไม่ใช้ใน `TablerLayout` |
| Bootstrap JS (`data-bs-toggle="dropdown"`, `offcanvas`, `collapse`) | `app/_components/layout/tabler/use-dropdown.ts` + React state | project นี้ไม่ได้โหลด Bootstrap/Tabler JS |
| `<app-confirm-modal>` | `app/_components/shared/confirm-modal.tsx` | ยืนยันก่อน sign out |
| `logout()` / `LogoutAllUseCase` | `signOutAction` (`app/(home)/actions/sign-out.action.ts`) | เรียก `DELETE /api/v1/authentication/logout` แล้วลบ cookie |
| อ่านชื่อผู้ใช้จาก `localStorage` (`fullname`, `roleTitle`, `avatarUrl`) | `AuthApiDataSource.getCurrentUser()` → `GET /api/v1/user/me` | ไม่ cache ใน localStorage |

Layout เดิมแบบ Tailwind + sidebar (`AppLayout` ใน `app/_components/layout/app-layout.tsx`) ยังอยู่ ถ้าจะกลับไปใช้ แก้ `app/(dashboard)/layout.tsx` ให้ return `<AppLayout>` แทน

---

## 2. โครงสร้าง layout

```
app/(dashboard)/layout.tsx  →  <TablerLayout>
│
├─ a.skip-link                         "Skip to content" (เห็นเมื่อกด Tab)
├─ .page
│  ├─ <TablerHeader>
│  │  ├─ header.navbar
│  │  │  ├─ navbar-toggler              (มือถือ) เปิด/ปิดเมนูแนวนอน
│  │  │  ├─ navbar-brand                โลโก้ light/dark สลับด้วย .hide-theme-dark / .hide-theme-light
│  │  │  ├─ 🔔 แจ้งเตือน                 demo 3 รายการ + ปุ่ม Archive all / Mark all as read
│  │  │  ├─ ▦ Apps                      ตาราง 3 คอลัมน์จาก APPS_MENU
│  │  │  ├─ ☾/☀ Dark mode               toggleTheme()
│  │  │  ├─ ⚙ Layout                    Fluid / Boxed / Boxed 2 / Full screen
│  │  │  ├─ ⚙ Theme Settings            แสดงเฉพาะ /settings/* — เปิด ThemeBuilder
│  │  │  ├─ โปรไฟล์                      ชื่อ/role จาก /api/v1/user/me + PROFILE_MENU
│  │  │  └─ LanguageSelector
│  │  └─ <HorizontalMenu>               จาก HORIZONTAL_MENU
│  └─ .page-wrapper
│     ├─ main.page-body#content > .container-xl > {children}
│     └─ <TablerFooter>
└─ <ThemeBuilder>                      ปุ่มลอยมุมซ้ายล่าง + off-canvas (เฉพาะ /settings/*)
```

---

## 3. ตัวเลือก Theme

| ตัวเลือก | key ใน `useTheme().settings` | ค่าที่เลือกได้ | ค่าเริ่มต้น | ตั้งที่ไหน |
|---|---|---|---|---|
| Color mode | `theme` | `light`, `dark`, (`system`) | `dark` | ปุ่ม ☾/☀ ใน header, ThemeBuilder |
| Primary color | `themePrimary` | `blue`, `azure`, `indigo`, `purple`, `pink`, `red`, `orange`, `yellow`, `lime`, `green`, `teal`, `cyan` | `blue` | ThemeBuilder |
| Font family | `themeFont` | `sans-serif`, `serif`, `monospace`, `comic` | `sans-serif` | ThemeBuilder |
| Theme base (เฉดสีเทา) | `themeBase` | `slate`, `gray`, `zinc`, `neutral`, `stone` | `gray` | ThemeBuilder |
| Border radius | `themeRadius` | `0`, `0.5`, `1`, `1.5`, `2` | `1` | ThemeBuilder |
| Layout | `layout` | `fluid`, `boxed`, `boxed-2` | `fluid` | เมนู ⚙ Layout ใน header |
| Full screen | — | เปิด/ปิด | — | เมนู ⚙ Layout → Full Screen (`toggleFullscreen()`) |

> `system` รองรับใน code (ใช้ `prefers-color-scheme`) แต่ ThemeBuilder ยังมีแค่ Light/Dark

### ค่าแต่ละตัวไปลงที่ไหนใน DOM

| ตัวเลือก | DOM | CSS ที่ใช้ |
|---|---|---|
| `theme` | `<html data-bs-theme="dark">` + class `dark` | Tabler (`data-bs-theme`), Tailwind (`darkMode: 'class'`) |
| `themePrimary` | `<html data-bs-theme-primary="red">` | `@tabler/core/scss/tabler-themes` → `--tblr-primary` |
| `themeFont` | `<html data-bs-theme-font="serif">` | `tabler-themes` → `--tblr-body-font-family` |
| `themeBase` | `<html data-bs-theme-base="zinc">` + class `theme-zinc` | `tabler-themes` → `--tblr-gray-*` |
| `themeRadius` | `<html data-bs-theme-radius="2">` | `tabler-themes` → `--tblr-border-radius-scale` |
| `layout` | `<body class="layout-boxed">` (+ `layout-boxed-2`) | Tabler `.layout-boxed` |

`tabler-themes` ต้องถูก import ใน `app/globals.scss` (ไม่ได้รวมอยู่ใน `tabler.scss`) — ถ้าไม่มี สี/ฟอนต์/มุม/เฉดเทาจะไม่เปลี่ยน

```scss
// app/globals.scss
@import '@tabler/core/scss/tabler';
@import '@tabler/core/scss/tabler-vendors';
@import '@tabler/core/scss/tabler-themes';
```

---

## 4. การบันทึกค่า (localStorage)

| key | ค่า |
|---|---|
| `tabler-theme` | `light` / `dark` / `system` |
| `tabler-themePrimary` | ชื่อสี |
| `tabler-themeFont` | ชื่อฟอนต์ |
| `tabler-themeBase` | ชื่อเฉดเทา |
| `tabler-themeRadius` | ค่ามุม |
| `tabler-layout` | `fluid` / `boxed` / `boxed-2` |

> Angular ใช้ key แบบขีด (`tabler-theme-base`, `tabler-theme-primary` …) ส่วน project นี้ใช้ camelCase (`tabler-themeBase`, `tabler-themePrimary` …) ค่าที่บันทึกจาก Angular จึงไม่ถูกอ่านใน React (ถ้า deploy คนละ origin ก็ไม่กระทบ)

### กันหน้าจอกระพริบ

`app/layout.tsx` มี inline script ใน `<head>` อ่าน localStorage แล้วตั้ง `data-bs-theme*` และ class `dark` / `theme-*` บน `<html>` **ก่อน** React hydrate จึงไม่เห็นสีผิดตอนโหลด

ข้อจำกัด: `layout-boxed` ตั้งบน `<body>` ซึ่งยังไม่มีตอน script ใน `<head>` ทำงาน — ถูกตั้งหลัง mount (อาจเห็นหน้ากว้างเต็มแวบหนึ่งเมื่อเลือก Boxed)

---

## 5. ใช้ใน code

### อ่าน/เปลี่ยน theme

```tsx
'use client';
import { useTheme, toggleFullscreen } from '@/src/core/services/theme.service';

export function Example() {
  const { settings, isDarkMode, isLoaded, update, reset, toggleTheme } = useTheme();

  return (
    <>
      <button onClick={toggleTheme}>{isDarkMode ? 'Light' : 'Dark'}</button>
      <button onClick={() => update('themePrimary', 'teal')}>Teal</button>
      <button onClick={() => update('layout', 'boxed')}>Boxed</button>
      <button onClick={toggleFullscreen}>Full screen</button>
      <button onClick={reset}>Reset</button>
    </>
  );
}
```

- ทุก component ที่เรียก `useTheme()` เห็นค่าเดียวกันทันที (เช่น กด ☾ ใน header แล้ว radio ใน ThemeBuilder เปลี่ยนตาม)
- render แรกใช้ค่า default เสมอ แล้วอ่าน localStorage หลัง mount (`isLoaded` เป็น `true`) — กัน hydration mismatch

### เปิด Theme Settings จากที่อื่น

```ts
import { OPEN_THEME_SETTINGS_EVENT } from '@/app/_components/auth/theme-builder';
window.dispatchEvent(new Event(OPEN_THEME_SETTINGS_EVENT));
```

ใช้ได้เมื่อมี `<ThemeBuilder />` อยู่ในหน้า (`/settings/*` ใน dashboard, ทุกหน้าใน `(auth)`)

### Page header

```tsx
import { PageHeader } from '@/app/_components/layout/tabler';

<PageHeader
  pretitle="nav.settings"          // i18n key หรือข้อความ
  title="nav.devices"
  description="settings.devicesHint"
  icon="Monitor"                   // ชื่อใน nav-icon.tsx
  actions={<button className="btn btn-primary">Add</button>}
/>
```

---

## 6. เมนู

แก้ที่ `src/core/config/nav-menu.config.ts`

```ts
export interface NavItem {
  labelKey: string;   // i18n key เช่น 'nav.devices' — ถ้าไม่มีใน public/i18n/*.json จะใช้ label
  label: string;      // ข้อความสำรอง
  icon?: string;      // ชื่อ lucide icon ที่ลงทะเบียนใน nav-icon.tsx
  href?: string;
  action?: 'logout';  // เฉพาะ PROFILE_MENU
  divider?: boolean;  // เฉพาะ PROFILE_MENU
  children?: NavItem[];
}
```

| ค่าคงที่ | ใช้ที่ |
|---|---|
| `HORIZONTAL_MENU` | เมนูแนวนอน (ระดับ 1 → dropdown → submenu) |
| `APPS_MENU` | dropdown ▦ Apps |
| `PROFILE_MENU` | dropdown โปรไฟล์ |
| `DEMO_NOTIFICATIONS` | dropdown 🔔 (ข้อมูลตัวอย่าง ยังไม่มี API) |

เพิ่ม icon ใหม่: import จาก `lucide-react` แล้วใส่ใน `ICONS` ของ `app/_components/layout/tabler/nav-icon.tsx`

### เมนูจาก Angular ที่ไม่ได้ย้ายมา (ไม่มีหน้าใน `app/(dashboard)`)

| เมนู Angular | route |
|---|---|
| IoT → Monitoring → Live Dashboard, Alerts | `/iot/dashboard`, `/iot/alerts` |
| IoT → MQTT Dashboard, MQTT Flows | `/mqtt/dashboard`, `/mqtt/flows` |
| IoT → Schedule (groups, zones, areas, logs, report) | `/schedule/*` → ใช้ `/settings/schedule` แทน |
| Service → Finance → Invoices | `/invoices` |
| Service → Operations → Jobs | `/jobs` |
| Settings → Appearance (Theme, Language) | `/settings/theme`, `/settings/language` → ใช้ ThemeBuilder / LanguageSelector |
| Reports → Analytics (Overview, Data Analyst) | `/analytics`, `/analytics/analyst` |
| AI → Command Center, Workflow, Schedule, Alerts, Reports, Logs, Analyst | `/ai-analytics/*` |
| Profile → Profile, Analytics, Help | `/user/profile`, `/analytics` |

Route ที่ชื่อต่างกันถูกแก้ให้ตรงกับ project นี้: `/settings/influx` → `/settings/influxdb`, `/settings/device` → `/settings/devices`, `/settings/location` → `/settings/locations`, `/settings/sensor` → `/settings/sensors`, `/settings/host` → `/settings/hosts`, `/settings/token` → `/settings/tokens`, `/iot/device-groups` → `/iot/map`

---

## 7. Dropdown โดยไม่มี Bootstrap JS

Angular ใช้ `data-bs-toggle="dropdown"` ซึ่งต้องมี Bootstrap JS — project นี้ไม่ได้โหลด จึงใช้ `useDropdown()` แทน

```tsx
const dd = useDropdown();                 // ปิดเมื่อคลิกรายการในเมนู
const dd = useDropdown({ autoClose: 'outside' }); // ไม่ปิดเมื่อคลิกในเมนู (แจ้งเตือน, layout)

<div ref={dd.ref} className="nav-item dropdown">
  <a href="#" onClick={(e) => { e.preventDefault(); dd.toggle(); }}>…</a>
  <div className={`dropdown-menu${dd.open ? ' show' : ''}`} data-bs-popper="static" onClick={dd.onMenuClick}>…</div>
</div>
```

- ปิดเมื่อคลิกนอกเมนู หรือกด `Esc`
- `data-bs-popper="static"` ให้ CSS ของ Bootstrap วางเมนูใต้ปุ่ม (`top: 100%`) และ `.dropdown-menu-end` ชิดขวา — แทน Popper.js
- submenu ระดับ 2 เปิดด้วย CSS `:hover` (desktop) หรือแตะ (class `.open`)

### Tailwind `collapse`

Tailwind มี utility `collapse` (`visibility: collapse`) ซึ่งโหลดหลัง Tabler และจะทำให้ `.collapse.navbar-collapse` (เมนูแนวนอน) หายไป จึงตั้งใน `tailwind.config.ts`:

```ts
blocklist: ['collapse'],
```

`border-collapse` ยังใช้ได้ตามปกติ

---

## 8. ผลการทดสอบ (Edge, profile ใหม่, `localhost:1003`)

| รายการ | ผล |
|---|---|
| header + เมนูแนวนอน 8 รายการแสดง, Dashboard ไฮไลต์ | ✅ |
| คลิกเมนูระดับ 1 → dropdown เปิด, hover → submenu เปิด, `Esc` ปิด | ✅ |
| ปุ่ม ☾/☀ เปลี่ยน `data-bs-theme` (`dark → light`) | ✅ |
| Layout → Boxed: `<body class="layout-boxed">`, `tabler-layout=boxed` | ✅ |
| Sign out → dialog ยืนยัน, Cancel ปิด | ✅ |
| `/settings`: ไอคอน ⚙ ใน header เปิด ThemeBuilder, radio ตรงกับ `data-bs-theme` | ✅ |
| มือถือ 400px: เมนูซ่อน, ปุ่ม ☰ เปิดได้ | ✅ |
| Hydration error | ไม่มี |
| `npx tsc` / `npx eslint` (ไฟล์ใหม่) | ผ่าน (มีแค่ warning `<img>`) |

---

## 9. ยังไม่ได้ทำ / ข้อจำกัด

- **แจ้งเตือน** เป็นข้อมูลตัวอย่าง (เหมือน Angular) ยังไม่ต่อ API / WebSocket
- **AI chatbot ลอย** (`<app-ai-chatbot>` ใน Angular ที่แสดงทุกหน้ายกเว้น `/monitoring`) ยังไม่ได้ย้าย — project นี้มีหน้า `/ai-chatbot` แยก
- **avatar** ใช้รูป default `/img/avatars/avatar1.png` — `/api/v1/user/me` มี `avatar` แต่ยังไม่ได้ต่อ
- **มือถือ 400px** หน้ากว้างเกินจอ 4px (เลื่อนแนวนอนได้เล็กน้อย) ยังไม่ได้แก้
- **Boxed** ตั้งหลัง mount (ดูหัวข้อ 4)
- **ThemeBuilder** ยังไม่มีตัวเลือก Layout (fluid/boxed) — อยู่ในเมนู ⚙ ของ header เหมือน Angular
