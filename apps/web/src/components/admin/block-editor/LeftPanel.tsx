"use client";

import { useMemo, useState, type ReactNode } from "react";
import type { Block } from "@workspace/types";
import {
  Heading, Pilcrow, Quote, List, CodeXml, AlertTriangle,
  Image, Video, LayoutGrid, Images, Columns2,
  Minus, ArrowUpDown, Columns3, FolderKanban,
  ChevronsDownUp, ChevronDown, Clock, Table,
  ArrowRight, DollarSign, Star,
} from "lucide-react";
import styles from "./workspace.module.scss";

export const BLOCK_LABELS: Record<string, string> = {
  heading: "Tiêu đề", paragraph: "Đoạn văn", quote: "Trích dẫn", list: "Danh sách",
  code: "Code", callout: "Callout", image: "Ảnh", video: "Video",
  gallery: "Gallery", carousel: "Carousel", beforeAfter: "Trước/Sau",
  divider: "Phân cách", spacer: "Khoảng trống", columns: "Cột", tabs: "Tabs",
  accordion: "Accordion", collapse: "Thu gọn", timeline: "Timeline",
  table: "Bảng", cta: "CTA", pricingTable: "Bảng giá", testimonial: "Đánh giá",
};

const BLOCK_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  heading:       Heading,
  paragraph:     Pilcrow,
  quote:         Quote,
  list:          List,
  code:          CodeXml,
  callout:       AlertTriangle,
  image:         Image,
  video:         Video,
  gallery:       LayoutGrid,
  carousel:      Images,
  beforeAfter:   Columns2,
  divider:       Minus,
  spacer:        ArrowUpDown,
  columns:       Columns3,
  tabs:          FolderKanban,
  accordion:     ChevronsDownUp,
  collapse:      ChevronDown,
  timeline:      Clock,
  table:         Table,
  cta:           ArrowRight,
  pricingTable:  DollarSign,
  testimonial:   Star,
};

const CATEGORIES = [
  { name: "Văn bản", types: ["heading", "paragraph", "quote", "list", "code", "callout"] },
  { name: "Media", types: ["image", "video", "gallery", "carousel", "beforeAfter"] },
  { name: "Bố cục", types: ["divider", "spacer", "columns", "tabs"] },
  { name: "Tương tác", types: ["accordion", "collapse", "timeline", "table"] },
  { name: "Chuyển đổi", types: ["cta", "pricingTable", "testimonial"] },
];

interface Props {
  activeTab: "info" | "components";
  onTabChange: (tab: "info" | "components") => void;
  infoPanel: ReactNode;
  onDrop: (type: Block["type"]) => void;
}

export function LeftPanel({ activeTab, onTabChange, infoPanel, onDrop }: Props) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return CATEGORIES;
    const q = search.toLowerCase();
    return CATEGORIES.map((cat) => ({
      ...cat,
      types: cat.types.filter((t) => BLOCK_LABELS[t].toLowerCase().includes(q)),
    })).filter((cat) => cat.types.length > 0);
  }, [search]);

  return (
    <>
      <div className={styles.panelTabs}>
        <button type="button" className={`${styles.panelTab} ${activeTab === "info" ? styles.panelTabActive : ""}`} onClick={() => onTabChange("info")}>Thông tin</button>
        <button type="button" className={`${styles.panelTab} ${activeTab === "components" ? styles.panelTabActive : ""}`} onClick={() => onTabChange("components")}>Components</button>
      </div>

      {activeTab === "info" ? (
        <div className={styles.panelBody}>{infoPanel}</div>
      ) : (
        <>
          <div className={styles.panelHeader}>
            <input type="text" className={styles.searchInput} placeholder="Tìm block..."
              value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className={styles.panelBody}>
            {filtered.map((cat) => (
              <div key={cat.name} className={styles.categoryGroup}>
                <div className={styles.categoryTitle}>{cat.name}</div>
                {cat.types.map((type) => {
                  const IconComp = BLOCK_ICONS[type];
                  return (
                    <button key={type} type="button" className={styles.blockTypeBtn}
                      onClick={() => onDrop(type as Block["type"])}>
                      <span className={styles.blockTypeIcon}>
                        {IconComp ? <IconComp size={20} /> : null}
                      </span>
                      <span className={styles.blockTypeLabel}>{BLOCK_LABELS[type]}</span>
                    </button>
                  );
                })}
              </div>
            ))}
            {filtered.length === 0 && <div className={styles.noResults}>Không tìm thấy block</div>}
          </div>
        </>
      )}
    </>
  );
}
