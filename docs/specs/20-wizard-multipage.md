# Spec 20: Layout Wizard Multi-Page Support

**Status:** Draft
**Created:** 2026-08-10
**Ref Brainstorming:** `.docs/v2-fix-three-pages-brainstorming.md`
**Depends on:** `LayoutWizard.tsx` (đã có), `PAGE_CONFIGS` in `lib/layout-engine.ts` (đã có)

---

## Feature Description

Mở rộng LayoutWizard từ chỉ hỗ trợ homepage → hỗ trợ cả 4 trang: Trang chủ, Khóa học, Dự án, Công cụ. Admin dùng dropdown chọn trang, wizard tự load đúng templates + engines + preview path.

---

## User Stories

### US-20.1: Admin chọn trang trong Wizard

> **As an** Administrator
> **I want to** switch between pages in the layout wizard
> **So that** I can configure layout for all pages without leaving the settings panel

**Acceptance Criteria:**
- Wizard header có dropdown "Trang đang chỉnh sửa" với 4 options
- Mặc định hiển thị "Trang chủ" (page mặc định khi mở)
- Khi chọn trang khác:
  - Template skeleton cards cập nhật → hiển thị templates của trang đó
  - Engine dropdowns cập nhật → hiển thị content types của trang đó
  - Preview iframe reload → hiển thị URL của trang mới
  - Form data load từ settings hiện tại của trang đó
- Cookie preview cũ bị xóa khi đổi trang
- Step quay về 1 khi đổi trang

### US-20.2: Admin lưu riêng từng trang

> **As an** Administrator
> **I want to** save layout settings for each page independently
> **So that** changing one page doesn't affect others

**Acceptance Criteria:**
- Khi lưu ở trang Khóa học, chỉ gửi keys liên quan đến courses (`courses_template`, `courses_list_engine`)
- Khi lưu ở trang Dự án, chỉ gửi keys liên quan đến portfolio (`portfolio_template`, `portfolio_list_engine`)
- Mỗi lần lưu → chỉ cập nhật setting của trang đang chỉnh sửa
- Toast hiển thị "Đã lưu giao diện [tên trang]"

### US-20.3: Preview nhanh khi đổi trang

> **As an** Administrator
> **I want to** see preview of each page without saving
> **So that** I can verify layout decisions before committing

**Acceptance Criteria:**
- Khi chọn trang từ dropdown → iframe reload với URL của trang đó
- Cookie preview cập nhật với template + engine của trang mới
- Preview hiển thị layout hiện tại của trang đó (từ DB + cookie)
- Không cần bấm "Lưu" mới thấy preview

---

## BDD Scenarios

```gherkin
Feature: Layout Wizard Page Switching

  Background:
    Given I am logged in as an Administrator
    And I navigate to "/quan-tri-vien/cai-dat"
    And I select tab "Giao diện"

  Scenario: Default page is Homepage (happy path)
    When the wizard loads
    Then the page dropdown shows "Trang chủ"
    And template cards show homepage templates: Mặc định, Tối giản, Điện ảnh
    And engine selector shows: Dự án, Sản phẩm (2 content types)
    And preview iframe shows "/"

  Scenario: Switch to Courses page (happy path)
    When I select "Khóa học" from the page dropdown
    Then the page dropdown shows "Khóa học"
    And template cards show courses templates: Mặc định, Tối giản, Đầy đủ
    And engine selector shows: Khóa học (1 content type)
    And preview iframe reloads to "/khoa-hoc"
    And template selection resets to the DB value for courses_template

  Scenario: Switch to Portfolio page
    When I select "Dự án" from the page dropdown
    Then template cards show portfolio templates: Mặc định, Phân loại, Showcase
    And engine selector shows: Dự án (1 content type)
    And preview iframe reloads to "/san-pham"

  Scenario: Switch to Presets page
    When I select "Công cụ" from the page dropdown
    Then template cards show presets templates: Mặc định, Nổi bật
    And engine selector shows: Công cụ (1 content type)
    And preview iframe reloads to "/cong-cu"

  Scenario: Switch pages clears preview cookie (edge case)
    Given I changed homepage template to "compact" (not saved)
    And preview_settings cookie has homepage_template = "compact"
    When I switch to "Khóa học" page
    Then preview_settings cookie is cleared
    And a new cookie is set with courses settings from DB

  Scenario: Switch pages resets step to 1
    Given I am on Step 2 (engine selection) for homepage
    When I switch to "Khóa học" page
    Then the wizard goes back to Step 1 (template selection)

  Scenario: Save only sends keys for current page
    Given I am editing "Khóa học" page
    And I changed courses_template to "minimal"
    And I changed courses_list_engine to "list"
    When I click "Lưu thay đổi"
    Then PUT /api/settings/batch is called with ONLY:
      | courses_template     | "minimal" |
      | courses_list_engine  | "list"    |
    And keys for other pages (homepage_template, portfolio_template, presets_template) are NOT sent

  Scenario: Save shows page name in success toast
    Given I am editing "Khóa học" page
    When I click "Lưu thay đổi"
    Then the toast shows "Đã lưu giao diện Khóa học"

  Scenario: Template is selected correctly after page switch
    Given DB has courses_template = "full"
    When I switch to "Khóa học" page
    Then template card "Đầy đủ" is marked as active/selected
    And the engine selector shows engine from DB

  Scenario: Engine defaults when no DB value exists
    Given courses_list_engine is not set in DB
    When I switch to "Khóa học" page
    Then the engine dropdown shows "Lưới" (default) selected
    And engine value "grid" is used for rendering
```

---

## Technical Constraints

| Constraint | Detail |
|---|---|
| **Page state** | `useState<PageId>("homepage")` trong LayoutWizard |
| **Dropdown options** | `Object.entries(PAGE_CONFIGS)` → 4 options |
| **Cookie behavior** | `writePreviewCookie({})` xóa cookie cũ → load settings page mới → set cookie mới |
| **Step reset** | Khi đổi page → `setStep(1)` |
| **Save scope** | Chỉ gửi keys của page hiện tại (dùng `PAGE_CONFIGS[page].templateKey` + `Object.values(PAGE_CONFIGS[page].engineKeys)`) |
| **Preview path** | `PAGE_CONFIGS[page].previewPath` |
| **Form data sync** | Khi đổi page → đọc `settings[config.templateKey]` + `settings[config.engineKeys...]` |

---

## Changes to LayoutWizard.tsx

### Before (current)
```tsx
export function LayoutWizard({ page, settings, onChange, onSave, onPreviewReload }: Props) {
  // page is hardcoded prop from parent — always "homepage"
```

### After (new)
```tsx
interface Props {
  settings: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onSave: (keys: string[]) => Promise<void>;  // changed: receives array of keys
  onPreviewReload: (path: string) => void;     // changed: receives preview path
}

export function LayoutWizard({ settings, onChange, onSave, onPreviewReload }: Props) {
  const [page, setPage] = useState<keyof typeof PAGE_CONFIGS>("homepage");
  // ... rest same but uses state page instead of prop page
  
  const handlePageChange = (newPage: keyof typeof PAGE_CONFIGS) => {
    setPage(newPage);
    setStep(1);
    // Clear cookie, reload iframe với path mới
    onPreviewReload(PAGE_CONFIGS[newPage].previewPath);
  };

  const handleSave = async () => {
    const config = PAGE_CONFIGS[page];
    const keys = [config.templateKey, ...Object.values(config.engineKeys)];
    await onSave(keys);
  };
```

---

## Files Modified

| File | Change |
|------|--------|
| `LayoutWizard.tsx` | Thêm `page` state + dropdown + `handlePageChange` + sửa `handleSave` |
| `cai-dat/page.tsx` | Sửa props truyền vào LayoutWizard: bỏ `page`, sửa `onSave` signature |

---

## API Endpoints (không thay đổi)

| Method | Endpoint | Auth | Dùng cho |
|--------|----------|------|----------|
| `GET` | `/api/settings` | Public | Đọc tất cả settings |
| `PUT` | `/api/settings/batch` | Admin | Lưu settings của page hiện tại |

---

## Dependencies

- `lib/layout-engine.ts` → `PAGE_CONFIGS`
- `LayoutWizard.tsx` hiện tại
- `cai-dat/page.tsx` integration

---

## Next Steps

`/bdd-review` → `/bdd-dev`
