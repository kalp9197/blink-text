import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";

interface LayoutProps {
  children: ReactNode;
  hideNav?: boolean;
}

export default function Layout({ children, hideNav = false }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen">
      {!hideNav && <Header />}
      <main className="flex-grow container py-8">{children}</main>
      <Footer />
    </div>
  );
}
