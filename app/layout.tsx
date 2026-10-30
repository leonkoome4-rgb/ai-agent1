import type { Metadata, Viewport } from "next";
import { Atkinson_Hyperlegible_Next } from "next/font/google";
import "./globals.css";

// Designed by the Braille Institute for readers with low vision.
const sans = Atkinson_Hyperlegible_Next({
  variable: "--font-sans-loaded",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sema AI — Your AI helper. One call away.",
  description:
    "Call Sema in Kiswahili, English or Sheng. Get answers by voice, steps by SMS, and rumour checks — no smartphone needed.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f7f6f2",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="sw" className={`${sans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
