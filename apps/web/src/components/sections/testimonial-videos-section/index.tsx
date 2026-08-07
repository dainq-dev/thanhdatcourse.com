import styles from "./index.module.scss";

interface TestimonialVideo {
  type?: string;
  youtube_url: string;
  media_url: string;
  title: string;
}

interface CarouselImage {
  image_url: string;
}

interface TestimonialVideosConfig {
  section_title?: string;
  videos?: TestimonialVideo[];
  carousel_title?: string;
  carousel_images?: CarouselImage[];
}

function getYouTubeEmbedUrl(url: string): string {
  const match = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/,
  );
  if (match) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }
  if (url.startsWith("http")) return url;
  return `https://www.youtube.com/embed/${url}`;
}

export default function TestimonialVideosSection({
  config,
}: {
  config: Record<string, unknown>;
}) {
  const cfg = config as unknown as TestimonialVideosConfig;
  const sectionTitle = cfg.section_title ?? "";
  const videos: TestimonialVideo[] = Array.isArray(cfg.videos)
    ? cfg.videos
    : [];
  const carouselTitle = cfg.carousel_title ?? "";
  const carouselImages: CarouselImage[] = Array.isArray(cfg.carousel_images)
    ? cfg.carousel_images
    : [];

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        {sectionTitle ? (
          <h2 className={styles.heading}>{sectionTitle}</h2>
        ) : null}

        {videos.length > 0 ? (
          <div className={styles.grid}>
            {videos.map((video, i) => (
              <div className={styles.videoCard} key={i}>
                <div className={styles.iframeWrapper}>
                  {(video.type ?? "youtube") === "media" && video.media_url ? (
                    <video
                      src={video.media_url}
                      title={video.title}
                      controls
                      className={styles.nativeVideo}
                    />
                  ) : (
                    <iframe
                      src={getYouTubeEmbedUrl(video.youtube_url)}
                      title={video.title}
                      allowFullScreen
                      loading="lazy"
                      className={styles.iframe}
                    />
                  )}
                </div>
                {video.title ? (
                  <h3 className={styles.videoTitle}>{video.title}</h3>
                ) : null}
              </div>
            ))}
          </div>
        ) : null}

        {carouselTitle ? (
          <h2 className={styles.carouselHeading}>{carouselTitle}</h2>
        ) : null}

        {carouselImages.length > 0 ? (
          <div className={styles.carousel}>
            {carouselImages.map((image, i) => (
              <img
                key={i}
                src={image.image_url}
                alt={`feedback ${i + 1}`}
                className={styles.carouselImage}
                loading="lazy"
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
