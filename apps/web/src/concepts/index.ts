import type { ComponentType } from "react";
import * as bento from "./bento";
import * as cinematic from "./cinematic";
import * as editorial from "./editorial";
import * as gallery from "./gallery";
import * as minimal from "./minimal";
import { DEFAULT_CONCEPT, type ConceptId } from "./meta";
import type {
  BlogDetailProps,
  BlogProps,
  ContactProps,
  CourseListProps,
  HomepageProps,
  PortfolioDetailProps,
  PortfolioListProps,
  ProductsProps,
} from "./types";

export { CONCEPT_IDS, CONCEPT_META, DEFAULT_CONCEPT } from "./meta";
export type { ConceptId, ConceptMeta } from "./meta";
export type {
  BlogDetailProps,
  BlogPostItem,
  BlogPostListItem,
  BlogProps,
  ContactProps,
  CourseItem,
  CourseListProps,
  CtaItem,
  FaqItem,
  HomepageProps,
  PortfolioDetailProps,
  PortfolioItem,
  PortfolioListProps,
  ProductItem,
  ProductsProps,
} from "./types";

export interface ConceptModule {
  Homepage: ComponentType<HomepageProps>;
  CourseList: ComponentType<CourseListProps>;
  PortfolioList: ComponentType<PortfolioListProps>;
  PortfolioDetail: ComponentType<PortfolioDetailProps>;
  Products: ComponentType<ProductsProps>;
  Contact: ComponentType<ContactProps>;
  Blog: ComponentType<BlogProps>;
  BlogDetail: ComponentType<BlogDetailProps>;
}

const REGISTRY: Partial<Record<ConceptId, ConceptModule>> = {
  cinematic,
  minimal,
  bento,
  editorial,
  gallery,
};

export function isImplemented(id: ConceptId): boolean {
  return Boolean(REGISTRY[id]);
}

export function getConcept(id: string | undefined): {
  id: ConceptId;
  module: ConceptModule;
} {
  const requested = id as ConceptId;
  const resolved =
    requested && REGISTRY[requested] ? requested : DEFAULT_CONCEPT;
  return { id: resolved, module: REGISTRY[resolved] ?? cinematic };
}
