"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavBar() {
  const pathname = usePathname();

  function navStyle(path) {
    const isActive = pathname === path;

    return {
      textDecoration: "none",
      fontWeight: "600",
      padding: "8px 14px",
      borderRadius: "999px",
      transition: "all 0.2s ease",
      color: isActive ? "white" : "#5b21b6",
      background: isActive ? "#5b21b6" : "#f5f0ff",
    };
  }

  return (
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
        <Link href="/" style={navStyle("/")}>
          🎬 FlickPick
        </Link>

        <Link href="/vault" style={navStyle("/vault")}>
          The Vault
        </Link>

        <Link href="/pick-list" style={navStyle("/pick-list")}>
          Pick List
        </Link>

        <Link href="/settings" style={navStyle("/settings")}>
          Settings
        </Link>
      </div>
    </nav>
  );
}
