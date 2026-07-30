import { Database } from "bun:sqlite";
import { existsSync } from "node:fs";

export function seed(sqlite: Database): void {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY, value TEXT NOT NULL, description TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, password_hash TEXT,
      name TEXT NOT NULL, avatar_url TEXT, role TEXT NOT NULL DEFAULT 'USER',
      google_id TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY, slug TEXT NOT NULL UNIQUE, title TEXT NOT NULL,
      subtitle TEXT, description TEXT NOT NULL, content_blocks TEXT,
      base_price INTEGER NOT NULL, original_price INTEGER, thumbnail_url TEXT,
      trailer_video_url TEXT, external_checkout_url TEXT,
      is_published INTEGER NOT NULL DEFAULT 0,
      is_featured_on_home INTEGER NOT NULL DEFAULT 0,
      is_combo_only INTEGER NOT NULL DEFAULT 0, button_text TEXT,
      featured_order INTEGER DEFAULT 0, rating REAL DEFAULT 0,
      rating_count TEXT DEFAULT '0', student_count INTEGER DEFAULT 0,
      learning_outcomes TEXT, level TEXT, certificate INTEGER DEFAULT 0,
      hero_subtitle TEXT, target_audience TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS post_categories (
      id TEXT PRIMARY KEY, name TEXT NOT NULL, slug TEXT NOT NULL UNIQUE
    );
    CREATE TABLE IF NOT EXISTS posts (
      id TEXT PRIMARY KEY, category_id TEXT REFERENCES post_categories(id) ON DELETE SET NULL,
      title TEXT NOT NULL, slug TEXT NOT NULL UNIQUE, excerpt TEXT NOT NULL,
      content_blocks TEXT, thumbnail_url TEXT, seo_description TEXT,
      author TEXT, read_time INTEGER, is_published INTEGER NOT NULL DEFAULT 0,
      published_at TEXT, views INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS portfolios (
      id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT,
      category TEXT NOT NULL, thumbnail_url TEXT, full_video_url TEXT,
      youtube_video_id TEXT, is_featured_on_home INTEGER NOT NULL DEFAULT 0,
      featured_order INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS digital_products (
      id TEXT PRIMARY KEY, title TEXT NOT NULL, description TEXT NOT NULL,
      price INTEGER NOT NULL, thumbnail_url TEXT, download_file_url TEXT,
      external_checkout_url TEXT, youtube_preview_id TEXT, tag TEXT,
      is_featured_on_home INTEGER NOT NULL DEFAULT 0,
      is_published INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS faqs (
      id TEXT PRIMARY KEY, course_id TEXT REFERENCES courses(id) ON DELETE SET NULL,
      question TEXT NOT NULL, answer TEXT NOT NULL, sort_order INTEGER NOT NULL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS testimonials (
      id TEXT PRIMARY KEY, course_id TEXT REFERENCES courses(id) ON DELETE SET NULL,
      user_name TEXT NOT NULL, user_role TEXT, user_avatar_url TEXT,
      rating INTEGER DEFAULT 5, content TEXT NOT NULL, title TEXT,
      is_featured INTEGER NOT NULL DEFAULT 0, sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const idMap: Record<string, string> = {};

  // ---- Admin user ----
  const adminHash = Bun.password.hashSync("admin123", {
    algorithm: "bcrypt",
    cost: 12,
  });
  idMap.admin = crypto.randomUUID();
  sqlite.run(
    "INSERT OR IGNORE INTO users (id, email, password_hash, name, role) VALUES (?, ?, ?, ?, ?)",
    [idMap.admin, "admin@minhtravel.vn", adminHash, "Admin", "ADMIN"],
  );
  const adminCount = (
    sqlite
      .query(
        "SELECT COUNT(*) as c FROM users WHERE email = 'admin@minhtravel.vn'",
      )
      .get() as { c: number }
  ).c;
  if (adminCount === 1) {
    console.log("✓ Admin user seeded");
  } else {
    console.log("• Admin user exists, skipping");
  }

  // ---- Courses ----
  const coursesData = [
    {
      slug: "30-ngay-sang-tao-video-trieu-view",
      title: "30 Ngày Sáng Tạo Video TikTok Triệu View (Điện thoại)",
      description:
        "Khóa học đơn giản và đầy đủ giúp bạn làm chủ kỹ năng quay dựng video Tiktok bằng điện thoại và bắt đầu những video triệu view của mình trên nền tảng Tiktok.",
      basePrice: 996000,
      thumbnailUrl:
        "https://minhtravel.vn/wp-content/uploads/2025/06/Quay-dung-Tiktok-bang-dien-thoai-Online-copy-scaled.webp",
      isFeaturedOnHome: 1,
      ratingCount: "99+",
      externalCheckoutUrl:
        "https://go.minhtravel.vn/checkouts/30-ngay-sang-tao-video-tiktok-trieu-view/",
      isComboOnly: 0,
      buttonText: null,
    },
    {
      slug: "khoa-hoc-chinh-mau",
      title: "Làm Chủ Tư Duy Chỉnh Màu Trong 2H (Online)",
      description:
        "Khóa học chia sẻ về làm màu, tư duy về ánh sáng, và phối màu. Đây là nền tảng quan trọng mà thiếu nó, không kỹ năng nào có thể giúp video chúng ta đẹp hơn được.",
      basePrice: 1599000,
      thumbnailUrl:
        "https://minhtravel.vn/wp-content/uploads/2025/06/tu-duy-chinh-mau-copy-scaled.webp",
      isFeaturedOnHome: 0,
      ratingCount: "10+",
      externalCheckoutUrl:
        "https://go.minhtravel.vn/checkouts/lam-chu-tu-duy-chinh-mau-video-trong-2h-cung-minh-travel/",
      isComboOnly: 0,
      buttonText: null,
    },
    {
      slug: "lam-chu-may-anh-quay-chuyen-nghiep",
      title: "15 Ngày Quay Video Máy Ảnh Chuyên Nghiệp",
      description:
        "Khóa học này giúp bạn chủ kĩ năng quay phim, tư duy nghệ thuật. Dù bạn là người mới hay đã có máy ảnh nhưng chưa biết quay đẹp, giúp bạn biến đam mê thành kỹ năng thực chiến.",
      basePrice: 2996000,
      thumbnailUrl:
        "https://minhtravel.vn/wp-content/uploads/2025/06/Quay-video-bang-may-anh-chuyen-nghiep-copy-scaled.webp",
      isFeaturedOnHome: 0,
      ratingCount: "99+",
      externalCheckoutUrl:
        "https://go.minhtravel.vn/checkouts/lam-chu-may-anh-quay-video-chuyen-nghiep/",
      isComboOnly: 0,
      buttonText: null,
    },
    {
      slug: "setup-goc-vlog-va-livestream-chuyen-nghiep-bang-may-anh",
      title: "Setup Góc Vlog Và Livestream Chuyên Nghiệp Bằng Máy Ảnh",
      description:
        "Khóa học giúp bạn xây dựng một không gian quay hiện đại, đẹp mắt và chuẩn ánh sáng studio ngay tại nhà.",
      basePrice: 1868000,
      thumbnailUrl:
        "https://minhtravel.vn/wp-content/uploads/2025/06/vlog-1024x683.webp",
      isFeaturedOnHome: 0,
      ratingCount: "10+",
      externalCheckoutUrl:
        "https://go.minhtravel.vn/checkouts/setup-goc-vlog-va-livestream-chuyen-nghiep-bang-may-anh/",
      isComboOnly: 0,
      buttonText: null,
    },
    {
      slug: "edit-video-chuyen-nghiep-voi-davinci-resolve",
      title: "Edit Video Chuyên Nghiệp Với Davinci Resolve",
      description:
        "Khóa học dành cho những ai muốn dựng video chuyên nghiệp với phần mềm miễn phí mạnh nhất hiện nay. Bạn sẽ được hướng dẫn từ cơ bản đến nâng cao.",
      basePrice: 2996000,
      thumbnailUrl:
        "https://minhtravel.vn/wp-content/uploads/2025/06/davinci-copy-scaled.webp",
      isFeaturedOnHome: 0,
      ratingCount: "99+",
      externalCheckoutUrl:
        "https://go.minhtravel.vn/checkouts/edit-video-chuyen-nghiep-voi-davinci-resolve/",
      isComboOnly: 0,
      buttonText: null,
    },
    {
      slug: "combo-video-marketing-masterclass",
      title: "Video Marketing For Business",
      description:
        "Khoá học hướng dẫn làm video quảng cáo chuyển đổi cao trên các nền tảng Facebook, Tiktok, Youtube. Khoá học chỉ bán cùng combo.",
      basePrice: 2868000,
      thumbnailUrl:
        "https://minhtravel.vn/wp-content/uploads/2024/09/course-marketing.jpg",
      isFeaturedOnHome: 0,
      ratingCount: "99+",
      externalCheckoutUrl: null,
      isComboOnly: 1,
      buttonText: "Không Bán Rời",
    },
    {
      slug: "bat-dau-su-nghiep-voi-video-marketing-a-z",
      title: "[Combo] Video Marketing Masterclass",
      description:
        "Combo chứa tất cả khoá học online của Minh Travel với mức giá ưu đãi nhất!",
      basePrice: 10000000,
      thumbnailUrl:
        "https://minhtravel.vn/wp-content/uploads/2024/09/course-combo.jpg",
      isFeaturedOnHome: 0,
      ratingCount: "99+",
      externalCheckoutUrl:
        "https://go.minhtravel.vn/checkouts/combo-video-marketing-masterclass/",
      isComboOnly: 0,
      buttonText: null,
    },
    {
      slug: "khoa-hoc-truc-tiep-11-cung-minh-travel",
      title: "Workshop Cho Doanh Nghiệp",
      description:
        "Chương trình đào tạo toàn diện giúp bạn làm chủ nghệ thuật quay dựng video, xây dựng thương hiệu cá nhân và phát triển công việc kinh doanh qua sức mạnh của video.",
      basePrice: 2000,
      thumbnailUrl:
        "https://minhtravel.vn/wp-content/uploads/2024/09/course-workshop.jpg",
      isFeaturedOnHome: 0,
      ratingCount: "99+",
      externalCheckoutUrl: "https://www.m.me/minhtravel11/",
      isComboOnly: 0,
      buttonText: "Tư Vấn Miễn Phí",
    },
  ];

  for (let i = 0; i < coursesData.length; i++) {
    const c = coursesData[i];
    idMap[`c${i + 1}`] = crypto.randomUUID();
    sqlite.run(
      `INSERT OR IGNORE INTO courses (id, slug, title, description, base_price, thumbnail_url, is_featured_on_home, rating_count, external_checkout_url, is_combo_only, button_text, is_published)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [
        idMap[`c${i + 1}`],
        c.slug,
        c.title,
        c.description,
        c.basePrice,
        c.thumbnailUrl,
        c.isFeaturedOnHome,
        c.ratingCount,
        c.externalCheckoutUrl,
        c.isComboOnly,
        c.buttonText,
      ],
    );
  }
  console.log(`✓ ${coursesData.length} courses seeded`);

  // ---- Articles (Posts) ----
  const articlesData = [
    {
      slug: "quay-video-bang-dien-thoai-chuyen-nghiep-de-thu-ve-trieu-view-hoan-toan-co-the",
      title:
        "Quay video bằng điện thoại chuyên nghiệp để thu về triệu view – hoàn toàn có thể!",
      excerpt:
        "Quay video bằng điện thoại chuyên nghiệp không chỉ giúp bạn tiết kiệm chi phí mà còn mang lại những thước phim chất lượng, dễ dàng đạt tương tác cao",
      thumbnailUrl:
        "https://minhtravel.vn/wp-content/uploads/2025/11/lam-video-chuyen-nghiep3-1024x517.png",
      author: "minhtravel",
      publishedAt: "2025-11-25T08:00:00Z",
      readTime: 8,
      htmlContent: "<p>Nội dung đang được cập nhật...</p>",
    },
    {
      slug: "6-ky-thuat-nhiep-anh-khong-the-thieu-khi-chup-bang-smartphone",
      title: "6 kỹ thuật nhiếp ảnh không thể thiếu khi chụp bằng Smartphone",
      excerpt:
        "Camera trên các thiết bị Smartphone hiện nay được cải tiến vô cùng mạnh mẽ, giúp người dùng dễ dàng quay video bằng điện thoại mà vẫn có chất lượng",
      thumbnailUrl:
        "https://minhtravel.vn/wp-content/uploads/2025/11/smartphone-photo.jpg",
      author: "minhtravel",
      publishedAt: "2025-11-20T08:00:00Z",
      readTime: 6,
      htmlContent: "<p>Nội dung đang được cập nhật...</p>",
    },
    {
      slug: "8-meo-huu-ich-giup-ban-quay-video-dep-chi-voi-dien-thoai",
      title: "8 mẹo hữu ích giúp bạn quay video đẹp chỉ với điện thoại",
      excerpt:
        "Một chiếc smartphone tốt có thể thay thế cho nhiều thiết bị khác tiện lợi và nhỏ gọn hơn, trong đó có chiếc máy ảnh, máy quay",
      thumbnailUrl:
        "https://minhtravel.vn/wp-content/uploads/2025/11/phone-video-tips.jpg",
      author: "minhtravel",
      publishedAt: "2025-11-15T08:00:00Z",
      readTime: 7,
      htmlContent: "<p>Nội dung đang được cập nhật...</p>",
    },
    {
      slug: "tu-hoc-quay-dung-video-tai-nha-bat-dau-tu-dau-de-khong-bi-nan",
      title: "Tự học quay dựng video tại nhà: Bắt đầu từ đâu để không bị nản?",
      excerpt:
        "Trong thời đại sáng tạo nội dung bùng nổ, quay dựng video không còn là kỹ năng chỉ dành cho dân chuyên nghiệp. Giờ đây, bất kỳ ai",
      thumbnailUrl:
        "https://minhtravel.vn/wp-content/uploads/2025/11/self-learn-video.jpg",
      author: "minhtravel",
      publishedAt: "2025-11-10T08:00:00Z",
      readTime: 10,
      htmlContent: "<p>Nội dung đang được cập nhật...</p>",
    },
    {
      slug: "quy-trinh-dung-video-voi-9-buoc-co-ban-cho-nguoi-moi-bat-dau",
      title: "Quy trình dựng video với 9 bước cơ bản cho người mới bắt đầu",
      excerpt:
        "Trong thời đại số, quy trình dựng video trở thành kỹ năng thiết yếu không chỉ cho những người làm phim chuyên nghiệp mà còn cho content creator, Youtuber, Tiktoker",
      thumbnailUrl:
        "https://minhtravel.vn/wp-content/uploads/2025/11/video-editing-steps.jpg",
      author: "minhtravel",
      publishedAt: "2025-11-05T08:00:00Z",
      readTime: 12,
      htmlContent: "<p>Nội dung đang được cập nhật...</p>",
    },
    {
      slug: "cac-cu-may-trong-quay-phim-co-ban-va-duoc-dung-pho-bien",
      title: "Các cú máy trong quay phim cơ bản và được dùng phổ biến",
      excerpt:
        "Trong phim ảnh và video quảng cáo theo lối kể chuyện (storytelling), camera không chỉ đơn thuần là một công cụ ghi hình. Nó là cây bút vẽ nên cảm",
      thumbnailUrl:
        "https://minhtravel.vn/wp-content/uploads/2025/11/camera-shots.jpg",
      author: "minhtravel",
      publishedAt: "2025-11-01T08:00:00Z",
      readTime: 9,
      htmlContent: "<p>Nội dung đang được cập nhật...</p>",
    },
  ];

  function htmlToTextBlocks(html: string): string {
    const text = html.replace(/<[^>]*>/g, "").trim();
    return JSON.stringify([
      { id: crypto.randomUUID(), type: "paragraph", data: { text } },
    ]);
  }

  for (let i = 0; i < articlesData.length; i++) {
    const a = articlesData[i];
    idMap[`a${i + 1}`] = crypto.randomUUID();
    const contentBlocks = htmlToTextBlocks(a.htmlContent);
    sqlite.run(
      `INSERT OR IGNORE INTO posts (id, title, slug, excerpt, content_blocks, thumbnail_url, author, read_time, is_published, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
      [
        idMap[`a${i + 1}`],
        a.title,
        a.slug,
        a.excerpt,
        contentBlocks,
        a.thumbnailUrl,
        a.author,
        a.readTime,
        a.publishedAt,
      ],
    );
  }
  console.log(`✓ ${articlesData.length} articles seeded`);

  // ---- Portfolios ----
  const portfolioData = [
    {
      title: "LIFE OF TIBET | Cinematic Travel Film",
      description: "32 ngày, lái xe 12.000km vòng quanh Trung Quốc.",
      thumbnailUrl:
        "https://minhtravel.vn/wp-content/uploads/2024/09/portfolio-tibet.jpg",
      category: "Travel",
      youtubeVideoId: "",
    },
    {
      title: "LIFE OF CÔ TÔ | Minh Travel x VTV",
      description:
        "May mắn khi được nhà đài liên hệ và làm đạo diễn cho 1 bộ phim du lịch chiếu 6 ngày tết trên VTV.",
      thumbnailUrl:
        "https://minhtravel.vn/wp-content/uploads/2024/09/portfolio-coto.jpg",
      category: "Travel",
      youtubeVideoId: "",
    },
    {
      title: "Life of Cat Ba | Minh Travel x Sony",
      description:
        "Video ghi lại cuộc sống chân thực ở cát bà. Đồng hành cùng chiếc máy ảnh Sony ZV-E1.",
      thumbnailUrl:
        "https://minhtravel.vn/wp-content/uploads/2024/09/portfolio-catba.jpg",
      category: "Travel",
      youtubeVideoId: "",
    },
    {
      title: "Ước mơ bị bỏ quên | Minh Travel x Honda",
      description:
        "Dự án kể về ước mơ của mình từ làm công việc văn phòng chuyển qua đam mê quay phim.",
      thumbnailUrl:
        "https://minhtravel.vn/wp-content/uploads/2024/09/portfolio-honda.jpg",
      category: "Commercial",
      youtubeVideoId: "",
    },
    {
      title: "VTV x Minh Travel | Hình Ảnh Cuộc Sống",
      description:
        "Phỏng vấn hành trình quay video tặng các cô chú bán đồ ăn đường phố tại Việt Nam của mình được chiếu trên sóng VTV1 và VTV3.",
      thumbnailUrl:
        "https://minhtravel.vn/wp-content/uploads/2024/09/portfolio-vtv.jpg",
      category: "TV",
      youtubeVideoId: "",
    },
    {
      title: "Cách quay video ĐẸP như Lý Tử Thất",
      description:
        "Lý Tử Thất là một tượng đài về video ẩm thực trên toàn thế giới. Video này sẽ chia sẻ chi tiết cách để bạn có thể quay được video đẹp như vậy.",
      thumbnailUrl:
        "https://minhtravel.vn/wp-content/uploads/2024/09/portfolio-lizhi.jpg",
      category: "Tutorial",
      youtubeVideoId: "",
    },
    {
      title: "Mình đã kiếm 100 Triệu/ Tháng như thế nào?",
      description:
        "Video chia sẻ chi tiết hành trình khởi nghiệp nghề làm video của mình từ con số 0 cho tới nay.",
      thumbnailUrl:
        "https://minhtravel.vn/wp-content/uploads/2024/09/portfolio-income.jpg",
      category: "Tutorial",
      youtubeVideoId: "",
    },
  ];

  const existingPortfolios = (
    sqlite.query("SELECT COUNT(*) as c FROM portfolios").get() as { c: number }
  ).c;
  if (existingPortfolios === 0) {
    for (const p of portfolioData) {
      sqlite.run(
        `INSERT INTO portfolios (id, title, description, category, thumbnail_url, youtube_video_id) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          crypto.randomUUID(),
          p.title,
          p.description,
          p.category,
          p.thumbnailUrl,
          p.youtubeVideoId,
        ],
      );
    }
  }
  console.log(`✓ ${portfolioData.length} portfolio items seeded`);

  // ---- Preset Products (Digital Products) ----
  const presetData = [
    {
      title: "Bộ 7 LUT Wedding",
      description:
        "Bộ LUT màu cưới với 2 tông màu chủ đạo là trong sáng và vintage (7 LUT) giúp cho sản phẩm của bạn trở nên bắt mắt hơn!",
      price: 199000,
      thumbnailUrl:
        "https://minhtravel.vn/wp-content/uploads/2024/09/preset-wedding.jpg",
      tag: "LUT",
      externalCheckoutUrl: "https://go.minhtravel.vn/?add-to-cart=776",
    },
    {
      title: "Bộ 3 LUT Travel Cinematic",
      description:
        "Bộ LUT màu travel, street mà mình hay sử dụng để tạo tông màu orange and teal, deep black trong các video của mình.",
      price: 149000,
      thumbnailUrl:
        "https://minhtravel.vn/wp-content/uploads/2024/09/preset-travel.jpg",
      tag: "LUT",
      externalCheckoutUrl: "https://go.minhtravel.vn/?add-to-cart=788",
    },
    {
      title: "Preset ảnh Minh Travel",
      description:
        "Bộ 10 Preset ảnh của Minh Travel được mình sử dụng chỉnh sửa tất cả những bộ ảnh profile. Tặng kèm video hướng dẫn chi tiết sử dụng preset để chỉnh ảnh.",
      price: 249000,
      thumbnailUrl:
        "https://minhtravel.vn/wp-content/uploads/2024/09/preset-photo.jpg",
      tag: "Preset",
      externalCheckoutUrl: "https://go.minhtravel.vn/?add-to-cart=930",
    },
  ];

  const existingPresets = (
    sqlite.query("SELECT COUNT(*) as c FROM digital_products").get() as {
      c: number;
    }
  ).c;
  if (existingPresets === 0) {
    for (const pr of presetData) {
      sqlite.run(
        `INSERT INTO digital_products (id, title, description, price, thumbnail_url, tag, external_checkout_url, is_published) VALUES (?, ?, ?, ?, ?, ?, ?, 1)`,
        [
          crypto.randomUUID(),
          pr.title,
          pr.description,
          pr.price,
          pr.thumbnailUrl,
          pr.tag,
          pr.externalCheckoutUrl,
        ],
      );
    }
  }
  console.log(`✓ ${presetData.length} preset products seeded`);

  // ---- FAQs (global) ----
  const faqData = [
    {
      question: "Ở đây có dạy về quay máy chuyên dụng không?",
      answer:
        "Hệ thống khoá học của Minh Travel có đầy đủ các khoá học từ sử dụng điện thoại tới khoá học quay dựng máy ảnh chuyên nghiệp. Đáp ứng được nhu cầu của tất cả mọi người.",
    },
    {
      question: "Tôi có thể xem các khóa học ở đâu?",
      answer:
        "Sau khi tạo tài khoản và đăng nhập vào website, học viên sẽ có quyền truy cập vào các video khóa học. Bạn có thể học thử miễn phí một số bài giảng để xem liệu có phù hợp với bản thân hay không.",
    },
    {
      question: "Khi nào tôi có quyền truy cập?",
      answer:
        "Quá trình được chấp nhận diễn ra ngay lập tức! Sau khi thanh toán của bạn được xử lý, bạn sẽ có quyền truy cập vào khóa học bạn đã mua. Nếu bạn đã mua Khóa học trực tiếp 1:1, bạn cũng sẽ nhận được quyền truy cập vào cộng đồng trực tuyến của chúng tôi.",
    },
    {
      question:
        "Khóa học của Minh Travel có được bao gồm trong Khóa học trực tiếp 1:1 không?",
      answer:
        "Có, tất cả các bài học của Minh đều có thể tìm thấy trong khóa học trực tiếp 1:1. Khóa học của Minh Travel bao gồm toàn bộ các kĩ năng quay dựng video.",
    },
    {
      question:
        "Tôi có thể tải xuống các bài học để sử dụng ngoại tuyến không?",
      answer:
        "Không, nội dung của chúng tôi không thể tải xuống được nhưng bạn sẽ có quyền truy cập trọn đời vào nội dung đó miễn là bạn có kết nối internet.",
    },
    {
      question: "Tôi có quyền truy cập vào nội dung khóa học trong bao lâu?",
      answer:
        "Bạn sẽ có TRUY CẬP 1 năm vào khóa học bạn đã mua. Hoặc thời hạn dài hơn nếu bạn mua combo.",
    },
    {
      question:
        "Khóa học của bạn dành cho người mới bắt đầu hay nhà làm phim có kinh nghiệm?",
      answer:
        "Các khóa học của chúng tôi dành cho bất kỳ ai sẵn sàng tìm hiểu nghệ thuật quay dựng video! Cho dù bạn mới bắt đầu hay bạn là một nhà làm phim giàu kinh nghiệm, cả hai khóa học đều được xây dựng cho mọi cấp độ, nhằm nâng khả năng sáng tạo của bạn lên một tầm cao mới.",
    },
  ];

  const existingFaqs = (
    sqlite.query("SELECT COUNT(*) as c FROM faqs").get() as { c: number }
  ).c;
  if (existingFaqs === 0) {
    for (let i = 0; i < faqData.length; i++) {
      const f = faqData[i];
      sqlite.run(
        `INSERT INTO faqs (id, course_id, question, answer, sort_order) VALUES (?, NULL, ?, ?, ?)`,
        [crypto.randomUUID(), f.question, f.answer, i],
      );
    }
  }
  console.log(`✓ ${faqData.length} FAQs seeded`);

  // ---- Testimonials (global) ----
  const testimonialData = [
    {
      userName: "CHỦ SHOP THỜI TRANG",
      userRole: "Học viên TikTok",
      content:
        "Học quay fashion chuyên nghiệp cùng Minh Travel đã giúp shop tôi tăng doanh số đáng kể.",
      userAvatarUrl: "/images/avatar-1.jpg",
    },
    {
      userName: "Nam Phạm",
      userRole: "Freelancer",
      content: "Hành trình trở thành freelancer từ con số 0 cùng Minh Travel.",
      userAvatarUrl: "/images/avatar-2.jpg",
    },
    {
      userName: "Hoàng Mạnh Cường",
      userRole: "CEO Học Viện Topmax",
      content:
        "Khóa học thay đổi hoàn toàn cách tôi làm video. Từ một người không biết gì, giờ tôi đã nhận được các dự án quay dựng chuyên nghiệp.",
      userAvatarUrl: "/images/avatar-3.jpg",
    },
    {
      userName: "Phạm Thị D",
      userRole: "Content Creator",
      content:
        "Khóa học chỉnh màu đỉnh cao! Màu phim của tôi đẹp hơn hẳn, khách hàng rất hài lòng.",
      userAvatarUrl: "/images/avatar-4.jpg",
    },
  ];

  const existingTestimonials = (
    sqlite.query("SELECT COUNT(*) as c FROM testimonials").get() as {
      c: number;
    }
  ).c;
  if (existingTestimonials === 0) {
    for (let i = 0; i < testimonialData.length; i++) {
      const t = testimonialData[i];
      sqlite.run(
        `INSERT INTO testimonials (id, course_id, user_name, user_role, user_avatar_url, content, is_featured, sort_order) VALUES (?, NULL, ?, ?, ?, ?, 1, ?)`,
        [
          crypto.randomUUID(),
          t.userName,
          t.userRole,
          t.userAvatarUrl,
          t.content,
          i,
        ],
      );
    }
  }
  console.log(`✓ ${testimonialData.length} testimonials seeded`);

  // ---- Site Settings (~55 keys) ----
  const siteSettingsData: [string, string, string | null][] = [
    [
      "site_title",
      "Minh Travel — Kể câu chuyện của bạn qua từng khung hình",
      "Browser tab title",
    ],
    [
      "site_description",
      "Học quay dựng, chỉnh màu chuyên nghiệp cùng Minh Travel.",
      "SEO meta description",
    ],
    ["theme_color", "#0B0F19", "Primary brand dark color"],
    [
      "hero_youtube_id",
      "utP7z6_Zcwg",
      "Hero section background YouTube video ID",
    ],
    [
      "hero_tagline",
      "Kể câu chuyện của bạn qua từng khung hình",
      "Hero heading text",
    ],
    ["hero_btn1_text", "KHOÁ HỌC CỦA TÔI", "Hero primary button text"],
    ["hero_btn1_url", "https://hoc.minhtravel.vn/", "Hero primary button URL"],
    ["hero_btn2_text", "ĐĂNG KÝ HỌC", "Hero secondary button text"],
    ["hero_btn2_url", "/khoa-hoc", "Hero secondary button URL"],
    [
      "courses_page_hero_title",
      "Khóa Học Của Minh Travel",
      "Courses page hero heading",
    ],
    [
      "courses_page_hero_subtitle",
      "Chọn khóa học phù hợp và bắt đầu hành trình sáng tạo nội dung của bạn",
      "Courses page subheading",
    ],
    [
      "courses_page_faq_heading",
      "Câu Hỏi Thường Gặp",
      "FAQ section heading on courses page",
    ],
    [
      "home_hero_heading",
      "Kể câu chuyện của bạn qua từng khung hình",
      "Homepage hero heading",
    ],
    [
      "home_hero_subheading",
      "Học quay dựng video chuyên nghiệp cùng Minh Travel",
      "Homepage hero subheading",
    ],
    [
      "home_courses_heading",
      "Khóa Học Nổi Bật",
      "Homepage courses section heading",
    ],
    [
      "home_portfolio_heading",
      "Dự Án Tiêu Biểu",
      "Homepage portfolio section heading",
    ],
    [
      "home_testimonials_heading",
      "Học Viên Nói Gì?",
      "Homepage testimonials section heading",
    ],
    [
      "home_brands_heading",
      "Đối Tác Của Chúng Tôi",
      "Homepage brands section heading",
    ],
    [
      "home_presets_heading",
      "Preset & LUT",
      "Homepage presets section heading",
    ],
    [
      "home_articles_heading",
      "Bài Viết Mới Nhất",
      "Homepage articles section heading",
    ],
    ["home_faq_heading", "Câu Hỏi Thường Gặp", "Homepage FAQ section heading"],
    [
      "home_cta_heading",
      "Sẵn sàng để trở thành nhà sáng tạo nội dung chuyên nghiệp?",
      "Homepage CTA heading",
    ],
    [
      "home_cta_subheading",
      "Tham gia cùng hơn 10.000 học viên đã và đang học tập tại Minh Travel",
      "Homepage CTA subheading",
    ],
    ["home_cta_button_text", "BẮT ĐẦU NGAY", "Homepage CTA button text"],
    ["home_cta_button_url", "/khoa-hoc", "Homepage CTA button URL"],
    ["about_page_title", "Về Minh Travel", "About page heading"],
    [
      "about_page_subtitle",
      "Hành trình kể chuyện qua từng khung hình",
      "About page subheading",
    ],
    ["about_page_content", "", "About page rich content"],
    ["contact_email", "contact@minhtravel.vn", "Public contact email"],
    ["contact_phone", "0900 123 456", "Public contact phone"],
    ["contact_address", "TP. Hồ Chí Minh, Việt Nam", "Office address"],
    [
      "social_facebook",
      "https://www.facebook.com/minhtravel11",
      "Facebook page URL",
    ],
    [
      "social_youtube",
      "https://www.youtube.com/@minhtravel",
      "YouTube channel URL",
    ],
    [
      "social_tiktok",
      "https://www.tiktok.com/@minhtravel",
      "TikTok profile URL",
    ],
    [
      "social_instagram",
      "https://www.instagram.com/minhtravel",
      "Instagram profile URL",
    ],
    [
      "footer_copyright",
      "© 2025 Minh Travel. All rights reserved.",
      "Footer copyright text",
    ],
    [
      "footer_description",
      "Minh Travel — Học viện đào tạo quay dựng video chuyên nghiệp hàng đầu Việt Nam",
      "Footer description",
    ],
    ["blog_page_title", "Blog & Kiến Thức", "Blog listing page heading"],
    [
      "blog_page_subtitle",
      "Kiến thức quay dựng, chỉnh màu và sáng tạo nội dung",
      "Blog listing page subheading",
    ],
    ["portfolio_page_title", "Dự Án Của Tôi", "Portfolio page heading"],
    [
      "portfolio_page_subtitle",
      "Những dự án quay dựng tiêu biểu",
      "Portfolio page subheading",
    ],
    ["product_page_title", "Preset & LUT", "Digital products page heading"],
    [
      "product_page_subtitle",
      "Công cụ chỉnh màu chuyên nghiệp cho video và ảnh của bạn",
      "Digital products page subheading",
    ],
    [
      "seo_default_title",
      "Minh Travel — Học Quay Dựng Video Chuyên Nghiệp",
      "Default SEO title",
    ],
    [
      "seo_default_description",
      "Học quay dựng video, chỉnh màu chuyên nghiệp cùng Minh Travel. Khóa học online từ cơ bản đến nâng cao.",
      "Default SEO description",
    ],
    [
      "seo_og_image",
      "https://minhtravel.vn/wp-content/uploads/2025/06/og-image.jpg",
      "Default Open Graph image",
    ],
    ["ga_tracking_id", "", "Google Analytics tracking ID"],
    ["fb_pixel_id", "", "Facebook Pixel ID"],
    ["header_logo_text", "MINH TRAVEL", "Header logo text fallback"],
    ["header_logo_url", "", "Header logo image URL"],
    ["maintenance_mode", "0", "Enable maintenance mode (0 or 1)"],
    ["courses_per_page", "12", "Number of courses per page"],
    ["articles_per_page", "9", "Number of articles per page"],
    ["instructor_name", "Minh Travel", "Main instructor name"],
    [
      "instructor_title",
      "Filmmaker & Content Creator",
      "Main instructor title",
    ],
    [
      "instructor_bio",
      "Minh Travel là nhà sáng tạo nội dung với hơn 7 năm kinh nghiệm trong lĩnh vực quay dựng video và sáng tạo nội dung trên các nền tảng mạng xã hội.",
      "Main instructor bio",
    ],
    [
      "instructor_avatar",
      "https://minhtravel.vn/wp-content/uploads/2024/09/instructor-avatar.jpg",
      "Main instructor avatar URL",
    ],
  ];

  for (const [key, value, description] of siteSettingsData) {
    sqlite.run(
      "INSERT OR IGNORE INTO site_settings (key, value, description) VALUES (?, ?, ?)",
      [key, value, description],
    );
  }
  console.log(`✓ ${siteSettingsData.length} site settings seeded`);

  console.log("\n✓ Seed complete!");
}

// Run directly from monorepo root or apps/api via: bun run apps/api/src/db/seed.ts
if (import.meta.main) {
  const d1 = "data/app.db";
  const d2 = "apps/api/data/app.db";
  const dbPath = existsSync(d1) ? d1 : existsSync(d2) ? d2 : null;
  if (!dbPath) {
    console.error(
      "Cannot find data/app.db. Run from monorepo root or apps/api/ directory.",
    );
    process.exit(1);
  }
  const sqlite = new Database(dbPath);
  sqlite.run("PRAGMA journal_mode = WAL");
  sqlite.run("PRAGMA busy_timeout = 5000");
  sqlite.run("PRAGMA foreign_keys = ON");
  seed(sqlite);
  sqlite.close();
}
