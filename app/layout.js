import Link from "next/link";

export const metadata = {
  title: "FlickPick",
  description: "A playful movie picker app",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "Arial, sans-serif" }}>
        {/* Main app navigation */}
        <nav
          style={{
            background: "#ffffff",
            borderBottom: "1px solid #e9ddff",
            padding: "14px 24px",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <div
            style={{
              maxWidth: "1000px",
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              gap: "18px",
            }}
          >
            <Link
              href="/"
              style={{
                textDecoration: "none",
                color: "#111827",
                fontWeight: "700",
                fontSize: "18px",
              }}
            >
              🎬 FlickPick
            </Link>

            <Link
              href="/memory"
              style={{
                textDecoration: "none",
                color: "#5b21b6",
                fontWeight: "600",
                padding: "8px 12px",
                borderRadius: "999px",
                background: "#f5f0ff",
              }}
            >
              Memory
            </Link>
          </div>
        </nav>

        {children}
      </body>
    </html>
  );
}
