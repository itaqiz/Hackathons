"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Header() {
  const path = usePathname();
  return (
    <header className="site-header">
      <div className="container">
        <div className="header-inner">
          <Link href="/" className="logo-link">
            <div className="logo-mark">TZ</div>
            <div className="logo-text">
              <span className="logo-name">MindPulse</span>
              <span className="logo-sub">iTaqiZ · SDG 3</span>
            </div>
          </Link>
          <nav>
            <Link href="/" aria-current={path === "/" ? "page" : undefined}>Check In</Link>
            <Link href="/history" aria-current={path === "/history" ? "page" : undefined}>History</Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
