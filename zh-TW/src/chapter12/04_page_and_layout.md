# `page` 與 `layout`

## 本集目標

知道 `page.tsx` 和 `layout.tsx` 各自負責什麼，並且寫出自己的根 layout。

## 正文

### `page.tsx`：一個網址的內容

在 `app/` 底下，只要有一個檔案叫 `page.tsx`，並且 `export default` 一個元件，這個資料夾就會變成一個可以瀏覽的網址。

`app/page.tsx` 對應的是 `/`，也就是首頁。你上一集寫的就是它：

```tsx
export default function Home() {
  return (
    <main>
      <h1>歡迎來到小書店</h1>
      <p>這是用 Next.js 做的第一個網站。</p>
    </main>
  );
}
```

元件的名字可以隨便取，`Home` 換成 `Page` 或 `Index` 都可以，重要的是檔名必須是 `page.tsx`，而且是預設匯出。

### `layout.tsx`：很多頁面共用的外框

網站上的每一頁通常都有一樣的東西：上方的導覽列、底下的版權資訊、同一套字型。這些東西不應該每個頁面都複製一份，應該放在 **layout**（版面配置）裡。

`app/layout.tsx` 是整個網站最外層的 layout，叫做**根 layout**（root layout）。範本裡已經有一個了，我們把它換成自己的：

```tsx
// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "小書店",
  description: "用 Next.js 做的小書店",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-TW">
      <body>
        <header>
          <strong>小書店</strong>
        </header>
        {children}
      </body>
    </html>
  );
}
```

幾個重點：

- **根 layout 是必要的**，而且一定要自己寫 `<html>` 和 `<body>`。React 的畫面最終都要放進這兩個標籤裡，Next.js 不會替你補。
- `lang="zh-TW"` 告訴瀏覽器和輔助工具，這個網站的語言是繁體中文。
- **`children` 就是頁面**。layout 會把目前網址對應的 `page.tsx` 放進 `children` 的位置。所以不管你走到哪一頁，`<header>` 都會在上面。
- `import "./globals.css"` 把全站的 CSS 引進來。放在根 layout 引入，每一頁都會套用。
- `metadata` 設定網頁的標題和描述，第 10 集會細講。

存檔後回到瀏覽器，首頁上方多了「小書店」三個字。

### `LayoutProps<"/">` 是什麼

注意 `RootLayout` 的參數型別：`LayoutProps<"/">`。你沒有在檔案裡 import 它，卻可以直接用，這是因為 Next.js 會根據你的資料夾結構，自動產生一份全域的型別，名字叫 `LayoutProps`。尖括號裡的 `"/"` 是這個 layout 對應的路徑。

這些型別是 `npm run dev` 或 `npm run build` 執行時產生的。如果你還沒啟動過它們，編輯器可能會對 `LayoutProps` 畫紅線。只要啟動一次開發伺服器，或是執行下面這個指令，紅線就會消失：

```bash
npx next typegen
```

### layout 換頁時不會重來

使用者在網站上從這一頁換到另一頁時，layout 不會重新渲染，而且它裡面的狀態也會被保留。例如 layout 裡有一個搜尋框，使用者輸入的文字，換頁之後還在。只有 `children` 的部分會換成新頁面的內容。

這是 layout 和「每個頁面都自己放一個 `<header>`」最大的差別。

## 重點整理

- `page.tsx` 預設匯出的元件，就是該資料夾對應網址的內容。
- `layout.tsx` 是共用的外框，`children` 的位置會放進目前的頁面。
- 根 layout 必須存在，而且要自己寫 `<html>` 和 `<body>`。
- `LayoutProps<"/">` 是 Next.js 自動產生的全域型別，不用 import。
- 換頁時 layout 不會重新渲染，它裡面的狀態也會保留。
