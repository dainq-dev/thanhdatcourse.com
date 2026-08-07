import {
  integer,
  primaryKey,
  real,
  sqliteTable,
  text,
} from "drizzle-orm/sqlite-core";

export const siteSettings = sqliteTable("site_settings", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
  description: text("description"),
  updatedAt: text("updated_at").$defaultFn(() => new Date().toISOString()),
});

export const users = sqliteTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  name: text("name").notNull(),
  avatarUrl: text("avatar_url"),
  role: text("role").notNull().default("USER"),
  googleId: text("google_id"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});

export const courses = sqliteTable("courses", {
  id: text("id") .primaryKey() .$defaultFn(() => crypto.randomUUID()),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  description: text("description").notNull(),
  contentBlocks: text("content_blocks"),
  thumbnailUrl: text("thumbnail_url"),
  basePrice: integer("base_price").notNull(),
  originalPrice: integer("original_price"),
  trailerVideoUrl: text("trailer_video_url"),
  externalCheckoutUrl: text("external_checkout_url"),
  isPublished: integer("is_published").notNull().default(0),
  isFeaturedOnHome: integer("is_featured_on_home").notNull().default(0),
  isComboOnly: integer("is_combo_only").notNull().default(0),
  buttonText: text("button_text"),
  ratingCount: text("rating_count").default("0"),
  rating: real("rating").default(0),
  studentCount: integer("student_count").default(0),
  learningOutcomes: text("learning_outcomes"),
  level: text("level"),
  certificate: integer("certificate").default(0),
  featuredOrder: integer("featured_order").default(0),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").$defaultFn(() => new Date().toISOString()),
});

export const courseModules = sqliteTable("course_modules", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  courseId: text("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  learningOutcomes: text("learning_outcomes"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const courseLessons = sqliteTable("course_lessons", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  moduleId: text("module_id")
    .notNull()
    .references(() => courseModules.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").default("video"),
  videoUrl: text("video_url"),
  durationSeconds: integer("duration_seconds"),
  contentBlocks: text("content_blocks"),
  resources: text("resources"),
  isFreePreview: integer("is_free_preview").notNull().default(0),
  isPublished: integer("is_published").default(0),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const courseBonuses = sqliteTable("course_bonuses", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  courseId: text("course_id")
    .notNull()
    .references(() => courses.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  value: text("value").notNull(),
  icon: text("icon"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const instructors = sqliteTable("instructors", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  title: text("title"),
  bio: text("bio"),
  avatarUrl: text("avatar_url"),
  rating: real("rating").default(5.0),
  studentCount: integer("student_count").default(0),
  courseCount: integer("course_count").default(0),
  socialLinks: text("social_links"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});

export const courseInstructors = sqliteTable(
  "course_instructors",
  {
    courseId: text("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    instructorId: text("instructor_id")
      .notNull()
      .references(() => instructors.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.courseId, table.instructorId] }),
  }),
);

export const testimonials = sqliteTable("testimonials", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  courseId: text("course_id").references(() => courses.id, {
    onDelete: "set null",
  }),
  userName: text("user_name").notNull(),
  userRole: text("user_role"),
  userAvatarUrl: text("user_avatar_url"),
  rating: integer("rating").default(5),
  content: text("content").notNull(),
  title: text("title"),
  isFeatured: integer("is_featured").notNull().default(0),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});

export const postCategories = sqliteTable("post_categories", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
});

export const posts = sqliteTable("posts", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  categoryId: text("category_id").references(() => postCategories.id, {
    onDelete: "set null",
  }),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt").notNull(),
  contentBlocks: text("content_blocks"),
  thumbnailUrl: text("thumbnail_url"),
  seoDescription: text("seo_description"),
  author: text("author").default("minhtravel"),
  readTime: integer("read_time").default(5),
  isPublished: integer("is_published").notNull().default(0),
  publishedAt: text("published_at"),
  views: integer("views").default(0),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").$defaultFn(() => new Date().toISOString()),
});

export const portfolios = sqliteTable("portfolios", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  fullVideoUrl: text("full_video_url"),
  youtubeVideoId: text("youtube_video_id"),
  isFeaturedOnHome: integer("is_featured_on_home").notNull().default(0),
  featuredOrder: integer("featured_order").default(0),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});

export const digitalProducts = sqliteTable("digital_products", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  downloadFileUrl: text("download_file_url"),
  externalCheckoutUrl: text("external_checkout_url"),
  youtubePreviewId: text("youtube_preview_id"),
  tag: text("tag"),
  isFeaturedOnHome: integer("is_featured_on_home").notNull().default(0),
  isPublished: integer("is_published").notNull().default(0),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").$defaultFn(() => new Date().toISOString()),
});

export const faqs = sqliteTable("faqs", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  courseId: text("course_id").references(() => courses.id, {
    onDelete: "set null",
  }),
  question: text("question").notNull(),
  answer: text("answer").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const leads = sqliteTable("leads", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  courseId: text("course_id").references(() => courses.id, {
    onDelete: "set null",
  }),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email"),
  customerPhone: text("customer_phone").notNull(),
  message: text("message"),
  status: text("status").notNull().default("NEW"),
  adminNotes: text("admin_notes"),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});

export const promotions = sqliteTable("promotions", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  campaignName: text("campaign_name").notNull(),
  discountPercentage: integer("discount_percentage").notNull(),
  discountAmount: integer("discount_amount"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  isActive: integer("is_active").notNull().default(0),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
});

export const promotionCourses = sqliteTable(
  "promotion_courses",
  {
    promotionId: text("promotion_id")
      .notNull()
      .references(() => promotions.id, { onDelete: "cascade" }),
    courseId: text("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.promotionId, table.courseId] }),
  }),
);

export const productShowcases = sqliteTable("product_showcases", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  productId: text("product_id")
    .notNull()
    .references(() => digitalProducts.id, { onDelete: "cascade" }),
  beforeImageUrl: text("before_image_url"),
  afterImageUrl: text("after_image_url"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const sections = sqliteTable("sections", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id").notNull(),
  sectionType: text("section_type").notNull(),
  title: text("title"),
  config: text("config").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  isPublished: integer("is_published").notNull().default(1),
  createdAt: text("created_at").$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").$defaultFn(() => new Date().toISOString()),
});
