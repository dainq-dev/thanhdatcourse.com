import type { SectionType as SharedSectionType } from "@workspace/types";
import {
  ENTITY_SECTION_MAP as SHARED_ENTITY_MAP,
  SECTION_CATALOG_GROUPS as SHARED_GROUPS,
  SECTION_LABELS as SHARED_LABELS,
  MAX_SECTIONS as SHARED_MAX,
  SINGLETON_SECTION_TYPES as SHARED_SINGLETONS,
  getDefaultConfig as sharedGetDefaultConfig,
} from "@workspace/types";

export type SectionType = SharedSectionType;

export type EntityType = "course" | "product" | "presets_page";

export interface Section {
  id: string;
  entity_type: EntityType;
  entity_id: string;
  section_type: SectionType;
  title: string | null;
  config: Record<string, unknown>;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
  isNew?: boolean;
}

export interface FieldProps<T> {
  config: T;
  onChange: (config: T) => void;
}

export const SINGLETON_SECTION_TYPES: SectionType[] = SHARED_SINGLETONS;

export const ENTITY_SECTION_MAP: Record<EntityType, SectionType[]> = {
  course: SHARED_ENTITY_MAP.course ?? [],
  product: SHARED_ENTITY_MAP.product ?? [],
  presets_page: SHARED_ENTITY_MAP.presets_page ?? [],
};

export const SECTION_LABELS: Record<string, string> = SHARED_LABELS;

export interface CatalogGroup {
  label: string;
  types: SectionType[];
}

export const SECTION_CATALOG_GROUPS: CatalogGroup[] = SHARED_GROUPS;

export const MAX_SECTIONS = SHARED_MAX;

export function getDefaultConfig(type: SectionType): Record<string, unknown> {
  return sharedGetDefaultConfig(type);
}
