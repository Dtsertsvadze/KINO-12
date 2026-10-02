import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kino XII",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
