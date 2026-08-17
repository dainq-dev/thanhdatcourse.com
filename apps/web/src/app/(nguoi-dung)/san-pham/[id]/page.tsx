import type { Metadata } from "next";
import Link from "next/link";
import { api } from "@/lib/api";
import { getSiteSettings } from "@/lib/settings";
import { getConcept } from "@/concepts";
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

  const { module } = getConcept(settings.site_concept);
  const PortfolioDetailView = module.PortfolioDetail;

  return <PortfolioDetailView settings={settings} item={item} />;
}
