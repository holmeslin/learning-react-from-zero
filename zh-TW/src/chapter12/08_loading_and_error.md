# `loading` 與 `error`

## 本集目標

在資料還沒到的時候顯示「載入中」，在出錯的時候顯示友善的畫面，而不是整個網站壞掉。

## 正文

### 資料很慢的時候

真正的網站，資料通常放在資料庫，讀取需要時間。我們先模擬這件事：在 `app/lib/books.ts` 的最後面加上這個函式，它會等 1.5 秒才回傳書籍：

```ts
// app/lib/books.ts（接在檔案最後）

// 模擬資料庫很慢：等一下才回傳
export async function getBooks() {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  return books;
}
```

`setTimeout` 你在第 6 章看過。這裡是用它製造一個「1.5 秒後才完成」的 Promise，假裝是資料庫在回應。

然後把 `app/books/page.tsx` 改成用它。因為 `getBooks()` 回傳 Promise，元件要變成 `async`，然後 `await` 它：

```tsx
// app/books/page.tsx
import Link from "next/link";
import { getBooks } from "@/app/lib/books";

export default async function BooksPage() {
  const books = await getBooks();

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

這是 Server Component 最特別的地方：元件可以直接是 `async` 函式，直接在裡面 `await` 資料，不用 `useEffect`、不用 `useState`。第 13 章會好好講。

現在執行 `npm run build`，你會看到建置失敗，訊息和上一集很像：

```text
Error: Route "/books": Next.js encountered uncached or runtime data during prerendering.
```

原因也一樣：頁面在等一個還沒準備好的資料，而 Next.js 沒辦法在建置時替它預先準備。它的解決辦法是：**給它一個「載入中」的畫面**，頁面先送出去，等資料到了再補上。

### `loading.tsx`

建立 `app/books/loading.tsx`：

```tsx
// app/books/loading.tsx
export default function Loading() {
  return (
    <main>
      <p>載入中……</p>
    </main>
  );
}
```

就這樣，不用 import 它，也不用在 `page.tsx` 裡呼叫它。`loading.tsx` 是 Next.js 認得的特殊檔案名稱：只要放在某個資料夾，那個資料夾裡的頁面在等資料的時候，就會先顯示它。

再跑一次 `npm run build`，這次會成功。啟動 `npm run start`，打開 `/books`，你會先看到「載入中……」，1.5 秒之後才換成書籍列表，而導覽列和 `books/layout.tsx` 的提示從一開始就在。

背後的原理是：`loading.tsx` 其實是替 `page.tsx` 包了一層 React 的 `<Suspense>`，你在第 8 章學過它。`loading.tsx` 的內容就是 `<Suspense>` 的 `fallback`。

### `error.tsx`

如果讀資料的時候出錯了呢？沒有處理的話，使用者會看到一個難看的錯誤畫面。Next.js 用 **error boundary**（錯誤邊界）處理這件事，你在第 8 章也學過。在 Next.js 裡，只要放一個 `error.tsx`。

建立 `app/books/error.tsx`：

```tsx
// app/books/error.tsx
"use client";

export default function BooksError({ retry }: { retry: () => void }) {
  return (
    <main>
      <h1>出了點問題</h1>
      <button onClick={() => retry()}>再試一次</button>
    </main>
  );
}
```

兩個重點：

- `error.tsx` 一定要是 Client Component，檔案最上面要有 `"use client"`。因為按鈕需要 `onClick`，而事件處理只能在瀏覽器裡發生。
- Next.js 會傳一個 `retry` 函式給它。使用者按下按鈕，就會重新嘗試渲染出錯的那一塊。

來故意讓它出錯。把 `app/books/[id]/page.tsx` 暫時改成，網址是 `/books/boom` 的時候丟出錯誤：

```tsx
// app/books/[id]/page.tsx
import { books, getBook } from "@/app/lib/books";

export function generateStaticParams() {
  return books.map((book) => ({ id: book.id }));
}

export default async function BookPage(props: PageProps<"/books/[id]">) {
  const { id } = await props.params;

  if (id === "boom") {
    throw new Error("故意丟出來的錯誤");
  }

  const book = getBook(id);

  return (
    <main>
      <h1>{book?.title}</h1>
      <p>{book?.summary}</p>
    </main>
  );
}
```

打開 <http://localhost:3000/books/boom>，畫面不是整個網站當掉，而是顯示「出了點問題」和一個按鈕。導覽列還在，因為 `error.tsx` 只替它所在的資料夾及底下的頁面擋住錯誤。`app/books/error.tsx` 也會接住 `/books/[id]` 裡的錯誤，因為 `[id]` 是 `books` 的子資料夾。

測試完之後，把那個 `if (id === "boom")` 刪掉。

### 兩個特殊檔案的差別

| 檔案 | 什麼時候出現 | 必須是 Client Component 嗎 |
| --- | --- | --- |
| `loading.tsx` | 頁面在等資料的時候 | 不用 |
| `error.tsx` | 頁面丟出錯誤的時候 | 要 |

放在哪個資料夾，就管哪個資料夾以下的頁面。如果要管整個網站，就放在 `app/` 根目錄。

## 重點整理

- Server Component 可以直接寫成 `async` 函式，用 `await` 取資料。
- 頁面在等還沒準備好的資料時，需要提供載入畫面，否則 `npm run build` 會失敗。
- `loading.tsx` 就是替頁面包了一層 `<Suspense>`，內容就是 `fallback`。
- `error.tsx` 是錯誤邊界，要用 `"use client"`，並且會拿到 `retry` 函式。
- 兩個檔案都是放在資料夾裡，管那個資料夾以下的頁面。
