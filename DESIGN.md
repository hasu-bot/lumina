# Last Call 公式サイト — デザイン設計書
> 更新: 2026-04-26 | 対象: hasu-bot/last-call-site

---

## 1. ブランドアイデンティティ

### コンセプトワード
**「瑞々しい喪失」**  
夏の終わりに残る、言えなかった言葉。軽やかさの中に微かな痛みがある。

### カラーパレット

| 変数名 | HEX | 用途 |
|--------|-----|------|
| `--sky` | `#87CEEB` | 夏空・メインアクセント |
| `--sky-deep` | `#4a9cc8` | ホバー・強調 |
| `--sunset` | `#FF8C42` | CTAボタン・ハイライト |
| `--sunset-soft` | `#FFD4B0` | 淡いアクセント |
| `--sand` | `#F5E6C8` | Cast背景・カードBG |
| `--navy` | `#1a2a4a` | テキスト・フッター |
| `--navy-mid` | `#2c4a7c` | セクションBG変化 |
| `--white` | `#FFFFFF` | ベースBG |
| `--cream` | `#FAFAF7` | セクションBG交互 |

### タイポグラフィ

| クラス | フォント | 用途 |
|--------|---------|------|
| `.serif` | Noto Serif JP 600/700 | セクション見出し・タイトル |
| `.klee` | Klee One 600 | キャッチコピー・ロゴ・詩的テキスト |
| body | Noto Sans JP 300/400 | 本文・UI |

### タイポスケール
```
9xl : clamp(4rem, 14vw, 10rem)  → ヒーロータイトル
3xl : clamp(1.8rem, 5vw, 3rem)  → セクション大見出し
xl  : clamp(1.1rem, 2.5vw, 1.5rem) → リード文
base: 0.95rem                    → 本文
sm  : 0.82rem                    → 日付・キャプション
xs  : 0.72rem                    → ラベル・タグ
```

---

## 2. レイアウト設計

### グリッドシステム
- コンテナ幅: max-width 1040px
- カラム: 12カラム（CSS Grid）
- ガター: 24px (pc) / 16px (sp)
- ブレークポイント: 768px

### セクション順序（縦スクロール）
```
[HERO]          全画面 / パラックス背景 / テキストアニメーション
[NAV]           固定ヘッダー / スクロールで白背景化
[TRAILER]       ★新設 / YouTube埋め込み or 動画プレビュー
[STORY]         2カラム（画像 + テキスト）/ 左右交互
[CAST]          3×2グリッド / モーダル
[STAFF]         センタリングテキストリスト
[GALLERY]       フルブリードCSSグリッドマソンリー
[NEWS]          3件リスト + 「一覧へ」
[FOOTER]        ウェーブ区切り + SNS + コピーライト
```

---

## 3. セクション詳細仕様

### HERO
- **背景**: 写真1枚 / object-fit:cover / Intersection Observerでパラックス（transform: translateY）
- **オーバーレイ**: `linear-gradient(to bottom, rgba(sky,0.2), rgba(navy,0.6))`
- **タイトルアニメ**: 文字を1文字ずつ `opacity 0→1` + `translateY 20px→0` を stagger 0.08s
- **キャッチコピー**: Klee One / 手書き風で下から出現
- **スクロール矢印**: 縦ラインアニメ（現行維持）

### TRAILER ★新設
- **目的**: 予告編がまだなくてもセクションを確保しておく
- **状態A（動画なし）**: ネイビー背景 + ぼかした写真 + 「TRAILER COMING SOON」テキスト
- **状態B（動画あり）**: YouTubeプレーヤーをモーダルで再生（クリックでオーバーレイ展開）
- **切替**: `data-trailer-id` 属性を `""` → `"YouTubeID"` にするだけで切替

### STORY
- **レイアウト**: 写真左 / テキスト右（PC） → 写真上 / テキスト下（SP）
- **写真**: aspect-ratio 4:5 / overflow hidden / hover:scale(1.03)
- **テキスト**: 縦書き感のある行間 / リード文はNoto Serif
- **装飾**: 左端にネイビーの細い縦ライン

### CAST
- **グリッド**: 3列 × 2行（PC）/ 1列（SP）
- **カード**: 写真 aspect 3:4 / 画像なし時はグラデーションプレースホルダー（番号表示）
- **ホバー**: `translateY(-8px)` + shadow強調
- **モーダル**: 写真左 / 役名・名前・コメント右 / ESC/外クリックで閉じる

### GALLERY
- **背景**: var(--navy) フルブリード
- **グリッド**: CSS Grid `auto-rows: 180px` / 4カラム(PC) / 2カラム(SP)
- **バリエーション**: `.--tall`(3行) / `.--wide`(2列) でリズム感
- **ホバー**: brightness 0.8→1.0 + scale(1.04) / オーバーレイ「＋」
- **ライトボックス**: 矢印 / タッチスワイプ / キーボード対応（現行維持）

### FOOTER
- **上部**: SVGウェーブ（navy背景への接続）
- **中央**: ロゴ・キャッチ・SNS・著作権
- **SNS**: Instagram・YouTube（アイコンSVG inline）

---

## 4. アニメーション設計

### フェードイン（共通）
```
初期: opacity:0 / translateY:32px
完了: opacity:1 / translateY:0
duration: 0.7s ease-out
trigger: Intersection Observer rootMargin "-80px"
stagger: 子要素ごとに animation-delay を += 0.1s
```

### ヒーロータイトル文字stagger
```
各文字を <span> で囲み
delay = index * 0.08s
from: opacity:0 / translateY:20px / blur:4px
to  : opacity:1 / translateY:0   / blur:0px
```

### パラックス（Hero背景）
```
scroll handler: hero__bg { transform: translateY(scrollY * 0.4) }
```

### ウェーブセパレーター
```
SVGパス / fill: 次のセクションのBG色
上下で交互に反転
```

---

## 5. レスポンシブ方針

| ブレーク | 変更内容 |
|---------|---------|
| `≤768px` | ナビ→ハンバーガー、STORY縦積み、CAST 1列 |
| `≤480px` | ヒーロータイトル縮小、ギャラリー2列 |

---

## 6. ファイル構成（完成形）

```
last-call-site/
├── index.html          # メインページ（本ファイル）
├── DESIGN.md           # 本設計書
├── css/
│   ├── style.css       # メインスタイル（全セクション）
│   └── news.css        # NEWS/記事ページ専用
├── js/
│   └── main.js         # インタラクション全般
├── news/
│   ├── index.html      # お知らせ一覧
│   └── template.html   # 記事テンプレート
├── assets/
│   ├── img/            # キャスト写真 cast01〜06.jpg など
│   └── video/          # 予告編 trailer.mp4（任意）
└── photos/             # 撮影済みスチール写真（既存）
```

---

## 7. 差し替えチェックリスト

- [ ] `photos/A7S07404.jpg` → ヒーロー背景 (`assets/img/hero.jpg`)
- [ ] `assets/img/cast01.jpg` 〜 `cast06.jpg` → キャスト写真
- [ ] キャストの `data-name` / `data-role` / `data-comment` → 実際の情報
- [ ] スタッフ名（`スタッフ名②〜⑤`）→ 実際の名前
- [ ] あらすじテキスト → 実際のあらすじ
- [ ] `data-trailer-id=""` → YouTube動画ID（例: `"dQw4w9WgXcQ"`）
- [ ] SNSリンク（`href`）→ 実際のURL
- [ ] NEWSの記事内容 → 実際の情報
- [ ] `datetime` 属性の日付 → 実際の日付
