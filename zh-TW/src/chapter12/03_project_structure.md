# 專案結構

## 本集目標

認得 Next.js 專案裡每個檔案和資料夾的用途，並且把範本清成乾淨的起點。

## 正文

### 逛一圈

在 VS Code 打開 `hello-next` 資料夾，你會看到這些東西：

| 名稱 | 用途 |
| --- | --- |
| `app/` | 網站的頁面都放在這裡，資料夾結構就是網址結構 |
| `public/` | 靜態檔案，例如圖片，網址從 `/` 開始直接對應 |
| `next.config.ts` | Next.js 的設定檔 |
| `package.json` | 專案的套件與指令，和第一部的 Vite 專案一樣 |
| `tsconfig.json` | TypeScript 的設定 |
| `eslint.config.mjs` | ESLint 的設定 |
| `next-env.d.ts` | Next.js 自動產生的型別宣告，不要手動改它 |
| `AGENTS.md`、`README.md` | 說明文件，不影響網站 |
| `.next/` | 建置時產生的暫存檔，會自動重建，不用管它 |
| `node_modules/` | 安裝下來的套件，和 Vite 專案一樣 |

最重要的是 `app/`。目前裡面有這幾個檔案：

- `layout.tsx`：整個網站共用的外框，下一集會講。
- `page.tsx`：首頁的內容。
- `globals.css`：全站的 CSS。
- `favicon.ico`：瀏覽器分頁上的小圖示。

### `next.config.ts`

打開 `next.config.ts`，會看到這樣的內容：

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
```

先不要被嚇到。`cacheComponents` 就是前面說的 Cache Components，第 15 章才會細講。不過它現在就會影響你寫程式的方式：讀取還沒準備好的資料時，必須告訴 Next.js 要怎麼處理，我們會在第 6 集和第 8 集遇到。

`partialPrefetching` 和 Cache Components 是一組的，讓 Next.js 在你點連結之前先載入下一頁能事先準備好的部分，保持預設就好。

`turbopack` 那一段是為了 Tailwind CSS 設定的，不用動它。

### `@/` 是什麼

打開 `tsconfig.json`，找到 `paths`：

```json
"paths": {
  "@/*": ["./*"]
}
```

這表示 `@/` 代表專案的根目錄。所以之後你會看到 `import { books } from "@/app/lib/books"` 這種寫法，意思是「從專案根目錄開始，找 `app/lib/books`」。好處是不管檔案放在多深的地方，import 的寫法都一樣，不用數要寫幾個 `../`。

### Tailwind CSS

範本的 `globals.css` 第一行是 `@import "tailwindcss";`，`page.tsx` 裡也有一堆像 `className="flex flex-col items-center"` 的寫法。這些都是 **Tailwind CSS**：一種不用另外寫 CSS 檔、直接在 `className` 裡用現成的小類別來排版的工具。

它很流行，但是對還在學 CSS 的人來說，等於要多學一套語言。所以這本書第二部不用它，而是用你在第 3 章和第 4 章學過的一般 CSS。想了解 Tailwind 的話，附錄一有一集專門介紹。

### 把範本清乾淨

我們把範本首頁換成自己的。先把 `app/globals.css` 整個換成：

```css
/* app/globals.css */
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  line-height: 1.6;
}

main {
  max-width: 40rem;
  margin: 0 auto;
  padding: 1rem;
}
```

再把 `app/page.tsx` 整個換成：

```tsx
// app/page.tsx
export default function Home() {
  return (
    <main>
      <h1>歡迎來到小書店</h1>
      <p>這是用 Next.js 做的第一個網站。</p>
    </main>
  );
}
```

`public/` 裡的幾個 `.svg` 檔案是範本首頁用的圖片，現在沒人用了，可以全部刪掉。

存檔後，瀏覽器會變成一個乾乾淨淨的頁面，只有標題和一行字。`next.config.ts` 裡和 Tailwind 有關的設定留著不會有任何影響。

## 重點整理

- `app/` 放頁面，`public/` 放靜態檔案，`next.config.ts` 是 Next.js 的設定。
- `import "@/..."` 的 `@/` 代表專案根目錄。
- `cacheComponents` 是開著的，它會影響怎麼讀取還沒準備好的資料，第 15 章會細講。
- Tailwind CSS 是另一種寫樣式的方式，這本書第二部改用一般 CSS。
