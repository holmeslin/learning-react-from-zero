# metadata

## 本集目標

設定每個頁面的標題和描述，包括標題要跟著書名變化的動態頁面。

## 正文

### 什麼是 metadata

**metadata**（中繼資料）是放在網頁 `<head>` 裡、不會直接出現在畫面上的資訊：分頁上的標題、搜尋結果裡的描述、分享到社群網站時的預覽文字。這些東西對使用者找到你的網站很重要。

Next.js 不要你自己去寫 `<head>`，而是在 `layout.tsx` 或 `page.tsx` 裡匯出一個叫 `metadata` 的物件。

### 靜態的 metadata

你在第 4 集已經寫過根 layout 的 `metadata`：

```tsx
export const metadata: Metadata = {
  title: "小書店",
  description: "用 Next.js 做的小書店",
};
```

`Metadata` 是 Next.js 提供的型別，會幫你檢查有沒有拼錯欄位。Next.js 會把這個物件轉成 `<title>` 和 `<meta name="description">`。

現在整個網站每一頁的分頁標題都是「小書店」。我們希望關於頁顯示「關於我們｜小書店」。

### 標題範本

不用每頁都自己寫一次「｜小書店」。在根 layout 設定一個**範本**（template）：

```tsx
// app/layout.tsx
import type { Metadata } from "next";
import NavLink from "@/app/ui/nav-link";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "小書店",
    template: "%s｜小書店",
  },
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

`title` 變成一個物件：

- `default`：沒有其他頁面設定標題的時候，用這個。
- `template`：其他頁面設定的標題，會代入 `%s` 的位置。

然後在 `app/about/page.tsx` 加上自己的標題：

```tsx
// app/about/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "關於我們",
};

export default function AboutPage() {
  return (
    <main>
      <h1>關於我們</h1>
      <p>我們是一間很小的書店。</p>
    </main>
  );
}
```

打開 `/about`，分頁標題是「關於我們｜小書店」。在首頁則是「小書店」，因為首頁沒有設定自己的標題，用的是 `default`。

### 動態的 metadata：`generateMetadata`

每本書的頁面標題，應該是那本書的名字。但是書名要看網址才知道，沒辦法寫成固定的物件。這時候改用函式：`generateMetadata`。

在 `app/books/[id]/page.tsx` 加上它：

```tsx
// app/books/[id]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { books, getBook } from "@/app/lib/books";

export function generateStaticParams() {
  return books.map((book) => ({ id: book.id }));
}

export async function generateMetadata(
  props: PageProps<"/books/[id]">,
): Promise<Metadata> {
  const { id } = await props.params;
  const book = getBook(id);

  return { title: book?.title ?? "找不到這本書" };
}

export default async function BookPage(props: PageProps<"/books/[id]">) {
  const { id } = await props.params;
  const book = getBook(id);

  if (!book) {
    notFound();
  }

  return (
    <main>
      <h1>{book.title}</h1>
      <p>{book.summary}</p>
    </main>
  );
}
```

`generateMetadata` 拿到的 `props` 和頁面元件一樣，所以可以用同樣的方式取出 `id`。它必須回傳 `Metadata` 物件，因為是 `async` 函式，型別是 `Promise<Metadata>`。

打開 `/books/1`，分頁標題是「貓咪的程式課｜小書店」；打開 `/books/999`，則是「找不到這本書｜小書店」。

你可能注意到了：`getBook(id)` 被呼叫了兩次，一次在 `generateMetadata`，一次在頁面元件裡。因為我們的資料只是陣列，這沒有問題。如果是資料庫，Next.js 會自動幫你合併重複的 `fetch` 請求，也有其他辦法避免重複查詢，後面的章節會再碰到。

### 注意

- `metadata` 和 `generateMetadata` 只能在 Server Component 裡用。如果檔案最上面有 `"use client"`，就不能匯出它們。
- 同一個頁面可以在 layout 和 page 都設定，越深的檔案優先。
- 如果你想做更完整的社群分享預覽，Next.js 還支援 `openGraph` 等欄位，用法一樣是在 `metadata` 物件裡加欄位，可以到官方文件查詢。

## 重點整理

- 在 `layout.tsx` 或 `page.tsx` 匯出 `metadata` 物件，Next.js 就會產生 `<head>` 裡的標籤。
- `title.template` 讓每頁只要寫短標題，統一加上網站名稱。
- 標題要看網址決定時，改匯出 `generateMetadata` 函式，回傳 `Metadata` 物件。
- `metadata` 只能用在 Server Component。
