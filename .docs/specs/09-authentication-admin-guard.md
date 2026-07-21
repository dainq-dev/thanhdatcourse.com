# Spec 09: Authentication & Admin Guard

**Status:** Draft  
**Created:** 2026-07-21  
**Blueprint ref:** `DYNAMIC-CONVERSION-BLUEPRINT.md` Section 2.11, Section 6.11  

---

## Feature Description

Hệ thống xác thực người dùng: Login/Register bằng email+password, Google OAuth. Admin guard bảo vệ các route `/quan-tri-vien/*` và API admin endpoints. Session-based auth với JWT token.

---

## User Stories

### US-09.1: Admin đăng nhập

> **As an** Administrator  
> **I want to** log in with email and password  
> **So that** I can access the admin dashboard

**Acceptance Criteria:**
- Trang `/xac-thuc/dang-nhap` hiển thị form: Email + Password + Nút "Đăng nhập"
- Validate fields (email format, password not empty)
- Gọi POST `/api/auth/login` → nếu thành công → redirect `/quan-tri-vien`
- Sai credentials → thông báo "Email hoặc mật khẩu không đúng"
- JWT token lưu trong httpOnly cookie (hoặc Authorization header)
- Token expires sau 24h
- Redirect về login nếu truy cập admin route mà chưa auth

### US-09.2: Admin đăng nhập bằng Google

> **As an** Administrator  
> **I want to** log in with my Google account  
> **So that** I don't need to remember another password

**Acceptance Criteria:**
- Nút "Đăng nhập với Google" trên login page
- Redirect → Google OAuth consent → callback → tạo/link user
- Chỉ user có `role = 'ADMIN'` trong DB mới được vào admin (kể cả Google login)
- User thường login bằng Google → role USER, không vào được admin

### US-09.3: Học viên đăng ký tài khoản

> **As a** Website Visitor  
> **I want to** register an account  
> **So that** I can enroll in courses

**Acceptance Criteria:**
- Trang `/xac-thuc/dang-ky`: Name, Email, Password, Confirm Password
- Validate: email format, password min 8 chars, confirm match
- Tạo user với role USER
- Tự động login sau khi register → redirect về homepage

### US-09.4: Auth Guard cho API endpoints

> **As a** System  
> **I want to** protect admin-only API endpoints  
> **So that** unauthorized users cannot modify data

**Acceptance Criteria:**
- Middleware kiểm tra JWT token trên tất cả admin endpoints
- Thiếu token → 401 Unauthorized
- Token valid nhưng role != ADMIN → 403 Forbidden
- Token hết hạn → 401 với message "Token expired"
- Token không hợp lệ (sai signature) → 401

### US-09.5: Auth Guard cho Admin Pages

> **As a** System  
> **I want to** protect admin dashboard pages  
> **So that** only logged-in admins can access the management interface

**Acceptance Criteria:**
- Admin layout `layout.tsx` kiểm tra session
- Chưa login → redirect `/xac-thuc/dang-nhap?callbackUrl={originalUrl}`
- Login rồi nhưng role USER → hiện "Không có quyền truy cập"
- Sau khi login thành công → redirect về callbackUrl hoặc `/quan-tri-vien`

### US-09.6: Đăng xuất

> **As an** Administrator  
> **I want to** log out  
> **So that** my session is securely terminated

**Acceptance Criteria:**
- Nút "Đăng xuất" trong admin sidebar/profile dropdown
- Gọi POST `/api/auth/logout` → xóa cookie/token
- Redirect về login page

---

## BDD Scenarios

```gherkin
Feature: Authentication

  Scenario: Admin login with email and password
    Given a user exists with email "admin@minhtravel.vn" and role "ADMIN"
    When I navigate to "/xac-thuc/dang-nhap"
    And I fill in email "admin@minhtravel.vn"
    And I fill in password "correct-password"
    And I click "Đăng nhập"
    Then I should be redirected to "/quan-tri-vien"
    And a JWT token should be set in cookies

  Scenario: Login with wrong password
    Given a user exists with email "admin@minhtravel.vn"
    When I fill in email "admin@minhtravel.vn"
    And I fill in password "wrong-password"
    And I click "Đăng nhập"
    Then I should see error "Email hoặc mật khẩu không đúng"
    And I should remain on the login page

  Scenario: Login with empty fields
    When I click "Đăng nhập" without filling any fields
    Then I should see validation errors for both email and password

  Scenario: Register new account
    When I navigate to "/xac-thuc/dang-ky"
    And I fill in name "Nguyễn Văn A"
    And I fill in email "user@example.com"
    And I fill in password "password123"
    And I fill in confirm password "password123"
    And I click "Đăng ký"
    Then a new user should be created with role "USER"
    And I should be automatically logged in

  Scenario: Register with password mismatch
    When I fill in password "password123"
    And I fill in confirm password "password456"
    And I click "Đăng ký"
    Then I should see error "Mật khẩu xác nhận không khớp"

  Scenario: Google OAuth login as non-admin
    Given a Google user "user@gmail.com" exists with role "USER"
    When I log in with Google
    Then I should NOT be able to access "/quan-tri-vien"
    And I should see "Không có quyền truy cập"

  Scenario: Google OAuth login as admin
    Given a Google user "admin@gmail.com" exists with role "ADMIN"
    When I log in with Google
    Then I should be able to access "/quan-tri-vien"

  Scenario: Access admin page without login
    Given I am NOT logged in
    When I navigate to "/quan-tri-vien"
    Then I should be redirected to "/xac-thuc/dang-nhap?callbackUrl=%2Fquan-tri-vien"

  Scenario: Access admin API without token
    Given I have no JWT token
    When I send PUT "/api/settings/batch" with valid body
    Then the response status should be 401

  Scenario: Access admin API with user token
    Given I have a JWT token with role "USER"
    When I send PUT "/api/settings/batch" with valid body
    Then the response status should be 403

  Scenario: Logout
    Given I am logged in as admin
    When I click "Đăng xuất"
    Then the JWT token should be cleared
    And I should be redirected to "/xac-thuc/dang-nhap"
```

---

## Technical Constraints

| Constraint | Detail |
|---|---|
| **Auth Method** | JWT (jsonwebtoken hoặc jose) |
| **Token Storage** | httpOnly secure cookie (production) hoặc localStorage + Authorization header |
| **Token Expiry** | 24 hours |
| **Password Hash** | bcrypt (Bun native hoặc `bun:ffi`) |
| **OAuth** | Google OAuth 2.0 (có thể dùng thư viện hoặc manual flow) |
| **DB Table** | `users` (thêm `password_hash TEXT`) |
| **Admin Check** | Middleware kiểm tra `role = 'ADMIN'` |
| **CSRF** | Token trong cookie + header check |

---

## API Endpoints

| Method | Endpoint | Auth | Mô tả |
|--------|----------|------|-------|
| `POST` | `/api/auth/login` | Public | Login → return JWT |
| `POST` | `/api/auth/register` | Public | Register → return JWT |
| `POST` | `/api/auth/logout` | User | Clear token |
| `GET` | `/api/auth/me` | User | Get current user info |
| `GET` | `/api/auth/google` | Public | OAuth redirect |
| `GET` | `/api/auth/google/callback` | Public | OAuth callback |

---

## Dependencies

- Spec 10 (Admin dashboard shell dùng auth guard)
- Tất cả specs có admin endpoints (Spec 01-08) — dùng auth middleware

---

## Next Steps

`/bdd-review` → `/bdd-dev`
