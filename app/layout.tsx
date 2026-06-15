import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "写真展参加者一覧 | YOLO写真映像展「lumina」",
  description:
    "YOLO写真映像展「lumina」公式。会場で出展モデルのプロフィールを見て、その場で撮影・対話の予約ができるマッチングシステム。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <header className="site-header">
          <div className="container site-header__inner">
            <Link href="/" className="brand">
              <span className="brand__mark">YOLO写真映像展</span>
              <span className="brand__event">lumina</span>
            </Link>
            <nav className="header-nav">
              <Link href="/">参加者一覧</Link>
              <Link href="/m/login">モデルログイン</Link>
              <Link href="/admin/login">運営</Link>
            </nav>
          </div>
        </header>

        <main>{children}</main>

        <footer className="site-footer">
          <div className="container">
            YOLO写真映像展「lumina」 / PHOTO EXHIBITION GUESTS
            <br />
            ※ 掲載モデルの所属事務所は各プロフィールに明記しています。
          </div>
        </footer>
      </body>
    </html>
  );
}
