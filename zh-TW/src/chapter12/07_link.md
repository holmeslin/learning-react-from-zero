# `Link`

## 本集目標

用 `<Link>` 在頁面之間跳轉，並且做出會標示「目前在哪一頁」的導覽列。

## 正文

### 為什麼不用 `<a>`

你現在只能靠手動輸入網址，才能看到 `/books/1`。網站當然要有連結。HTML 的 `<a>` 當然也能用，但 Next.js 提供了一個更好的版本：`<Link>`。

`<Link>` 是 Next.js 內建的元件，它長得就像 `<a>`，但多了兩樣本事：

- **預先載入**（prefetch）：只要連結出現在畫面上，Next.js 就會在背景把目標頁面先準備好。等使用者真的點下去，內容幾乎立刻出現。
- **瀏覽器端跳轉**（client-side navigation）：換頁時只更新頁面變動的部分，不會整個網頁重新載入，所以 layout 的狀態才能被保留。

用法是從 `next/link` 引入，用 `href` 指定網址：

```tsx
import Link from "next/link";

<Link href="/about">關於我們</Link>;
```

### 在書籍列表加上連結

把 `app/books/page.tsx` 改成每一本書都是一個連結：

```tsx
// app/books/page.tsx
import Link from "next/link";
import { books } from "@/app/lib/books";

export default function BooksPage() {
  return (
    <main>
      <h1>所有書籍</h1>
      <ul>
        {books.map((book) => (
          <li key={book.id}>
            <Link href={`/books/${book.id}`}>{book.title}</Link>
            <span>（{book.author}）</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
```

`href` 用你第 1 章學的樣板字面值，把 `book.id` 放進網址。現在打開 `/books`，點任何一本書，就會跳到它的頁面。

### 在根 layout 加上導覽列

導覽列每一頁都要有，所以放在根 layout。把 `app/layout.tsx` 改成：

```tsx
// app/layout.tsx
import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "小書店",
  description: "用 Next.js 做的小書店",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-TW">
      <body>
        <nav>
          <Link href="/">首頁</Link> <Link href="/books">書籍</Link>{" "}
          <Link href="/about">關於</Link>
        </nav>
        {children}
      </body>
    </html>
  );
}
```

`{" "}` 是 JSX 裡放一個空格的寫法，用來讓連結之間有空隙。這個導覽列只是最陽春的版本，樣式你可以自己用 CSS 美化。

### 標示目前在哪一頁

好的導覽列會讓使用者知道「我現在在哪」。這需要知道目前的網址，Next.js 提供了一個 Hook：`usePathname`。

但是這裡有個限制：**Hook 只能在 Client Component 裡用**。Client Component 是什麼，第 13 章會詳細講，現在你只要知道：檔案的最上面寫一行 `"use client"`，就代表「這個元件要在瀏覽器裡執行」，才能用 `useState`、`usePathname` 這些 Hook。

新增 `app/ui/nav-link.tsx`：

```tsx
// app/ui/nav-link.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = pathname === href;

  return (
    <Link href={href} aria-current={active ? "page" : undefined}>
      {children}
    </Link>
  );
}
```

`usePathname()` 會回傳目前的網址路徑，例如 `/about`。當它等於這個連結的 `href`，就加上 `aria-current="page"`，這是給螢幕閱讀器看的標記，表示「這是目前所在的頁面」。

再把根 layout 的 `Link` 全部換成 `NavLink`：

```tsx
// app/layout.tsx
import type { Metadata } from "next";
import NavLink from "@/app/ui/nav-link";
import "./globals.css";

export const metadata: Metadata = {
  title: "小書店",
  description: "用 Next.js 做的小書店",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="zh-TW">
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

打開 `/about`，在瀏覽器的原始碼裡可以找到 `<a aria-current="page" href="/about">關於</a>`。如果想讓目前頁面看得出來，在 `globals.css` 加一條：

```css
a[aria-current="page"] {
  font-weight: bold;
}
```

這是一般 CSS 的屬性選擇器，不需要任何 JavaScript。

## 重點整理

- `<Link href="...">` 像 `<a>`，但會預先載入目標頁面，換頁時也不會整個網頁重新載入。
- 在 `layout.tsx` 放導覽列，每一頁都會有。
- `usePathname` 可以取得目前的網址，但它是 Hook，所以要放在有 `"use client"` 的檔案裡。
- 用 `aria-current="page"` 標示目前的頁面，再用 CSS 的屬性選擇器讓它看得出來。
