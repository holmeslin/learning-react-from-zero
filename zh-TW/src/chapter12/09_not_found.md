# `not-found`

## 本集目標

網址存在、但是找不到對應資料的時候（例如不存在的書號），顯示「找不到」的畫面。

## 正文

### 兩種找不到

「找不到」有兩種情況：

1. **整個網址根本不存在**，例如 `/nowhere`。Next.js 會自動顯示一個預設的 404 頁面，你什麼都不用做。
2. **網址符合路由，但是資料不存在**，例如 `/books/999`。路由 `[id]` 確實存在，但是沒有編號 999 的書。這時 Next.js 不會知道它該算 404，要你自己告訴它。

### `notFound()`

在 `app/books/[id]/page.tsx` 裡，找不到書的時候呼叫 `notFound()`：

```tsx
// app/books/[id]/page.tsx
import { notFound } from "next/navigation";
import { books, getBook } from "@/app/lib/books";

export function generateStaticParams() {
  return books.map((book) => ({ id: book.id }));
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

`notFound` 從 `next/navigation` 引入。呼叫它會立刻中斷這個元件的渲染，改成顯示 404 畫面。

仔細看 TypeScript 的部分：我們在 `if (!book)` 裡呼叫了 `notFound()`，之後的程式碼裡，`book` 就不再是 `Book | undefined`，而是確定有值的 `Book`，所以可以直接寫 `book.title`，不用再寫 `book?.title`。這是因為 `notFound()` 的型別告訴 TypeScript：「呼叫了它，程式就不會往下走。」

### 自訂 404 畫面

現在打開 `/books/999`，會看到 Next.js 預設的 404 頁面。想要自己設計，就在同一個資料夾放一個 `not-found.tsx`：

```tsx
// app/books/[id]/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <main>
      <h1>找不到這本書</h1>
      <p>書號可能打錯了，或是這本書已經下架。</p>
      <Link href="/books">回到書籍列表</Link>
    </main>
  );
}
```

`not-found.tsx` 和 `loading.tsx` 一樣，是 Next.js 認得的特殊檔名。放在 `app/books/[id]/`，就代表這個資料夾的頁面呼叫 `notFound()` 時，會顯示它。再打開 `/books/999`，就會看到你設計的畫面。

如果想要自訂 `/nowhere` 這種「整個網址不存在」的畫面，在 `app/` 根目錄放一個 `not-found.tsx`。

### 搜尋引擎會怎麼看

網頁找不到的時候，伺服器通常會回傳 HTTP 狀態碼 `404`，搜尋引擎看到就知道「這頁不存在，不要收錄」。

Next.js 的情況稍微複雜一點。因為網頁是邊算邊送的（第 8 集 `loading.tsx` 就是例子），如果在內容開始送出之前就發現找不到，會回傳 `404`；但如果內容已經開始送出，狀態碼就只能維持在 `200`，不能再改。

不管是哪一種，Next.js 都會自動在網頁裡加上 `<meta name="robots" content="noindex" />`，告訴搜尋引擎不要收錄。所以你不用擔心這件事。

你可以自己驗證：打開 `/books/999`，用 `view-source:` 檢視原始碼，會找到那行 `noindex`。

## 重點整理

- 網址完全不存在，Next.js 會自動顯示預設的 404 頁面。
- 網址符合路由、但資料不存在時，要自己呼叫 `notFound()`。
- 呼叫 `notFound()` 之後，TypeScript 知道程式不會往下走，所以可以放心使用後面的值。
- `not-found.tsx` 可以自訂找不到的畫面，放在哪個資料夾就管哪裡。
- 找不到的頁面會自動加上 `noindex`，告訴搜尋引擎不要收錄。
