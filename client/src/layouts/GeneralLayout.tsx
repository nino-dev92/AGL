import Header from "../components/Header";
import Footer from "../components/Footer";
import type { ReactNode } from "react";

export default function GeneralLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <div className="grow">{children}</div>
      <Footer />
    </div>
  );
}
