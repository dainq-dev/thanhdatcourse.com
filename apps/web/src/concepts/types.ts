export type ConceptId =
  | "cinematic"
  | "minimal"
  | "bento"
  | "editorial"
  | "gallery";

export interface ConceptMeta {
  id: ConceptId;
  label: string;
  description: string;
  tone: "dark" | "light";
}

export interface CourseItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  basePrice: number;
  originalPrice?: number;
  thumbnailUrl?: string;
  ratingCount?: string;
  externalCheckoutUrl?: string;
  isComboOnly?: number;
  buttonText?: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  thumbnailUrl?: string;
  fullVideoUrl?: string;
  youtubeVideoId?: string;
  isFeaturedOnHome?: number;
  featuredOrder?: number;
}

export interface ProductItem {
  id: string;
  title: string;
  description: string;
  price: number;
  thumbnailUrl?: string;
  downloadFileUrl?: string;
  externalCheckoutUrl?: string;
  youtubePreviewId?: string;
  tag?: string;
  isFeaturedOnHome?: number;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface CtaItem {
  text: string;
  href: string;
  target?: string;
  className?: string;
}

export interface BlogPostItem {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  contentBlocks?: string;
  thumbnailUrl?: string;
  publishedAt?: string;
  readTime?: number;
  author?: string;
  seoDescription?: string;
}

export interface BlogPostListItem {
  id: string;
  slug: string;
  title: string;
  thumbnailUrl?: string;
  readTime?: number;
}

export interface HomepageProps {
  settings: Record<string, string>;
  portfolios: PortfolioItem[];
  courses: CourseItem[];
  products: ProductItem[];
}

export interface CourseListProps {
  settings: Record<string, string>;
  courses: CourseItem[];
  faqs: FaqItem[];
}

export interface PortfolioListProps {
  settings: Record<string, string>;
  portfolios: PortfolioItem[];
  ctaItems: CtaItem[];
}

export interface PortfolioDetailProps {
  settings: Record<string, string>;
  item: PortfolioItem;
}

export interface ProductsProps {
  settings: Record<string, string>;
  products: ProductItem[];
}

export interface ContactProps {
  settings: Record<string, string>;
}

export interface BlogProps {
  posts: BlogPostItem[];
}

export interface BlogDetailProps {
  post: BlogPostItem;
  relatedArticles: BlogPostListItem[];
}
