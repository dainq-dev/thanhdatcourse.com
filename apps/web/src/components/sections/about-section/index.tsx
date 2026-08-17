import { MotionReveal } from "@/components/sections/motion-reveal";
import { getHomepageMotion } from "@/lib/motion";
import styles from "./index.module.scss";

interface Props {
  settings: Record<string, string>;
}

const DEFAULT_1 =
  "Minh Travel nổi bật với phong cách quay và biên tập video độc đáo của mình, anh đã truyền cảm hứng cho rất nhiều bạn trẻ theo công việc sáng tạo nội dung. Từ khi bắt đầu sự nghiệp vào năm 2017, tài năng chỉnh sửa video của Minh đã mang lại cho anh nhiều cơ hội lớn như hợp tác với các thương hiệu toàn cầu: Sony, Canon, Fujifilm, DJI, Samsung, XiaoMi, Oppo… và nhiều thương hiệu khác.";
const DEFAULT_2 =
  "Minh nổi tiếng với việc không ngừng vươn lên giới hạn sáng tạo của mình. Cho dù là một video du lịch, đánh giá thiết bị hoặc quảng cáo video, người xem luôn có thể mong đợi anh sẽ tạo ra nội dung độc đáo và khác biệt cho thương hiệu. Hợp tác với Minh có nghĩa là có cơ hội tiếp cận một trong những đám đông đam mê du lịch, sáng tạo trên internet hiện nay.";

export function AboutSection({ settings }: Props) {
  const visible =
    settings.home_about_section_visible !== "0" &&
    settings.home_about_section_visible !== "false";

  if (!visible) return null;

  const concept = getHomepageMotion(settings);
  const text1 = settings.home_about_text_1 || DEFAULT_1;
  const text2 = settings.home_about_text_2 || DEFAULT_2;

  return (
    <section className={styles.about}>
      <MotionReveal concept={concept}>
        <div className={styles.inner}>
          <p className={styles.text} data-motion-item>
            {text1}
          </p>
          <p className={styles.text} data-motion-item>
            {text2}
          </p>
        </div>
      </MotionReveal>
    </section>
  );
}
