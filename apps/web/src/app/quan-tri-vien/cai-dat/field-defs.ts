export interface FieldDef {
  key: string;
  label: string;
  placeholder?: string;
  type?:
    | "text"
    | "textarea"
    | "color"
    | "media"
    | "media-video"
    | "select"
    | "link"
    | "reference"
    | "tags"
    | "counters"
    | "toggle"
    | "layout-template"
    | "hidden";
  options?: { label: string; value: string }[];
  showWhen?: { key: string; value: string };
  toggleField?: string;
}

export interface SubSection {
  id: string;
  title: string;
  hint: string;
  fields: FieldDef[];
}

export interface Section {
  id: string;
  title: string;
  description: string;
  previewPath: string;
  fields: FieldDef[];
  subSections?: SubSection[];
}

export const SECTIONS: Section[] = [
  {
    id: "homepage",
    title: "Trang chủ",
    description: "Banner, dự án nổi bật, sản phẩm, số liệu, giới thiệu.",
    previewPath: "/",
    fields: [
      {
        key: "homepage_motion",
        label: "Hiệu ứng chuyển động toàn trang",
        type: "select",
        options: [
          { label: "Cascade — nối đuôi từng thẻ", value: "cascade" },
          { label: "Fade — mờ dần nổi lên", value: "fade" },
          { label: "Slide — trượt ngang xen kẽ", value: "slide" },
          { label: "Parallax — trôi theo nhiều tầng", value: "parallax" },
          { label: "Zoom — phóng to vào", value: "zoom" },
          { label: "Clip — mở dần kiểu điện ảnh", value: "clip" },
        ],
      },
    ],
    subSections: [
      {
        id: "home-hero",
        title: "Banner chính",
        hint: "Phần đầu tiên người dùng nhìn thấy",
        fields: [
          {
            key: "hero_video_type",
            label: "Video nền từ",
            type: "select",
            options: [
              { label: "YouTube", value: "youtube" },
              { label: "Tự upload", value: "upload" },
            ],
          },
          {
            key: "hero_youtube_id",
            label: "Link YouTube",
            placeholder: "https://www.youtube.com/watch?v=...",
            showWhen: { key: "hero_video_type", value: "youtube" },
          },
          {
            key: "hero_video_url",
            label: "Video đã upload",
            type: "media-video",
            showWhen: { key: "hero_video_type", value: "upload" },
          },
          {
            key: "hero_tagline",
            label: "Dòng chữ chính giữa banner",
            placeholder: "VD: Kể câu chuyện của bạn qua từng khung hình",
          },
          {
            key: "hero_logo_type",
            label: "Logo hiển thị dạng",
            type: "select",
            options: [
              { label: "Ảnh", value: "image" },
              { label: "Chữ", value: "text" },
            ],
          },
          {
            key: "hero_logo_url",
            label: "Ảnh logo",
            type: "media",
            showWhen: { key: "hero_logo_type", value: "image" },
          },
          {
            key: "hero_logo_text",
            label: "Tên hiển thị (dạng chữ)",
            placeholder: "VD: Minh Travel",
            showWhen: { key: "hero_logo_type", value: "text" },
          },
          {
            key: "hero_btn1_text",
            label: "Nút phụ — Chữ",
            placeholder: "VD: KHOÁ HỌC CỦA TÔI",
          },
          {
            key: "hero_btn1_url",
            label: "Nút phụ — Link đến",
            type: "link",
          },
          {
            key: "hero_btn2_text",
            label: "Nút chính — Chữ",
            placeholder: "VD: ĐĂNG KÝ HỌC",
          },
          {
            key: "hero_btn2_url",
            label: "Nút chính — Link đến",
            type: "link",
          },
          {
            key: "hero_brands",
            label: "Danh sách thương hiệu",
            type: "tags",
          },
        ],
      },
      {
        id: "home-work",
        title: "Mục Dự án nổi bật",
        hint: "2 thẻ ngang, nằm dưới banner — lấy từ Quản lý dự án",
        fields: [
          {
            key: "home_work_section_visible",
            label: "Hiển thị mục này",
            type: "toggle",
          },
          {
            key: "home_work_heading",
            label: "Tiêu đề mục",
            placeholder: "VD: Dự án nổi bật",
          },
          {
            key: "home_work_card1_ref",
            label: "Thẻ trái — Chọn dự án",
            type: "reference",
            placeholder: "/api/portfolios",
          },
          {
            key: "home_work_card2_ref",
            label: "Thẻ phải — Chọn dự án",
            type: "reference",
            placeholder: "/api/portfolios",
          },
        ],
      },
      {
        id: "home-products",
        title: "Mục Sản phẩm",
        hint: "2 thẻ bento, thẻ trái to hơn thẻ phải — lấy từ Quản lý khóa học & Preset",
        fields: [
          {
            key: "home_products_section_visible",
            label: "Hiển thị mục này",
            type: "toggle",
          },
          {
            key: "home_products_heading",
            label: "Tiêu đề mục",
            placeholder: "VD: Sản phẩm",
          },
          {
            key: "home_products_card1_ref",
            label: "Thẻ trái — Chọn khóa học",
            type: "reference",
            placeholder: "/api/courses",
          },
          {
            key: "home_products_card2_ref",
            label: "Thẻ phải — Chọn preset",
            type: "reference",
            placeholder: "/api/products",
          },
        ],
      },
      {
        id: "home-counters",
        title: "Số liệu",
        hint: "Dãy số animation — học viên, follower, subscriber...",
        fields: [
          {
            key: "home_counters_section_visible",
            label: "Hiển thị mục này",
            type: "toggle",
          },
          {
            key: "home_counters",
            label: "Danh sách số liệu",
            type: "counters",
          },
        ],
      },
      {
        id: "home-about",
        title: "Giới thiệu",
        hint: "2 đoạn văn bản ở gần cuối trang",
        fields: [
          {
            key: "home_about_section_visible",
            label: "Hiển thị mục này",
            type: "toggle",
          },
          {
            key: "home_about_text_1",
            label: "Đoạn 1",
            type: "textarea",
            placeholder: "Giới thiệu ngắn về bạn...",
          },
          {
            key: "home_about_text_2",
            label: "Đoạn 2",
            type: "textarea",
            placeholder: "Tiếp tục giới thiệu...",
          },
        ],
      },
    ],
  },
  {
    id: "courses",
    title: "Trang Khóa học",
    description: "Tiêu đề, nút bấm trên trang danh sách & chi tiết khóa học.",
    previewPath: "/khoa-hoc",
    fields: [
      {
        key: "courses_page_hero_title",
        label: "Tiêu đề lớn đầu trang",
        placeholder: "VD: Bắt đầu sự nghiệp của bạn",
      },
      {
        key: "courses_page_trust_text",
        label: "Dòng tin cậy",
        placeholder: "VD: Được tin tưởng bởi 3,600+ thành viên",
      },
      {
        key: "courses_page_trust_icon_url",
        label: "Icon dòng tin cậy",
        type: "media",
      },
      {
        key: "courses_page_default_btn_text",
        label: "Chữ mặc định nút mua",
        placeholder: "VD: Mua ngay",
      },
      {
        key: "courses_page_faq_heading",
        label: "Tiêu đề mục Hỏi & Đáp",
        placeholder: "VD: Câu hỏi thường gặp",
      },
      {
        key: "course_detail_modules_title",
        label: "Chi tiết — Tiêu đề mục Giáo trình",
      },
      {
        key: "course_detail_modules_subtitle",
        label: "Chi tiết — Phụ đề mục Giáo trình",
      },
      {
        key: "course_detail_bonuses_title",
        label: "Chi tiết — Tiêu đề mục Ưu đãi",
      },
      {
        key: "course_detail_testimonials_title",
        label: "Chi tiết — Tiêu đề mục Đánh giá",
        placeholder: "VD: Học viên nói gì",
      },
      {
        key: "course_target_badges",
        label: "Chi tiết — Thẻ đối tượng khóa học",
        placeholder: "Mỗi dòng 1 đối tượng\nVD:\nNgười mới\nContent Creator",
      },
      {
        key: "hero_subtitle",
        label: "Chi tiết — Dòng phụ trên banner",
        placeholder: "VD: TIẾT LỘ BÍ QUYẾT...",
      },
    ],
  },
  {
    id: "portfolio",
    title: "Trang Dự án",
    description: "Tiêu đề & nút kêu gọi hành động trang portfolio.",
    previewPath: "/san-pham",
    fields: [
      {
        key: "portfolio_page_title",
        label: "Tiêu đề trang",
        placeholder: "VD: Films by Minh Travel",
      },
      { key: "portfolio_page_subtitle", label: "Phụ đề trang" },
      {
        key: "portfolio_cta_heading",
        label: "Tiêu đề kêu gọi cuối trang",
        placeholder: "VD: Bạn muốn làm việc cùng tôi?",
      },
      {
        key: "portfolio_cta_items",
        label: "Nút kêu gọi",
        placeholder:
          "Mỗi dòng: Chữ = Link\nVD:\nLiên hệ = /lien-he\nXem thêm = /san-pham",
      },
    ],
  },
  {
    id: "presets",
    title: "Trang Công cụ",
    description: "Tiêu đề & nút mua trang Presets & LUTs.",
    previewPath: "/cong-cu",
    fields: [
      {
        key: "presets_page_title",
        label: "Tiêu đề trang",
        placeholder: "VD: LUTs & Presets",
      },
      { key: "presets_page_subtitle", label: "Phụ đề trang", type: "textarea" },
      {
        key: "presets_page_btn_text",
        label: "Chữ nút mua",
        placeholder: "VD: Mua ngay",
      },
    ],
  },
  {
    id: "contact",
    title: "Trang Liên hệ",
    description: "Thông tin liên hệ, địa chỉ, giờ làm việc.",
    previewPath: "/lien-he",
    fields: [
      {
        key: "contact_page_title",
        label: "Tiêu đề trang",
        placeholder: "VD: Liên hệ",
      },
      { key: "contact_page_subtitle", label: "Phụ đề trang" },
      {
        key: "contact_success_title",
        label: "Tiêu đề sau gửi form",
        placeholder: "VD: Cảm ơn bạn!",
      },
      {
        key: "contact_success_text",
        label: "Nội dung sau gửi form",
        type: "textarea",
      },
      {
        key: "contact_info_title",
        label: "Tiêu đề khối thông tin",
        placeholder: "VD: Thông tin liên hệ",
      },
      {
        key: "contact_email",
        label: "Email",
        placeholder: "VD: contact@minhtravel.vn",
      },
      {
        key: "contact_address",
        label: "Địa chỉ",
        placeholder: "VD: Hà Nội, Việt Nam",
      },
      {
        key: "contact_phone",
        label: "Số điện thoại",
        placeholder: "VD: 0900 123 456",
      },
      {
        key: "contact_hours",
        label: "Giờ làm việc",
        placeholder: "VD: T2-T6, 9:00-18:00",
      },
    ],
  },
  {
    id: "design",
    title: "Giao diện",
    description: "Chọn bố cục trang và kiểu hiển thị nội dung.",
    previewPath: "/",
    fields: [
      {
        key: "homepage_template",
        label: "Trang chủ - Bố cục",
        type: "layout-template",
        placeholder: "homepage",
      },
      { key: "homepage_portfolios_engine", label: "", type: "hidden" },
      { key: "homepage_products_engine", label: "", type: "hidden" },
      {
        key: "courses_template",
        label: "Khóa học - Bố cục",
        type: "layout-template",
        placeholder: "courses",
      },
      { key: "courses_list_engine", label: "", type: "hidden" },
      {
        key: "portfolio_template",
        label: "Dự án - Bố cục",
        type: "layout-template",
        placeholder: "portfolio",
      },
      { key: "portfolio_list_engine", label: "", type: "hidden" },
      {
        key: "presets_template",
        label: "Công cụ - Bố cục",
        type: "layout-template",
        placeholder: "presets",
      },
      { key: "presets_list_engine", label: "", type: "hidden" },
    ],
  },
];

export const ALL_FIELDS = SECTIONS.flatMap((s) => {
  const sectionFields = s.fields.map((f) => ({
    ...f,
    sectionId: s.id,
    sectionTitle: s.title,
    subsectionTitle: undefined as string | undefined,
  }));
  if (s.subSections) {
    for (const sub of s.subSections) {
      for (const f of sub.fields) {
        sectionFields.push({
          ...f,
          sectionId: s.id,
          sectionTitle: s.title,
          subsectionTitle: sub.title,
        });
      }
    }
  }
  return sectionFields;
});
