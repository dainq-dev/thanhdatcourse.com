# Brainstorming Session: Site Concept System (Toàn Site)

**Date:** 18/08/2026
**Techniques:** Classic Brainstorm → Affinity Mapping → Feasibility Matrix → Multi-Perspective
**Ref:** trace codebase toàn bộ frontend public + backend, `.docs/brainstorming-multi-layout-config.md` (09/08)

---

## Phase 1: Frame the Problem

### Problem statement (1 câu)

Admin không hiểu tab "Giao diện" đang làm gì, vì hiện tại nó cho chọn "Template + Engine" nhưng (a) preview skeleton tĩnh không phản ánh lựa chọn, (b) engine chỉ đổi animation chứ không đổi layout, (c) homepage engine chết hẳn — nên chọn gì website cũng gần như không đổi.

### Bằng chứng đã xác minh (không suy đoán)

| # | Bằng chứng | File:line |
|---|---|---|
| E1 | Engine chỉ map → animation (`getMotionConcept`), không đổi layout | `apps/web/src/lib/motion.ts:40-49` |
| E2 | Chỉ 3 layout thật: courses `list`, portfolio `masonry`, products `single-col` | `courses-default.tsx:47`, `portfolio-default.tsx:50`, `presets-default.tsx:48` |
| E3 | Homepage engine dead — `void getHomepageEngines()` rồi vứt kết quả | `(nguoi-dung)/page.tsx:91` |
| E4 | Cinematic = re-export default | `_templates/homepage-cinematic.tsx:1` |
| E5 | Skeleton tĩnh, chỉ render theo `type`, không phản ánh engine | `skeletons/PageSkeleton.tsx`, `GridSkeleton.tsx` |
| E6 | Course detail dùng hệ render khác (SectionRenderer, 14 section type) | `khoa-hoc/[slug]/page.tsx:81`, `section-render-map.tsx` |
| E7 | Bài viết, liên hệ, dự án detail chưa có cơ chế template nào | `bai-viet/page.tsx`, `lien-he/page.tsx`, `san-pham/[id]/page.tsx` |

### Ask "Why" 3 lần

1. **Why** admin mơ hồ? → Vì preview không cho thấy kết quả thật trước khi lưu.
2. **Why** preview không cho thấy? → Vì skeleton tĩnh + engine không đổi layout nên không có gì khác biệt để thấy.
3. **Why** engine không đổi layout? → Vì chưa ai handcode các layout thật; engine chỉ được "đánh bóng" bằng animation map.

### Define success

1. Admin vào tab "Giao diện", thấy 1 lưới concept (5-7), mỗi cái có **preview render từ dữ liệu thật thu nhỏ**, nhìn là hiểu khác nhau chỗ nào.
2. Chọn 1 concept → **toàn site đồng bộ** (homepage, khóa học list+detail, dự án list+detail, công cụ, liên hệ, bài viết) đổi theo cùng 1 DNA.
3. Mỗi concept thật sự khác biệt ở 4 chiều: layout danh sách, thứ tự section, style visual, concept chủ đạo — không "same same".
4. Handcode thuần Server Component (SSR), motion/GSAP là progressive enhancement.

---

## Phase 2: Requirement đã chốt (từ Q&A)

| # | Quyết định |
|---|---|
| R1 | Gộp Template + Engine → **1 concept** (bố cục hoàn chỉnh) |
| R2 | **1 concept toàn site** (đồng bộ, không per-page) |
| R3 | **5-7 concept**, research pattern nổi bật, sáng tạo + chuyên nghiệp |
| R4 | **1 bước chọn + preview 1 concept đang chọn** (click → xem thu nhỏ ngay) |
| R5 | Khác biệt thật ở 4 chiều (layout list / section order / style / concept chủ đạo) |
| R6 | Preview dùng **dữ liệu thật, render thu nhỏ** |
| R7 | Lưu **1 key `site_concept`** (bỏ hẳn key template/engine cũ) |
| R8 | Concept = **Server Component thuần** (SSR) |
| R9 | **Phủ toàn bộ** trang (kể cả course detail SectionRenderer + liên hệ + bài viết) |
| R10 | Concept **toàn quyền layout + style** (được sắp xếp lại thứ tự section) |

---

## Phase 3: Research & Ý tưởng Concept (Divergent)

### Nguyên liệu data dùng chung (từ schema + component, đã trace)

- **Course**: title, description, basePrice, originalPrice, thumbnailUrl, slug, ratingCount, buttonText, level
- **Portfolio**: title, category, thumbnailUrl, youtubeVideoId, description
- **Product**: title, price, thumbnailUrl, youtubePreviewId, externalCheckoutUrl, tag (LUT/Preset)
- **Counter**: [{label, value}] · **Brand**: [name] · **FAQ**: [{question, answer}] · **Promotion**: banner + % + countdown + coupon
- **Section (course detail)**: 14 type — hero_banner, brand_logos, countdown_offer, trust_badges, curriculum_highlights, lesson_accordion, bonus_gifts, rich_text, testimonial_videos, featured_students, instructor_journey, sales_story, pricing_card, faq_accordion
- **Motion infra**: 6 concept (fade/slide/parallax/zoom/clip/cascade) + ScrollTrigger pin/scrub
- **Brand**: dark `#000` + accent `#FF005A`

### 7 Concept đề xuất (mỗi cái 1 DNA khác hẳn)

#### C1 — Cinematic
- **DNA**: Full-viewport video/ảnh, typo lớn đè lên hình, crossfade, parallax scrub, ít chữ nhiều hình.
- **Tham chiếu**: Apple product pages, film portfolio Awwwards.
- **Layout danh sách**: full-bleed từng mục, ảnh chiếm 100% viewport, title/desc overlay.
- **Thứ tự section**: hero → work (video lớn) → products (overlay) → counter (parallax) → about.

#### C2 — Editorial
- **DNA**: Serif display lớn, grid bất đối xứng, pull-quote, whitespace rộng, đánh số chương.
- **Tham chiếu**: MasterClass, tạp chí longform.
- **Layout danh sách**: asymmetric 2/3 + 1/3 xen kẽ, course như bài feature.
- **Thứ tự section**: intro → course feature → pull-quote → portfolio → about → cta.

#### C3 — Minimal
- **DNA**: Monochrome, hairline border, small-caps, kỷ luật lưới, gần như không ảnh.
- **Tham chiếu**: Linear, Stripe, Notion marketing.
- **Layout danh sách**: list row ngăn cách hairline, typo dẫn dắt.
- **Thứ tự section**: hero (typo) → list → faq → cta (lược bớt brand/work).

#### C4 — Bento
- **DNA**: Lưới tile bo góc kích thước khác nhau, mỗi loại nội dung 1 tile, mật độ cao.
- **Tham chiếu**: Apple bento, Vercel/Linear feature pages.
- **Layout danh sách**: tile mosaic (hero 1 tile lớn, work/products/counter/about chia ô).
- **Thứ tự section**: hero tile → bento grid (work+products+counter đan xen) → about tile.

#### C5 — Gallery
- **DNA**: Hình ảnh dẫn đầu, masonry/filmstrip, text overlay khi hover.
- **Tham chiếu**: Behance, Dribbble, portfolio nhiếp ảnh.
- **Layout danh sách**: masonry/filmstrip, thumbnail lớn.
- **Thứ tự section**: header → filter → masonry grid → lightbox detail → cta.

#### C6 — Brutalist
- **DNA**: Monospace, contrast cao, border thay shadow, đánh số section, thô/technical.
- **Tham chiếu**: site dev-tool brutalist Awwwards.
- **Layout danh sách**: table/row có border dày, data dạng spec sheet.
- **Thứ tự section**: mỗi section đánh số 01/02/03, counter làm dải số lớn.

#### C7 — Narrative
- **DNA**: Cuộn thành câu chuyện liền mạch, sticky/pinned panel, chapter reveal.
- **Tham chiếu**: NYT Snowfall, storytelling scroll.
- **Layout danh sách**: sticky stack, mỗi section pinned rồi reveal chương tiếp.
- **Thứ tự section**: mở đầu → chương (work) → chương (products) → chương (about) → kết.

### Cách concept áp lên TỪNG trang (đã phủ R9/R10)

Mỗi concept cung cấp bộ component cho 8 trang:

| Trang | Concept chi phối |
|---|---|
| Homepage `/` | bố cục + thứ tự 6 section |
| Khóa học list `/khoa-hoc` | hero + list layout + brand + faq + cta |
| Khóa học detail `/khoa-hoc/[slug]` | bọc style 14 section type (SectionRenderer → concept-aware) |
| Dự án list `/san-pham` | header + filter + list/masonry + cta |
| Dự án detail `/san-pham/[id]` | hero video layout |
| Công cụ `/cong-cu` | hero + featured + grid |
| Liên hệ `/lien-he` | header + form layout |
| Bài viết `/bai-viet` + `[slug]` | grid + article layout |

---

## Phase 4: Organize & Prioritize

### Affinity — gom theo "concept chủ đạo"

| Nhóm | Concept |
|---|---|
| **Hình ảnh dẫn dắt** | Cinematic, Gallery |
| **Typo dẫn dắt** | Editorial, Minimal |
| **Cấu trúc đặc trưng** | Bento, Brutalist |
| **Kể chuyện cuộn** | Narrative |

### Feasibility Matrix (1-5)

| Concept | Desirability | Feasibility | Viability | Score |
|---|---|---|---|---|
| Cinematic | 5 | 4 | 5 | 14 |
| Editorial | 4 | 4 | 4 | 12 |
| Minimal | 4 | 5 | 5 | 14 |
| Bento | 5 | 4 | 5 | 14 |
| Gallery | 4 | 4 | 4 | 12 |
| Brutalist | 3 | 4 | 4 | 11 |
| Narrative | 4 | 2 | 3 | 9 |

- **Feasibility thấp**: Narrative (pinned stack phức tạp SSR + a11y), Brutalist (dễ lạc brand).
- **Đề xuất chọn 5 mạnh nhất**: Cinematic, Minimal, Bento, Editorial, Gallery.
- **Default**: Cinematic (gần brand hiện tại nhất, ít đứt gãy).

---

## Phase 5: Action Plan (đề xuất, chưa chốt)

1. Chốt 5-7 concept + concept default.
2. Chốt cơ chế course-detail (SectionRenderer có bị concept tái cấu trúc hay chỉ bọc style).
3. SPEC → user story + BDD cho từng concept + preview "dữ liệu thật".
4. PLAN → cấu trúc `src/concepts/<id>/` + key `site_concept` + cleanup key cũ.
5. DEV từng concept (ưu tiên Cinematic + Minimal làm mẫu).

---

## Open Questions

1. Chọn mấy concept trong 7? (gợi ý 5: Cinematic, Minimal, Bento, Editorial, Gallery)
2. Concept default là gì? (gợi ý Cinematic)
3. Course detail (14 section type block-based): concept chỉ **bọc style** (giữ nguyên cấu trúc section, đổi typo/spacing/border) hay được **tái cấu trúc** (đổi cách trình bày từng section type)?
4. `homepage_motion` (field đang có) giữ hay gộp vào concept?
