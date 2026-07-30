import type {
  Article,
  Bonus,
  Course,
  CourseModule,
  FAQItem,
  PortfolioItem,
  PresetProduct,
  Testimonial,
} from "@workspace/types";

export interface CourseDetailExtras {
  brands: string[];
  targetBadges: string[];
  modules: { num: string; title: string; desc: string }[];
  bonuses: { title: string; value: string }[];
  testimonials: { title: string; quote: string }[];
}

const COURSE_EXTRAS: CourseDetailExtras = {
  brands: ["Sony", "Canon", "Fujifilm", "DJI", "Samsung", "XiaoMi", "Oppo"],
  targetBadges: [
    "KHÔNG CẦN CÓ KINH NGHIỆM",
    "KHÔNG CẦN CÓ NĂNG KHIẾU",
    "PHÙ HỢP BẤT CỨ ĐỘ TUỔI NÀO",
  ],
  modules: [
    {
      num: "#1",
      title: "Chiến lược xây kênh tiktok triệu view",
      desc: "Xây dựng nền tảng vững chắc để bắt đầu hành trình sáng tạo nội dung",
    },
    {
      num: "#5",
      title: "Lựa chọn thiết bị phù hợp",
      desc: "Cách chọn điện thoại và phụ kiện tối ưu cho việc quay video",
    },
    {
      num: "#8",
      title: "Làm chủ điện thoại và phụ kiện",
      desc: "Thành thạo các cài đặt và kỹ thuật quay với thiết bị của bạn",
    },
    {
      num: "#11",
      title: "Setup góc Vlog, Livestream",
      desc: "Tạo không gian quay chuyên nghiệp ngay tại nhà",
    },
    {
      num: "#12",
      title: "Quy trình edit, hiệu ứng chuyển cảnh",
      desc: "Kỹ thuật dựng video mượt mà, thu hút người xem",
    },
    {
      num: "#15",
      title: "Cách viết kịch bản - Bài học đắt giá nhất",
      desc: "Nghệ thuật storytelling giúp video của bạn khác biệt",
    },
    {
      num: "#18",
      title: "Sự đơn giản của nội dung",
      desc: "Bí quyết tạo nội dung hiệu quả mà không cần phức tạp hóa",
    },
    {
      num: "#21",
      title: "Định hướng kiếm tiền từ tiktok",
      desc: "Chiến lược biến view thành doanh thu thực tế",
    },
  ],
  bonuses: [
    {
      title: "Khoá học 30 ngày quay dựng tiktok triệu view",
      value: "3.868.000đ",
    },
    {
      title: "Bộ sound effect độc quyền giúp video cuốn hút hơn",
      value: "3.200.000đ",
    },
    {
      title: "Tham gia cộng đồng học viên Minh Travel trên Zalo, Facebook",
      value: "5.000.000đ",
    },
    {
      title: "Giao lưu với cộng đồng nhà sáng tạo nội dung",
      value: "X.000.000đ",
    },
    { title: "Cam kết hoàn tiền 100% trong vòng 7 ngày", value: "Đảm bảo" },
  ],
  testimonials: [
    {
      title: "CHỦ SHOP THỜI TRANG HỌC QUAY FASHION",
      quote:
        "Khóa học đã giúp shop tôi tăng doanh số gấp 3 lần chỉ sau 2 tháng áp dụng kỹ thuật quay video chuyên nghiệp.",
    },
    {
      title: "PHÁT TRIỂN SỰ NGHIỆP CHO CREATOR",
      quote:
        "Từ một người không biết gì về quay dựng, tôi đã tự tin nhận các dự án freelance với thu nhập ổn định mỗi tháng.",
    },
    {
      title: "Nam Phạm – HÀNH TRÌNH TRỞ THÀNH FREELANCER TỪ CON SỐ 0",
      quote:
        "Kiến thức thực chiến, dễ hiểu và áp dụng ngay. Đây là khoản đầu tư xứng đáng nhất cho sự nghiệp của tôi.",
    },
    {
      title: "Hoàng Mạnh Cường CEO Học Viện Topmax",
      quote:
        "Phương pháp giảng dạy của Minh Travel rất khoa học, giúp học viên nắm bắt nhanh và thực hành hiệu quả.",
    },
  ],
};

export function getCourseDetailExtras(_slug: string): CourseDetailExtras {
  return COURSE_EXTRAS;
}

const emptyModules: CourseModule[] = [];
const emptyBonuses: Bonus[] = [];

export const mockCourses: Course[] = [
  {
    id: "c1",
    slug: "30-ngay-sang-tao-video-trieu-view",
    title: "30 Ngày Sáng Tạo Video TikTok Triệu View (Điện thoại)",
    description:
      "Khóa học đơn giản và đầy đủ giúp bạn làm chủ kỹ năng quay dựng video Tiktok bằng điện thoại và bắt đầu những video triệu view của mình trên nền tảng Tiktok.",
    price: 996000,
    ratingCount: "99+",
    thumbnail:
      "https://minhtravel.vn/wp-content/uploads/2025/06/Quay-dung-Tiktok-bang-dien-thoai-Online-copy-scaled.webp",
    modules: emptyModules,
    bonuses: emptyBonuses,
    isFeatured: true,
    externalCheckoutUrl:
      "https://go.minhtravel.vn/checkouts/30-ngay-sang-tao-video-tiktok-trieu-view/",
  },
  {
    id: "c2",
    slug: "khoa-hoc-chinh-mau",
    title: "Làm Chủ Tư Duy Chỉnh Màu Trong 2H (Online)",
    description:
      "Khóa học chia sẻ về làm màu, tư duy về ánh sáng, và phối màu. Đây là nền tảng quan trọng mà thiếu nó, không kỹ năng nào có thể giúp video chúng ta đẹp hơn được.",
    price: 1599000,
    ratingCount: "10+",
    thumbnail:
      "https://minhtravel.vn/wp-content/uploads/2025/06/tu-duy-chinh-mau-copy-scaled.webp",
    modules: emptyModules,
    bonuses: emptyBonuses,
    externalCheckoutUrl:
      "https://go.minhtravel.vn/checkouts/lam-chu-tu-duy-chinh-mau-video-trong-2h-cung-minh-travel/",
  },
  {
    id: "c3",
    slug: "lam-chu-may-anh-quay-chuyen-nghiep",
    title: "15 Ngày Quay Video Máy Ảnh Chuyên Nghiệp",
    description:
      "Khóa học này giúp bạn chủ kĩ năng quay phim, tư duy nghệ thuật. Dù bạn là người mới hay đã có máy ảnh nhưng chưa biết quay đẹp, giúp bạn biến đam mê thành kỹ năng thực chiến.",
    price: 2996000,
    ratingCount: "99+",
    thumbnail:
      "https://minhtravel.vn/wp-content/uploads/2025/06/Quay-video-bang-may-anh-chuyen-nghiep-copy-scaled.webp",
    modules: emptyModules,
    bonuses: emptyBonuses,
    externalCheckoutUrl:
      "https://go.minhtravel.vn/checkouts/lam-chu-may-anh-quay-video-chuyen-nghiep/",
  },
  {
    id: "c4",
    slug: "setup-goc-vlog-va-livestream-chuyen-nghiep-bang-may-anh",
    title: "Setup Góc Vlog Và Livestream Chuyên Nghiệp Bằng Máy Ảnh",
    description:
      "Khóa học giúp bạn xây dựng một không gian quay hiện đại, đẹp mắt và chuẩn ánh sáng studio ngay tại nhà.",
    price: 1868000,
    ratingCount: "10+",
    thumbnail:
      "https://minhtravel.vn/wp-content/uploads/2025/06/vlog-1024x683.webp",
    modules: emptyModules,
    bonuses: emptyBonuses,
    externalCheckoutUrl:
      "https://go.minhtravel.vn/checkouts/setup-goc-vlog-va-livestream-chuyen-nghiep-bang-may-anh/",
  },
  {
    id: "c5",
    slug: "edit-video-chuyen-nghiep-voi-davinci-resolve",
    title: "Edit Video Chuyên Nghiệp Với Davinci Resolve",
    description:
      "Khóa học dành cho những ai muốn dựng video chuyên nghiệp với phần mềm miễn phí mạnh nhất hiện nay. Bạn sẽ được hướng dẫn từ cơ bản đến nâng cao.",
    price: 2996000,
    ratingCount: "99+",
    thumbnail:
      "https://minhtravel.vn/wp-content/uploads/2025/06/davinci-copy-scaled.webp",
    modules: emptyModules,
    bonuses: emptyBonuses,
    externalCheckoutUrl:
      "https://go.minhtravel.vn/checkouts/edit-video-chuyen-nghiep-voi-davinci-resolve/",
  },
  {
    id: "c6",
    slug: "combo-video-marketing-masterclass",
    title: "Video Marketing For Business",
    description:
      "Khoá học hướng dẫn làm video quảng cáo chuyển đổi cao trên các nền tảng Facebook, Tiktok, Youtube. Khoá học chỉ bán cùng combo.",
    price: 2868000,
    ratingCount: "99+",
    thumbnail:
      "https://minhtravel.vn/wp-content/uploads/2024/09/course-marketing.jpg",
    modules: emptyModules,
    bonuses: emptyBonuses,
    isComboOnly: true,
    buttonText: "Không Bán Rời",
  },
  {
    id: "c7",
    slug: "bat-dau-su-nghiep-voi-video-marketing-a-z",
    title: "[Combo] Video Marketing Masterclass",
    description:
      "Combo chứa tất cả khoá học online của Minh Travel với mức giá ưu đãi nhất!",
    price: 10000000,
    ratingCount: "99+",
    thumbnail:
      "https://minhtravel.vn/wp-content/uploads/2024/09/course-combo.jpg",
    modules: emptyModules,
    bonuses: emptyBonuses,
    externalCheckoutUrl:
      "https://go.minhtravel.vn/checkouts/combo-video-marketing-masterclass/",
  },
  {
    id: "c8",
    slug: "khoa-hoc-truc-tiep-11-cung-minh-travel",
    title: "Workshop Cho Doanh Nghiệp",
    description:
      "Chương trình đào tạo toàn diện giúp bạn làm chủ nghệ thuật quay dựng video, xây dựng thương hiệu cá nhân và phát triển công việc kinh doanh qua sức mạnh của video.",
    price: 2000,
    ratingCount: "99+",
    thumbnail:
      "https://minhtravel.vn/wp-content/uploads/2024/09/course-workshop.jpg",
    modules: emptyModules,
    bonuses: emptyBonuses,
    buttonText: "Tư Vấn Miễn Phí",
    externalCheckoutUrl: "https://www.m.me/minhtravel11/",
  },
];

export const mockArticles: Article[] = [
  {
    id: "a1",
    slug: "quay-video-bang-dien-thoai-chuyen-nghiep-de-thu-ve-trieu-view-hoan-toan-co-the",
    title:
      "Quay video bằng điện thoại chuyên nghiệp để thu về triệu view – hoàn toàn có thể!",
    excerpt:
      "Quay video bằng điện thoại chuyên nghiệp không chỉ giúp bạn tiết kiệm chi phí mà còn mang lại những thước phim chất lượng, dễ dàng đạt tương tác cao",
    content: "<p>Nội dung đang được cập nhật...</p>",
    thumbnail:
      "https://minhtravel.vn/wp-content/uploads/2025/11/lam-video-chuyen-nghiep3-1024x517.png",
    author: "minhtravel",
    publishedAt: "2025-11-25T08:00:00Z",
    readTime: 8,
  },
  {
    id: "a2",
    slug: "6-ky-thuat-nhiep-anh-khong-the-thieu-khi-chup-bang-smartphone",
    title: "6 kỹ thuật nhiếp ảnh không thể thiếu khi chụp bằng Smartphone",
    excerpt:
      "Camera trên các thiết bị Smartphone hiện nay được cải tiến vô cùng mạnh mẽ, giúp người dùng dễ dàng quay video bằng điện thoại mà vẫn có chất lượng",
    content: "<p>Nội dung đang được cập nhật...</p>",
    thumbnail:
      "https://minhtravel.vn/wp-content/uploads/2025/11/smartphone-photo.jpg",
    author: "minhtravel",
    publishedAt: "2025-11-20T08:00:00Z",
    readTime: 6,
  },
  {
    id: "a3",
    slug: "8-meo-huu-ich-giup-ban-quay-video-dep-chi-voi-dien-thoai",
    title: "8 mẹo hữu ích giúp bạn quay video đẹp chỉ với điện thoại",
    excerpt:
      "Một chiếc smartphone tốt có thể thay thế cho nhiều thiết bị khác tiện lợi và nhỏ gọn hơn, trong đó có chiếc máy ảnh, máy quay",
    content: "<p>Nội dung đang được cập nhật...</p>",
    thumbnail:
      "https://minhtravel.vn/wp-content/uploads/2025/11/phone-video-tips.jpg",
    author: "minhtravel",
    publishedAt: "2025-11-15T08:00:00Z",
    readTime: 7,
  },
  {
    id: "a4",
    slug: "tu-hoc-quay-dung-video-tai-nha-bat-dau-tu-dau-de-khong-bi-nan",
    title: "Tự học quay dựng video tại nhà: Bắt đầu từ đâu để không bị nản?",
    excerpt:
      "Trong thời đại sáng tạo nội dung bùng nổ, quay dựng video không còn là kỹ năng chỉ dành cho dân chuyên nghiệp. Giờ đây, bất kỳ ai",
    content: "<p>Nội dung đang được cập nhật...</p>",
    thumbnail:
      "https://minhtravel.vn/wp-content/uploads/2025/11/self-learn-video.jpg",
    author: "minhtravel",
    publishedAt: "2025-11-10T08:00:00Z",
    readTime: 10,
  },
  {
    id: "a5",
    slug: "quy-trinh-dung-video-voi-9-buoc-co-ban-cho-nguoi-moi-bat-dau",
    title: "Quy trình dựng video với 9 bước cơ bản cho người mới bắt đầu",
    excerpt:
      "Trong thời đại số, quy trình dựng video trở thành kỹ năng thiết yếu không chỉ cho những người làm phim chuyên nghiệp mà còn cho content creator, Youtuber, Tiktoker",
    content: "<p>Nội dung đang được cập nhật...</p>",
    thumbnail:
      "https://minhtravel.vn/wp-content/uploads/2025/11/video-editing-steps.jpg",
    author: "minhtravel",
    publishedAt: "2025-11-05T08:00:00Z",
    readTime: 12,
  },
  {
    id: "a6",
    slug: "cac-cu-may-trong-quay-phim-co-ban-va-duoc-dung-pho-bien",
    title: "Các cú máy trong quay phim cơ bản và được dùng phổ biến",
    excerpt:
      "Trong phim ảnh và video quảng cáo theo lối kể chuyện (storytelling), camera không chỉ đơn thuần là một công cụ ghi hình. Nó là cây bút vẽ nên cảm",
    content: "<p>Nội dung đang được cập nhật...</p>",
    thumbnail:
      "https://minhtravel.vn/wp-content/uploads/2025/11/camera-shots.jpg",
    author: "minhtravel",
    publishedAt: "2025-11-01T08:00:00Z",
    readTime: 9,
  },
];

export const mockPortfolioItems: PortfolioItem[] = [
  {
    id: "p1",
    title: "LIFE OF TIBET | Cinematic Travel Film",
    description: "32 ngày, lái xe 12.000km vòng quanh Trung Quốc.",
    videoUrl: "#",
    thumbnail:
      "https://minhtravel.vn/wp-content/uploads/2024/09/portfolio-tibet.jpg",
    category: "Travel",
    youtubeVideoId: "",
  },
  {
    id: "p2",
    title: "LIFE OF CÔ TÔ | Minh Travel x VTV",
    description:
      "May mắn khi được nhà đài liên hệ và làm đạo diễn cho 1 bộ phim du lịch chiếu 6 ngày tết trên VTV.",
    videoUrl: "#",
    thumbnail:
      "https://minhtravel.vn/wp-content/uploads/2024/09/portfolio-coto.jpg",
    category: "Travel",
    youtubeVideoId: "",
  },
  {
    id: "p3",
    title: "Life of Cat Ba | Minh Travel x Sony",
    description:
      "Video ghi lại cuộc sống chân thực ở cát bà. Đồng hành cùng chiếc máy ảnh Sony ZV-E1.",
    videoUrl: "#",
    thumbnail:
      "https://minhtravel.vn/wp-content/uploads/2024/09/portfolio-catba.jpg",
    category: "Travel",
    youtubeVideoId: "",
  },
  {
    id: "p4",
    title: "Ước mơ bị bỏ quên | Minh Travel x Honda",
    description:
      "Dự án kể về ước mơ của mình từ làm công việc văn phòng chuyển qua đam mê quay phim.",
    videoUrl: "#",
    thumbnail:
      "https://minhtravel.vn/wp-content/uploads/2024/09/portfolio-honda.jpg",
    category: "Commercial",
    youtubeVideoId: "",
  },
  {
    id: "p5",
    title: "VTV x Minh Travel | Hình Ảnh Cuộc Sống",
    description:
      "Phỏng vấn hành trình quay video tặng các cô chú bán đồ ăn đường phố tại Việt Nam của mình được chiếu trên sóng VTV1 và VTV3.",
    videoUrl: "#",
    thumbnail:
      "https://minhtravel.vn/wp-content/uploads/2024/09/portfolio-vtv.jpg",
    category: "TV",
    youtubeVideoId: "",
  },
  {
    id: "p6",
    title: "Cách quay video ĐẸP như Lý Tử Thất",
    description:
      "Lý Tử Thất là một tượng đài về video ẩm thực trên toàn thế giới. Video này sẽ chia sẻ chi tiết cách để bạn có thể quay được video đẹp như vậy.",
    videoUrl: "#",
    thumbnail:
      "https://minhtravel.vn/wp-content/uploads/2024/09/portfolio-lizhi.jpg",
    category: "Tutorial",
    youtubeVideoId: "",
  },
  {
    id: "p7",
    title: "Mình đã kiếm 100 Triệu/ Tháng như thế nào?",
    description:
      "Video chia sẻ chi tiết hành trình khởi nghiệp nghề làm video của mình từ con số 0 cho tới nay.",
    videoUrl: "#",
    thumbnail:
      "https://minhtravel.vn/wp-content/uploads/2024/09/portfolio-income.jpg",
    category: "Tutorial",
    youtubeVideoId: "",
  },
];

export const mockPresets: PresetProduct[] = [
  {
    id: "pr1",
    name: "Bộ 7 LUT Wedding",
    description:
      "Bộ LUT màu cưới với 2 tông màu chủ đạo là trong sáng và vintage (7 LUT) giúp cho sản phẩm của bạn trở nên bắt mắt hơn!",
    price: 199000,
    thumbnail:
      "https://minhtravel.vn/wp-content/uploads/2024/09/preset-wedding.jpg",
    tag: "LUT",
    externalCheckoutUrl: "https://go.minhtravel.vn/?add-to-cart=776",
  },
  {
    id: "pr2",
    name: "Bộ 3 LUT Travel Cinematic",
    description:
      "Bộ LUT màu travel, street mà mình hay sử dụng để tạo tông màu orange and teal, deep black trong các video của mình.",
    price: 149000,
    thumbnail:
      "https://minhtravel.vn/wp-content/uploads/2024/09/preset-travel.jpg",
    tag: "LUT",
    externalCheckoutUrl: "https://go.minhtravel.vn/?add-to-cart=788",
  },
  {
    id: "pr3",
    name: "Preset ảnh Minh Travel",
    description:
      "Bộ 10 Preset ảnh của Minh Travel được mình sử dụng chỉnh sửa tất cả những bộ ảnh profile. Tặng kèm video hướng dẫn chi tiết sử dụng preset để chỉnh ảnh.",
    price: 249000,
    thumbnail:
      "https://minhtravel.vn/wp-content/uploads/2024/09/preset-photo.jpg",
    tag: "Preset",
    externalCheckoutUrl: "https://go.minhtravel.vn/?add-to-cart=930",
  },
];

export const mockFAQs: FAQItem[] = [
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
    question: "Tôi có thể tải xuống các bài học để sử dụng ngoại tuyến không?",
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

export const mockTestimonials: Testimonial[] = [
  {
    id: "t1",
    name: "CHỦ SHOP THỜI TRANG",
    role: "Học viên TikTok",
    quote:
      "Học quay fashion chuyên nghiệp cùng Minh Travel đã giúp shop tôi tăng doanh số đáng kể.",
    avatar: "/images/avatar-1.jpg",
  },
  {
    id: "t2",
    name: "Nam Phạm",
    role: "Freelancer",
    quote: "Hành trình trở thành freelancer từ con số 0 cùng Minh Travel.",
    avatar: "/images/avatar-2.jpg",
  },
  {
    id: "t3",
    name: "Hoàng Mạnh Cường",
    role: "CEO Học Viện Topmax",
    quote:
      "Khóa học thay đổi hoàn toàn cách tôi làm video. Từ một người không biết gì, giờ tôi đã nhận được các dự án quay dựng chuyên nghiệp.",
    avatar: "/images/avatar-3.jpg",
  },
  {
    id: "t4",
    name: "Phạm Thị D",
    role: "Content Creator",
    quote:
      "Khóa học chỉnh màu đỉnh cao! Màu phim của tôi đẹp hơn hẳn, khách hàng rất hài lòng.",
    avatar: "/images/avatar-4.jpg",
  },
];
