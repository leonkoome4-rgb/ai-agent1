import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Sema AI — Your AI helper. One call away.",
  description:
    "Call Sema in Kiswahili, English or Sheng. Get answers by voice, steps by SMS, and rumour checks — no smartphone needed.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0b0a22",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="sw" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
