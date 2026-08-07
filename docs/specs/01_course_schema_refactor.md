# Specs: Kiến Trúc Schema Khóa Học & Hệ Sinh Thái Landing Page

**Tham chiếu**: `/bdd-spec`, `/brainstorming`, `/way-of-reasoning`
**Mục tiêu**: Thiết lập hệ thống dữ liệu "Không Cẩu Thả" - tối ưu e-commerce (Pricing/Campaign) và định nghĩa giao diện (Sections) chặt chẽ, dựa trên dẫn chứng thực tế từ các trang Sales Page đỉnh cao của Minh Travel.

---

## 1. Tư Duy Kiến Trúc: Pricing & Promotions (E-commerce Core)

Việc lưu cả `originalPrice` và `discountedPrice` thẳng vào bảng sản phẩm là tư duy tĩnh (static). 

**Giải pháp Chuẩn (Enterprise E-commerce Pattern):**
1. Bảng `courses` CHỈ LƯU `base_price` (Giá trị cốt lõi của sản phẩm).
2. Tách **Discount/Campaign** thành module riêng.
3. Liên kết qua M2M (Polymorphic) để một chiến dịch có thể áp lên nhiều Khóa học.

**Refactor Bảng `promotions` (Chiến dịch khuyến mãi)**
- Xóa `courseId` (đang bị hard-code).
- Thêm cơ chế Giảm giá: `%` (Percentage) hoặc `Tiền mặt` (Cash).
- Thêm `entity_promotions` để map chiến dịch với đối tượng cụ thể.

```typescript
export const promotions = sqliteTable("promotions", {
  id: text("id").primaryKey(),
  campaignName: text("campaign_name").notNull(),
  discountType: text("discount_type").notNull(), // 'percentage' | 'fixed_amount'
  discountValue: integer("discount_value").notNull(), 
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  isActive: integer("is_active").notNull().default(1),
});

export const entityPromotions = sqliteTable("entity_promotions", {
  id: text("id").primaryKey(),
  promotionId: text("promotion_id").references(() => promotions.id),
  entityType: text("entity_type").notNull(), // 'course' | 'product'
  entityId: text("entity_id").notNull(),
});
```

---

## 2. Thư Viện Các Sections Cho Khóa Học (Zod Strict Types)

Sau khi đào sâu phân tích kiến trúc của cả 2 trang (30 Ngày & Quay Video Chuyên Nghiệp), 1 trang Sales Page chuyển đổi cao (High-converting) sẽ bao gồm các building-blocks sau. Bằng cách định nghĩa chặt chẽ chúng, Admin có thể tự do ghép nối mà không làm hỏng UI/UX.

### Nhóm 1: Hook & Authority (Gây ấn tượng ban đầu)

**1. Hero Trailer Section (Video/Ảnh mở màn)**
- **Mục đích**: Vùng đập vào mắt đầu tiên, chứa cam kết lớn nhất.
- **Zod Schema**:
  ```typescript
  z.object({
    type: z.literal("hero"),
    data: z.object({
      badges: z.array(z.string()).max(2),
      headline: z.string(),
      subtitle: z.string(),
      trailerVideoUrl: z.string().optional(),
      primaryCta: z.object({ label: z.string(), href: z.string() }),
      trustNote: z.string().optional() // VD: "Cam kết hoàn tiền trong 7 ngày"
    })
  })
  ```

**2. Brands / Equipment Showcase (Thiết bị/Báo chí)**
- **Mục đích**: "Khóa học này dạy trên thiết bị nào?" (Sony, Canon, DJI...) hoặc "Đã xuất hiện trên".
- **Zod Schema**:
  ```typescript
  z.object({
    type: z.literal("brands_proof"),
    data: z.object({
      title: z.string(),
      logoMediaIds: z.array(z.string())
    })
  })
  ```

### Nhóm 2: Empathy & Desires (Khơi gợi nỗi đau & Mong muốn)

**3. Pain Points Grid (Nỗi đau học viên)**
- **Mục đích**: Liệt kê những khó khăn học viên đang gặp phải (VD: "Quay bị rung?", "Màu xỉn?").
- **Zod Schema**:
  ```typescript
  z.object({
    type: z.literal("pain_points"),
    data: z.object({
      title: z.string(),
      items: z.array(z.object({ icon: z.string(), text: z.string() }))
    })
  })
  ```

**4. Target Audience (Khóa học này dành cho ai?)**
- **Mục đích**: Lọc đúng tệp khách hàng.
- **Zod Schema**:
  ```typescript
  z.object({
    type: z.literal("target_audience"),
    data: z.object({
      title: z.string(),
      audiences: z.array(z.string()), // VD: ["Vlogger mới bắt đầu", "Chủ shop online"]
      mediaId: z.string().optional()
    })
  })
  ```

**5. Transformations / Outcomes (Kết quả đạt được)**
- **Mục đích**: Trình bày before/after hoặc các giá trị nhận được.
- **Zod Schema**:
  ```typescript
  z.object({
    type: z.literal("outcomes"),
    data: z.object({
      title: z.string(),
      items: z.array(z.object({ 
        title: z.string(), 
        description: z.string(),
        mediaId: z.string().optional() 
      }))
    })
  })
  ```

### Nhóm 3: Core Value (Sản phẩm cốt lõi)

**6. Curriculum Roadmap (Lộ trình học)**
- **Mục đích**: Hiển thị các chương bài.
- **Zod Schema**: *Chỉ cần lưu cấu hình UI, Data sẽ tự fetch từ bảng `course_modules` & `course_lessons`.*
  ```typescript
  z.object({
    type: z.literal("curriculum"),
    data: z.object({
      title: z.string(),
      theme: z.enum(["accordion", "list", "grid"])
    })
  })
  ```

**7. Instructor Bio (Thông tin giảng viên)**
- **Mục đích**: Xây dựng uy tín cá nhân (Minh Travel).
- **Zod Schema**:
  ```typescript
  z.object({
    type: z.literal("instructor"),
    data: z.object({
      name: z.string(),
      role: z.string(),
      bio: z.string(),
      avatarMediaId: z.string(),
      stats: z.array(z.object({ label: z.string(), value: z.string() })) // VD: "100k Subs", "5 năm KN"
    })
  })
  ```

### Nhóm 4: Sales & Conversion (Đẩy mạnh chuyển đổi)

**8. Testimonial Gallery (Feedback thực tế)**
- **Mục đích**: Thay vì review text khô khan, dùng lưới ảnh màn hình chat Zalo/FB ngập tràn.
- **Zod Schema**:
  ```typescript
  z.object({
    type: z.literal("testimonial_gallery"),
    data: z.object({
      title: z.string(),
      galleryMediaIds: z.array(z.string()), 
      layout: z.enum(["masonry", "grid", "carousel"])
    })
  })
  ```

**9. Bonus Stack (Quà tặng Kèm)**
- **Mục đích**: Tăng giá trị vô hình (LUT màu, Group kín). 
- **Zod Schema**: *Tự fetch từ bảng `course_bonuses`.*
  ```typescript
  z.object({
    type: z.literal("bonus_stack"),
    data: z.object({ title: z.string() })
  })
  ```

**10. Pricing & Countdown CTA (Bảng giá chốt sale)**
- **Mục đích**: Nơi chốt sale với giá gốc (gạch chéo), giá hiện tại (fetch từ Base Price - Promotion), và đồng hồ đếm ngược.
- **Zod Schema**:
  ```typescript
  z.object({
    type: z.literal("pricing_cta"),
    data: z.object({
      promotionId: z.string().optional(), // Trỏ tới Campaign để lấy đếm ngược & Giá giảm
      features: z.array(z.string()), // VD: ["Sở hữu vĩnh viễn", "Hỗ trợ 1-1"]
      cta: z.object({ label: z.string(), href: z.string() })
    })
  })
  ```

**11. FAQ Accordion**
- **Zod Schema**: *Data fetch từ bảng `entity_faqs`*
  ```typescript
  z.object({ type: z.literal("faq"), data: z.object({ title: z.string() }) })
  ```

---
> Nhờ 11 loại Section chuẩn Zod này, Admin có thể tự xây dựng 1 trang Sales Page cực kỳ dài và chuyên nghiệp như Elementor nhưng đảm bảo dữ liệu gọn gàng 100% dạng JSON Array. Không có code HTML rác vào DB!
