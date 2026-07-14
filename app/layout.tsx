import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "写真展参加者一覧 | YOLO写真映像展「lumina」",
  description:
    "YOLO写真映像展「lumina」公式。会場で会場参加モデルのプロフィールを見て、その場で撮影リクエストができるマッチングシステム。",
};

// スマホブラウザがデスクトップ幅(980px相当)で描画してしまい、
// モバイル用CSS(@media)が発動しなくなる問題を防ぐための必須設定。
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@500;600;700&family=Noto+Serif+JP:wght@500;600&family=Noto+Sans+JP:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <header className="site-header">
          <div className="container site-header__inner">
            <Link href="/" className="brand">
              <span className="brand__event">lumina</span>
              <span className="brand__mark">YOLO 写真映像展</span>
            </Link>
            <nav className="header-nav">
              <Link href="/">参加者一覧</Link>
              <Link href="/m/login">モデル</Link>
              <Link href="/admin/login">運営</Link>
            </nav>
          </div>
        </header>

        <main>{children}</main>

        <footer className="site-footer">
          <div className="container">
            <span className="footer__mark">lumina</span>
            <span>YOLO写真映像展 ／ PHOTO EXHIBITION GUESTS</span>
            <nav className="footer__links" aria-label="Creative YOLO 関連リンク">
              <a href="https://yolo-members.vercel.app/" target="_blank" rel="noopener">Creative YOLO</a>
              <a href="https://hasu-bot.github.io/yolo-film-festival/" target="_blank" rel="noopener">映画祭</a>
              <a href="https://last-call-movie.vercel.app/" target="_blank" rel="noopener">ラストコール</a>
              <a href="https://www.instagram.com/creative.yolo/" target="_blank" rel="noopener">Instagram</a>
            </nav>
            <span className="muted">※ 掲載モデルの所属事務所は各プロフィールに明記しています。</span>
            <span className="muted">
              ※ 掲載モデルへの撮影依頼は、各所属事務所および本人の許可範囲内で実施されます。本サイトは「YOLO写真映像展
              lumina」会場内での交流および撮影マッチングを目的としたサービスです。
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
