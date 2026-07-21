---
description: Expert frontend design for landing pages, portfolios, and redesigns. Reads briefs, infers the right design direction, builds polished non-templated UIs, applies real design systems, performs audit-first redesigns, and follows strict pre-flight checks
---


# Taste-Skill Workflow

Bộ skill này tuân theo **Agent Skills specification** (https://agentskills.io/specification). Mỗi skill là một thư mục con chứa `SKILL.md` với YAML frontmatter + Markdown instructions.

Root: `.agents/skills/taste-skill/`

---

## 1. Progressive Disclosure (Cách load skill)

| Stage | Token | Nội dung | Khi nào load |
|-------|-------|----------|--------------|
| **Metadata** | ~100 | `name` + `description` | Load ngay khi khởi động để agent biết skill nào tồn tại |
| **Instructions** | < 5000 | Full `SKILL.md` body | Load khi skill được kích hoạt (khi task phù hợp) |
| **Resources** | Tuỳ ý | File trong `scripts/`, `references/`, `assets/` | Load theo nhu cầu, chỉ đọc khi cần |

**Nguyên tắc:** Giữ `SKILL.md` dưới 500 dòng. Tài liệu chi tiết để ở file riêng.

---

## 2. Skill Map — Khi nào dùng skill nào

| Skill name | Mô tả | Khi nào activate |
|-----------|-------|------------------|
| `design-taste-frontend` (taste-skill/) | Main skill v2: anti-slop frontend, 3 dials, pre-flight check, Awwwards-level | **Mặc định** cho landing page, portfolio, redesign. Luôn đọc đầu tiên. |
| `design-taste-frontend-v1` (taste-skill-v1/) | Original v1, backward-compatible | Khi project phụ thuộc vào behavior cũ |
| `gpt-taste` | Awwwards-level: Python RNG layout, AIDA, GSAP ScrollTrigger, gapless bento | Khi task yêu cầu "Awwwards", "elite", "cinematic motion" |
| `image-to-code` | Image-first: generate image → deep analysis → implement code | Khi có image-gen tool, task yêu cầu design-to-code chính xác |
| `imagegen-frontend-web` | Generate web section reference images. Image generation ONLY. | Khi cần tạo design reference hình ảnh cho website sections |
| `imagegen-frontend-mobile` | Generate mobile app screen images inside phone mockups. Image ONLY. | Khi cần tạo design reference cho mobile app screens/flows |
| `brandkit` | Generate brand-kit overview images (logo, identity, palette). Image ONLY. | Khi cần brand guidelines, logo concepts, identity system visuals |
| `redesign-existing-projects` | Audit-first redesign: scan, diagnose, fix, upgrade | Khi task là **redesign** project có sẵn |
| `high-end-visual-design` (soft-skill/) | $150k agency-level: glassmorphism, double-bezel, magnetic physics | Khi task yêu cầu "premium", "luxury", "Apple-tier", "expensive" |
| `full-output-enforcement` (output-skill/) | Chống truncation, ban placeholder patterns, enforce complete output | Khi task cần output dài, nhiều files, production-critical |
| `minimalist-ui` | Editorial-style: warm monochrome, flat bento, muted pastels | Khi task yêu cầu "minimalist", "clean", "Linear-style", "editorial" |
| `industrial-brutalist-ui` (brutalist-skill/) | Swiss typography + military terminal, rigid grids | Khi task yêu cầu "brutalist", "industrial", "terminal", "tactical" |
| `stitch-design-taste` (stitch-skill/) | Generate DESIGN.md cho Google Stitch screen gen | Khi dùng Google Stitch để gen UI screens |

---

## 3. Activation Rules

### 3.1 Luôn đọc `design-taste-frontend` trước
Skill này là main controller. Nó chứa:
- Brief inference protocol (Section 0)
- 3 dials system (VARIANCE / MOTION / DENSITY)
- Design system mapping (Section 2)
- Pre-flight check (Section 14)

### 3.2 Chồng skill đúng cách
Các skill có thể hoạt động cùng nhau:
- `design-taste-frontend` + `gpt-taste` = main taste + Awwwards motion
- `design-taste-frontend` + `minimalist-ui` = main taste + minimalist enforcement
- `design-taste-frontend` + `redesign-existing-projects` = main taste + redesign audit
- `design-taste-frontend` + `full-output-enforcement` = main taste + output completeness

Không chồng các skill mâu thuẫn (ví dụ: `minimalist-ui` + `brutalist-ui`).

### 3.3 Image-gen skills chỉ generate image
`imagegen-frontend-web`, `imagegen-frontend-mobile`, `brandkit` là **image generation only**. Không dùng để viết code.

### 3.4 Khi nào dùng redesign protocol
Nếu user nói "redesign", "upgrade", "cải thiện", "làm lại" project có sẵn:
1. Activate `redesign-existing-projects`
2. Scan codebase
3. Chạy Design Audit
4. Apply upgrades theo Fix Priority

---

## 4. SKILL.md Format Enforcement

Mọi SKILL.md trong bộ này phải tuân theo spec:

```yaml
---
name: skill-name          # required: lowercase + hyphens, max 64 chars, match dir name
description: >-           # required: max 1024 chars, mô tả skill + khi nào dùng
  Mô tả ngắn gọn...
---
```

**Quy tắc:**
- `name` phải trùng tên thư mục cha
- `name` chỉ gồm lowercase `a-z`, `0-9`, `-`. Không bắt đầu/kết thúc bằng `-`
- `description` viết ở ngôi thứ 3 ("Use when...", không "You can use...")
- Giữ body dưới ~500 dòng, tài liệu dài để file riêng trong `references/`

---

## 5. Pre-Flight Check

Trước khi output bất kỳ code nào từ taste-skill, chạy checklist này:

- [ ] Đã đọc brief và infer đúng page kind / audience / vibe?
- [ ] 3 dials (VARIANCE / MOTION / DENSITY) đã set và hợp lý?
- [ ] Design system đã chọn (Section 2) hoặc aesthetic labeled honestly?
- [ ] Nếu là redesign: đã chạy audit chưa?
- [ ] **Zero em-dashes (`—`)** trong toàn bộ output?
- [ ] Hero fit viewport: headline ≤ 2 lines, subtext ≤ 20 words?
- [ ] Button contrast: WCAG AA (4.5:1) ?
- [ ] Page theme lock: ONE theme cho cả page?
- [ ] Color consistency: một accent duy nhất cho cả page?
- [ ] Motion motivated: mọi animation đều có lý do?
- [ ] Mobile collapse explicit: single-column dưới 768px?
- [ ] `min-h-[100dvh]` thay vì `h-screen`?

Tham khảo Pre-Flight Check đầy đủ ở `design-taste-frontend` Section 14.

---

## 6. References

- Agent Skills specification: https://agentskills.io/specification
- Danh sách skills: `.agents/skills/taste-skill/llms.txt`
- GSAP skills: `.agents/workflows/gsap.prompt.md`
