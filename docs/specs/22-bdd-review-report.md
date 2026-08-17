# BDD Review: Spec 22 — Admin Panel Bugfixes

**Reviewer:** Adversarial agent
**Date:** 2026-08-17
**Spec:** `docs/specs/22-admin-bugfixes.md`

---

## Cross-Check with Existing Code

| # | Check | Status | Details |
|---|-------|--------|---------|
| 1 | **Variant "full" còn bị lỗi ở nơi khác (spec bỏ sót)** | 🔴 Blocking | Spec 22.5 chỉ sửa `media-manager/index.logic.ts:187`. Nhưng `GalleryBlock.tsx:66` lightbox gọi `resolveMediaUrl(img.mediaId, "full")`, và `lib/media-url.ts` type signature cho phép `"full"`. Cả 2 đều sinh `/img/:id/full` → 404. Spec phải bao gồm `GalleryBlock` + `lib/media-url.ts` (đổi `"full"` → `"large"`). |
| 2 | **YouTube thumbnail bug còn 1 chỗ nữa (spec bỏ sót)** | 🔴 Blocking | Spec 22.4 chỉ sửa `getMediaUrl`. Nhưng `getMediaVariantUrls` (cùng file `index.logic.ts:170`) cũng dùng `file.diskPath` làm video ID. Phải sửa cả 2 hàm. |
| 3 | **Route ordering `/bulk` vs `/:id`** | 🟡 Warning | Hono match route theo thứ tự đăng ký. `DELETE /api/media/bulk` PHẢI đăng ký TRƯỚC `.delete("/:id")`, nếu không "bulk" lại rơi vào `/:id` (chính là nguyên nhân gốc của bug C1). Spec 22.2 cần ghi rõ thứ tự này. |
| 4 | **Toggle visibility: undefined vs UI** | 🟡 Warning | `FieldRow` toggle `checked={value === "1"}`. Khi chưa set (undefined), toggle hiển thị OFF nhưng section mặc định hiển thị. Gây nhầm lẫn UX. Spec 22.6 nói "mặc định hiển thị" nhưng không nói toggle UI phải coi undefined như ON. Cần thống nhất: hoặc hiển thị toggle ON khi undefined, hoặc seed giá trị "1" mặc định. |
| 5 | **`promotion-banner` response shape** | 🟡 Warning | Spec 22.8 nói dùng `api.publicGet`. Nhưng code hiện tại xử lý `json.data ?? json`. Backend `/homepage-banner` trả object trực tiếp (không wrap `{data}`), nên `api.publicGet` trả đúng object. Cần ghi rõ trong spec để dev không giữ nhầm `json.data ?? json`. |
| 6 | **`dang-nhap` vẫn phải set localStorage** | 🟡 Warning | Spec 22.8 nói dùng `api.submit`. Nhưng `api.submit` không set localStorage. Login page vẫn phải tự đọc `data.token` + `data.user` rồi `localStorage.setItem`. Spec cần ghi rõ để tránh dev bỏ sót bước set token. |
| 7 | **`quan-tri-vien/layout.tsx` cần try/catch** | 🟡 Warning | `api.get` ném `ApiError` khi `!res.ok`. Layout hiện dùng `.then().catch()` chain. Chuyển sang `api.get` phải giữ try/catch để redirect login. Spec 22.8 scenario đã nói "invalid token redirects" nhưng cần ghi rõ cơ chế (catch ApiError → redirect). |

## Spec 22 Findings by User Story

### US-22.1 (Toggle khuyến mãi)
- ✅ Đầy đủ. `is_active: item.isActive === 0` đúng.
- ⚠️ **Thiếu:** spec không đề cập `setTogglingId` loading state đã có sẵn — chỉ cần thêm body, giữ nguyên loading. Minor, không blocking.

### US-22.2 (Bulk delete)
- 🔴 **Blocking:** thiếu route ordering (finding #3). Nếu dev thêm `.delete("/bulk")` sau `.delete("/:id")`, bug không fix được.
- ⚠️ **Thiếu edge case:** disk file không tồn tại (đã xóa tay) — bulk delete nên skip không throw.

### US-22.3 (YouTube add)
- ✅ Đúng. `POST /external` với `{source:"youtube", url}`.
- ⚠️ **Thiếu:** `external.ts` hiện lưu `diskPath: external://...`, `youtubeId` riêng. Spec 22.4 phụ thuộc việc frontend đọc `youtubeId` — nhưng `MediaFile` type (index.logic types.ts) không có `youtubeId` field. Spec 22.4 có nói thêm field, nhưng 22.3 + 22.4 cần nêu rõ backend `external.ts` trả `youtubeId` (đã có) và frontend phải map nó.

### US-22.4 (YouTube thumbnail)
- 🔴 **Blocking:** thiếu `getMediaVariantUrls` (finding #2).

### US-22.5 (Variant full)
- 🔴 **Blocking:** thiếu `GalleryBlock` + `lib/media-url.ts` (finding #1). Spec chỉ fix media-manager → bug vẫn còn ở block renderer.

### US-22.6 (Toggle visibility)
- ✅ Đúng hướng (`!== "0"`).
- ⚠️ **Thiếu:** backward-compat với data cũ `"false"` — spec đã ghi edge case #1, nhưng nên chuẩn hóa ngay: check `!== "0" && !== "false"`. Minor.
- 🟡 **Thiếu:** toggle UI với undefined (finding #4).

### US-22.7 (Draft filter)
- ✅ Đúng. `posts.ts` thêm `draft` param.
- ⚠️ **Cần làm rõ precedence:** khi `draft=true` (admin), push `isPublished=0`; khi `published` undefined + admin + không draft → không filter (trả tất cả). Spec nên có scenario "admin chọn Tất cả → không filter". Hiện đã có "Filter all" scenario nhưng không rõ backend logic.

### US-22.8 (Fetch unification)
- ✅ Đúng hướng.
- 🟡 Thiếu: response shape (finding #5), localStorage (finding #6), try/catch (finding #7).

## Edge Cases Not Covered

| # | Edge Case | Suggested fix |
|---|-----------|---------------|
| 1 | `resolveMediaUrl` signature còn type `"full"` | Đổi type union sang `"medium" \| "thumbnail" \| "large"` |
| 2 | Bulk delete khi disk file đã mất | try/catch skip, không abort toàn bộ batch |
| 3 | YouTube video ID > 11 ký tự hoặc URL rút gọn | `extractYoutubeId` đã xử lý, nhưng backend `external.ts` regex chỉ nhận 11 ký tự `[a-zA-Z0-9_-]{11}` — shorts URL có thể khác. Ngoài scope, note lại. |
| 4 | `draft` + `published` cùng gửi | Ưu tiên draft (admin intent), tránh AND 2 điều kiện mâu thuẫn trả rỗng |

## Combined Verdict

- Total findings: **14** (3 Blocking 🔴, 7 Warning 🟡, 4 Info)
- Blocking (🔴): **3** — variant "full" sót GalleryBlock, YouTube thumbnail sót getMediaVariantUrls, route ordering /bulk.

**Overall: REVISE** — Spec 22 chưa đủ để implement. Phải bổ sung:
1. Mở rộng US-22.5 bao gồm `GalleryBlock.tsx` + `lib/media-url.ts` (type signature).
2. Mở rộng US-22.4 bao gồm `getMediaVariantUrls`.
3. Ghi rõ route ordering `/bulk` phải trước `/:id`.
4. Làm rõ toggle UI undefined + response shape + localStorage + try/catch cho US-22.8.
