import { PortfolioDefault } from "@/app/(nguoi-dung)/san-pham/_templates/portfolio-default";
import type { PortfolioListProps, PortfolioItem } from "../types";

export function PortfolioList(props: PortfolioListProps) {
  const portfolios = props.portfolios as Array<
    PortfolioItem & { description: string }
  >;
  return (
    <PortfolioDefault
      settings={props.settings}
      portfolios={portfolios}
      ctaItems={props.ctaItems}
    />
  );
}
