import { PresetsDefault } from "@/app/(nguoi-dung)/cong-cu/_templates/presets-default";
import type { ProductsProps } from "../types";

export function Products(props: ProductsProps) {
  return <PresetsDefault settings={props.settings} products={props.products} />;
}
