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

export const CONCEPT_META: Record<ConceptId, ConceptMeta> = {
  cinematic: {
    id: "cinematic",
    label: "Điện ảnh",
    description: "Full-viewport video, typo lớn đè hình, parallax.",
    tone: "dark",
  },
  minimal: {
    id: "minimal",
    label: "Tối giản",
    description: "Monochrome, hairline border, kỷ luật lưới.",
    tone: "dark",
  },
  bento: {
    id: "bento",
    label: "Bento",
    description: "Lưới tile bo góc, mỗi loại nội dung 1 ô.",
    tone: "dark",
  },
  editorial: {
    id: "editorial",
    label: "Biên tập",
    description: "Serif display lớn, grid bất đối xứng, pull-quote.",
    tone: "dark",
  },
  gallery: {
    id: "gallery",
    label: "Thư viện",
    description: "Hình dẫn đầu, masonry, text overlay khi hover.",
    tone: "dark",
  },
};

export const CONCEPT_IDS = Object.keys(CONCEPT_META) as ConceptId[];

export const DEFAULT_CONCEPT: ConceptId = "cinematic";
