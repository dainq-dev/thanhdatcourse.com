import styles from "./index.module.scss";

interface StudentStat {
  label: string;
  value: string;
}

interface Student {
  name: string;
  role?: string;
  avatar_url: string;
  stats?: StudentStat[];
  description: string;
}

interface CarouselImage {
  image_url: string;
}

interface FeaturedStudentsConfig {
  section_title?: string;
  students?: Student[];
  carousel_title?: string;
  carousel_images?: CarouselImage[];
}

export default function FeaturedStudentsSection({
  config,
}: {
  config: Record<string, unknown>;
}) {
  const cfg = config as unknown as FeaturedStudentsConfig;
  const sectionTitle = cfg.section_title ?? "";
  const students: Student[] = Array.isArray(cfg.students) ? cfg.students : [];
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

        {students.length > 0 ? (
          <div className={styles.grid}>
            {students.map((student, i) => (
              <div className={styles.card} key={i}>
                <div className={styles.avatarWrapper}>
                  <img
                    src={student.avatar_url}
                    alt={student.name}
                    className={styles.avatar}
                    loading="lazy"
                  />
                </div>
                <div className={styles.body}>
                  <h3 className={styles.name}>{student.name}</h3>
                  {student.role ? (
                    <p className={styles.role}>{student.role}</p>
                  ) : null}
                  {student.stats && student.stats.length > 0 ? (
                    <div className={styles.stats}>
                      {student.stats.map((stat, si) => (
                        <div className={styles.stat} key={si}>
                          <span className={styles.statValue}>{stat.value}</span>{" "}
                          <span className={styles.statLabel}>{stat.label}</span>
                        </div>
                      ))}
                    </div>
                  ) : null}
                  {student.description ? (
                    <p className={styles.description}>{student.description}</p>
                  ) : null}
                </div>
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
