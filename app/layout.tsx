import type { Metadata, Viewport } from "next";
import { Caveat, DM_Sans, Permanent_Marker } from "next/font/google";
import "./globals.css";

// Body text: clean and easy to read.
const dmSans = DM_Sans({ variable: "--font-dm", subsets: ["latin"] });
// Big titles only: a bold marker pen.
const marker = Permanent_Marker({ variable: "--font-marker-loaded", subsets: ["latin"], weight: "400" });
// Small hand-written notes.
const caveat = Caveat({ variable: "--font-caveat", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sema AI — Your AI helper. One call away.",
  description:
    "Call Sema in Kiswahili, English or Sheng. Get answers by voice, steps by SMS, and rumour checks — no smartphone needed.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#24130c",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="sw" className={`${dmSans.variable} ${marker.variable} ${caveat.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
