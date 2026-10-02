import type { Metadata } from "next";
import { Navbar } from "@/components/navigation/navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kino XII",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body className="min-h-[1080px] min-w-[1920px] bg-page font-sans text-white">
        <Navbar variant="guest" />
        {children}
      </body>
    </html>
  );
}
