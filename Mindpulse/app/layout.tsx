import type { Metadata } from "next";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";

export const metadata: Metadata = {
  title: "MindPulse — Daily Mental Wellness Tracker",
  description:
    "A daily mental health check-in app aligned with UN SDG 3: Good Health and Well-being. Built by iTaqiZ · Pakistan.",
  keywords: ["mental health", "mood tracker", "wellness", "SDG 3", "mindfulness"],
  openGraph: {
    title: "MindPulse",
    description: "Daily Mental Wellness Tracker — iTaqiZ · SDG 3",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
