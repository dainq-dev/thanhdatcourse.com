import { SiteFooter, SiteHeader } from "@workspace/ui";
import type { ReactNode } from "react";

export default function NguoiDungLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}
