# 檔案路由

## 本集目標

用資料夾做出新的網址，並且替某一區的頁面加上自己的 layout。

## 正文

### 資料夾就是網址

Next.js 的路由規則只有一條：**`app/` 底下的資料夾結構，就是網址結構。** 資料夾裡放了 `page.tsx`，那個網址才會出現。

| 檔案 | 網址 |
| --- | --- |
| `app/page.tsx` | `/` |
| `app/about/page.tsx` | `/about` |
| `app/books/page.tsx` | `/books` |
| `app/books/hot/page.tsx` | `/books/hot` |

來做兩個新頁面。先建立 `app/about/page.tsx`：

```tsx
// app/about/page.tsx
export default function AboutPage() {
  return (
    <main>
      <h1>關於我們</h1>
      <p>我們是一間很小的書店。</p>
    </main>
  );
}
```

打開 <http://localhost:3000/about>，就看到這一頁了。你沒有設定任何路由，只是建了一個資料夾和一個檔案。

回頭看第 1 集：用 `view-source:http://localhost:3000/about` 檢視原始碼，你會在裡面找到：

```html
<main><h1>關於我們</h1><p>我們是一間很小的書店。</p></main>
```

文字已經在伺服器送來的 HTML 裡了，這就是 Next.js 和 Vite 專案最大的差別。

### 準備一些書

接下來要做書籍列表。在 `app` 底下建立 `lib` 資料夾，放一個資料檔 `app/lib/books.ts`。這就是我們的「資料庫」，目前先用一個陣列代替：

```ts
// app/lib/books.ts
export type Book = {
  id: string;
  title: string;
  author: string;
  price: number;
  likes: number;
  summary: string;
};

export const books: Book[] = [
  {
    id: "1",
    title: "貓咪的程式課",
    author: "陳小橘",
    price: 380,
    likes: 12,
    summary: "從一隻貓學寫第一行程式，適合完全沒有基礎的人。",
  },
  {
    id: "2",
    title: "河馬的資料結構",
    author: "林阿河",
    price: 520,
    likes: 7,
    summary: "用河馬的日常生活，解釋陣列、佇列和堆疊。",
  },
  {
    id: "3",
    title: "企鵝的網路世界",
    author: "王小企",
    price: 450,
    likes: 21,
    summary: "從一封信怎麼寄到企鵝家，講到網頁怎麼送到你的瀏覽器。",
  },
];

export function getBook(id: string) {
  return books.find((book) => book.id === id);
}
```

`likes` 先放著，第 13 章會用到。`getBook` 是用書號找書的函式，下一集會用到。

你可能會問：`app/lib` 也是 `app/` 底下的資料夾，它會變成 `/lib` 這個網址嗎？不會。因為裡面沒有 `page.tsx`。**資料夾裡沒有 `page.tsx`，就不會變成網頁**，所以你可以放心把元件、工具函式跟頁面放在一起。

然後建立 `app/books/page.tsx`：

```tsx
// app/books/page.tsx
import { books } from "@/app/lib/books";

export default function BooksPage() {
  return (
    <main>
      <h1>所有書籍</h1>
      <ul>
        {books.map((book) => (
          <li key={book.id}>
            {book.title}（{book.author}）
          </li>
        ))}
      </ul>
    </main>
  );
}
```

這就是你熟悉的 React：用 `map` 把陣列變成列表，每一項要有 `key`。唯一不同的是，它是在伺服器上執行的。

打開 <http://localhost:3000/books>，你就能看到三本書。

### 巢狀 layout

假設書籍區的每一頁，都想在上面放一行共同的提示。這個需求不需要改根 layout，只要在 `app/books/` 裡再放一個 `layout.tsx`：

```tsx
// app/books/layout.tsx
export default function BooksLayout({ children }: LayoutProps<"/books">) {
  return (
    <section>
      <p>📚 你正在逛書籍區</p>
      {children}
    </section>
  );
}
```

存檔之後，打開 `/books`，上面多了提示；打開 `/about`，沒有。

layout 是一層包一層的：`/books` 這頁的結構是「根 layout → `books/layout.tsx` → `books/page.tsx`」。之後在 `app/books/` 裡新增的任何頁面，包括下一集的 `/books/1`，都會自動套用這個 layout。

## 重點整理

- `app/` 底下的資料夾結構就是網址結構，資料夾裡要有 `page.tsx` 才會變成網頁。
- 沒有 `page.tsx` 的資料夾不會變成網址，可以放心放元件和工具函式。
- 頁面元件寫法和你熟悉的 React 一樣，只是預設在伺服器上執行。
- 在子資料夾放 `layout.tsx`，可以替那一區的所有頁面加上共用外框。
- layout 一層包一層：根 layout 包子 layout，子 layout 再包頁面。
