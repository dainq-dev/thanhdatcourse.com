# Spec 18: Lead Management Enhancement (Khách hàng tiềm năng nâng cao)

**Status:** Draft
**Created:** 2026-08-09
**Ref Brainstorming:** `.docs/brainstorming-4-admin-modules.md`
**Related BRD:** `.docs/brd/08-contact-lead-management.md`
**Related Spec:** `.docs/specs/08-contact-lead-management.md` (base)

---

## Feature Description

Nâng cấp module Leads hiện tại với: search, hiển thị tên khóa học, form đăng ký tư vấn trên course detail (tự động gắn courseId), export CSV, click-to-call SĐT, admin nhập tay lead, và pagination.

---

## Nghiệp vụ Leads

### Nguồn Leads trong dự án Minh Travel

```
┌─────────────────────────────────────────────────────────────────────┐
│                        NGUỒN LEADS                                 │
├─────────────────┬─────────────────┬────────────────────────────────┤
│  TRANG LIÊN HỆ  │  TRANG KHÓA HỌC │  NHẬP TAY (ADMIN)             │
│  /lien-he       │  /khoa-hoc/     │                                │
│                 │  [slug]         │                                │
├─────────────────┼─────────────────┼────────────────────────────────┤
│ Form chung:     │ Form đăng ký    │ Admin nhập lead từ:            │
│ - Tên           │ tư vấn:         │ - Facebook / Zalo message      │
│ - Email         │ - Tên           │ - YouTube comment              │
│ - SĐT           │ - SĐT           │ - Điện thoại gọi đến           │
│ - Lời nhắn      │ - Email         │ - Người quen giới thiệu        │
│                 │                 │                                │
│ courseId: NULL  │ courseId: X     │ courseId: manual select        │
│ status: NEW     │ status: NEW     │ status: NEW                    │
└─────────────────┴─────────────────┴────────────────────────────────┘
                                  │
                                  ▼
                    ┌──────────────────────┐
                    │     LEADS TABLE       │
                    │  id, course_id,       │
                    │  customer_name,       │
                    │  customer_email,      │
                    │  customer_phone,      │
                    │  message, status,     │
                    │  admin_notes,         │
                    │  created_at           │
                    └──────────────────────┘
                                  │
                                  ▼
                    ┌──────────────────────┐
                    │   ADMIN XỬ LÝ        │
                    │                      │
                    │ 1. Xem danh sách     │
                    │    filter theo status│
                    │ 2. Search tên/SĐT    │
                    │ 3. Click SĐT → gọi   │
                    │ 4. Ghi chú + đổi     │
                    │    trạng thái         │
                    │ 5. Export CSV        │
                    │    gửi team sales    │
                    │                      │
                    │ Status flow:         │
                    │ NEW → CONTACTED      │
                    │     → CONVERTED ✓    │
                    │     → CANCELLED ✗    │
                    └──────────────────────┘
```

---

## User Stories

### US-18.1: Admin search và filter leads nâng cao

> **As an** Administrator
> **I want to** search leads by name, phone, or email
> **So that** I can quickly find a specific lead when they call back

**Acceptance Criteria:**
- Search bar nhận input: tên, SĐT, hoặc email
- Debounced 300ms. **Server-side search:** thêm query param `?search=` vào GET `/api/leads` (backend filter by name/phone/email). Cần thêm `like` query + import vào `leads.ts`
- Giữ nguyên filter tab hiện tại (NEW/CONTACTED/CONVERTED/CANCELLED)
- Kết hợp filter status + search text

### US-18.2: Hiển thị tên khóa học trong lead

> **As an** Administrator
> **I want to** see which course a lead is interested in
> **So that** I can tailor my consultation to the right course

**Acceptance Criteria:**
- Khi lead có `courseId` → hiển thị tên khóa học bên cạnh tên khách
- Fetch course names 1 lần khi load page, cache vào map `{id: title}`
- Nếu course đã bị xóa → hiển thị "Khóa học đã xóa"

### US-18.3: Click-to-call và quick actions

> **As an** Administrator
> **I want to** quickly call or message a lead
> **So that** I can follow up immediately without copying the number

**Acceptance Criteria:**
- SĐT hiển thị dạng link `tel:0909123456` → click để gọi (mobile) hoặc mở app gọi (desktop)
- Email hiển thị dạng link `mailto:` → click để mở mail client
- Copy SĐT button (icon copy) → 1 click copy vào clipboard

### US-18.4: Export CSV

> **As an** Administrator
> **I want to** export lead data to CSV
> **So that** I can share with the sales team or import into CRM

**Acceptance Criteria:**
- Nút "Xuất CSV" trên thanh toolbar
- Export toàn bộ leads đang filter (tôn trọng status filter hiện tại)
- CSV columns: Tên, Email, SĐT, Khóa học, Lời nhắn, Trạng thái, Ghi chú admin, Ngày tạo
- Tự động download file với tên `leads-{date}.csv`, UTF-8 with BOM (để Excel mở đúng tiếng Việt)
- Dữ liệu được escape đúng chuẩn CSV (dấu phẩy, xuống dòng trong message)

### US-18.5: Form đăng ký tư vấn trên Course Detail

> **As a** Website Visitor
> **I want to** register for consultation about a specific course
> **So that** I can get personalized advice before purchasing

**Acceptance Criteria:**
- Section "Đăng ký tư vấn" ở cuối course detail page
- Form nhẹ: Tên (required), SĐT (required), Email (optional)
- Tự động gắn `courseId` từ course hiện tại
- Submit → POST `/api/leads` với `courseId`
- Success message: "Cảm ơn bạn! Chúng tôi sẽ liên hệ tư vấn về khóa học [tên khóa học]"
- Không popup, không intrusive — embedded section trong page flow
- Rate limit: 3 submissions/IP/hour (dùng chung middleware)

### US-18.6: Admin nhập tay lead

> **As an** Administrator
> **I want to** manually add leads from external channels
> **So that** I can track leads from Facebook, Zalo, phone calls in one place

**Acceptance Criteria:**
- Nút "Thêm lead" trên toolbar → mở form nhỏ (modal hoặc inline)
- Fields: Tên (required), SĐT (required), Email (optional), Khóa học (select, optional), Lời nhắn (optional), Nguồn (select: Facebook/Zalo/YouTube/Phone/Other — saved as prefix in admin_notes: "Nhập tay từ [Nguồn]")
- Không cần migration — nguồn lead được lưu vào `admin_notes` dạng structured prefix
- Status mặc định: NEW
- Sau khi tạo → lead xuất hiện trong list, filter NEW

### US-18.7: Pagination

> **As an** Administrator
> **I want to** paginate through leads
> **So that** the page doesn't slow down with hundreds of leads

**Acceptance Criteria:**
- Phân trang: 20 leads/page
- Pagination controls: "← Trước", "Sau →", page info "Trang 1 / 5"
- Tôn trọng filter + search hiện tại khi chuyển trang
- Backend hỗ trợ `page` và `limit` query params (đã có)

---

## BDD Scenarios

```gherkin
Feature: Lead Search & Filtering

  Background:
    Given I am logged in as an Administrator
    And I navigate to "/quan-tri-vien/khach-hang"
    And there are leads: "Nguyễn Văn A" (phone: 0909000001), "Trần Thị B" (phone: 0909000002)

  Scenario: Search by name (happy path)
    When I type "Nguyễn" in the search bar
    Then after 300ms, I see only "Nguyễn Văn A"
    And "Trần Thị B" is hidden

  Scenario: Search by phone number (happy path)
    When I type "0909000002" in the search bar
    Then I see only "Trần Thị B"

  Scenario: Search combined with status filter
    Given "Nguyễn Văn A" is status "CONTACTED"
    When I filter by status "CONTACTED"
    And I search "Nguyễn"
    Then I see "Nguyễn Văn A"
    When I filter by status "NEW"
    And I search "Nguyễn"
    Then I see no results

  Scenario: Search no results (edge case)
    When I search "xyznotfound"
    Then I see "Không tìm thấy lead nào"


Feature: Course Name Display

  Background:
    Given a lead has course_id = "course-1"
    And course "course-1" is "TikTok Cơ Bản"

  Scenario: Show course name next to lead (happy path)
    When I view the leads list
    Then next to the lead name, I see tag "TikTok Cơ Bản"

  Scenario: Lead without course (happy path)
    Given a lead has course_id = NULL
    When I view the leads list
    Then no course tag is shown

  Scenario: Course deleted (edge case)
    Given a lead has course_id pointing to a deleted course
    When I view the leads list
    Then I see tag "Khóa học đã xóa"


Feature: Click-to-Call & Quick Actions

  Scenario: Click phone number to call
    Given a lead with phone "0909123456"
    When I click the phone number
    Then the browser opens tel:0909123456

  Scenario: Copy phone number
    When I click the copy icon next to the phone number
    Then "0909123456" is copied to clipboard
    And a toast "Đã copy SĐT" appears

  Scenario: Click email to compose
    Given a lead with email "a@email.com"
    When I click the email
    Then the browser opens mailto:a@email.com


Feature: Export CSV

  Background:
    Given there are 10 leads with status "NEW"

  Scenario: Export current filter to CSV (happy path)
    When I click "Xuất CSV"
    Then a CSV file "leads-{today}.csv" is downloaded
    And the file contains 10 rows (1 header + 10 data)
    And columns are: Tên, Email, SĐT, Khóa học, Lời nhắn, Trạng thái, Ghi chú, Ngày tạo

  Scenario: Export with active filter
    When I filter by status "CONTACTED" (3 leads)
    And I click "Xuất CSV"
    Then the CSV contains only 3 leads

  Scenario: Export empty list
    Given there are no leads
    When I click "Xuất CSV"
    Then a CSV with only headers is downloaded

  Scenario: CSV escape special characters
    Given a lead message contains commas, quotes, and newlines
    When I export CSV
    Then the message field is properly escaped with double quotes


Feature: Course Detail Consultation Form

  Background:
    Given I am a visitor on "/khoa-hoc/tiktok-co-ban"
    And the course has id "course-1"

  Scenario: Submit consultation request (happy path)
    When I scroll to "Đăng ký tư vấn" section
    And I fill in:
      | Tên          | Nguyễn Văn A          |
      | Số điện thoại | 0909123456            |
      | Email        | a@email.com           |
    And I click "Gửi yêu cầu tư vấn"
    Then POST /api/leads is called with course_id = "course-1"
    And I see success message "Cảm ơn bạn! Chúng tôi sẽ liên hệ tư vấn về khóa học TikTok Cơ Bản"

  Scenario: Submit with minimum fields (happy path)
    When I fill in only Tên and SĐT
    And I click "Gửi yêu cầu tư vấn"
    Then the request is submitted successfully
    And email is sent as empty

  Scenario: Validation - missing required fields (error path)
    When I leave Tên empty
    And I click "Gửi yêu cầu tư vấn"
    Then I should see "Vui lòng nhập họ tên"

  Scenario: Rate limiting (error path)
    Given I have submitted 3 requests in the last hour
    When I try to submit a 4th request
    Then I should see "Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau."


Feature: Admin Manual Lead Entry

  Background:
    Given I am logged in as an Administrator
    And I navigate to "/quan-tri-vien/khach-hang"

  Scenario: Add lead manually (happy path)
    When I click "Thêm lead"
    Then a form appears
    When I fill in:
      | Tên          | Lê Văn C              |
      | SĐT          | 0909000003            |
      | Email        | c@email.com           |
      | Khóa học     | TikTok Cơ Bản         |
      | Lời nhắn     | Nhắn trên Facebook    |
      | Nguồn        | Facebook              |
    And I click "Lưu"
    Then POST /api/leads is called
    And admin_notes contains "Nhập tay từ Facebook"
    And the new lead appears in the NEW list

  Scenario: Manual entry minimum fields (happy path)
    When I click "Thêm lead"
    And I fill in only Tên and SĐT
    And I click "Lưu"
    Then the lead is created with status "NEW"

  Scenario: Manual entry missing name (error path)
    When I click "Thêm lead"
    And I leave Tên empty
    And I click "Lưu"
    Then I should see "Vui lòng nhập tên khách hàng"


Feature: Pagination

  Scenario: Navigate pages
    Given there are 50 leads in total
    When the page loads
    Then I see 20 leads (page 1)
    And pagination shows "Trang 1 / 3"
    When I click "Sau →"
    Then I see leads 21-40
    And pagination shows "Trang 2 / 3"

  Scenario: Filter respects pagination
    Given there are 50 leads total, 10 with status "CONVERTED"
    When I filter by "CONVERTED"
    Then I see all 10 leads on 1 page
    And pagination shows "Trang 1 / 1"
```

---

## Technical Constraints

| Constraint | Detail |
|---|---|
| **DB Table** | `leads` (không cần migration mới) |
| **API** | GET/POST/PUT `/api/leads` (đã có sẵn) |
| **Search** | Server-side qua query param `?search=` (backend cần thêm logic, xem section Backend Changes). Đảm bảo hoạt động với pagination |
| **CSV Export** | Generate CSV string client-side, download qua Blob + `URL.createObjectURL` |
| **Course names** | Fetch 1 lần `GET /api/courses?published=true`, cache `{id: title}` map |
| **Rate limit** | Dùng chung middleware `rate-limit.ts` (3/IP/hour) cho cả contact form và course form |
| **Admin manual entry** | Nguồn lead lưu vào `admin_notes` dạng structured prefix: "Nhập tay từ Facebook". Không cần migration mới |

---

## API Endpoints

| Method | Endpoint | Auth | Thay đổi |
|--------|----------|------|----------|
| `POST` | `/api/leads` | Public | Giữ nguyên, đã hỗ trợ `courseId` |
| `GET` | `/api/leads?status=&page=&limit=&search=` | Admin | **Thêm `search` param** (backend filter by name/phone/email) |
| `PUT` | `/api/leads/:id` | Admin | Giữ nguyên |

---

## Backend Changes

**1. Thêm `search` support vào GET `/api/leads` (`apps/api/src/routes/leads.ts`):**

Cần thêm import `like`, `or` từ drizzle-orm và xử lý query param `search`:

```typescript
import { and, count, desc, eq, like, or } from "drizzle-orm";

// Trong GET "/" handler, sau dòng const conditions = []:
const search = c.req.query("search");
if (search) {
  conditions.push(
    or(
      like(leads.customerName, `%${search}%`),
      like(leads.customerPhone, `%${search}%`),
      like(leads.customerEmail, `%${search}%`),
    )
  );
}
```

**2. Đăng ký search query param không cần Zod validator** — backend đã dùng manual `c.req.query()` nên có thể thêm trực tiếp.

---

## Dependencies

- Spec 08 (base Leads spec — form submit, admin management)
- Spec 03 (Course Management — course detail page + course name display)
- Backend: `apps/api/src/routes/leads.ts` (cần thêm search param)
- Backend: `apps/api/src/middleware/rate-limit.ts` (đã có)

---

## Next Steps

`/bdd-review` → `/bdd-dev`
