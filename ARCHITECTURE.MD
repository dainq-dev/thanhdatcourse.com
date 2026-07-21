# MASTER ARCHITECTURE BLUEPRINT (Bản Vẽ Kỹ Thuật Tổng Thể & Vận Hành)
**Dự án**: Website Khóa học & Portfolio Minh Travel
**Triết lý cốt lõi**: Tối ưu hóa triệt để (Extreme Optimization), 100% Type-Safe, Vận hành Đơn giản gọn nhẹ (Simplicity First) bằng Hệ sinh thái Bun.

---

## PHẦN 1: TỔNG QUAN KIẾN TRÚC MONOREPO (BUN WORKSPACES)

Toàn bộ mã nguồn dự án được đặt chung trong một kho lưu trữ (Monorepo) được quản lý bằng **Bun Workspaces**.

### Sơ đồ Cấu trúc Cây
```text
/thanhdatcomputer.com
 ├── package.json (Định nghĩa Workspaces)
 ├── bun.lockb (Khóa version nhị phân, siêu tốc độ)
 ├── apps/
 │   ├── web/     (Next.js 16 - Cổng tương tác người dùng)
 │   ├── api/     (Hono - Backend xử lý logic, Database)
 │   └── media/   (Hono - Microservice Upload/Xử lý Ảnh & Video)
 ├── packages/
 │   ├── ui/      (Thư viện Atomic Component & Sass)
 │   ├── types/   (Zod Schema, Single Source of Truth)
 │   └── config/  (Shared TSConfig, ESLint, Prettier)
 ├── docker/      (Chứa config Nginx và các Dockerfile)
 └── docker-compose.yml
```

---

## PHẦN 2: CHI TIẾT CẤU TRÚC VÀ CONFIG TỪNG PHÂN HỆ (DEEP-DIVE ARCHITECTURE)

Để "Clear Architecture" (làm rõ kiến trúc), dưới đây là cách thiết lập cấu trúc nội bộ và config cho từng App/Package.

### 2.1. `packages/types` (Trái tim của dự án - Validator & Single Source of Truth)
Đây là package quan trọng nhất. Nếu Backend hoặc Frontend cần định nghĩa một cấu trúc dữ liệu, nó **bắt buộc** phải nằm ở đây.

- **Kiến trúc nội bộ**:
  ```text
  packages/types/
   ├── package.json (name: "@workspace/types")
   ├── src/
   │   ├── index.ts        // Export tất cả
   │   ├── schemas/        // Chứa Zod Schemas
   │   │   └── user.ts
   │   │   └── course.ts
   │   └── responses.ts    // Chuẩn hóa format API trả về
  ```
- **Làm thế nào để Validator hoạt động?**
  Chúng ta dùng **Zod**. Zod vừa kiểm tra dữ liệu lúc chạy (Runtime validation) vừa tự sinh ra TypeScript type (Compile-time).
  ```typescript
  // packages/types/src/schemas/course.ts
  import { z } from "zod";
  
  // 1. Khai báo Schema (Validator thực tế)
  export const CreateCourseSchema = z.object({
    title: z.string().min(10, "Tiêu đề quá ngắn"),
    price: z.number().positive("Giá phải lớn hơn 0"),
    status: z.enum(["draft", "published"])
  });

  // 2. Tự động sinh TypeScript Type (Chỉ mất 1 dòng code)
  export type CreateCourseDTO = z.infer<typeof CreateCourseSchema>;
  ```

### 2.2. `apps/api` và `apps/media` (Backend Hono)
Backend chạy cực nhẹ trên Bun. Nó sử dụng `packages/types` để xác thực request đầu vào.

- **Kiến trúc nội bộ**:
  ```text
  apps/api/
   ├── package.json (phụ thuộc "@workspace/types")
   ├── src/
   │   ├── db/             // Drizzle ORM config + SQLite
   │   ├── routes/         // Các Endpoint API
   │   │   └── course.ts
   │   └── index.ts        // Entry point Bun.serve()
  ```
- **Cách Hono tận dụng Zod Validator (Hono RPC)**:
  Hono có middleware `zValidator`. Nó sẽ tự động bắt request, đối chiếu với Schema từ `packages/types`.
  ```typescript
  // apps/api/src/routes/course.ts
  import { Hono } from "hono";
  import { zValidator } from "@hono/zod-validator";
  import { CreateCourseSchema } from "@workspace/types";

  // Request bắt buộc phải pass qua CreateCourseSchema, nếu sai Hono tự trả về 400 Bad Request.
  const route = new Hono().post("/", zValidator("json", CreateCourseSchema), (c) => {
    const validData = c.req.valid("json"); // Lúc này validData đã được Type-safe 100%
    return c.json({ success: true, data: validData });
  });

  export type CourseRouteType = typeof route; // Export Type ra cho Frontend
  ```

### 2.3. `apps/web` (Frontend Next.js 16)
Next.js đóng vai trò thuần UI và lấy dữ liệu bằng cơ chế RPC.

- **Kiến trúc nội bộ**:
  ```text
  apps/web/
   ├── src/
   │   ├── app/
   │   │   └── [locale]/    // Next-intl dynamic route
   │   ├── lib/
   │   │   └── rpc.ts       // Khởi tạo hc client gọi Hono
   │   └── middleware.ts    // Next-intl + Auth.js
  ```
- **Cách Frontend kết nối Hono (End-to-End Type Safety)**:
  ```typescript
  // apps/web/src/lib/rpc.ts
  import { hc } from "hono/client";
  import type { AppRouterType } from "../../../api/src/index"; 

  // Tạo client. Lúc này client đã biết TẤT CẢ các route, method, và params của Backend.
  export const client = hc<AppRouterType>(process.env.NEXT_PUBLIC_API_URL!);
  ```
  *Lợi ích*: Khi dev gõ `client.course.$post({ json: { ... } })`, IDE sẽ tự động Auto-complete (Gợi ý code). Nếu truyền thiếu biến `title`, màn hình sẽ báo lỗi đỏ rực mà không cần phải chạy thử lên trình duyệt.

### 2.4. `packages/ui` (Design System & CSS Component)
Nơi chứa toàn bộ Atomic Component và Styling. Nó giữ cho Frontend `apps/web` sạch sẽ.

- **Kiến trúc nội bộ**:
  ```text
  packages/ui/
   ├── src/
   │   ├── atoms/
   │   ├── molecules/
   │   └── organisms/
   └── styles/
       ├── abstracts/      // _variables.scss, _mixins.scss
       └── base/           // _reset.scss
  ```
- **Workflow với UI**:
  - Không viết CSS trực tiếp vào `apps/web`. Toàn bộ Design Token (Màu, font) nằm ở `packages/ui/styles`.
  - Next.js sẽ import Component trực tiếp: `import { Button } from "@workspace/ui/atoms"`.

### 2.5. `packages/config` (Rule & Policy)
Nơi chứa các file cấu hình gốc để các App khác kế thừa (extends).
- **`tsconfig.base.json`**: Định nghĩa chuẩn `"strict": true`, `"noImplicitAny": true`. File TSConfig ở `apps/web` chỉ cần viết `"extends": "@workspace/config/tsconfig.base.json"`.
- **`eslint-config`**: Đồng nhất quy tắc check lỗi cú pháp cho cả frontend và backend.

---

## PHẦN 3: WORKFLOW PHÁT TRIỂN (DEVELOPER WORKFLOW)

Để vận hành mượt mà kiến trúc này, Workflow của lập trình viên sẽ diễn ra như sau:

### 3.1. Kịch bản Thêm/Sửa một tính năng (VD: Đổi tên trường Dữ liệu)
1. **Bước 1 (Gốc rễ)**: Developer mở `packages/types/schemas/user.ts` sửa tên biến từ `name` thành `fullName`.
2. **Bước 2 (Backend)**: Do Type tự động lan truyền, file Controller trong `apps/api` sẽ lập tức báo lỗi đỏ vì nó đang chèn biến `name` cũ vào Database. Dev sửa lại thành `fullName`.
3. **Bước 3 (Frontend)**: Đồng thời, `apps/web` (nơi đang render hiển thị `name`) cũng lập tức báo lỗi lúc Compile vì prop đó không còn tồn tại. Dev sửa lại UI.
=> **Kết quả**: Zero bugs ở Runtime. Lỗi được chặn 100% ngay từ lúc gõ phím.

### 3.2. Lệnh Khởi động (Running the Workspace)
Sử dụng script chung ở thư mục gốc (Gói gọn bằng Turbo hoặc Concurrent):
- Mở terminal tại thư mục gốc: chạy `bun run dev`.
- Lệnh này sẽ tự động khởi động 3 terminal ngầm:
  - `bun run dev --filter @workspace/web` (Port 3000)
  - `bun run dev --filter @workspace/api` (Port 3001)
  - `bun run dev --filter @workspace/media` (Port 3002)
- HMR (Hot Module Replacement) của Bun sẽ làm tươi giao diện ngay trong tích tắc mỗi khi đổi 1 file SCSS trong `packages/ui`.

---

## PHẦN 4: HẠ TẦNG VÀ DEVOPS (DOCKER & NGINX)

### 4.1. Sơ đồ Điều Hướng Proxy Nginx
Nginx đứng trước đón toàn bộ lượng truy cập và rẽ nhánh thông minh:
- Request `minhtravel.vn/` -> Nginx chuyển cho **Next.js** xử lý SSR (Port 3000).
- Request `minhtravel.vn/api/*` -> Nginx bỏ tiền tố `/api`, ném thẳng vào **Hono API** (Port 3001).
- Request Upload `media.minhtravel.vn/upload` -> Chuyển vào **Hono Media** (Port 3002).
- **(ĐẶC BIỆT CỦA NGINX)**: Nếu Request là đọc ảnh tĩnh (Ví dụ: `media.minhtravel.vn/images/123.webp`), Nginx sẽ tự động lấy trực tiếp từ ổ cứng Server và trả về ngay mà KHÔNG CẦN gọi vào Hono Media. Việc này giảm 90% tải trọng cho hệ thống Bun.

### 4.2. Khởi tạo Production
- Mọi App đều có `Dockerfile` riêng, sử dụng `oven/bun:alpine` siêu nhỏ.
- Khi triển khai, chỉ cần gõ 1 lệnh duy nhất:
  ```bash
  docker-compose up -d --build
  ```
- **Backup Data**: Chỉ cần thiết lập Cronjob trên VPS copy file `/apps/media/media.sqlite` và `/apps/api/data.sqlite` đẩy lên Cloud mỗi 24h.

---
> [!IMPORTANT]
> **KẾT LUẬN VỀ KIẾN TRÚC**
> Kiến trúc này chia để trị (Divide and Conquer), nhưng được gắn kết bởi sợi dây xích Type-Safe bằng **Zod + Hono RPC**. Các phân hệ không dẫm chân lên nhau. Hạ tầng Nginx đỡ tải tĩnh, Bun xử lý luồng xử lý động. Hệ thống này đảm bảo **Cinematic Performance** với chi phí vận hành VPS rẻ nhất.
