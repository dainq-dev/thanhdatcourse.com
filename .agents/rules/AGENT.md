---
trigger: glob
globs: apps/fe
---

# Frontend Coding Rules

> Agent PHẢI tuân thủ các nguyên tắc này khi code Frontend. Đây là ràng buộc bắt buộc.

---

## Rule 1: Tách bạch UI & Logic (Feature-File Separation)

Mỗi feature/module PHẢI được tổ chức thành 2 file riêng biệt:

```
<feature>/
├── logic.ts    # ViewModel / Logic layer
└── index.tsx             # View layer (UI) — hoặc page.tsx nếu là Next.js App Router
```

**Trách nhiệm từng layer:**

| File | Được phép chứa | Không được chứa |
|------|----------------|-----------------|
| `logic.ts` | State management, computed data, event handlers, side effects, gọi controller | Import React DOM, JSX |
| `index.tsx` / `page.tsx` | JSX, binding data từ logic.ts, gọi action từ logic.ts | Gọi API trực tiếp, business logic, xử lý dữ liệu |

**Cách binding:**
```typescript
// index.tsx — View chỉ binding
const { data, handleSubmit, isLoading } = useSomeLogic()
```

---

## Rule 2: Kiến trúc MVVM

```
View (index.tsx) ──► ViewModel (logic.ts) ──► Controller (Service) ──► API/Backend
                             │
                             ▼
                        Model (DTO / Interface)
```

**Controller Layer:**
- Là nơi duy nhất giao tiếp với API Gateway / Backend.
- Nhận response API, map vào **Model** (DTO/interface).
- Class singleton (theo Rule 3).
- KHÔNG chứa UI state, KHÔNG import React.

**ViewModel Layer (`logic.ts`):**
- Composed data từ **Model** để View dùng.
- Chứa state (loading, error, data), computed values, event handlers.
- Là cầu nối giữa Controller và View.

**View Layer (`index.tsx`):**
- Thuần UI, chỉ nhận dữ liệu đã computed từ ViewModel.
- Render JSX, xử lý animation, styling, layout.

---

## Rule 3: Class-First + Singleton Pattern

Luôn ưu tiên **class-based architecture** cho Controller, Service, Store.

```typescript
// ✅ ĐÚNG — Class + Singleton
class UserController {
  private static instance: UserController

  private constructor() {}

  static getInstance(): UserController {
    if (!UserController.instance) {
      UserController.instance = new UserController()
    }
    return UserController.instance
  }

  async getUsers(): Promise<User[]> {
    const res = await api.get("/users")
    return res.data as User[]
  }
}
```

**Ngoại lệ — được dùng function thay vì class khi:**
- Utility/helper functions thuần (pure functions, không state).
- React Server Components (Next.js RSC) — server functions.
- Callback nhỏ, event handler local không tái sử dụng.

---

## Rule 4: Zero Duplicate Code (DRY)

**Bất kỳ logic/hàm nào xuất hiện >= 2 lần PHẢI được chuyển vào common ngay lập tức.**

```
packages/shared/
├── utils/          # Pure utility functions
├── hooks/          # Shared React hooks
├── constants/      # Enum, constants, config
├── types/          # Shared TypeScript types/interfaces
├── controllers/    # Singleton controllers (Rule 3)
└── helpers/        # Helper classes
```

**Quy tắc:**
- Copy-paste code = vi phạm.
- Khi viết lần thứ 2 của cùng 1 logic → dừng lại, extract ngay.
- Common code phải type-safe (TypeScript strict).
- Không có ngoại lệ cho "chỉ 2 lần" hay "tạm thời".

---

## Rule 5: UI Library First

1. **Dùng thư viện UI có sẵn** (shadcn/ui, Material UI, Ant Design) — đã chọn cái nào thì PHẢI dùng nhất quán toàn bộ dự án.
2. **Customize theme/token** của thư viện nếu cần thay đổi style.
3. **Chỉ viết custom component khi thư viện KHÔNG đáp ứng được yêu cầu**, và phải:
   - Ghi comment lý do: `// NOTE: Antd Select không hỗ trợ virtual scroll với 10k items`
   - Đạt chuẩn accessibility (aria attributes, keyboard support, focus management).

---

## Rule 6: Route & Component Structure

Mỗi route feature có thể có folder `_components/` chứa các component nhỏ dùng riêng cho feature đó — folder `_components` KHÔNG phải là route nhờ Next.js Private Folder convention (prefix `_`).

```
app/<route>/
├── _components/        # Component riêng của feature này (KHÔNG phải route)
│   ├── ItemCard/
│   │   ├── logic.ts
│   │   └── index.tsx
│   └── ItemFilter/
│       ├── logic.ts
│       └── index.tsx
├── logic.ts           # ViewModel chính của route
└── page.tsx           # View chính của route
```

**Quy tắc:**
- `_components/` trong route chỉ chứa component dùng nội bộ cho feature đó, không tái sử dụng ở nơi khác.
- Component nào được dùng lại >= 2 lần PHẢI được move lên `src/components/`.
- Mỗi component trong `_components/` vẫn PHẢI tuân thủ Rule 1 (tách `logic.ts` và `index.tsx`).
- Cấu trúc này áp dụng cho cả App Router (`app/`) và Pages Router (`pages/`).

---

## Rule 7: 100% Type-Safe & Advanced TypeScript (Single Source of Truth)

**Toàn bộ dự án phải được gõ Type nghiêm ngặt (Strict Typing) 100%. Tuyệt đối không dùng `any` hay `ts-ignore` bừa bãi.**

- **Single Source of Truth**: Mọi interface/type quan trọng (Models, API Responses, DB Schema) PHẢI được định nghĩa ở một nơi duy nhất (ví dụ: `packages/types`) thông qua thư viện Validation (như Zod) và infer ra TypeScript (`z.infer`). KHÔNG viết Type thủ công rời rạc.
- **Advanced Types**: Tận dụng triệt để các Utility Types (`Omit`, `Pick`, `Partial`, `Record`, `ReturnType`, Generics...) để kế thừa và tái sử dụng Type. Tránh tình trạng lặp lại code định nghĩa.
- **RPC & End-to-End Type Safety**: Bắt buộc sử dụng cơ chế RPC (như `hc` của Hono) để share Type từ Backend sang Frontend. Mọi request/response phải được TypeScript validate ngay lúc compile.
- **Explicit Returns**: Mọi hàm/method phải khai báo rõ kiểu dữ liệu trả về (VD: `async getData(): Promise<DataType>`).

---

## VIOLATION CHECKLIST

Trước khi commit mỗi file, agent PHẢI tự kiểm tra:

| Rule | Câu hỏi kiểm tra |
|------|------------------|
| 1 | Feature có tách `logic.ts` và `index.tsx` không? |
| 2 | View có gọi API trực tiếp hoặc chứa business logic không? |
| 3 | Controller/service đã dùng class + singleton chưa? Nếu dùng function, có thuộc diện ngoại lệ không? |
| 4 | Có code bị duplicate không? Đã extract ra common chưa? |
| 5 | Có thể dùng UI library thay vì custom code không? |
| 7 | File này đã đạt 100% Type-safe chưa? Có đang dùng `any` không? Data type có được import từ `packages/types` chuẩn Single Source of Truth không? |
