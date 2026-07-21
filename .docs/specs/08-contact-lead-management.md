# Spec 08: Contact Form & Lead Management

**Status:** Draft  
**Created:** 2026-07-21  
**Blueprint ref:** `DYNAMIC-CONVERSION-BLUEPRINT.md` Section 2.11, Section 6.10  

---

## Feature Description

Trang Liên hệ (frontend) cho phép khách gửi tin nhắn → lưu vào `leads` table. Admin dashboard có trang quản lý leads: xem, lọc theo trạng thái, ghi chú, đổi trạng thái (NEW → CONTACTED → CONVERTED → CANCELLED). Contact info (address, phone, email, hours) lấy từ site_settings.

---

## User Stories

### US-08.1: Khách gửi tin nhắn liên hệ

> **As a** Website Visitor  
> **I want to** submit a contact form  
> **So that** I can ask questions or request consultations

**Acceptance Criteria:**
- Form fields: Họ và tên (required), Email (required, validate format), Số điện thoại (optional), Lời nhắn (required)
- Submit → POST `/api/leads` → success message
- Rate limit: 3 submissions/IP/giờ để chống spam
- Labels/placeholders có thể là hardcode UI text (không cần dynamic)
- Page header, contact info section lấy từ site_settings

### US-08.2: Admin xem và quản lý leads

> **As an** Administrator  
> **I want to** view and manage incoming leads  
> **So that** I can follow up with potential customers

**Acceptance Criteria:**
- Trang `/quan-tri-vien/khach-hang` — table leads
- Columns: Name, Email, Phone, Message (truncated), Course (nếu có), Status, Created date
- Filter by status: NEW, CONTACTED, CONVERTED, CANCELLED
- Click lead → expand/modal chi tiết
- Đổi status (dropdown: NEW → CONTACTED → CONVERTED | CANCELLED)
- Admin notes field (textarea, lưu riêng)
- Search by name, email, phone
- Badge màu cho status: NEW = blue, CONTACTED = yellow, CONVERTED = green, CANCELLED = red

### US-08.3: Contact info dynamic từ site_settings

> **As an** Administrator  
> **I want to** configure contact info in site settings  
> **So that** the contact page always shows up-to-date information

**Acceptance Criteria:**
- Contact info section: Địa chỉ, Email, Số điện thoại, Giờ làm việc
- Tất cả lấy từ site_settings: contact_address, contact_email, contact_phone, contact_hours
- Nếu setting trống → ẩn field đó (không hiện "Chưa có giá trị")

---

## BDD Scenarios

```gherkin
Feature: Contact Form

  Scenario: Visitor submits contact form successfully
    Given I am on "/lien-he"
    When I fill in:
      | Họ và tên     | Nguyễn Văn A          |
      | Email         | nguyenvana@email.com  |
      | Số điện thoại  | 0909123456            |
      | Lời nhắn       | Tôi muốn tư vấn khóa học |
    And I click "Gửi lời nhắn"
    Then the form should submit POST "/api/leads"
    And I should see success message from site_settings
    And a lead record should be created with status "NEW"

  Scenario: Form validation - missing required fields
    Given I am on "/lien-he"
    When I leave name empty and click "Gửi lời nhắn"
    Then I should see "Vui lòng nhập họ tên"

  Scenario: Form validation - invalid email
    When I fill in email "not-an-email" and click "Gửi lời nhắn"
    Then I should see "Email không hợp lệ"

  Scenario: Rate limiting
    Given I have submitted 3 forms in the last hour
    When I try to submit a 4th form
    Then I should see "Bạn đã gửi quá nhiều tin nhắn. Vui lòng thử lại sau."

Feature: Lead Management

  Background:
    Given I am logged in as an Administrator
    And I navigate to "/quan-tri-vien/khach-hang"

  Scenario: View lead list with filters
    Given there are 10 leads: 5 NEW, 3 CONTACTED, 2 CONVERTED
    When the page loads
    Then I should see all 10 leads
    When I filter by status "NEW"
    Then I should see only 5 leads

  Scenario: Update lead status
    Given a lead with status "NEW"
    When I click on the lead
    Then a detail panel should open showing full message
    When I change status to "CONTACTED"
    And I add admin note "Đã gọi, hẹn tư vấn thứ 5"
    And I click "Lưu"
    Then the lead status should update to "CONTACTED"
    And the note should be saved

  Scenario: Contact info dynamic
    Given site_settings has contact_phone = "0900 123 456"
    When I view the contact page
    Then I should see "0900 123 456" in the info section
    Given site_settings has no contact_address
    When I view the contact page
    Then the address line should not be rendered
```

---

## Technical Constraints

| Constraint | Detail |
|---|---|
| **DB Table** | `leads` |
| **Rate Limit** | Per IP, 3/hour (Hono rate-limiter hoặc middleware custom) |
| **Spam Protection** | Có thể thêm honeypot field (hidden input, nếu filled → bot) |
| **Form Submit** | Client-side `'use client'` component, POST qua fetch |
| **Admin UI** | Table + detail panel, không cần modal riêng |

---

## API Endpoints

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| `POST` | `/api/leads` | Public | Submit lead (rate limited) |
| `GET` | `/api/leads` | Admin | List (query: status, search, page) |
| `PUT` | `/api/leads/:id` | Admin | Update status + notes |

---

## Dependencies

- Spec 01 (site_settings cho contact info, page header)
- Spec 09, Spec 10

---

## Next Steps

`/bdd-review` → `/bdd-dev`
