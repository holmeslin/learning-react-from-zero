# 串流與 Suspense

## 本集目標

讓頁面「先出現能先出現的部分」，慢的部分準備好再補上。

## 正文

### 整頁等一個慢資料

書的頁面現在很快，因為資料就在記憶體裡。但是假設我們要在下面加上「讀者評論」，而評論要從另一個很慢的地方讀，需要 3 秒。

在 `app/lib/books.ts` 的最後面加上評論的資料和讀取函式：

```ts
// app/lib/books.ts（接在檔案最後）

export type Review = { id: string; bookId: string; text: string };

const reviews: Review[] = [
  { id: "r1", bookId: "1", text: "貓咪太可愛，連我阿嬤都學會了。" },
  { id: "r2", bookId: "1", text: "範例都跑得起來，推薦。" },
  { id: "r3", bookId: "2", text: "河馬畫得很傳神。" },
];

// 評論的資料更慢，等久一點
export async function getReviews(bookId: string) {
  await new Promise((resolve) => setTimeout(resolve, 3000));
  return reviews.filter((review) => review.bookId === bookId);
}
```

如果我們在頁面裡直接 `await getReviews(id)`，整個頁面都要等 3 秒才能出現，連書名、按讚按鈕這些明明很快就能顯示的東西也被拖住了。這對使用者很不友善。

### 串流

HTTP 回應不一定要一次送完，可以**一塊一塊地送**。這個技術叫做**串流**（streaming）：伺服器先把算好的部分送出去，剩下的等準備好再接著送。瀏覽器收到一塊就先顯示一塊。

React 用你熟悉的 `<Suspense>` 來決定「哪一塊可以晚一點」。把慢的元件包在 `<Suspense>` 裡，並且給它一個載入中的畫面（`fallback`）。頁面的其他部分不必等它。

### 實作

把評論拆成獨立的 Server Component，放進 `<Suspense>`。修改 `app/books/[id]/page.tsx`：

```tsx
// app/books/[id]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { books, getBook, getReviews } from "@/app/lib/books";
import Collapsible from "@/app/ui/collapsible";
import LikeButton from "@/app/ui/like-button";
import Summary from "@/app/ui/summary";

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

async function Reviews({ bookId }: { bookId: string }) {
  const reviews = await getReviews(bookId);

  return (
    <ul>
      {reviews.map((review) => (
        <li key={review.id}>{review.text}</li>
      ))}
    </ul>
  );
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
      <LikeButton initialLikes={book.likes} />
      <Collapsible>
        <Summary id={id} />
      </Collapsible>
      <h2>讀者評論</h2>
      <Suspense fallback={<p>評論載入中……</p>}>
        <Reviews bookId={id} />
      </Suspense>
    </main>
  );
}
```

重點是這三行：

```tsx
<Suspense fallback={<p>評論載入中……</p>}>
  <Reviews bookId={id} />
</Suspense>
```

`Reviews` 是一個 `async` 的 Server Component，要等 3 秒。因為包在 `<Suspense>` 裡，書名、按鈕、簡介等其他部分不用等它。

執行 `npm run build` 再 `npm run start`，打開 `/books/1`：書名和按鈕馬上出現，「評論載入中……」顯示 3 秒，然後換成真正的評論。

### 確認真的是串流

怎麼確認不是整頁等 3 秒才送出？用 `curl` 量一下時間（Windows 10 以後的 PowerShell 也有 `curl.exe`，但要把 `/dev/null` 改成 `NUL`）：

```bash
curl -s -o /dev/null -w "第一個位元組：%{time_starttransfer} 秒，全部完成：%{time_total} 秒\n" http://localhost:3000/books/1
```

結果會是這樣：

```text
第一個位元組：0.0025 秒，全部完成：3.0 秒
```

第一個位元組只花不到 0.01 秒就到了，但是整個回應要 3 秒才送完。這就是串流：頁面的外殼先到，評論晚點補上。

### 沒有 Suspense 會怎樣

Cache Components 開著的時候，如果頁面裡有尚未準備好的資料，而又沒有 `<Suspense>`（或 `loading.tsx`）包住，建置時就會報錯。第 12 章的第 6 集和第 8 集，你已經看過這個錯誤。

所以規則是：**會慢的東西，一定要有地方讓它「先顯示別的東西」。** `loading.tsx` 是替整個頁面包一層 `<Suspense>`；自己寫 `<Suspense>` 則可以精準地只包住慢的那一小塊。後者通常體驗更好，因為其他內容不必跟著等。

### 用 `use` 把 Promise 傳給 Client Component

有時候，慢的資料需要用在 Client Component 裡，例如評論列表要有互動。你不能在 Client Component 裡直接 `await`，但可以這樣做：

1. 在 Server Component 呼叫讀資料的函式，**不要 `await`**，直接把 Promise 傳下去。
2. 在 Client Component 用 React 的 `use` 讀取這個 Promise。

先新增 `app/ui/review-list.tsx`：

```tsx
// app/ui/review-list.tsx
"use client";

import { use } from "react";
import type { Review } from "@/app/lib/books";

export default function ReviewList({
  reviews,
}: {
  reviews: Promise<Review[]>;
}) {
  const list = use(reviews);

  return (
    <ul>
      {list.map((review) => (
        <li key={review.id}>{review.text}</li>
      ))}
    </ul>
  );
}
```

`use(reviews)` 會讀出 Promise 的結果。如果結果還沒到，它會讓這個元件「暫停」，交給最近的 `<Suspense>` 顯示載入中的畫面。這就是你在第 8 章學過的 `use`。

然後修改頁面，把 `Reviews` 換成 `ReviewList`：

```tsx
// app/books/[id]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { books, getBook, getReviews } from "@/app/lib/books";
import Collapsible from "@/app/ui/collapsible";
import LikeButton from "@/app/ui/like-button";
import ReviewList from "@/app/ui/review-list";
import Summary from "@/app/ui/summary";

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

  const reviews = getReviews(id);

  return (
    <main>
      <h1>{book.title}</h1>
      <LikeButton initialLikes={book.likes} />
      <Collapsible>
        <Summary id={id} />
      </Collapsible>
      <h2>讀者評論</h2>
      <Suspense fallback={<p>評論載入中……</p>}>
        <ReviewList reviews={reviews} />
      </Suspense>
    </main>
  );
}
```

注意 `const reviews = getReviews(id);` 沒有 `await`，所以 `reviews` 是一個 Promise。這個 Promise 作為 props 傳給 `ReviewList`，這在上一集說過是可以的。行為和之前一樣：先出現外殼，3 秒後出現評論。

兩種做法怎麼選？評論列表沒有互動的話，用前一種（`Reviews` 是 Server Component）就好，更簡單。只有當它需要 `useState` 這類互動，才用 `use` 的做法。

## 重點整理

- 串流是把網頁一塊一塊送出，先送算好的部分，慢的部分準備好再補上。
- 用 `<Suspense fallback={...}>` 包住會慢的元件，其他部分不必等它。
- 會慢的東西一定要有 `<Suspense>` 或 `loading.tsx` 包住，否則 Cache Components 會讓建置失敗。
- 慢的資料要用在 Client Component 時：在 Server Component 不 `await` 就傳 Promise，Client Component 用 `use` 讀取。
- 用 `curl` 量第一個位元組與全部完成的時間，可以確認是不是串流。
