# Spec 10: Admin Dashboard Shell (Layout, Sidebar, Overview)

**Status:** Draft  
**Created:** 2026-07-21  
**Blueprint ref:** `DYNAMIC-CONVERSION-BLUEPRINT.md` Section 5  

---

## Feature Description

Khung giao diện Admin Dashboard: sidebar navigation, auth guard, dashboard overview với thống kê. Nền tảng để tất cả admin pages (Spec 01-08) hoạt động bên trong.

---

## User Stories

### US-10.1: Admin Dashboard Shell (Layout)

> **As an** Administrator  
> **I want to** have a consistent admin interface with sidebar navigation  
> **So that** I can easily navigate between management pages

**Acceptance Criteria:**
- Sidebar bên trái, cố định (sticky), width ~260px
- Sidebar items (10 mục với icon + label + href)
- Active item highlight dựa trên pathname hiện tại
- Header bar: logo "Minh Travel Admin", user avatar + dropdown (Đăng xuất)
- Content area (main) scrollable độc lập với sidebar
- Responsive: sidebar collapse thành hamburger menu trên mobile/tablet
- Auth guard: check session, redirect login nếu chưa auth

### US-10.2: Dashboard Overview

> **As an** Administrator  
> **I want to** see key metrics on the dashboard homepage  
> **So that** I have a quick overview of website status

**Acceptance Criteria:**
- Dashboard tại `/quan-tri-vien`
- 4 Stat cards: Tổng khóa học (published/total), Tổng bài viết (published/total), Leads mới (hôm nay/tuần này), Tổng media files
- Recent items lists: 5 bài viết mới nhất, 5 leads mới nhất (NEW), 5 khóa học mới cập nhật
- Mỗi list item clickable → navigate đến trang edit tương ứng
- Quick action buttons: "Tạo khóa học mới", "Viết bài mới", "Upload media"

### US-10.3: Breadcrumbs trong Admin

> **As an** Administrator  
> **I want to** see breadcrumbs in the admin interface  
> **So that** I know where I am in the navigation hierarchy

**Acceptance Criteria:**
- Breadcrumbs tự động từ URL path (VD: Tổng quan > Khóa học > Chỉnh sửa: TikTok cơ bản)
- Parent levels clickable, current page (last item) không clickable

### US-10.4: Toast Notifications System

> **As an** Administrator  
> **I want to** see success/error notifications after actions  
> **So that** I know whether my changes were saved

**Acceptance Criteria:**
- Toast component global (dùng React Context hoặc thư viện nhẹ)
- Types: success (green), error (red), warning (yellow), info (blue)
- Auto-dismiss sau 5 giây (success/info) hoặc manual dismiss (error)
- Stack multiple toasts (tối đa 5), newest at bottom

### US-10.5: Loading States & Empty States

> **As an** Administrator  
> **I want to** see appropriate feedback during loading and when there's no data  
> **So that** I understand what's happening

**Acceptance Criteria:**
- Loading skeleton (cho table, form, cards) khi data đang fetch
- Empty state component với illustration + message + CTA (VD: "Chưa có khóa học nào. Tạo khóa học đầu tiên!")
- Error state với retry button khi fetch thất bại

---

## BDD Scenarios

```gherkin
Feature: Admin Dashboard Shell

  Background:
    Given I am logged in as an Administrator

  Scenario: Admin sidebar displays correctly
    When I navigate to "/quan-tri-vien"
    Then I should see a sidebar on the left with 10 navigation items
    And "Tổng quan" should be highlighted as active
    And the header should show "Minh Travel Admin" logo
    And the header should show my avatar with a dropdown

  Scenario: Navigate via sidebar
    Given I am on the dashboard overview
    When I click "Khóa học" in the sidebar
    Then I should navigate to "/quan-tri-vien/khoa-hoc"
    And "Khóa học" should now be highlighted as active

  Scenario: Logout via header dropdown
    When I click my avatar in the header
    And I click "Đăng xuất" in the dropdown
    Then I should be logged out
    And redirected to "/xac-thuc/dang-nhap"

  Scenario: Dashboard overview shows stats
    Given the database has 8 courses (6 published, 2 draft)
    And 6 articles (6 published)
    And 5 leads (3 NEW)
    And 30 media files
    When I navigate to "/quan-tri-vien"
    Then I should see stat card "Khóa học" showing "6/8 published"
    And stat card "Bài viết" showing "6/6 published"
    And stat card "Leads mới" showing "3 new"
    And stat card "Media" showing "30 files"

  Scenario: Quick action buttons
    When I click "Tạo khóa học mới" on the dashboard
    Then I should navigate to "/quan-tri-vien/khoa-hoc/tao-moi"

  Scenario: Empty state
    Given the database has 0 courses
    When I navigate to "/quan-tri-vien/khoa-hoc"
    Then I should see an empty state with "Chưa có khóa học nào"
    And a button "Tạo khóa học mới"

  Scenario: Loading skeleton
    When I navigate to "/quan-tri-vien/khoa-hoc" and data is still loading
    Then I should see a loading skeleton (gray placeholder cards/rows)
    And not a blank white page

  Scenario: Toast notification after save
    Given I am editing site settings
    When I click "Lưu thay đổi" and the save succeeds
    Then a green toast should appear: "Đã lưu thành công"
    And the toast should auto-dismiss after 5 seconds

  Scenario: Error toast
    When I click "Lưu thay đổi" and the API returns 500
    Then a red toast should appear: "Lỗi máy chủ. Vui lòng thử lại."
    And the toast should have a close (x) button

  Scenario: Mobile responsive sidebar
    Given I am on a mobile screen (width 375px)
    When I view the admin dashboard
    Then the sidebar should be hidden
    And a hamburger menu button should be visible in the header
    When I tap the hamburger button
    Then the sidebar should slide in from the left as an overlay
```

---

## Technical Constraints

| Constraint | Detail |
|---|---|
| **Layout** | `apps/web/src/app/quan-tri-vien/layout.tsx` — 'use client' (cần usePathname, useState) |
| **Sidebar Items** | Array constant, có thể sau này dynamic từ DB nếu cần |
| **Toast** | Tự build hoặc dùng `react-hot-toast` (nhẹ, 5kB) |
| **Loading** | Skeleton component trong `@workspace/ui` (đã có atom Skeleton) |
| **Empty State** | Component tái sử dụng: `<EmptyState icon title description action />` |
| **Error State** | Component tái sử dụng: `<ErrorState message onRetry />` |
| **Auth Guard** | Check session trong layout, redirect nếu !session (Spec 09) |
| **Responsive** | CSS breakpoint tại 1024px — sidebar collapse |

---

## Dependencies

- **Spec 09:** Authentication (auth guard trong layout)
- **Spec 01-08:** Tất cả admin pages render bên trong shell này

---

## Next Steps

1. `/bdd-review` — Challenge spec
2. `/bdd-dev` — Implement: layout + sidebar + header + dashboard overview + toast system + loading/empty/error states
