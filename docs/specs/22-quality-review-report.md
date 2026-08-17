# Quality Review: Spec 22 — Admin Panel Bugfixes

**Reviewer:** Quality orchestrator (adversarial + edge-case + editorial)
**Date:** 2026-08-17
**Artifact type:** BDD spec / test plan
**Reviewers run:** adversarial-reviewer → edge-case-hunter → editorial-reviewer

---

## Review Summary

Spec 22 hướng đúng (fix các bug đã trace), nhưng có **3 vấn đề nền tảng** khiến nó chưa đạt chuẩn để vào `/bdd-dev`:

1. **Thiếu TDD convention** — project có `.test.ts` cho MỌI route, nhưng spec 22 không yêu cầu test nào.
2. **Trùng lặp với spec 16, 17** — spec 22 tái định nghĩa media/promotion thay vì tham chiếu.
3. **3 bug blocking** từ review trước chưa được cập nhật vào spec (variant "full" sót file, youtube thumbnail sót hàm, route ordering).

---

## Adversarial Review — 8 findings

| # | Sev | Finding | Evidence |
|---|-----|---------|----------|
| A1 | 🔴 | **Không có test requirement** — mọi route đều có `.test.ts` (`posts.test.ts`, `promotions.test.ts`, ...) và `.docs/plan-implementation/README.md` quy định TDD (RED→GREEN→refactor). Spec 22 sửa backend (posts draft, media bulk) + frontend logic nhưng không có mục "Tests". Dev sẽ bỏ test → vi phạm convention. | `plan-implementation/README.md:63-81`, 16 file `.test.ts` |
| A2 | 🔴 | **Variant "full" còn 2 chỗ sót** — spec 22.5 chỉ sửa `media-manager/index.logic.ts:187`. `GalleryBlock.tsx:66` lightbox gọi `resolveMediaUrl(mediaId, "full")`, và `lib/media-url.ts` type cho phép `"full"`. Cả 2 sinh `/img/:id/full` → 404. Bug không fix hết. | `GalleryBlock.tsx:66`, `media-url.ts:3` |
| A3 | 🔴 | **YouTube thumbnail còn sót `getMediaVariantUrls`** — spec 22.4 chỉ sửa `getMediaUrl`. `index.logic.ts:170` (getMediaVariantUrls) cũng dùng `file.diskPath` làm video ID → thumbnail/hd/sd URLs sai. | `index.logic.ts:170-181` |
| A4 | 🟡 | **Route ordering `/bulk` vs `/:id`** — Hono match theo thứ tự. `DELETE /api/media/bulk` PHẢI đăng ký trước `.delete("/:id")`, nếu không "bulk" rơi vào `/:id`. Spec 22.2 không nói. | `media.ts:87` |
| A5 | 🟡 | **Trùng lặp spec 17** — US-22.2→22.5 thực chất là bug của spec 17 (Media Library full-page) đã implement. Spec 22 nên ghi "Fixes bug trong spec 17" chứ không viết lại AC. Hiện như đang phủ nhận spec 17. | `docs/specs/17-media-library-fullpage.md` |
| A6 | 🟡 | **Trùng lặp spec 16** — US-22.1 (toggle promotion) là bug của spec 16 (US-16.3 "Toggle active/inactive"). Spec 16 BDD scenario đã ghi đúng contract `is_active: true`, nhưng dev implement sai. Spec 22 nên tham chiếu, không định nghĩa lại. | `docs/specs/16-promotion-campaign-management.md:105-109` |
| A7 | 🟡 | **`posts.ts` logic hiện tại khác giả định của spec** — dòng 68 `if (published || !isAdmin)` là cơ chế khác `courses.ts` (dùng `draft`+`published` tách bạch). Spec 22.7 nói "tương tự courses.ts" nhưng không nêu rõ phải **thay** cơ chế `posts.ts` hiện tại thế nào (có nguy cơ dev chỉ thêm `draft` vào schema mà không sửa dòng 68 → `published=true` và `draft=true` xung đột). | `posts.ts:68` vs `courses.ts:76-82` |
| A8 | 🟡 | **US-22.8 thiếu cơ chế chi tiết** — spec không nói: (a) login vẫn phải `localStorage.setItem` sau `api.submit`; (b) `promotion-banner` backend trả object trực tiếp (không wrap `{data}`), nên `api.publicGet` dùng trực tiếp; (c) admin layout phải try/catch `ApiError` để redirect. Dev sẽ đoán. | `api.ts:112-120`, `dang-nhap/page.tsx:40-41` |

---

## Edge-Case Review — 6 findings

| # | Sev | Finding |
|---|-----|---------|
| E1 | 🟡 | Toggle visibility: value `undefined` → `checked={value==="1"}` hiển thị OFF nhưng section render. UX nghịch lý. Cần thống nhất (hiển thị ON khi undefined, hoặc seed "1"). |
| E2 | 🟡 | Bulk delete: disk file đã mất (xóa tay) → nên skip id đó, không abort batch. |
| E3 | 🟢 | `draft=true` + `published=true` cùng gửi → ưu tiên draft, tránh AND mâu thuẫn trả rỗng. |
| E4 | 🟢 | YouTube URL shorts (`youtube.com/shorts/...`) — frontend `extractYoutubeId` xử lý, backend `external.ts:28` regex chỉ nhận `watch?v=/youtu.be/embed`. Có mismatch nhưng ngoài scope spec 22. Note lại. |
| E5 | 🟢 | `getMediaVariantUrls` "Full"→"large" nhưng `IMAGE_VARIANTS` có `large` width 1400 — nếu ảnh gốc nhỏ hơn, `withoutEnlargement` trả ảnh gốc. OK, nhưng nên note. |
| E6 | 🟢 | Toggle visibility data cũ có thể là `"false"` (string) → check `!== "0"` thôi thì `"false" !== "0"` → vẫn hiển thị. Cần `!== "0" && !== "false"`. Spec edge case #1 đã ghi nhưng chưa thành AC chính thức. |

---

## Editorial Review — 4 findings

| # | Sev | Finding |
|---|-----|---------|
| D1 | 🟡 | Spec không có mục **"Tests"** / "Test Plan" như convention BDD của project (spec 16 có BDD scenario; các spec khác có test cases). |
| D2 | 🟢 | Thiếu **"Related Specs"** section — spec 16, 17 liên quan trực tiếp, cần tham chiếu. |
| D3 | 🟢 | Mục "Edge Cases" dạng bảng tốt, nhưng edge case #1 (backward compat `"false"`) nên nâng thành AC chính thức trong US-22.6 vì nó là điều kiện render thực tế. |
| D4 | 🟢 | US-22.2 "Files" ghi "(giữ nguyên nếu đúng, verify)" — mơ hồ, dev không biết frontend đã đúng chưa. Nên nói rõ: backend thêm route, frontend KHÔNG cần sửa. |

---

## Combined Verdict

- **Total findings**: 18
- **Blocking (🔴)**: 3 (A1 test, A2 variant full, A3 youtube thumb)
- **Warnings (🟡)**: 9
- **Info (🟢)**: 6

**Overall: REVISE** — Spec 22 phải cập nhật trước khi vào `/bdd-dev`:

1. **Thêm mục "Tests"** theo TDD convention (mỗi US có test file tương ứng: `posts.test.ts` thêm draft case, `promotions.test.ts` thêm toggle case, media route test).
2. **Sửa 3 blocking** đã nêu ở A1/A2/A3 (mở rộng phạm vi file + route ordering).
3. **Thêm "Related Specs"** (16, 17) và đổi ngôn ngữ từ "định nghĩa" → "sửa bug của spec X".
4. **Làm rõ cơ chế** A7 (posts.ts dòng 68), A8 (localStorage/response shape/try-catch), D4 (ai sửa file nào).

---

## Khuyến nghị (theo hướng phát triển feature)

Spec 22 đang bị **"bugfix scattered"** — các fix nằm rải ở 3 domain (promotion, media, homepage visibility, fetch). Đề xuất tách thành **2 spec** để dễ review + test:

- **Spec 22a — Promotion + Homepage visibility fix** (US-22.1, 22.6): 2 bug "bấm không có tác dụng", cùng pattern (contract lệch / so sánh sai kiểu), effort nhỏ, test dễ.
- **Spec 22b — Media manager fix + Fetch unification** (US-22.2→22.5, 22.8): cụm media (liên quan spec 17) + refactor env.

Hoặc nếu giữ nguyên 1 spec, ít nhất phải thêm phần test + related specs + sửa 3 blocking.
