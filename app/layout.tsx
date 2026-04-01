import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Partnership Health Assessment | Tatyana Anisimova",
  description:
    "Take this 3-minute assessment to uncover what's really going on in your business partnership. Get your score across 5 critical dimensions.",
  openGraph: {
    title: "How Healthy Is Your Business Partnership?",
    description:
      "Take this 3-minute assessment used by co-founders and business partners to uncover what's really going on beneath the surface.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
