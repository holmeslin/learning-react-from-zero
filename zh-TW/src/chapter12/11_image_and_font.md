# `next/image` 與 `next/font`

## 本集目標

用 Next.js 內建的 `<Image>` 放圖片、用 `next/font` 載入字型，讓網站又快又穩。

## 正文

### 圖片

網頁上放圖片，最容易遇到兩個問題：圖片太大，載入很慢；圖片載入前沒有預留位置，載入完成時整個版面被推擠。

Next.js 的 `<Image>` 元件幫你解決這兩個問題：

- 依照使用者螢幕的大小，自動提供合適尺寸的圖片，並轉成比較小的格式。
- 要求你寫明圖片的寬和高，載入前就預留好空間，版面不會跳動。
- 預設只有圖片快要出現在畫面上時才載入（lazy loading）。

先準備一張圖片。隨便找一張，改名叫 `cover.png`，放進專案的 `public/` 資料夾。`public/` 裡的檔案，網址直接從 `/` 開始，所以它的網址是 `/cover.png`。

修改首頁 `app/page.tsx`：

```tsx
// app/page.tsx
import Image from "next/image";

export default function Home() {
  return (
    <main>
      <h1>歡迎來到小書店</h1>
      <p>這是用 Next.js 做的第一個網站。</p>
      <Image
        src="/cover.png"
        alt="書店的招牌"
        width={600}
        height={400}
        preload
      />
    </main>
  );
}
```

重點：

- `src` 是圖片網址。
- `alt` 是圖片的文字說明，給螢幕閱讀器和圖片載入失敗時使用。有意義的圖片都要寫。
- `width` 和 `height` 是圖片的原始尺寸（單位是像素），Next.js 用它們算出比例、預留空間。它們不等於顯示大小，要改顯示大小用 CSS。
- `preload` 告訴 Next.js：「這張圖一進頁面就看得到，請提早載入。」首頁最上方的大圖適合加上；放在頁面下方的圖片不要加，讓它保持預設的 lazy loading。

用 `view-source:` 看首頁的原始碼，你會發現 `<img>` 的 `src` 變成了這樣：

```text
/_next/image?url=%2Fcover.png&w=1200&q=75
```

圖片先經過 Next.js 的圖片服務處理，再送給瀏覽器。`w=1200` 是寬度，`q=75` 是品質。同時還有一個 `srcSet`，列出 640 和 1200 兩種尺寸，讓瀏覽器依照螢幕選一個。

### 圖片來自別的網站

如果圖片網址是別人的網站，例如 `https://example.com/photo.jpg`，Next.js 為了安全，預設會拒絕處理，你必須在 `next.config.ts` 明確列出允許的網站：

```ts
// next.config.ts（只列出新增的部分）
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "example.com" }],
  },
};
```

這個設定要和你原本 `next.config.ts` 裡的其他欄位放在一起，不是整個取代。這本書的範例都用 `public/` 裡的圖片，所以不需要它。

### 字型

網頁預設用使用者電腦裡的字型，每個人看到的樣子都不一樣。想要統一，就要自己載入字型。傳統的做法是在網頁裡連到 Google Fonts，缺點是使用者每次載入網頁，還要多連一次別人的伺服器。

`next/font` 的做法不一樣：**建置的時候**就把字型檔下載下來，跟你的網站放在一起。使用者的瀏覽器只需要跟你的網站要資料，不用再連到 Google。

我們幫小書店換成 Noto Sans TC（思源黑體）。修改根 layout `app/layout.tsx`：

```tsx
// app/layout.tsx
import type { Metadata } from "next";
import { Noto_Sans_TC } from "next/font/google";
import NavLink from "@/app/ui/nav-link";
import "./globals.css";

const notoSansTC = Noto_Sans_TC({
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "小書店",
    template: "%s｜小書店",
  },
  description: "用 Next.js 做的小書店",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-TW" className={notoSansTC.className}>
      <body>
        <nav>
          <NavLink href="/">首頁</NavLink> <NavLink href="/books">書籍</NavLink>{" "}
          <NavLink href="/about">關於</NavLink>
        </nav>
        {children}
      </body>
    </html>
  );
}
```

做了三件事：

1. 從 `next/font/google` 引入字型。字型的名字是用底線連起來的 `Noto_Sans_TC`，對應 Google Fonts 上的「Noto Sans TC」。
2. 呼叫它，設定要載入的字重：`400` 是一般粗細，`700` 是粗體。
3. 把回傳物件的 `className` 套用到 `<html>` 上。

執行 `npm run build`，建置會花比較久，因為它正在下載字型。完成之後，你會發現 `.next/static/media/` 資料夾裡出現很多 `.woff2` 檔案，那就是字型檔。中文字很多，所以字型被切成很多小塊，瀏覽器只會下載頁面上用得到的那幾塊。

你可以檢查網頁的 CSS，會找到類似 `src:url(../media/....woff2)` 的寫法，沒有任何指向 Google 的網址。

### 本機的字型檔

如果你有自己的字型檔，可以放進專案，改用 `next/font/local`，用法類似，只是用 `src` 指定檔案的位置。這裡不細講，需要時查官方文件就好。

## 重點整理

- `<Image>` 要設定 `src`、`alt`、`width`、`height`，Next.js 會自動最佳化大小並預留空間。
- `public/` 裡的檔案，網址直接從 `/` 開始。
- 首頁最上方看得到的大圖加 `preload`，其他圖片保持預設的 lazy loading。
- 別人網站的圖片要在 `next.config.ts` 的 `images.remotePatterns` 裡列出來。
- `next/font` 在建置時下載字型，跟網站放在一起，使用者不用再連到 Google。
