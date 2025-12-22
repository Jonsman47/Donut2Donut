import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "../components/Navbar";
import Providers from "./providers";
import Footer from "../components/Footer";

export const metadata: Metadata = {
  title: "Donut2Donut — Secure DonutSMP Marketplace",
  description:
    "Secure DonutSMP trading marketplace with escrow, proof-based delivery, and disputes.",
  icons: { icon: "/donut1.jpg" },
  metadataBase: new URL("http://localhost:3000"),
  openGraph: {
    title: "Donut2Donut — Secure DonutSMP Marketplace",
    description: "Escrow-first trading with proof + disputes. Built to stop scams.",
    images: ["/donut3.png"],
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#f7f9fc",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <div className="app-shell">
            <a className="skip-link" href="#content">
              Skip to content
            </a>
            <Navbar />
            <main id="content" className="app-content">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
