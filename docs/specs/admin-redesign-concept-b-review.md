# BDD Review: Admin Redesign Concept B

**Date**: 2026-08-02
**Spec under review**: `docs/specs/admin-redesign-concept-b.md`
**Reviewer**: AI (adversarial-reviewer)

---

## Challenge Round 1: Missing Scenarios

### C1: Pricing Tiers vs Existing basePrice/originalPrice — Conflict?

**Challenge**: Spec mô tả PricingEditor riêng, nhưng DB schema hiện tại có `basePrice` và `originalPrice` là 2 cột riêng trên bảng `courses`. Nếu thêm pricing tiers (multi-tier), 2 cột này còn dùng không? Public course page hiện đọc `basePrice` — ai migrate?

**Recommendation**: 
- Option A: Giữ `basePrice` + `originalPrice` cho backward compat, `pricingTiers` JSON là extension. Public page đọc tiers trước, fallback về basePrice.
- Option B: Deprecate `basePrice`, migrate data, chỉ dùng `pricingTiers`.

**Đề xuất**: Option A (an toàn hơn, không break public page đang chạy).

### C2: Không có scenario xóa khóa học từ list page

Spec có xóa cho portfolio/products nhưng không mention xóa cho course. Admin edit form chỉ có "Hủy". Cần thêm:

```
Scenario: Admin xóa khóa học từ list
  Given admin ở /quan-tri-vien/khoa-hoc
  When admin bấm "Xóa" trên một khóa học
  Then confirm dialog hiển thị "Xóa khóa học '{tên}'?"
  And cảnh báo "Thao tác này sẽ xóa tất cả chương, bài học, ưu đãi, giảng viên liên quan"
  When admin xác nhận
  Then API DELETE /api/courses/{id} được gọi (cascade delete)
  And khóa học biến mất khỏi danh sách
```

### C3: Không có scenario cho việc thay đổi slug

Nếu admin đổi slug của khóa học đã published, link cũ sẽ 404. Cần handle:

```
Scenario: Admin đổi slug khóa học đã published
  Given khóa học có slug "khoa-hoc-cu" và isPublished = 1
  When admin đổi slug thành "khoa-hoc-moi"
  Then hiển thị warning "Slug đã thay đổi. Link cũ sẽ không còn hoạt động."
  And auto-save lưu slug mới
  And public page mới ở /khoa-hoc/khoa-hoc-moi
  And /khoa-hoc/khoa-hoc-cu trả về 404
```

### C4: Pricing tiers — không có spec về storage

Spec nói "auto-save lưu pricing tiers vào DB" nhưng không rõ lưu ở đâu. Hiện courses API không có field `pricingTiers`.

**Recommendation**: Thêm field `pricingTiers` text (JSON) vào bảng `courses`, hoặc dùng `contentBlocks` JSON field hiện có. Đề xuất field riêng `pricing_tiers TEXT` để tách biệt concern.

### C5: Student stories — không spec về API route registration

Spec có student stories API routes nhưng không mention việc đăng ký route vào `apps/api/src/index.ts`.

**Fix**: Thêm task vào Sprint 4 checklist.

### C6: Portfolio featured — maximum?

Nếu admin đánh dấu 10 portfolios là featured, homepage sẽ hiển thị bao nhiêu? Cần cap hoặc sort by `featuredOrder`.

```
Scenario: Quá nhiều portfolio featured
  Given có 10 portfolio isFeaturedOnHome = 1
  When public page gọi GET /api/portfolios?featured=true
  Then API trả về tối đa 6 items, sắp xếp theo featuredOrder ASC
```

### C7: Media picker trong dark theme

MediaTrigger component có render đúng trên dark theme không? Nút "Chọn ảnh" trên nền tối có bị mất không? Cần verify sau Sprint 1.

---

## Challenge Round 2: Edge Cases & Performance

### C8: Curriculum tree với 50+ modules

Nếu khóa học có 50 chương (unlikely but possible với combo masterclass có 14 chương, mỗi chương 10+ bài), tree performance thế nào?

**Recommendation**: Virtualize only if needed (dùng `react-window`). Hiện tại max ~200 nodes (14 chương × 15 bài) — vẫn OK cho DOM. Không cần virtualize ngay.

### C9: Student story không có thumbnail

```
Scenario: Story hiển thị placeholder khi không có thumbnail
  Given story có thumbnailUrl = null
  When user xem public course page
  Then hiển thị avatar placeholder với initials
  And không hiển thị ảnh vỡ
```

### C10: Public page rendering — contentBlocks không tồn tại

Nếu khóa học chưa có contentBlocks (field null), public page có break không?

```
Scenario: Course không có contentBlocks
  Given course.contentBlocks = null
  When user xem /khoa-hoc/{slug}
  Then trang render bình thường, không có section content blocks
  And không throw error
```

Already handled implicitly by `&&` condition, but should be explicit.

### C11: Auto-save debounce race condition

Nếu admin gõ rất nhanh (thay đổi field liên tục trong < 1.5s), multiple debounce timers có conflict không?

Spec đã mention `clearTimeout` trong useEffect — OK.

Nhưng nếu admin thay đổi title → slug cũng đổi → 2 PUT requests xảy ra? Cần verify slug update chỉ gửi 1 request cuối cùng.

### C12: Preview iframe với 3rd-party content

Nếu course có externalCheckoutUrl dẫn đến `go.minhtravel.vn`, iframe preview có load được không? (cross-origin issues, CSP headers).

**Recommendation**: iframe preview chỉ render internal content, không load external checkout links. Đã là iframe cùng origin (`/khoa-hoc/{slug}`) — OK.

---

## Challenge Round 3: Consistency & UX Edge Cases

### C13: View toggle persistence

Khi admin chuyển card → table view, refresh trang có giữ view preference không?

```
Scenario: View toggle không persist mặc định
  Given admin chọn table view
  When admin reload trang
  Then quay về card view (default)
  [OPTIONAL] Có thể lưu vào localStorage nếu cần
```

Không cần persist ngay — low priority.

### C14: Form reset sau khi tạo thành công

```
Scenario: Tạo liên tiếp nhiều portfolio
  Given admin vừa tạo một portfolio thành công và redirect về list
  When admin bấm "Tạo dự án mới" lần nữa
  Then form hiển thị trống, không còn dữ liệu cũ
```

Redirection đã handle việc này — OK.

### C15: Block editor — max blocks?

Block editor trong posts không giới hạn số blocks. Liệu courses có cần giới hạn không?

Không cần giới hạn — block editor tự handle.

### C16: Countdown timer timezone

`saleEndDate` lưu dạng ISO string. Timezone mặc định là gì? UTC? Asia/Ho_Chi_Minh?

**Recommendation**: Lưu ISO UTC. Client-side chuyển đổi sang local timezone để hiển thị. Rõ ràng trong label: "Ngày kết thúc (UTC)".

### C17: Sidebar 11 items — scroll on small screens

Trên laptop 13" (height ~800px), sidebar có 11 items + logo + padding — có overflow không?

Tính toán: logo ~56px + margin 30px = 86px. 11 items × ~44px = 484px. Nav padding ~24px. Total ~594px. Còn ~206px space → OK. Đã có `overflow-y: auto`.

---

## Challenge Round 4: Migration & Rollback

### C18: Existing course data migration

Nếu đang có courses trong production DB, sau khi deploy Sprint 3-4, public page cần render được cả courses cũ (không có contentBlocks, saleEndDate, pricingTiers) và mới.

**Recommendation**: Tất cả field mới phải optional (nullable trong DB, optional trong Zod schema). Public page render conditionally.

### C19: Admin dark theme — ảnh hưởng public pages?

Admin global styles được import trong `layout.tsx` — có leak sang public pages không?

**Answer**: CSS modules scoped nên không leak. `admin-global.scss` chỉ có CSS custom properties — chúng được define trong `:root` và `:root` chỉ ảnh hưởng nếu elements tham chiếu. Public pages dùng brand variables riêng. Tuy nhiên, cần verify không có class name collision.

**Recommendation**: Chỉ import `admin-global.scss` trong admin layout, không import trong root layout.

### C20: Nếu có bug dark theme nghiêm trọng — rollback?

Nếu Sprint 1 deploy và admin không dùng được, làm sao rollback?

**Recommendation**: Commit từng sprint riêng. Có thể revert commit. CSS changes là additive (thêm `admin-global.scss`, sửa `layout.module.scss`) — dễ revert.

---

## Verdict Summary

| # | Challenge | Verdict | Action |
|---|-----------|---------|--------|
| C1 | Pricing tiers vs basePrice conflict | **REVISE** | Spec cần rõ: giữ basePrice, pricingTiers là extension |
| C2 | Thiếu scenario xóa khóa học | **REVISE** | Thêm US xóa khóa học |
| C3 | Slug change warning | **REVISE** | Thêm scenario đổi slug published course |
| C4 | Thiếu storage location cho pricingTiers | **REVISE** | Spec rõ: thêm cột `pricing_tiers TEXT` |
| C5 | Thiếu route registration | **ACCEPTED** | Đã có trong implementation plan, chỉ cần thêm note |
| C6 | Portfolio featured max | **REVISE** | Thêm cap 6 items, sort by featuredOrder |
| C7 | Media picker dark theme verify | **DEFER** | Kiểm tra trong Sprint 1 |
| C8 | 50+ modules performance | **ACCEPTED** | Không cần virtualize với scale hiện tại |
| C9 | Story missing thumbnail | **REVISE** | Thêm fallback avatar initials |
| C10 | contentBlocks null render | **ACCEPTED** | Đã xử lý, thêm scenario |
| C11 | Debounce race condition | **ACCEPTED** | Đã có clearTimeout |
| C12 | iframe cross-origin | **ACCEPTED** | iframe same-origin |
| C13 | View toggle persist | **DEFER** | Low priority, không cần ngay |
| C14 | Form reset after create | **ACCEPTED** | Đã handle |
| C15 | Block editor max blocks | **ACCEPTED** | Không cần limit |
| C16 | Countdown timezone | **REVISE** | Lưu UTC, hiển thị local, label rõ |
| C17 | Sidebar overflow | **ACCEPTED** | Đã có overflow-y: auto |
| C18 | Backward compat | **REVISE** | Tất cả field mới phải optional |
| C19 | CSS leak public pages | **REVISE** | Import admin-global trong admin layout, không phải root |
| C20 | Rollback strategy | **ACCEPTED** | Commit riêng từng sprint |

---

## Revised Items to Add to Spec

The following scenarios need to be added to the spec before proceeding to implementation:

1. **US2.5: Xóa khóa học** — confirm cascade delete với cảnh báo
2. **US4.1a: Đổi slug khóa học đã published** — warning về broken links
3. **US4.4a: Pricing tiers storage & backward compat** — giữ basePrice + dùng JSON tiers
4. **US7.3: Backward compatibility** — tất cả field mới optional, public page render conditionally
5. **US2.1a: Portfolio featured cap** — max 6, sort featuredOrder
6. **US5.3a: Story fallback thumbnail** — avatar initials
7. **US5.2a: Countdown timezone** — UTC storage + local display
8. **US1.1a: Admin layout import scope** — admin-global.scss chỉ import trong admin layout
