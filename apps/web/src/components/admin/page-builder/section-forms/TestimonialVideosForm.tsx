"use client";

import { useCallback } from "react";
import { MediaTrigger } from "@/components/admin/media-manager/media-trigger";
import s from "./section-form.module.scss";

interface Props {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}

interface Video {
  type: string;
  youtube_url: string;
  media_url: string;
  title: string;
}

interface CarouselImage {
  image_url: string;
}

export function TestimonialVideosForm({ config, onChange }: Props) {
  const videos = (config.videos as Video[]) ?? [];
  const carouselImages = (config.carousel_images as CarouselImage[]) ?? [];

  const update = useCallback(
    (key: string, value: unknown) => {
      onChange({ ...config, [key]: value });
    },
    [config, onChange],
  );

  const addVideo = () => {
    update("videos", [
      ...videos,
      { type: "youtube", youtube_url: "", media_url: "", title: "" },
    ]);
  };

  const removeVideo = (index: number) => {
    update(
      "videos",
      videos.filter((_, i) => i !== index),
    );
  };

  const updateVideo = (index: number, field: string, value: string) => {
    const next = videos.map((v, i) =>
      i === index ? { ...v, [field]: value } : v,
    );
    update("videos", next);
  };

  const addCarouselImage = () => {
    update("carousel_images", [...carouselImages, { image_url: "" }]);
  };

  const removeCarouselImage = (index: number) => {
    update(
      "carousel_images",
      carouselImages.filter((_, i) => i !== index),
    );
  };

  const updateCarouselImage = (index: number, url: string) => {
    const next = carouselImages.map((img, i) =>
      i === index ? { image_url: url } : img,
    );
    update("carousel_images", next);
  };

  return (
    <div className={s.form}>
      <div className={s.field}>
        <label className={s.label}>Section title</label>
        <input
          className={s.input}
          value={(config.section_title as string) ?? ""}
          onChange={(e) => update("section_title", e.target.value)}
          placeholder="VD: Học viên nói gì"
        />
      </div>

      <div className={s.arrayField}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <label className={s.label}>Videos</label>
          <button type="button" className={s.btnAccentSmall} onClick={addVideo}>
            Thêm
          </button>
        </div>
        {videos.map((video, i) => (
          <div key={i} className={s.arrayItem}>
            <div className={s.arrayItemContent}>
              <div className={s.field}>
                <label className={s.label}>Type</label>
                <select
                  className={s.select}
                  value={video.type ?? "youtube"}
                  onChange={(e) => updateVideo(i, "type", e.target.value)}
                >
                  <option value="youtube">YouTube</option>
                  <option value="media">Media (upload)</option>
                </select>
              </div>
              {(video.type ?? "youtube") === "youtube" ? (
                <div className={s.field}>
                  <label className={s.label}>YouTube URL</label>
                  <input
                    className={s.input}
                    value={video.youtube_url ?? ""}
                    onChange={(e) =>
                      updateVideo(i, "youtube_url", e.target.value)
                    }
                    placeholder="VD: https://youtube.com/watch?v=..."
                  />
                </div>
              ) : (
                <div className={s.field}>
                  <label className={s.label}>Video file</label>
                  <MediaTrigger
                    value={video.media_url ?? ""}
                    onSelect={(url) => updateVideo(i, "media_url", url)}
                    showPreview
                  />
                </div>
              )}
              <div className={s.field}>
                <label className={s.label}>Title</label>
                <input
                  className={s.input}
                  value={video.title ?? ""}
                  onChange={(e) => updateVideo(i, "title", e.target.value)}
                  placeholder="VD: Feedback từ anh A"
                />
              </div>
            </div>
            <button
              type="button"
              className={s.btnDangerSmall}
              onClick={() => removeVideo(i)}
            >
              Xóa
            </button>
          </div>
        ))}
        {videos.length === 0 && (
          <p
            style={{
              fontSize: "0.75rem",
              color: "var(--admin-text-disabled)",
              margin: "0.25rem 0",
            }}
          >
            Chưa có video nào
          </p>
        )}
      </div>

      <div className={s.field}>
        <label className={s.label}>Carousel title</label>
        <input
          className={s.input}
          value={(config.carousel_title as string) ?? ""}
          onChange={(e) => update("carousel_title", e.target.value)}
          placeholder="VD: Một số hình ảnh học viên"
        />
      </div>

      <div className={s.arrayField}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <label className={s.label}>Carousel images</label>
          <button
            type="button"
            className={s.btnAccentSmall}
            onClick={addCarouselImage}
          >
            Thêm
          </button>
        </div>
        {carouselImages.map((img, i) => (
          <div key={i} className={s.arrayItem}>
            <div className={s.arrayItemContent}>
              <MediaTrigger
                value={img.image_url}
                onSelect={(url) => updateCarouselImage(i, url)}
                showPreview
              />
            </div>
            <button
              type="button"
              className={s.btnDangerSmall}
              onClick={() => removeCarouselImage(i)}
            >
              Xóa
            </button>
          </div>
        ))}
        {carouselImages.length === 0 && (
          <p
            style={{
              fontSize: "0.75rem",
              color: "var(--admin-text-disabled)",
              margin: "0.25rem 0",
            }}
          >
            Chưa có ảnh nào
          </p>
        )}
      </div>
    </div>
  );
}
