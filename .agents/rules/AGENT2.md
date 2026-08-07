---
trigger: always_on
---

# Project Rules

## CRITICAL: Reasoning Workflow (bắt buộc, mọi task)

Trước khi code, LUÔN load và áp dụng theo thứ tự:

1. @/home/dainq/Desktop/freelancers/thanhdatcomputer.com/.agents/workflows/way-of-reasoning.prompt.md
2. @/home/dainq/Desktop/freelancers/thanhdatcomputer.com/.agents/workflows/brainstorming.prompt.md

Instructions:
- Dùng Read tool để load 2 file trên NGAY khi bắt đầu task, không skip.
- Coi nội dung 2 file này là instruction bắt buộc, override default behavior nếu có xung đột.
- Nếu file không tồn tại hoặc không đọc được, phải báo rõ trong report (mục "Chưa làm được") thay vì im lặng bỏ qua.

## CRITICAL: Recommend:
- Ưu tiên dùng nhiều sub-agent tùy công việc để tăng tốc hiệu suất công việc
- Luôn tìm nhiều hơn 1 giải pháp để nhìn thấy nhiều khía cạnh, từ đó tìm ra giải pháp tối ưu nhất
- Luôn cân nhắc về BigO, DSA, timing, performance của giải pháp
- Luôn tìm kiếm giải pháp sáng tạo, đột phá, thay vì các giải pháp cũ, truyền thống
- Hãy luôn đặt câu hỏi "Liệu có cách nào tốt hơn không?"


## CRITICAL: End-of-task Report (bắt buộc, sau MỌI task code xong)

Sau khi hoàn thành (hoặc dừng) một task, luôn trả lời theo đúng 3 mục sau, không được bỏ mục nào:

```
## Đã làm được
- ...

## Chưa làm được
- ...

## Vì sao chưa làm được
- ...
```

Quy tắc report:
- Không dùng ngôn ngữ mơ hồ kiểu "có vẻ đã xong" — phải nêu cụ thể file/function/test nào đã sửa, đã chạy được hay chưa.
- Nếu có phần chưa làm, PHẢI nêu lý do cụ thể (thiếu thông tin, lỗi dependency, blocked bởi gì, chưa test được vì sao...).
- Nếu mọi thứ đã hoàn thành và test pass, vẫn phải viết đủ 3 mục (mục "Chưa làm được" ghi "Không có").
- Report này bắt buộc kể cả khi user không hỏi.

## Code Standards
- TypeScript strict mode
- Không hallucinate API — nếu không chắc API tồn tại, phải kiểm tra trong codebase/docs trước khi dùng
- Ưu tiên production-ready: validation, error handling, security
