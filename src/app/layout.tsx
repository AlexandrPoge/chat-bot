import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Helpwise — AI support grounded in your docs",
  description: "Turn your product knowledge into clear, source-grounded answers.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
