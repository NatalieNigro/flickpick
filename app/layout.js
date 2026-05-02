// Import Link from Next.js so we can navigate between pages
import Link from "next/link";

// Metadata is optional but helps define the app title
export const metadata = {
  title: "FlickPick",
  description: "A playful movie picker app",
};

// RootLayout wraps EVERY page in your app
// This is where we define things like navigation that appear everywhere
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "Arial, sans-serif" }}>

        {/* -----------------------------
            TOP NAVIGATION BAR
           ----------------------------- */}
        <nav
          style={{
            padding: "16px 24px",
            display: "flex",
            gap: "18px",
            borderBottom: "1px solid #eee",
            background: "white",
          }}
        >
          {/* Link to Home page */}
          <Link href="/" style={{ textDecoration: "none", color: "#111827" }}>
            🎬 FlickPick
          </Link>

          {/* Link to Memory page */}
          <Link href="/memory" style={{ textDecoration: "none", color: "#6b21a8" }}>
            Memory
          </Link>
        </nav>

        {/* This is where each page's content gets rendered */}
        {children}

      </body>
    </html>
  );
}
