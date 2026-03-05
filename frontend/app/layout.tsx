import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bayanihan.AI - AI-Powered Legal Technology for the Philippines",
  description:
    "AI legal research, document drafting, notarial compliance tools, and citizen legal navigation for the Philippine legal ecosystem.",
  keywords: [
    "Philippine law",
    "legal research",
    "AI legal",
    "notarial",
    "Supreme Court decisions",
    "legal technology",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
