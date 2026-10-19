# 伺服器與瀏覽器

## 本集目標

分清楚一段程式碼是在伺服器上執行，還是在瀏覽器裡執行，並且知道怎麼觀察它。

## 正文

### 兩個執行的地方

第一部你寫的 React 程式，全部都在**瀏覽器**裡執行：使用者的手機或電腦下載了你的 JavaScript，在自己的機器上跑。

Next.js 多了另一個地方：**伺服器**。伺服器是一台一直開著的電腦（開發的時候就是你自己的電腦），它收到瀏覽器的請求之後，先執行一部分的程式，算出畫面，再送出去。

兩個地方能做的事不一樣：

| | 伺服器 | 瀏覽器 |
| --- | --- | --- |
| 可以讀資料庫、檔案 | 可以 | 不行 |
| 可以放祕密的金鑰 | 可以 | 不行，使用者看得到 |
| 可以用 `useState`、`useEffect` | 不行 | 可以 |
| 可以處理 `onClick` | 不行 | 可以 |
| 可以用 `window`、`localStorage` | 不行 | 可以 |
| 程式碼會被使用者下載 | 不會 | 會 |

簡單說：**需要讀取資料、保護祕密的事交給伺服器，需要回應使用者操作的事交給瀏覽器。**

### 預設在哪裡

在 Next.js 的 App Router 裡，**所有元件預設都在伺服器上執行**，也就是 Server Component。你上一章寫的每一個 `page.tsx`、`layout.tsx` 都是。

只有在檔案最上面寫了 `"use client"` 的元件，才會變成 Client Component，在瀏覽器裡執行。這個之後會講。

### 怎麼觀察

怎麼確認一段程式碼真的在伺服器上跑？用 `console.log` 就可以。

把 `app/books/page.tsx` 暫時加上一行 `console.log`：

```tsx
// app/books/page.tsx
import Link from "next/link";
import { getBooks } from "@/app/lib/books";

export default async function BooksPage() {
  const books = await getBooks();
  console.log("BooksPage 在渲染，共有", books.length, "本書");

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

打開瀏覽器的 `/books`，然後看**終端機**，也就是你執行 `npm run dev` 的那個視窗，會出現：

```text
BooksPage 在渲染，共有 3 本書
```

這行字是在終端機裡看到的，因為這段程式是在你的電腦（也就是伺服器）上執行的。它不是在使用者的瀏覽器裡跑，所以 `console.log` 的輸出跑到了伺服器的終端機。

執行 `npm run build` 的時候也會看到一樣的訊息，因為這個頁面在建置時就預先渲染了一次。

### 兩個時間點

伺服器渲染元件的時間點有兩個，你在上一章已經碰過：

- **建置的時候**（`npm run build`）：先渲染好、存起來。使用者來的時候直接拿，很快。
- **使用者請求的時候**：資料需要即時查，只能等請求來了再渲染。

預設是盡量在建置時做完。需要請求時才做的部分，Next.js 會要求你用 `<Suspense>` 或 `loading.tsx` 標示出來，第 8 集會再講。

### 想想看

下面這些事，應該在伺服器還是瀏覽器？

- 從資料庫讀取書籍列表：伺服器。
- 使用者按了「喜歡」按鈕，數字加一：瀏覽器，因為要回應按下去的動作。
- 呼叫付費服務，需要一把金鑰：伺服器，不然金鑰會被使用者看到。
- 記住使用者選的深色模式，存在 `localStorage`：瀏覽器，因為只有瀏覽器有 `localStorage`。

先不要管「怎麼切換」，之後幾集會一個一個教。現在只要養成習慣：看到一段程式，先問自己它在哪裡執行。

## 重點整理

- 伺服器能讀資料、保護祕密；瀏覽器能回應使用者操作、使用 `useState`。
- App Router 裡所有元件預設在伺服器上執行，叫 Server Component。
- Server Component 裡的 `console.log`，輸出在執行 `npm run dev` 的終端機，不在瀏覽器。
- 頁面可以在建置時預先渲染，也可以等使用者請求時才渲染。
