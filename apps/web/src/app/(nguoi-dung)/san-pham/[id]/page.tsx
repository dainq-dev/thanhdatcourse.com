import type { Metadata } from "next";
import Link from "next/link";
import { api } from "@/lib/api";
import { getSiteSettings } from "@/lib/settings";
import styles from "./page.module.scss";

interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  category: string;
  thumbnailUrl?: string;
  fullVideoUrl?: string;
  youtubeVideoId?: string;
}

async function getPortfolio(id: string): Promise<PortfolioItem | null> {
  try {
    const res = await api.fetch(`/api/portfolios/${id}`, {
      next: { revalidate: 60 },
    });
    if (res.status === 404) return null;
    const json = await res.json();
    return json.data || json;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const item = await getPortfolio(id);
  if (!item) return { title: "Không tìm thấy" };
  return {
    title: item.title,
    description: item.description,
    openGraph: {
      title: item.title,
      description: item.description,
      type: "website",
      images: item.thumbnailUrl ? [item.thumbnailUrl] : [],
    },
  };
}

export default async function PortfolioDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [item, settings] = await Promise.all([
    getPortfolio(id),
    getSiteSettings(),
  ]);

  if (!item) {
    return (
      <div className={styles.notFound}>
        <h1 className={styles.notFoundTitle}>Không tìm thấy dự án</h1>
        <p className={styles.notFoundDesc}>
          Dự án bạn đang tìm không tồn tại hoặc đã bị xóa.
        </p>
        <Link href="/san-pham" className={styles.backLink}>
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  const pageTitle = settings.portfolio_page_title || "Films by Minh Travel";

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        {item.youtubeVideoId ? (
          <div className={styles.videoWrapper}>
            <iframe
              className={styles.videoFrame}
              src={`https://www.youtube.com/embed/${item.youtubeVideoId}`}
              title={item.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : item.thumbnailUrl ? (
          <img
            src={item.thumbnailUrl}
            alt={item.title}
            className={styles.heroImage}
          />
        ) : null}
        <div className={styles.heroContent}>
          <span className={styles.categoryBadge}>{item.category}</span>
          <h1 className={styles.heroTitle}>{item.title}</h1>
          {item.description && (
            <p className={styles.heroDesc}>{item.description}</p>
          )}
          <div className={styles.heroActions}>
            {item.youtubeVideoId && (
              <a
                href={`https://youtu.be/${item.youtubeVideoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.ctaYoutube}
              >
                Xem trên YouTube
              </a>
            )}
            {item.fullVideoUrl && (
              <a
                href={item.fullVideoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.ctaSecondary}
              >
                Xem video đầy đủ
              </a>
            )}
          </div>
          <Link href="/san-pham" className={styles.backLink}>
            Quay lại danh sách
          </Link>
        </div>
      </section>
    </div>
  );
}
