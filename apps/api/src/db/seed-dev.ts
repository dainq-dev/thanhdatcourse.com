import { Database } from "bun:sqlite";
import { existsSync } from "node:fs";

const dbPath = (() => {
  if (existsSync("data/app.db")) return "data/app.db";
  if (existsSync("apps/api/data/app.db")) return "apps/api/data/app.db";
  throw new Error("Cannot find data/app.db");
})();

const db = new Database(dbPath);
db.run("PRAGMA foreign_keys = ON");

const now = new Date().toISOString();
const uid = () => crypto.randomUUID();

// ── Xóa data cũ để seed idempotent ──
const clearTables = [
  "course_lessons",
  "course_bonuses",
  "course_modules",
  "course_instructors",
  "product_showcases",
  "promotion_courses",
  "promotions",
  "testimonials",
  "leads",
  "faqs",
  "sections",
  "posts",
  "portfolios",
  "courses",
  "instructors",
  "digital_products",
  "post_categories",
];
for (const t of clearTables) {
  db.run(`DELETE FROM ${t}`);
}

// ── Admin user ──
const adminHash = Bun.password.hashSync("admin123", {
  algorithm: "bcrypt",
  cost: 12,
});
db.run(
  `INSERT OR IGNORE INTO users (id, email, password_hash, name, role)
   VALUES (?, ?, ?, ?, ?)`,
  [uid(), "admin@minhtravel.vn", adminHash, "Admin", "ADMIN"],
);

// ── Courses ──
const courses = [
  {
    id: uid(),
    slug: "30-ngay-sang-tao-video-tiktok-trieu-view",
    title: "30 Ngày Sáng Tạo Video TikTok Triệu View",
    description:
      "Khóa học hướng dẫn A-Z kỹ năng quay dựng, lên kịch bản và tối ưu thuật toán TikTok để đạt triệu view.",
    basePrice: 996000,
    originalPrice: 3868000,
    thumbnailUrl:
      "https://img.youtube.com/vi/utP7z6_Zcwg/maxresdefault.jpg",
    isPublished: 1,
    isFeaturedOnHome: 1,
    featuredOrder: 0,
    ratingCount: "1240",
    rating: 4.9,
    studentCount: 3600,
    level: "all",
    buttonText: "Mua ngay",
  },
  {
    id: uid(),
    slug: "15-ngay-quay-video-may-anh-chuyen-nghiep",
    title: "15 Ngày Quay Video Máy Ảnh Chuyên Nghiệp",
    description:
      "Làm chủ máy ảnh, ánh sáng và bố cục để quay video điện ảnh chuyên nghiệp chỉ trong 15 ngày.",
    basePrice: 1496000,
    originalPrice: 4868000,
    thumbnailUrl:
      "https://img.youtube.com/vi/r9W4i8pvYKY/maxresdefault.jpg",
    isPublished: 1,
    isFeaturedOnHome: 1,
    featuredOrder: 1,
    ratingCount: "856",
    rating: 4.8,
    studentCount: 2100,
    level: "beginner",
    buttonText: "Mua ngay",
  },
  {
    id: uid(),
    slug: "chinh-mau-video-voi-davinci-resolve",
    title: "Chỉnh Màu Video với DaVinci Resolve",
    description:
      "Học chỉnh màu chuyên nghiệp với DaVinci Resolve từ cơ bản đến nâng cao, tạo nên phong cách màu riêng.",
    basePrice: 1296000,
    originalPrice: 3868000,
    thumbnailUrl:
      "https://img.youtube.com/vi/0mC3f7J3ZUA/maxresdefault.jpg",
    isPublished: 1,
    isFeaturedOnHome: 0,
    featuredOrder: 2,
    ratingCount: "432",
    rating: 4.7,
    studentCount: 980,
    level: "intermediate",
    buttonText: "Mua ngay",
  },
];

for (const c of courses) {
  db.run(
    `INSERT INTO courses (id, slug, title, description, base_price, original_price, thumbnail_url, is_published, is_featured_on_home, featured_order, rating_count, rating, student_count, level, button_text, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      c.id,
      c.slug,
      c.title,
      c.description,
      c.basePrice,
      c.originalPrice,
      c.thumbnailUrl,
      c.isPublished,
      c.isFeaturedOnHome,
      c.featuredOrder,
      c.ratingCount,
      c.rating,
      c.studentCount,
      c.level,
      c.buttonText,
      now,
      now,
    ],
  );
}

// ── Portfolios ──
const portfolios = [
  {
    id: uid(),
    title: "THE FORGOTTEN DREAM",
    description:
      "Phim du lịch điện ảnh hợp tác cùng Honda Winner X, ghi lại hành trình 32 ngày lái xe 12.000km.",
    category: "TRAVEL_VLOG",
    youtubeVideoId: "utP7z6_Zcwg",
    isFeaturedOnHome: 1,
    featuredOrder: 0,
  },
  {
    id: uid(),
    title: "LIFE OF TIBET",
    description: "Hành trình khám phá Tây Tạng, vùng đất của những câu chuyện.",
    category: "TRAVEL_VLOG",
    youtubeVideoId: "r9W4i8pvYKY",
    isFeaturedOnHome: 1,
    featuredOrder: 1,
  },
  {
    id: uid(),
    title: "LIFE OF CÔ TÔ",
    description: "Minh Travel x VTV — ghi lại vẻ đẹp hoang sơ của đảo Cô Tô.",
    category: "TVC",
    youtubeVideoId: "0mC3f7J3ZUA",
    isFeaturedOnHome: 0,
    featuredOrder: 2,
  },
  {
    id: uid(),
    title: "ƯỚC MƠ BỊ BỎ QUÊN",
    description: "Minh Travel x Honda — câu chuyện về ước mơ và đam mê.",
    category: "SHORT_FILM",
    youtubeVideoId: "dQw4w9WgXcQ",
    isFeaturedOnHome: 0,
    featuredOrder: 3,
  },
];

for (const p of portfolios) {
  db.run(
    `INSERT INTO portfolios (id, title, description, category, youtube_video_id, is_featured_on_home, featured_order, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      p.id,
      p.title,
      p.description,
      p.category,
      p.youtubeVideoId,
      p.isFeaturedOnHome,
      p.featuredOrder,
      now,
    ],
  );
}

// ── Digital products (Presets & LUTs) ──
const products = [
  {
    id: uid(),
    title: "Cinematic LUT Pack Vol.1",
    description:
      "Bộ 20 LUT màu điện ảnh dành cho video du lịch, tương thích DaVinci, Premiere, CapCut.",
    price: 399000,
    thumbnailUrl: "https://img.youtube.com/vi/utP7z6_Zcwg/hqdefault.jpg",
    youtubePreviewId: "utP7z6_Zcwg",
    tag: "LUT",
    isPublished: 1,
    isFeaturedOnHome: 1,
  },
  {
    id: uid(),
    title: "Travel Preset Lightroom",
    description:
      "15 preset chỉnh ảnh du lịch chuẩn màu Minh Travel, dùng cho Lightroom Mobile & Desktop.",
    price: 299000,
    thumbnailUrl: "https://img.youtube.com/vi/r9W4i8pvYKY/hqdefault.jpg",
    youtubePreviewId: "r9W4i8pvYKY",
    tag: "Preset",
    isPublished: 1,
    isFeaturedOnHome: 1,
  },
  {
    id: uid(),
    title: "DaVinci Color Grade Preset",
    description: "Preset node tree chỉnh màu cho DaVinci Resolve.",
    price: 499000,
    thumbnailUrl: "https://img.youtube.com/vi/0mC3f7J3ZUA/hqdefault.jpg",
    youtubePreviewId: "0mC3f7J3ZUA",
    tag: "Preset",
    isPublished: 1,
    isFeaturedOnHome: 0,
  },
];

for (const p of products) {
  db.run(
    `INSERT INTO digital_products (id, title, description, price, thumbnail_url, youtube_preview_id, tag, is_published, is_featured_on_home, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      p.id,
      p.title,
      p.description,
      p.price,
      p.thumbnailUrl,
      p.youtubePreviewId,
      p.tag,
      p.isPublished,
      p.isFeaturedOnHome,
      now,
      now,
    ],
  );
}

// ── FAQs ──
const faqs = [
  {
    id: uid(),
    question: "Khóa học có dành cho người mới bắt đầu không?",
    answer:
      "Có. Khóa học được thiết kế từ cơ bản đến nâng cao, phù hợp cả người chưa có kinh nghiệm.",
    sortOrder: 0,
  },
  {
    id: uid(),
    question: "Tôi có thể học trên điện thoại được không?",
    answer:
      "Được. Bạn có thể xem video bài giảng trên mọi thiết bị có kết nối internet.",
    sortOrder: 1,
  },
  {
    id: uid(),
    question: "Mua khóa học xong có được hỗ trợ không?",
    answer:
      "Có. Bạn sẽ được tham gia cộng đồng học viên và được hỗ trợ giải đáp thắc mắc.",
    sortOrder: 2,
  },
];

for (const f of faqs) {
  db.run(
    `INSERT INTO faqs (id, question, answer, sort_order) VALUES (?, ?, ?, ?)`,
    [f.id, f.question, f.answer, f.sortOrder],
  );
}

// ── Testimonials ──
const testimonials = [
  {
    id: uid(),
    userName: "Nguyễn Văn A",
    userRole: "Content Creator",
    rating: 5,
    content:
      "Khóa học thay đổi hoàn toàn cách tôi làm video. Giờ kênh của tôi đã đạt 500k subscriber.",
    isFeatured: 1,
    sortOrder: 0,
  },
  {
    id: uid(),
    userName: "Trần Thị B",
    userRole: "Freelancer",
    rating: 5,
    content: "Kiến thức rất thực tế, dễ áp dụng. Mình đã có khách hàng đầu tiên sau 1 tháng.",
    isFeatured: 1,
    sortOrder: 1,
  },
];

for (const t of testimonials) {
  db.run(
    `INSERT INTO testimonials (id, user_name, user_role, rating, content, is_featured, sort_order, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      t.id,
      t.userName,
      t.userRole,
      t.rating,
      t.content,
      t.isFeatured,
      t.sortOrder,
      now,
    ],
  );
}

// ── Promotion (active, show homepage) ──
const promoId = uid();
const promoEnd = new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString();
db.run(
  `INSERT INTO promotions (id, campaign_name, discount_percentage, start_date, end_date, is_active, show_on_homepage, coupon_code, created_at)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  [
    promoId,
    "Flash Sale Hè 2026",
    30,
    now,
    promoEnd,
    1,
    1,
    "HE2026",
    now,
  ],
);
// link promotion to all courses
for (const c of courses) {
  db.run(
    `INSERT INTO promotion_courses (promotion_id, course_id) VALUES (?, ?)`,
    [promoId, c.id],
  );
}

// ── Site settings ──
const settings: Record<string, string> = {
  site_concept: "cinematic",
  hero_video_type: "youtube",
  hero_youtube_id: "utP7z6_Zcwg",
  hero_tagline: "Kể câu chuyện của bạn qua từng khung hình",
  hero_logo_type: "text",
  hero_logo_text: "Minh Travel",
  hero_btn1_text: "KHOÁ HỌC CỦA TÔI",
  hero_btn1_url: "https://hoc.minhtravel.vn/",
  hero_btn2_text: "ĐĂNG KÝ HỌC",
  hero_btn2_url: "/khoa-hoc",
  hero_brands: JSON.stringify([
    { name: "sony" },
    { name: "canon" },
    { name: "dji" },
    { name: "samsung" },
    { name: "fujifilm" },
    { name: "oppo" },
  ]),
  home_work_heading: "Dự án nổi bật",
  home_work_section_visible: "1",
  home_products_heading: "Sản phẩm",
  home_products_section_visible: "1",
  home_counters: JSON.stringify([
    { label: "Facebook followers", value: 38760 },
    { label: "Instagram followers", value: 14856 },
    { label: "YouTube subscribers", value: 112287 },
    { label: "Tiktok followers", value: 443238 },
  ]),
  home_counters_section_visible: "1",
  home_about_text_1:
    "Minh Travel nổi bật với phong cách quay và biên tập video độc đáo, đã truyền cảm hứng cho rất nhiều bạn trẻ theo công việc sáng tạo nội dung.",
  home_about_text_2:
    "Hợp tác với Minh có nghĩa là có cơ hội tiếp cận một trong những đám đông đam mê du lịch, sáng tạo trên internet hiện nay.",
  home_about_section_visible: "1",
  courses_page_hero_title: "Bắt đầu sự nghiệp của bạn",
  courses_page_trust_text: "Được tin tưởng bởi 3,600+ thành viên",
  courses_page_faq_heading: "Câu hỏi thường gặp",
  courses_page_default_btn_text: "Mua ngay",
  portfolio_page_title: "Films by Minh Travel",
  portfolio_page_subtitle: "Những thước phim được đầu tư về hình ảnh và storytelling",
  portfolio_cta_heading: "Bạn muốn làm việc cùng tôi?",
  portfolio_cta_items: JSON.stringify([
    { text: "Liên hệ làm việc", href: "https://www.m.me/minhtravel11/" },
    { text: "Xem nhiều video nữa", href: "https://www.youtube.com/@MinhTravel96" },
  ]),
  presets_page_title: "LUTs & Presets",
  presets_page_subtitle:
    "Bộ sưu tập presets và LUTs chuyên nghiệp dành cho video editor",
  contact_page_title: "Liên hệ",
  contact_page_subtitle: "Bạn có câu hỏi hoặc cần tư vấn? Hãy để lại lời nhắn.",
  contact_email: "contact@minhtravel.vn",
  contact_phone: "0900 123 456",
  contact_address: "Hà Nội, Việt Nam",
  contact_hours: "T2-T6, 9:00-18:00",
};

for (const [key, value] of Object.entries(settings)) {
  db.run(
    `INSERT INTO site_settings (key, value, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    [key, value, now],
  );
}

// ── Sections for first course (course detail) ──
// Xóa orphan sections cũ trỏ course_id không tồn tại
db.run(
  `DELETE FROM sections WHERE entity_type = 'course' AND entity_id NOT IN (SELECT id FROM courses)`,
);

const firstCourseId = courses[0].id;
const sectionDefs = [
  {
    section_type: "hero_banner",
    config: {
      badge_text: "ƯU ĐÃI ĐẶC BIỆT",
      badge_subtitle: "Từng bước xây dựng video tạo doanh thu bạc tỉ",
      title: "30 NGÀY SÁNG TẠO VIDEO TIKTOK TRIỆU VIEW!",
      subtitle:
        "Từ người mới đến chuyên nghiệp: Hướng dẫn A-Z kỹ thuật quay dựng TikTok",
      video_thumbnail_url:
        "https://img.youtube.com/vi/utP7z6_Zcwg/maxresdefault.jpg",
      video_youtube_url: "https://www.youtube.com/watch?v=utP7z6_Zcwg",
      cta_text: "Đăng ký ngay",
      cta_url: "/khoa-hoc",
    },
  },
  {
    section_type: "trust_badges",
    config: {
      items: [
        { text: "KHÔNG CẦN CÓ KINH NGHIỆM" },
        { text: "KHÔNG CẦN CÓ NĂNG KHIẾU" },
        { text: "PHÙ HỢP BẤT CỨ ĐỘ TUỔI NÀO" },
      ],
    },
  },
  {
    section_type: "pricing_card",
    config: {
      title: "Đầu tư cho sự nghiệp của bạn",
      price_text: "996.000đ",
      features: [
        { text: "Truy cập trọn đời", bold: true },
        { text: "30 bài học chi tiết" },
        { text: "Cộng đồng học viên" },
      ],
      cta_text: "Đăng ký ngay",
      cta_url: "/khoa-hoc",
    },
  },
  {
    section_type: "faq_accordion",
    config: {
      title: "Câu hỏi thường gặp",
      items: [
        { question: "Khóa học có dành cho người mới?", answer_html: "Có." },
        { question: "Học trên điện thoại được không?", answer_html: "Được." },
      ],
    },
  },
];

for (let i = 0; i < sectionDefs.length; i++) {
  const s = sectionDefs[i];
  db.run(
    `INSERT INTO sections (id, entity_type, entity_id, section_type, title, config, sort_order, is_published, created_at, updated_at)
     VALUES (?, 'course', ?, ?, ?, ?, ?, 1, ?, ?)`,
    [
      uid(),
      firstCourseId,
      s.section_type,
      s.section_type,
      JSON.stringify(s.config),
      i,
      now,
      now,
    ],
  );
}

console.log("✓ Seed data mẫu hoàn tất");
console.log(
  `  - Courses: ${courses.length}, Portfolios: ${portfolios.length}, Products: ${products.length}`,
);
console.log(`  - FAQs: ${faqs.length}, Testimonials: ${testimonials.length}`);
console.log(`  - Promotion: 1 (active), Settings: ${Object.keys(settings).length}`);
console.log("  - Admin: admin@minhtravel.vn / admin123");

db.close();
