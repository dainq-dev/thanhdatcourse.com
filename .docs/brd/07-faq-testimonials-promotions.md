# BRD 07: FAQ, Testimonials & Promotions Management

**Document Type:** Business Requirements Document
**Module:** FAQ, Testimonials & Promotions
**Version:** 1.0 | **Date:** 2026-07-21
**Ref Spec:** `.docs/specs/07-faq-testimonials-promotions.md`

---

## 1. Business Background

Ba module nhỏ nhưng quan trọng cho conversion:
- **FAQ:** Giải đáp thắc mắc của học viên tiềm năng, giảm rào cản mua hàng
- **Testimonials:** Social proof từ học viên cũ, tăng niềm tin
- **Promotions:** Chiến dịch giảm giá, tạo urgency (FOMO)

---

## 2. Business Requirements

| ID | Requirement | Priority |
|----|------------|----------|
| BR-07.1 | Admin CRUD FAQs (question, answer, gắn với course hoặc global) | Must Have |
| BR-07.2 | FAQs hiển thị accordion trên course detail và course listing page | Must Have |
| BR-07.3 | Admin CRUD testimonials (name, role, rating, quote, avatar, course) | Must Have |
| BR-07.4 | Featured testimonials hiển thị trên homepage | Should Have |
| BR-07.5 | Testimonials per course hiển thị trên course detail | Must Have |
| BR-07.6 | Admin CRUD promotions (campaign name, discount %, date range, course, active toggle) | Should Have |
| BR-07.7 | Active promotion hiển thị badge "Giảm X%" trên course card | Should Have |
| BR-07.8 | Promotion tự động hết hiệu lực khi qua end_date | Must Have |

---

## 3. Business Rules

| ID | Rule |
|----|------|
| BR-R1 | FAQ có course_id = NULL → global FAQ (hiển thị mọi nơi) |
| BR-R2 | FAQ có course_id → chỉ hiển thị trên course detail đó |
| BR-R3 | Testimonial rating 1-5 sao |
| BR-R4 | Testimonial is_featured = true → hiển thị trên homepage |
| BR-R5 | Chỉ 1 promotion active cho mỗi course tại 1 thời điểm |
| BR-R6 | Promotion is_active = true + start_date <= now <= end_date → mới hiển thị |

---

## 4. Process Flow

### 4.1 Promotion Lifecycle
```mermaid
sequenceDiagram
    actor Admin
    participant UI
    participant API
    participant DB as SQLite
    participant Frontend as Public Site

    Admin->>UI: Tạo promotion "Flash Sale 90%"
    Admin->>UI: Set course = "TikTok cơ bản", discount = 90%
    Admin->>UI: Set start = 2026-08-01, end = 2026-08-07
    Admin->>UI: Toggle "Kích hoạt"
    UI->>API: POST /api/promotions { ... is_active: true }
    API->>API: Check: no other active promo for this course
    API->>DB: INSERT INTO promotions
    API-->>UI: OK

    Note over Frontend: Ngày 2026-08-01
    Frontend->>API: GET /api/promotions/active?course_id=X
    API->>DB: SELECT WHERE course_id=X AND is_active=1 AND start<=now AND end>=now
    DB-->>API: Promotion found
    API-->>Frontend: { discount_percentage: 90 }
    Frontend->>Frontend: Hiển thị badge "Giảm 90%" trên course card

    Note over Frontend: Ngày 2026-08-08
    Frontend->>API: GET /api/promotions/active?course_id=X
    API->>DB: SELECT WHERE ... AND end>=now → now > end_date
    DB-->>API: No results
    API-->>Frontend: null
    Frontend->>Frontend: Ẩn badge (hết hạn)
```

---

## 5. Success Metrics

| Metric | Target |
|--------|--------|
| FAQ coverage (câu hỏi phổ biến được trả lời) | 100% |
| Testimonial hiển thị đầy đủ (avatar, rating, quote) | 100% |
| Promotion tự động hết hạn chính xác | 100% |
