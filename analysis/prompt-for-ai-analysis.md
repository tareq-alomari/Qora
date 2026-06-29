# 🏗️ AI Prompt — تحليل مشروع برمجي احترافي
# Software Project Analysis Generator

> استخدم هذا الـ prompt مع أي ذكاء اصطناعي (Claude, ChatGPT, Gemini)  
> لإنشاء تحليل كامل لأي مشروع برمجي — جاهز للبرمجة.

---

## Instructions for the AI

You are a senior software consultant tasked with performing a complete analysis for the following project. You must follow the methodology below strictly.

### Methodology: 9-Phase Analysis Framework (First Principles)

Every software project goes through these 9 phases. The framework is STANDARD — only the answers change.

```
Phase 1: Business & Vision (why build it?)
Phase 2: Requirements Engineering (what to build exactly?)
Phase 3: System Architecture (how will we build it?)
Phase 4: Database Design (where do we store data?)
Phase 5: API & Integrations (how do services connect?)
Phase 6: UI/UX Design (how will users interact?)
Phase 7: DevOps & Deployment (how do we operate it?)
Phase 8: Security & Risks (how do we protect it?)
Phase 9: Testing & QA (how do we ensure quality?)
```

### Output Requirements

1. Create files in `analysis/{phase-number}-{name}/` with numbered files
2. Every file MUST answer the specific question in its header
3. Language: Code in English, Content in the user's language
4. Depth: Every file should be 100-300 lines of actionable content
5. Use **Mermaid.js** for all diagrams (`graph TB`, `erDiagram`, `stateDiagram-v2`, `sequenceDiagram`) — no ASCII art
6. Reference real numbers (costs, time estimates, competitors)

---

## TEMPLATE: Per-Phase File Structure

### Phase 1: Business & Vision (01_Business_and_Vision/)

```
README.md               → Phase index with file listing
Business_Model_Canvas.md → Value proposition, customer segments, revenue, costs (BMC)
Value_Proposition.md     → What problem do we solve? Customer retention, lifecycle
Market_and_Competitors.md → Market size, target audience, real competitors, SWOT
Unit_Economics.md        → CAC, LTV, Break-Even, margin per unit
Financial_Projections.md → 3-year P&L, cash flow, 3 scenarios (optimistic/expected/conservative)
Marketing_Strategy.md    → Channels, personas, campaigns, budget, calendar
Team_Structure.md        → Roles, salaries, hiring timeline, seasonal/perm
Product_Roadmap.md       → 12-24 month timeline with milestones
Risk_Analysis.md         → 10+ business risks with RPN matrix + heat map
```

**For each file, answer:** Who are the users? TAM/SAM/SOM? Competitor prices + weaknesses? Revenue model? Unit cost? Break-even? Channels? Team size? Major milestones? Top 3 critical risks?

### Phase 2: Requirements Engineering (02_Requirements_Engineering/)

```
README.md               → Phase index with file listing
PRD.md                  → Product Requirements Document (all FRs + NFRs + Release Criteria + OKRs)
User_Personas.md        → 3-5 detailed personas with names, ages, devices, pains, channels
Functional_Requirements.md → All FRs + NFRs + User Stories + Use Cases in one file
```

**Key insight:** PRD is THE master document. Consolidate everything there. User stories go inside functional requirements.

### Phase 3: System Architecture (03_System_Architecture/)

```
README.md               → Phase index with file listing
Architecture_Overview.md → Mermaid: high-level diagram, ERD, State Machine, 3 sequence diagrams
Architecture_Decision_Records_ADR.md → ADRs (at least 8), with justification for EVERY choice
System_Flowcharts.md    → Mermaid: DFD Level 0/1/2 for core processes
Official_Submission.md  → Mermaid: external site automation, queue, CAPTCHA strategy (if applicable)
Failure_Scenarios.md    → 6+ scenarios with early warning + manual fallback
```

**For ADRs:** "Why Express not NestJS?" "Why PostgreSQL not MongoDB?" — real reasons, not hype. ALL diagrams in Mermaid.

### Phase 4: Database Design (04_Database_Design/)

```
README.md               → Phase index with file listing
Entity_Relationship_Diagram_ERD.md → ERD with SQL, indexes, JSONB, migrations, RLS
Data_Requirements.md    → Data classification, volumes, lifecycle, storage estimates
```

**Optional extras:** Caching_Strategy.md (Redis, CDN), Data_Dictionary.md (field-by-field reference)

### Phase 5: API & Integrations (05_API_and_Integrations/)

```
README.md               → Phase index with file listing
RESTful_Endpoints_Draft.md → API endpoints with method, path, auth, role, request/response format
Integration_Requirements.md → External services, APIs, fallback chains, costs
Third_Party_Integrations.md → Payment gateways, SMS, email — each with auth method + cost + fallback
Notifications.md        → Notification chain: WhatsApp→PWA→SMS→Email
Payment_Reconciliation.md → Payment matching, accounting cycle, fraud detection
```

**Optional extras:** WebSockets_and_Events.md (for real-time features)

### Phase 6: UI/UX Design (06_UI_UX_Design/)

```
README.md               → Phase index with file listing
User_Journey_Maps.md    → Complete step-by-step journey (time per step) + site map + workflows
Client_Dashboard.md     → Client screens, wizards, order tracking
Admin_Dashboard.md      → Admin screens, user management, reports, settings
Employee_Operations.md  → Employee review flow, daily timeline, task queue (Mermaid)
Post_Payment_Workflow.md → Payment verification → official submission → result checking
Design_System.md        → Colors, typography, spacing, components, RTL rules
Wireframes_and_Layouts.md → Every key screen in 4 states (default/loading/error/empty)
Content_Strategy.md     → Copy, FAQs, video scripts, photo guides, canned responses
Mobile_First.md         → PWA, responsive breakpoints, touch targets, 3G performance
Onboarding_Trust.md     → Trust moments, first 5 minutes, first 24 hours
Accessibility.md        → WCAG AA: keyboard, ARIA, contrast 4.5:1, screen readers
User_Testing.md         → 5 personas, SUS score, 7 scenarios, report template
```

**Key insight:** Design for the WEAKEST user (worst internet, cheapest phone, lowest tech literacy). Mobile-first.

### Phase 7: DevOps & Deployment (07_DevOps_and_Deployment/)

```
README.md               → Phase index with file listing
Project_Setup.md        → From git clone to running locally (step-by-step)
Coding_Standards.md     → Folder structure, naming, patterns with ✅/❌ examples
Module_Template.md      → Complete module: routes, controller, service, model (reference implementation)
Error_Handling.md       → 50+ error codes, AppError class, HTTP status, centralized handler
Validation_Schemas.md   → Joi/Zod schemas for every endpoint
Component_Library.md    → UI component tree, hooks, stores, services
Docker_and_Containers.md → VPS topology (Mermaid), Docker Compose, environments
Deployment_Strategy.md  → Dev/Staging/Prod, CI/CD, zero-downtime, rollback
CI_CD_Pipelines.md      → GitHub Actions, Docker build, deploy to VPS
Monitoring_and_Logs.md  → Health checks, alert channels, thresholds
Logging.md              → Logger setup, JSON structure, levels, retention
Disaster_Recovery.md    → 10+ scenarios with RTO/RPO, backup strategy
Runbook.md              → Founder continuity: passwords, servers, emergency contacts
Customer_Support.md     → Channels, hours, templates, 4 escalation levels
Maintenance.md          → Daily/weekly/monthly/seasonal task schedule
Reports_Analytics.md    → KPIs, dashboards, SQL queries, automated alerts
```

**Key insight:** The module template is copied for EVERY new feature. Make it perfect with comments explaining WHY.

### Phase 8: Security & Risks (08_Security_and_Risks/)

```
README.md               → Phase index with file listing
Threat_Model.md         → Security risks with RPN (Probability × Impact), mitigation strategies
Security_Architecture.md → JWT strategy, RBAC matrix, encryption (AES-256), rate limiting, traffic
Data_Privacy.md         → Legal compliance, data protection, encryption at rest/transit, retention
Privacy_Policy.md       → Full privacy policy text (ready to publish)
Terms_of_Service.md     → Full ToS text (ready to publish)
Fraud_Prevention.md     → Rules engine, detection algorithms, thresholds, audit trail
Security_Testing.md     → OWASP Top 10 penetration testing, 30+ security tests
```

### Phase 9: Testing & QA (09_Testing_and_QA/)

```
README.md               → Phase index with file listing
QA_Testing_Strategy.md  → Unit/Integration/E2E pyramid, tools, coverage targets
Test_Cases.md           → 50+ test cases across all modules + state machine matrix (12×12)
Testing_Guide.md        → Jest patterns, mocks, coverage targets, practical examples
Performance_Testing.md  → K6/Artillery scripts, SLOs, stress/soak tests
UAT.md                  → UAT protocol, 6 personas, 7 scenarios, SUS score
Pre_Launch_Checklist.md → 100+ GO/NO-GO conditions across all categories
```

**For test cases:** Cover EVERY state machine transition. Happy path + error path + edge cases.

---

## The 80/20 Rule for Each File

```
README.md in each folder:
├── 20%: One-paragraph summary of the phase
├── 60%: Table listing actual files with #, name, size, description
└── 20%: Notes on merged files or gaps

Content files (01-xx.md):
├── 10%: Header with phase name + file name
├── 70%: Actionable content with tables, lists, Mermaid diagrams
├── 10%: Examples with ✅/❌
└── 10%: Cross-references to other files
```

---

## Quality Gates for Each File

```
Before moving to the next file, verify:
□ Does it answer the question in its header?
□ Are there specific numbers (costs, times, percentages)?
□ Are competitors named (not "some competitors")?
□ Are the examples practical (not generic)?
□ Would a developer know what to build after reading it?
□ Would a new team member understand the system?
□ Are Mermaid diagrams included for all architecture/flow content (no ASCII art)?
□ Does README.md list ALL files in that folder with sizes?
```

---

## Example: Market Analysis Template

```markdown
# تحليل السوق — Market Analysis

> **{Project Name}** — السوق المستهدف، الحجم، الجمهور

## 1. السوق المستهدف

| القطاع | الحجم | النسبة المستهدفة |
|--------|-------|-----------------|
| {Segment 1} | {X users} | {Y%} |
| {Segment 2} | {X users} | {Y%} |

## 2. المشكلة

| المشكلة | الحل في {Project} |
|---------|------------------|
| {Pain point 1} | {Solution 1} |
| {Pain point 2} | {Solution 2} |

## 3. Pricing Comparison

| المنافس | السعر | نقاط القوة | نقاط الضعف |
|---------|-------|-----------|-----------|
| {Competitor 1} | {Price} | {...} | {...} |
| {Ours} | {Price} | {...} | {...} |

## 4. SWOT

### Strengths
- ...

### Weaknesses
- ...

### Opportunities
- ...

### Threats
- ...
```

---

## Final Master Index

After creating all files, generate `analysis/INDEX.md` with:

1. **Project structure tree** — ASCII tree of analysis/ directory
2. **Overview table** — 9 phases with file counts and the question each phase answers
3. **Per-phase file listing** — Every file with name, size, short description
4. **Quick Reference** — 40+ questions answered with file paths (e.g., "How do we make money?" → `01_Business_and_Vision/Business_Model_Canvas.md`)
5. **Audience reading guide** — "Beginner starts here, Developer starts here"

---

## Time Estimate

| Project size | Files | Time for AI |
|-------------|-------|-------------|
| 🟢 Small (landing page + API) | 15-20 core files | 2-3 sessions |
| 🟡 Medium (MVP with auth + payments) | 30-40 files | 5-8 sessions |
| 🔴 Large (enterprise, multi-service) | 60-80 files | 10-20 sessions |

Start with the core 20 files (business model, PRD, architecture overview, DB design) — you can always expand later.

---

*This prompt template is derived from Qor3a (قرعة) — July 2026*
*An actual project analysis: 65 files, 1.2MB, 9 phases, 100% coverage.*
