import type { ReactNode } from "react";
import { BackgroundLayer } from "./BackgroundLayer";

type LayoutProps = {
  children: ReactNode;
};

export function Layout({ children }: LayoutProps) {
  return (
    <div className="app-shell">
      <BackgroundLayer />
      <div className="app-frame">
        {children}
      </div>
    </div>
  );
}
