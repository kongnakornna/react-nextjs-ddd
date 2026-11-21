## เอกสารสถาปัตยกรรม React + Next.js + DDD
## IoT Monitoring Web Application

---

## บทนำ

เอกสารนี้อธิบายสถาปัตยกรรมของระบบ **IoT Monitoring Web Application** ที่พัฒนาด้วย **React 18 + Next.js 14** โดยใช้หลักการ **Domain-Driven Design (DDD)** และ **Clean Architecture**

โปรเจกต์นี้เป็นการ migrate จาก Angular 21 มาเป็น React/Next.js โดยรักษาโครงสร้างแบบ Clean Architecture และเพิ่มประสิทธิภาพด้วย Server Components, Server Actions และ App Router ของ Next.js

### วัตถุประสงค์

1. **แยกชั้นการทำงาน (Separation of Concerns)**: แยก Business Logic, UI, และ Infrastructure ออกจากกันอย่างชัดเจน
2. **ทดสอบง่าย (Testability)**: สามารถเขียน Unit Test และ E2E Test ได้ครอบคลุม
3. **บำรุงรักษาง่าย (Maintainability)**: โค้ดมีโครงสร้างชัดเจน ค้นหาและแก้ไขได้รวดเร็ว
4. **ขยายตัวได้ (Scalability)**: เพิ่ม Feature ใหม่ได้โดยไม่กระทบระบบเดิม
5. **ยืดหยุ่น (Flexibility)**: สลับ Database, API Backend หรือ UI Framework ได้ง่าย

### กลุ่มเป้าหมาย

เอกสารนี้เหมาะสำหรับ:
- **Full-stack Developers** ที่ต้องการทำความเข้าใจโครงสร้างโปรเจกต์
- **Frontend Developers** ที่จะพัฒนา UI และ Feature ใหม่
- **Backend Developers** ที่ต้องเชื่อมต่อ API กับ Frontend
- **DevOps Engineers** ที่ต้อง deploy และ maintain ระบบ
- **Architects** ที่ต้องการศึกษาหรือปรับปรุงสถาปัตยกรรม

### ความรู้พื้นฐานที่ต้องมี

- TypeScript, React Hooks, Next.js App Router
- Clean Architecture, DDD, Dependency Injection
- RESTful API, HTTP Client (fetch)
- Zod (Schema Validation)
- Git, Docker

---

## นิยามศัพท์ (Glossary)

| ศัพท์ | ความหมาย |
|------|----------|
| **Clean Architecture** | สถาปัตยกรรมที่แยกชั้นการทำงานตามหลัก Dependency Rule (ชั้นในไม่รู้จักชั้นนอก) |
| **DDD (Domain-Driven Design)** | แนวทางออกแบบซอฟต์แวร์ที่มุ่งเน้นที่ Business Domain เป็นหลัก |
| **Entity** | โมเดลข้อมูลหลัก (Domain Model) ที่มี identity เช่น User, Customer, Device |
| **Use Case** | กรณีการใช้งานเฉพาะ (Business Logic) เช่น CreateCustomer, GetDevice |
| **Repository** | Interface สำหรับการเข้าถึงข้อมูล (Data Access Layer) |
| **Data Source** | ตัวเชื่อมต่อกับแหล่งข้อมูลจริง เช่น REST API, Database |
| **DTO (Data Transfer Object)** | โครงสร้างข้อมูลที่ใช้ส่งต่อระหว่างชั้น |
| **DI (Dependency Injection)** | รูปแบบการส่งมอบ dependencies ให้กับ class/function |
| **BFF (Backend for Frontend)** | Adapter Layer ระหว่าง Frontend และ Backend |
| **Server Component** | React Component ที่ทำงานฝั่ง Server (Next.js) |
| **Server Action** | Function ที่ทำงานฝั่ง Server และเรียกจาก Client Component |

---

[... เนื้อหาส่วนอื่นของเอกสารเดิมยังคงอยู่ทั้งหมด ...]

---

# ภาคผนวก A: AI-Assisted Development (tb-* Skills) สำหรับทีมพัฒนา

> **อ้างอิง:** จาก เล่ม 10 (ฉบับขยาย): คู่มือ AI-Assisted Development (tb-* Skills)
>
> **ผู้แต่ง:** kongnakorn jantakun
> **อีเมล:** kongnakornjantakun@gmail.com

---

## A.1 บทนำและปรัชญา AI-Assisted Development

### A.1.1 ทำไมต้อง AI-Assisted Development?

```
┌─────────────────────────────────────────────────────────────┐
│              PROBLEM vs SOLUTION                            │
└─────────────────────────────────────────────────────────────┘

  ปัญหาของการพัฒนาแบบเดิม:
  • เข้าใจ Task ผิด → Rework สูง
  • ไม่มี Plan → Implement วกวน
  • ไม่มี Safety Net → บั๊กหลุดถึง Prod
  • Context หาย → AI ตอบผิด

  Solution: Structured AI Workflow
  • Brainstorm ก่อน → ลด Misunderstanding
  • Plan ก่อน → ลด Rework
  • Scrutinize ก่อน Merge → ลด Defect
  • Context ชัด → AI ตอบตรง
```

### A.1.2 ปรัชญา 3 ข้อ

| หลักการ | ความหมาย | ผลลัพธ์ |
|---------|----------|---------|
| **Think Before Code** | เข้าใจก่อนลงมือ | ลด Rework |
| **Plan Before Execute** | วางแผนก่อนทำ | ลดการวกวน |
| **Verify Before Merge** | ตรวจสอบก่อนรวม | ลด Defect |

### A.1.3 AI เป็น "Pair Programmer" ไม่ใช่ "Auto-Coder"

```
❌ ผิด: Developer → AI → Code → Merge
   (AI ทำงานแทนทั้งหมด)

✅ ถูก: Developer ↔ AI (Brainstorm) → Plan → Execute → Scrutinize → Merge
   (AI เป็นคู่คิด, Developer เป็นผู้ตัดสินใจ)
```

**Developer ยังต้อง:**
- ตัดสินใจสุดท้าย (Final Decision)
- เข้าใจ Code ที่ AI สร้าง
- รับผิดชอบต่อ Code ที่ Merge
- Review ก่อน Commit

---

## A.2 tb-* Skills Overview

### A.2.1 แผนผัง Skills

```
┌─────────────────────────────────────────────────────────────┐
│                    tb-* SKILLS MAP                          │
└─────────────────────────────────────────────────────────────┘

  ┌──────────────────────────────────────────────────────┐
  │                  UNDERSTANDING PHASE                 │
  │  /tb-brainstorming  ──►  ทำความเข้าใจ · หา Assumption │
  └──────────────────────┬───────────────────────────────┘
                         │
                         ▼
  ┌──────────────────────────────────────────────────────┐
  │                  PLANNING PHASE                      │
  │  /tb-writing-plans  ──►  แบ่ง Subtask · Decision Log  │
  └──────────────────────┬───────────────────────────────┘
                         │
                         ▼
  ┌──────────────────────────────────────────────────────┐
  │                  EXECUTION PHASE                     │
  │  /tb-executing-plans  ──►  Implement + Test          │
  │  /tb-test-driven-development  ──►  Fix + Test        │
  └──────────────────────┬───────────────────────────────┘
                         │
                         ▼
  ┌──────────────────────────────────────────────────────┐
  │                  VERIFICATION PHASE                  │
  │  /tb-scrutinize  ──►  Logic + Side Effects (GATE)    │
  └──────────────────────┬───────────────────────────────┘
                         │
                         ▼
  ┌──────────────────────────────────────────────────────┐
  │                  DEBUGGING PHASE                     │
  │  /tb-investigate-error  ──►  Root Cause              │
  └──────────────────────────────────────────────────────┘
```

### A.2.2 ตาราง Skills (ละเอียด)

| Skill | เฟส | ใช้เมื่อ | Input | Output | เวลา |
|-------|-----|---------|-------|--------|------|
| `/tb-brainstorming` | Understanding | เริ่ม Task ใหม่ / ไม่ชัด | Task Description, Context | Assumptions, Questions, Scope | 5–15 นาที |
| `/tb-writing-plans` | Planning | ต้องวางแผน | Brainstorm Output | Subtasks, Decisions, Risks | 10–20 นาที |
| `/tb-executing-plans` | Execution | ลงมือ | Plan | Code + Tests | ตาม Task |
| `/tb-investigate-error` | Debugging | Bug / Error | Error Log, Reproduction | Root Cause, Fix Direction | 10–30 นาที |
| `/tb-test-driven-development` | Execution | แก้ Bug จุดเดียว | Bug Description | Test + Fix | 5–15 นาที |
| `/tb-scrutinize` | Verification | ก่อน Merge (บังคับ) | Code Diff, Context | Review Report, Issues | 5–10 นาที |

---

## A.3 Workflow Integration

### A.3.1 Normal Development Workflow

```
┌─────────────────────────────────────────────────────────────┐
│              NORMAL DEVELOPMENT WORKFLOW                    │
└─────────────────────────────────────────────────────────────┘

  Step 1: รับ Story Task จาก PO
         │
         ▼
  Step 2: /tb-brainstorming
         ├─ ระบุ Assumptions
         ├─ ถาม Questions
         └─ ยืนยัน Scope
         │
         ▼
  Step 3: /tb-writing-plans
         ├─ แบ่ง Subtasks
         ├─ Decision Log
         └─ Test Strategy
         │
         ▼
  Step 4: /tb-executing-plans (ทีละ Subtask)
         ├─ Implement
         ├─ Test
         └─ Commit (Atomic)
         │
         ▼
  Step 5: /tb-scrutinize (MANDATORY GATE)
         ├─ ผ่าน → Step 6
         └─ Fail → Fix → Step 5
         │
         ▼
  Step 6: PR + Code Review → Merge → Deploy
```

### A.3.2 Bug Fix Workflow

```
┌─────────────────────────────────────────────────────────────┐
│                   BUG FIX WORKFLOW                          │
└─────────────────────────────────────────────────────────────┘

  🔍 Step 1: /tb-investigate-error (เริ่มเสมอ)
         │
         ├─ Path A: แก้หลายจุด
         │   │
         │   ▼
         │   /tb-writing-plans → /tb-executing-plans
         │
         └─ Path B: แก้จุดเดียว
             │
             ▼
             /tb-test-driven-development
         │
         ▼
  🛡 Step 2: /tb-scrutinize (MANDATORY GATE)
         ├─ ผ่าน → Merge
         └─ Fail → Fix → Scrutinize
         │
         ▼
  📝 Step 3: เพิ่ม Regression Test
         │
         ▼
  🔄 Step 4: Merge → Deploy
```

---

## A.4 การนำ tb-* Skills มาใช้กับโปรเจกต์นี้

### A.4.1 ตัวอย่าง: เพิ่ม IoT Device Feature

**Step 1: Brainstorming**

```markdown
/tb-brainstorming

Task: เพิ่ม API POST /iot/devices สำหรับลงทะเบียนอุปกรณ์ IoT ใหม่

Context:
- Repo: react-nextjs-ddd
- Stack: React 18, Next.js 14, TypeScript, FastAPI (Backend)
- Model: Device (id, device_name, device_type, location_id, status)
- Constraint: device_name ต้องไม่ซ้ำ, location_id ต้องมีอยู่จริง

Expected Output:
- Assumptions ที่ต้องยืนยัน
- Scope (In/Out)
- Questions สำหรับ PO/BA
- Potential Risks
```

**Step 2: Writing Plans**

```markdown
/tb-writing-plans

Brainstorm Output: [แนบผลจาก Step 1]

Expected Output:
- Subtasks:
  1. สร้าง Entity (src/features/iot/domain/entities/device.entity.ts)
  2. สร้าง Repository Interface
  3. สร้าง Use Cases (CreateDevice, GetDevice, ListDevices)
  4. สร้าง Data Source (IoTApiDataSource)
  5. สร้าง React Page Component
  6. เขียน Tests
- Decision Log
- Test Strategy
- Definition of Done
```

**Step 3: Executing Plans**

```markdown
/tb-executing-plans

Plan: [แนบ Plan จาก Step 2]

Current Subtask: Subtask 1 - สร้าง Entity

Context Files:
- src/features/iot/domain/entities/device.entity.ts
- src/features/iot/domain/repositories/iot.repository.ts

Constraints:
- ต้องใช้ Zod สำหรับ Validation
- ต้องมี TypeScript Type Safety
- ต้องมี Unit Test
```

**Step 4: Scrutinize**

```markdown
/tb-scrutinize

Code Changes: [แนบ Diff]

Context:
- Task: เพิ่ม POST /iot/devices
- Related Files: device.entity.ts, iot.repository.ts, device-list.tsx
- Business Rules: device_name unique, location_id exists

Checklist:
1. Logic ถูกต้อง?
2. Edge Cases ครบ?
3. Security?
4. Performance?
5. Test Coverage?
```

### A.4.2 Integration กับ Git Workflow

```
main
 │
 ├── feature/IOT-101-add-device-registration
 │   │
 │   ├── /tb-brainstorming → (ไม่ Commit)
 │   ├── /tb-writing-plans → Commit (docs/plan-IOT-101.md)
 │   ├── /tb-executing-plans
 │   │   ├── Subtask 1 → Commit (feat: add device entity)
 │   │   ├── Subtask 2 → Commit (feat: add device repository)
 │   │   ├── Subtask 3 → Commit (feat: add device use cases)
 │   │   └── Subtask 4 → Commit (feat: add device page)
 │   ├── /tb-scrutinize → (ไม่ Commit — เป็น Gate)
 │   └── PR → Review → Merge
```

---

## A.5 Definition of Done (เพิ่มเติม)

การ Merge Code จะต้องผ่าน DoD ต่อไปนี้:

- [ ] Code ผ่าน Lint + Type Check
- [ ] Unit Test Coverage ≥ 80%
- [ ] Integration Test ผ่าน
- [ ] Code Review Approve ≥ 1
- [ ] CI Pipeline ผ่าน
- [ ] Documentation / API Contract อัปเดต
- [ ] Deploy บน Staging ได้
- [ ] Observability พร้อม (Log, Metric)
- [ ] ไม่มี Secrets ในโค้ด
- [ ] **ผ่าน /tb-scrutinize** ← **MANDATORY GATE**

---

## A.6 KPI สำหรับ AI-Assisted Development

| KPI | เป้าหมาย | วิธีวัด |
|-----|----------|---------|
| **Rework Rate** | < 10% | % งานที่ต้องแก้หลัง Merge |
| **Defect Leakage** | < 5% | % บั๊กที่หลุดถึง Prod |
| **Time to First PR** | ≤ 1 วัน | เวลาจากเริ่ม Task ถึง PR แรก |
| **Scrutinize Pass Rate** | ≥ 95% | % ที่ผ่าน Scrutinize ครั้งแรก |
| **Brainstorm Coverage** | 100% | % Task ที่ใช้ Brainstorm |
| **Plan Adherence** | ≥ 90% | % ที่ทำตาม Plan |
| **Test Coverage** | ≥ 80% | % Code ที่มี Test |
| **Developer Satisfaction** | ≥ 4/5 | ความพึงพอใจจาก Survey |

---

## A.7 Anti-Patterns (สิ่งที่ต้องหลีกเลี่ยง)

| # | Anti-Pattern | ผลกระทบ | วิธีแก้ |
|---|--------------|---------|--------|
| 1 | เริ่ม Execute ทันที | Rework สูง | Brainstorm ก่อน |
| 2 | ไม่มี Plan | วกวน | Plan ก่อน Execute |
| 3 | ข้าม Scrutinize | บั๊กหลุด | บังคับทุกครั้ง |
| 4 | Merge โดยไม่เข้าใจ | Maintain ไม่ได้ | ต้องเข้าใจทุกบรรทัด |
| 5 | ใช้ AI แทนคิด | ทีมไม่โต | AI เป็นคู่คิด ไม่ใช่แทน |
| 6 | ไม่ให้ Context | AI ตอบผิด | ให้ Context ครบ |
| 7 | Prompt กว้างเกิน | AI สับสน | แบ่ง Prompt เล็กลง |
| 8 | ไม่มี Test | Bug เยอะ | Test ทุก Subtask |
| 9 | Commit รวมใหญ่ | Review ยาก | Commit Atomic |
| 10 | ไม่บันทึก Decision | ลืมเหตุผล | Decision Log |

---

## A.8 Best Practices

### A.8.1 Do's (สิ่งที่ควรทำ)

- ✅ Brainstorm ก่อนทุก Task ใหม่
- ✅ Plan ก่อน Execute
- ✅ Scrutinize ก่อน Merge (บังคับ)
- ✅ Test ทุก Subtask
- ✅ Commit Atomic (ทีละ Subtask)
- ✅ บันทึก Decision Log
- ✅ อ่านและเข้าใจ Code ที่ AI สร้าง
- ✅ ให้ Context ครบ (Repo, Stack, Files, Patterns, Constraints)
- ✅ ใช้ AI เป็นคู่คิด ไม่ใช่ Auto-Coder
- ✅ วัดผลด้วย KPI

### A.8.2 Don'ts (สิ่งที่ไม่ควรทำ)

- ❌ ข้าม Scrutinize
- ❌ Merge โดยไม่เข้าใจ
- ❌ ใช้ AI กับ Production โดยตรง
- ❌ Commit Secrets
- ❌ ใช้ Library ที่ไม่ตรวจสอบ
- ❌ ปล่อยให้ AI ตัดสินใจสุดท้าย
- ❌ ทำ Task ใหญ่ในครั้งเดียว
- ❌ ไม่เขียน Test
- ❌ ไม่บันทึก Plan
- ❌ Over-engineered

---

## A.9 FAQ (คำถามที่พบบ่อย)

**Q1: ต้องใช้ทุก Skill ทุกครั้งไหม?**
A: ไม่ — Task เล็กมาก (แก้ Typo) ข้าม Brainstorm/Plan ได้ แต่ **Scrutinize บังคับทุกครั้ง**

**Q2: ถ้า AI ตอบช้า / ค้าง ทำไง?**
A: ลองแบ่ง Prompt ให้เล็กลง, ให้ Context น้อยลง, ลอง Skill ที่เล็กลง (เช่น TDD แทน Execute)

**Q3: AI สร้าง Code ที่ไม่เข้าใจ ทำไง?**
A: **ห้าม Merge** — ถาม AI ให้อธิบายทีละบรรทัด หรือให้เขียน Comment ถ้ายังไม่เข้าใจ → ปรึกษา Senior

**Q4: Scrutinize ผ่าน แต่ Code Review ไม่ผ่าน ทำไง?**
A: ใช้ Feedback จาก Code Review มา Improve — อาจต้องกลับไป Brainstorm/Plan ใหม่

**Q5: ใช้ AI กับ Legacy Code ได้ไหม?**
A: ได้ — แต่ต้องให้ Context เยอะขึ้น (Architecture, Pattern) และระวัง AI ไม่รู้ Context เก่า

**Q6: AI แนะนำ Library ที่ไม่รู้จัก ควรใช้ไหม?**
A: **อย่าเพิ่ง** — ตรวจ:
1. Library มีจริงไหม?
2. Maintain อยู่ไหม?
3. License OK ไหม?
4. Security (CVE) ไหม?
ถ้าไม่แน่ใจ → ปรึกษา Architect

**Q7: ต้อง Commit Plan ไหม?**
A: **แนะนำ** — Commit `docs/plan-{TICKET}.md` เพื่อเป็น Reference ในอนาคต

**Q8: ใช้ AI กับ Production โดยตรงได้ไหม?**
A: **ไม่ได้** — ต้องผ่าน Branch → PR → Review → Merge → Deploy ตามปกติ

---

## A.10 สรุปสาระสำคัญ (Key Takeaways)

```text
┌─────────────────────────────────────────────────────────────┐
│              AI-ASSISTED DEVELOPMENT                        │
│                     KEY TAKEAWAYS                           │
└─────────────────────────────────────────────────────────────┘

  1. AI เป็นคู่คิด ไม่ใช่ Auto-Coder — Developer ตัดสินใจสุดท้าย
  2. Brainstorm ก่อนทุก Task — ลด Misunderstanding
  3. Plan ก่อน Execute — ลด Rework
  4. Execute ทีละ Subtask + Test — ลด Bug
  5. Scrutinize ก่อน Merge — บังคับทุกครั้ง
  6. Investigate ก่อน Fix Bug — หา Root Cause
  7. TDD สำหรับ Bug จุดเดียว — Red → Green → Refactor
  8. Context ครบ — AI ตอบตรง
  9. Fallback เมื่อ AI ผิด — ระบุ, เพิ่ม Context, ลองใหม่
  10. วัดผลด้วย KPI — Rework, Defect, Time to First PR
  11. Git Workflow — Commit Atomic, PR Template
  12. อย่า Merge โดยไม่เข้าใจ — ต้องเข้าใจทุกบรรทัด
```

---

## A.11 Daily Checklist สำหรับ Developer

### ก่อนเริ่มงาน
- [ ] อ่าน Story + AC ครบ
- [ ] ผ่าน `/tb-brainstorming`
- [ ] มี Plan / Subtask
- [ ] สร้าง Branch ถูกต้อง

### ระหว่างพัฒนา
- [ ] เขียน Test ควบคู่
- [ ] รัน Lint + Type Check
- [ ] ไม่ Commit Secrets
- [ ] อัปเดต API Contract

### ก่อนเปิด PR
- [ ] Test ผ่านทั้งหมด
- [ ] Coverage ≥ 80%
- [ ] ผ่าน `/tb-scrutinize`
- [ ] แนบ Test Evidence
- [ ] มี Rollback Plan

### หลัง Merge
- [ ] Deploy Staging สำเร็จ
- [ ] Monitor Log/Metric
- [ ] แจ้ง QA / PO
- [ ] อัปเดต Documentation

---

**จบภาคผนวก A: AI-Assisted Development (tb-* Skills)**

> หมายเหตุ: ภาคผนวกนี้เป็น **Living Document** ควรทบทวนและปรับปรุงตามการเปลี่ยนแปลงของ Workflow และ Best Practices ของทีม

---

## เอกสารอ้างอิง

| ไฟล์ | รายละเอียด |
|------|-----------|
| [README.md](../README.md) | ภาพรวมโปรเจกต์, Setup, คำสั่งพื้นฐาน |
| [architecture-guide.md](./architecture-guide.md) | คู่มือการพัฒนาและบำรุงรักษา Clean Architecture |
| [module-map.md](./module-map.md) | Module dependency map, สรุป Features ทั้งหมด |
| [migration-report.md](./migration-report.md) | รายงาน migration จาก Angular 21 → React/Next.js |
| [theme-guide.md](./theme-guide.md) | คู่มือ Tabler UI + Tailwind + Dark Mode |
| [plan.md](./plan.md) | แผนการ migrate Features (Phase 0-8) |
| [apiflow.md](./apiflow.md) | API Flow, Proxy Configuration, Authentication |
| **[Book/10-Book-AI-Assisted-Development.md](./Book/10-Book-AI-Assisted-Development.md)** | **เล่ม 10 ฉบับเต็ม: AI-Assisted Development** |

---

**Last Updated**: 21 พฤศจิกายน 2026
**Version**: 1.1.0
