import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "../components/Navbar";
import Providers from "./providers";

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
  themeColor: "#0b1220",
  colorScheme: "dark",
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
            {/* base backdrops (keep your existing assets) */}
            <div
              className="app-backdrop"
              aria-hidden="true"
              style={{
                backgroundImage: "url(/donut3.png)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                filter: "blur(20px) saturate(1.08) contrast(1.06)",
                opacity: 0.18,
                transform: "scale(1.12)",
                pointerEvents: "none",
              }}
            />
            <div
              className="app-crystal"
              aria-hidden="true"
              style={{
                backgroundImage: "url(/donut2.png)",
                backgroundRepeat: "no-repeat",
                backgroundPosition: "85% 10%",
                backgroundSize: "720px auto",
                opacity: 0.22,
                mixBlendMode: "screen",
                filter: "saturate(1.15) contrast(1.05)",
                pointerEvents: "none",
              }}
            />

            {/* stronger depth: corner glows + vignette */}
            <div
              aria-hidden="true"
              style={{
                position: "fixed",
                inset: 0,
                pointerEvents: "none",
                background: `
                  radial-gradient(900px 520px at 12% 12%, rgba(120,220,255,0.14), transparent 60%),
                  radial-gradient(900px 520px at 88% 18%, rgba(120,170,255,0.12), transparent 62%),
                  radial-gradient(900px 640px at 70% 92%, rgba(120,220,255,0.10), transparent 64%),
                  linear-gradient(180deg, rgba(7,11,20,0.10), rgba(7,11,20,0.62))
                `,
              }}
            />

            {/* subtle grain/noise */}
            <div className="app-noise" aria-hidden="true" style={{ pointerEvents: "none" }} />

            {/* extra vignette */}
            <div
              aria-hidden="true"
              style={{
                position: "fixed",
                inset: 0,
                pointerEvents: "none",
                background:
                  "radial-gradient(1200px 800px at 50% 30%, transparent 55%, rgba(0,0,0,0.55) 100%)",
                opacity: 0.55,
              }}
            />

            {/* skip link */}
            <a className="skip-link" href="#content">
              Skip to content
            </a>

            {/* navbar */}
            <Navbar />

            {/* page */}
            <main id="content" className="app-content">
              {children}
            </main>

            {/* footer */}
            <footer className="footer">
              <div className="footer-inner">
                <span>© {new Date().getFullYear()} Donut2Donut</span>
                <span>Escrow • Proof • Disputes</span>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
