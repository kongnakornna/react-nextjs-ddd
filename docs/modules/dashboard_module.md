# Dashboard Module — icmonangular → icmon-react-nextjs

> Source: `C:\github\icmonangular\src\app\features\dashboard` (Angular, RxJS)
> Target: `src/features/dashboard` (React, Promise)
> Date: 2026-11-21

## สารบัญ

1. [สรุป](#1-สรุป)
2. [API](#2-api)
3. [โครงสร้าง Folder](#3-โครงสร้าง-folder)
4. [Domain](#4-domain)
5. [หน้าจอ](#5-หน้าจอ)
6. [Mapping Angular → React](#6-mapping-angular--react)
7. [ต่างจาก Angular](#7-ต่างจาก-angular)
8. [Test](#8-test)
9. [งานที่ยังไม่ได้ทำ](#9-งานที่ยังไม่ได้ทำ)

---

## 1. สรุป

ย้าย feature dashboard ของ Angular มาทั้งชุด — entity, DTO, datasource, repository,
use case 6 ตัว และหน้า **main-dashboard / analytics / reports**

| Route | หน้า | ไฟล์ |
|---|---|---|
| `/dashboard` | Main dashboard | `presentation/pages/main-dashboard.tsx` |
| `/dashboard/analytics` | Analytics | `presentation/pages/analytics.tsx` |
| `/dashboard/reports` | Recent reports + download | `presentation/pages/reports.tsx` |

Layout: `TablerLayout` (route group `app/(dashboard)`)

> **สถานะ:** FastAPI (`:8000`) **ยังไม่มี endpoint dashboard เลย** →
> ทุก method ของ datasource throw `ApiNotAvailableError` → หน้าแสดงกล่อง
> "ยังไม่มี API สำหรับส่วนนี้" + ค่า `–` / "ไม่มีข้อมูล" (หน้าไม่ error)
> ถ้าต้องการตัวเลข IoT ที่ใช้งานได้จริงตอนนี้ ใช้ [IoT Dashboard](iotdashboard_module.md)

---

## 2. API

Endpoint ตาม Angular `API_ENDPOINTS.dashboard` (prefix `/api/v1`) — เก็บไว้ที่
`DASHBOARD_ENDPOINTS` ใน `data/datasources/dashboard.api.datasource.ts`

| Use case | Method / Path | Response | FastAPI |
|---|---|---|---|
| GetDashboardStats | `GET /dashboard/stats` | `{ totalDevices, onlineDevices, activeAlerts, todayCommands }` | ❌ |
| GetRevenueChart | `GET /dashboard/revenue?period=monthly` | `[{ period, amount }]` | ❌ |
| GetJobStatus | `GET /dashboard/job-status` | `[{ status, count }]` | ❌ |
| GetTopParts | `GET /dashboard/top-parts?limit=5` | `[{ partName, count }]` | ❌ |
| GetReports | `GET /reports` | `[{ id, name, type, createdAt, status, reportType }]` | ❌ |
| GenerateReport | `GET /reports/export?type=&startDate=&endDate=` | `Blob` (PDF) | ❌ |

### เมื่อ backend เพิ่ม endpoint แล้ว

แก้เฉพาะ method นั้นใน datasource (ไม่ต้องแก้ repository / หน้าจอ):

```ts
import { API_PREFIX, api } from '@/src/core/http/api-client';

async getStats(): Promise<DashboardStatsResponseDto> {
  return api.get<DashboardStatsResponseDto>(`${API_PREFIX}${DASHBOARD_ENDPOINTS.stats}`);
}
```

---

## 3. โครงสร้าง Folder

```
src/features/dashboard/
├── index.ts                                   ← barrel export
├── domain/
│   ├── entities/
│   │   ├── dashboard-stats.entity.ts          ← DashboardStats, RevenueData, JobStatusSummary, TopPartData
│   │   └── report.entity.ts                   ← DashboardReport, DashboardReportStatus, GenerateDashboardReportParams
│   ├── repositories/dashboard.repository.ts   ← IDashboardRepository (Promise)
│   ├── services/dashboard-metrics.ts          ← คำนวณ % / สี badge / i18n key (ย้ายออกจาก component)
│   └── use-cases/
│       ├── get-dashboard-stats.use-case.ts
│       ├── get-revenue-chart.use-case.ts
│       ├── get-job-status.use-case.ts
│       ├── get-top-parts.use-case.ts
│       ├── get-reports.use-case.ts
│       └── generate-report.use-case.ts
├── data/
│   ├── dtos/
│   │   ├── dashboard-stats-response.dto.ts
│   │   └── report-response.dto.ts
│   ├── datasources/dashboard.api.datasource.ts ← DASHBOARD_ENDPOINTS + notAvailable()
│   └── repositories/dashboard.repository.impl.ts ← DTO → entity, กันข้อมูลผิดรูป
└── presentation/
    ├── dashboard.container.ts                 ← DI wiring (แทน DASHBOARD_REPOSITORY token)
    ├── hooks/use-dashboard-data.ts            ← useDashboardSections: โหลดหลายส่วนพร้อมกัน แยก error
    ├── components/welcome-illustration.tsx    ← <img src="/img/illustrations/welcome-good-info.svg">
    └── pages/
        ├── main-dashboard.tsx
        ├── analytics.tsx
        └── reports.tsx

app/(dashboard)/dashboard/
├── page.tsx                                   ← /dashboard
├── analytics/page.tsx                         ← /dashboard/analytics
└── reports/page.tsx                           ← /dashboard/reports

public/img/illustrations/welcome-good-info.svg ← คัดลอกจาก Angular shared/welcome-illustration
tests/unit/features/dashboard/dashboard.test.ts
```

---

## 4. Domain

### Entity

```ts
interface DashboardStats   { totalDevices; onlineDevices; activeAlerts; todayCommands }
interface RevenueData      { period: string; amount: number }
interface JobStatusSummary { status: string; count: number }
interface TopPartData      { partName: string; count: number }
interface DashboardReport  { id; name; type; createdAt; status: 'ready' | 'generating' | string; reportType }
```

> ชื่อ `DashboardReport` (ไม่ใช่ `Report`) เพราะ `src/features/index.ts` export ทุก feature
> และ feature `report` มี `Report` อยู่แล้ว

### dashboard-metrics.ts

| ฟังก์ชัน | ทำอะไร |
|---|---|
| `onlineRate(stats)` | `onlineDevices / totalDevices` เป็น % (0 ถ้าไม่มีอุปกรณ์) |
| `revenueBarHeight(amount, data)` / `totalRevenue(data)` | ความสูงแท่งกราฟ / ยอดรวม |
| `jobStatusLabel` / `jobStatusBadge` / `jobStatusPercent` | i18n key / สี badge / % ของ job status |
| `partPercent(count, data)` | % เทียบค่าสูงสุด |
| `normalizeReportStatus` | `พร้อม` → `ready`, `กำลังสร้าง` → `generating` |
| `reportStatusLabel` / `reportStatusClass` / `canDownloadReport` | สถานะรายงาน |

### Repository (`DashboardRepositoryImpl`)

- ค่าตัวเลขที่ไม่ใช่ตัวเลข → `0`
- response ที่ควรเป็น array แต่ไม่ใช่ (เช่น `{ detail: 'Not Found' }`) → `[]`
- แปลงสถานะรายงานภาษาไทยด้วย `normalizeReportStatus`

---

## 5. หน้าจอ

### `/dashboard` (main-dashboard)

| ส่วน | ข้อมูล |
|---|---|
| Page header | `dashboard.overview` / `dashboard.title` |
| Welcome card + illustration | online rate, online / total devices |
| Stat cards 4 ใบ | Total devices, Online devices, Today's commands, Active alerts |
| Revenue (monthly) | กราฟแท่ง + ยอดรวม (THB) |
| Job status | badge + progress ต่อสถานะ |
| Locations | placeholder (เหมือน Angular) |
| Storage | **ข้อมูลตัวอย่างคงที่** (มาจาก template Angular) |
| Top parts | ตาราง 5 อันดับ |
| Most visited pages | **ข้อมูลตัวอย่างคงที่** (มาจาก template Angular) |
| Tabler icons | การ์ดลิงก์ |

### `/dashboard/analytics`

Stat cards 4 ใบ + กราฟรายได้รายเดือน + Summary list

### `/dashboard/reports`

ตาราง Recent reports — ปุ่ม Download ใช้ได้เฉพาะสถานะ `ready`,
ช่วงวันที่ default `2026-01-01 … 2026-03-31` (เหมือน Angular), ไฟล์ `<reportType>_report.pdf`

---

## 6. Mapping Angular → React

| Angular | React |
|---|---|
| `@Injectable` + `inject(HttpClient)` | class ธรรมดา + `api` client (`src/core/http/api-client.ts`) |
| `Observable<T>` | `Promise<T>` |
| `@Inject(DASHBOARD_REPOSITORY)` | `presentation/dashboard.container.ts` |
| `BehaviorSubject` + `async` pipe | `useDashboardSections()` + `useState` |
| `takeUntil(destroy$)` | ตัวแปร `cancelled` ใน `useEffect` cleanup |
| method ใน component (`onlineRate`, `statusBadge` …) | `domain/services/dashboard-metrics.ts` |
| `TranslatePipe` | `useI18n().t` |
| `WelcomeIllustrationComponent` (SVG inline 25 KB) | `public/img/illustrations/welcome-good-info.svg` + `<img>` |
| `| number` / `| currency:'THB'` | `Intl.NumberFormat` |

---

## 7. ต่างจาก Angular

| เรื่อง | Angular | React |
|---|---|---|
| stats โหลดไม่ได้ | ซ่อนทั้งหน้า (`*ngIf="stats$ \| async"`) | แสดงหน้า + กล่อง ApiUnavailable แต่ละส่วนแสดงสถานะของตัวเอง |
| การ์ด Today's commands / Active alerts | ซ้ำ 2 ชุด (copy-paste) | แสดงชุดเดียว |
| ข้อมูลรูปผิด | `list.map` crash ได้ | repository กันไว้ |
| แปล `dashboard.onlineRate` | ไม่มี key | fallback "Online rate" |

---

## 8. Test

```bash
npx vitest run tests/unit/features/dashboard   # 10 tests
```

ครอบคลุม: helper ทุกตัวใน dashboard-metrics, repository (map stats, non-array → `[]`,
แปลงสถานะไทย), use case ส่ง `limit` ต่อ, datasource → `ApiNotAvailableError`

---

## 9. งานที่ยังไม่ได้ทำ

- FastAPI: เพิ่ม `/api/v1/dashboard/{stats,revenue,job-status,top-parts}` และ `/api/v1/reports`, `/reports/export`
- Storage / Most visited pages ยังเป็นข้อมูลตัวอย่าง (เหมือน Angular) — ต่อ API จริงหรือเอาออก
- `dashboard.onlineRate` ยังไม่มีในไฟล์แปล
- Reports: ช่วงวันที่ยัง fix ตาม Angular — ควรมีตัวเลือกวันที่
