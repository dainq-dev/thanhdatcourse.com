import { z } from 'zod';

export const CourseSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  description: z.string(),
  price: z.number(),
  originalPrice: z.number().optional(),
  rating: z.number().min(0).max(5).optional(),
  ratingCount: z.string().optional(),
  studentCount: z.number().optional(),
  thumbnail: z.string(),
  trailerYoutubeId: z.string().optional(),
  modules: z.array(z.lazy(() => CourseModuleSchema)),
  bonuses: z.array(z.lazy(() => BonusSchema)),
  testimonials: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
  externalCheckoutUrl: z.string().optional(),
  isComboOnly: z.boolean().optional(),
  buttonText: z.string().optional(),
});

export type Course = z.infer<typeof CourseSchema>;

export const CourseModuleSchema = z.object({
  id: z.string(),
  title: z.string(),
  subtitle: z.string().optional(),
  lessons: z.array(
    z.object({
      title: z.string(),
      duration: z.string().optional(),
    })
  ),
});

export type CourseModule = z.infer<typeof CourseModuleSchema>;

export const BonusSchema = z.object({
  name: z.string(),
  value: z.string(),
  icon: z.string().optional(),
});

export type Bonus = z.infer<typeof BonusSchema>;

export const ArticleSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  excerpt: z.string(),
  content: z.string(),
  thumbnail: z.string(),
  author: z.string(),
  publishedAt: z.string(),
  readTime: z.number(),
});

export type Article = z.infer<typeof ArticleSchema>;

export const PortfolioItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  videoUrl: z.string(),
  thumbnail: z.string(),
  category: z.string(),
  youtubeVideoId: z.string().optional(),
});

export type PortfolioItem = z.infer<typeof PortfolioItemSchema>;

export const PresetProductSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  thumbnail: z.string(),
  tag: z.string().optional(),
  externalCheckoutUrl: z.string().optional(),
  youtubePreviewId: z.string().optional(),
});

export type PresetProduct = z.infer<typeof PresetProductSchema>;

export const FAQItemSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

export type FAQItem = z.infer<typeof FAQItemSchema>;

export const TestimonialSchema = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string(),
  quote: z.string(),
  avatar: z.string(),
});

export type Testimonial = z.infer<typeof TestimonialSchema>;
