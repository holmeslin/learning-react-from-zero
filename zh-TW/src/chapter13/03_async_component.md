# `async` 元件直接讀資料

## 本集目標

在元件裡直接 `await` 資料，並且把讀資料的工作切成自己的元件。

## 正文

### 回顧第 6 章

第 6 章你在 React 裡抓資料，是這樣做的：

1. 宣告一個 `useState` 放資料，一開始是空的。
2. 在 `useEffect` 裡發出請求。
3. 請求回來之後，呼叫 `setState`。
4. 還要自己處理「載入中」和「出錯」的狀態。

步驟很多，而且每一步都要在瀏覽器裡等前一步完成。

### 現在只要一個 `await`

在 Server Component 裡，同樣的事情變成這樣：

```tsx
export default async function BookList() {
  const books = await getBooks();

  return <ul>{/* ...把 books 變成列表... */}</ul>;
}
```

元件宣告成 `async function`，直接 `await` 資料，然後用資料回傳 JSX。沒有 `useState`，沒有 `useEffect`，沒有「載入中」的狀態要自己管，因為這個函式要等資料到了才會往下執行，而「載入中」的畫面，Next.js 已經用 `loading.tsx` 替你處理了。

這是前一章 `app/books/page.tsx` 在做的事。`getBooks()` 在這裡是我們模擬的資料庫，換成真正的資料庫查詢、或是 `fetch` 呼叫別人的 API，寫法完全一樣：

```tsx
// 真實世界的寫法大概像這樣，這裡只是示範，不用實際執行
const res = await fetch("https://api.example.com/books");
const books = await res.json();
```

### 讓每個元件自己讀資料

既然元件可以直接讀資料，就不必把所有資料都在頁面讀完，再一層一層用 props 傳下去。**需要資料的元件，自己讀就好。**

把書籍列表從 `page.tsx` 拆成獨立的元件。新增 `app/ui/book-list.tsx`：

```tsx
// app/ui/book-list.tsx
import Link from "next/link";
import { getBooks } from "@/app/lib/books";

export default async function BookList() {
  const books = await getBooks();

  return (
    <ul>
      {books.map((book) => (
        <li key={book.id}>
          <Link href={`/books/${book.id}`}>{book.title}</Link>
          <span>（{book.author}）</span>
        </li>
      ))}
    </ul>
  );
}
```

然後 `app/books/page.tsx` 變得非常簡單，連 `async` 都不用了：

```tsx
// app/books/page.tsx
import BookList from "@/app/ui/book-list";

export default function BooksPage() {
  return (
    <main>
      <h1>所有書籍</h1>
      <BookList />
    </main>
  );
}
```

`BookList` 自己讀資料，頁面只負責排版。如果其他頁面也需要書籍列表，直接放 `<BookList />` 就好，不需要每個頁面都重新讀一遍資料、再傳進來。

存檔後打開 `/books`，行為和之前一樣：先是「載入中……」，1.5 秒後出現書籍列表。

### 重複讀資料會不會很浪費

如果兩個元件都讀同一份資料，會不會查兩次？如果用 `fetch`，Next.js 在同一次渲染裡，會自動把相同的請求合併成一個。其他方式（例如直接查資料庫）則有別的做法，我們在第 15 章談快取的時候再說。

### 等待的時候

不過現在有一個小缺點：`BookList` 要等 1.5 秒，整個 `/books` 頁面都被 `loading.tsx` 蓋住，連「所有書籍」這個標題也要等。第 8 集會學到怎麼讓頁面「能先出現的先出現」。

## 重點整理

- Server Component 可以寫成 `async` 函式，直接 `await` 資料，不需要 `useState` 和 `useEffect`。
- 資料可以來自資料庫、檔案或 `fetch`，寫法一樣。
- 需要資料的元件，自己讀資料，不必在頁面讀完再傳下去。
- 在同一次渲染裡，相同的 `fetch` 請求會被自動合併。
