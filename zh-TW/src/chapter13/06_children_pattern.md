# 把 Server Component 當 `children` 傳入

## 本集目標

在 Client Component 裡面放進 Server Component，讓「需要互動的外殼」和「在伺服器上算的內容」同時存在。

## 正文

### 一個兩難

上一集說過：Client Component 引入的東西，都會變成 Client Component。那麼問題來了：

我想做一個「點一下才展開」的簡介區塊。展開、收起需要 `useState`，所以它是 Client Component。但簡介的內容要從資料裡讀，最好留在伺服器上算。這可以兩全嗎？

可以，方法是**不要在 Client Component 裡面「引入」Server Component，而是用 `children` 把它傳進去。**

### 做出可以展開的區塊

新增 `app/ui/collapsible.tsx`，這是 Client Component，只負責「展開、收起」，完全不知道裡面放什麼：

```tsx
// app/ui/collapsible.tsx
"use client";

import { useState } from "react";

export default function Collapsible({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setOpen(!open)}>
        {open ? "收起來" : "看簡介"}
      </button>
      {open && <div>{children}</div>}
    </div>
  );
}
```

再新增 `app/ui/summary.tsx`，這是 Server Component（沒有 `"use client"`），負責顯示簡介：

```tsx
// app/ui/summary.tsx
import { getBook } from "@/app/lib/books";

export default function Summary({ id }: { id: string }) {
  const book = getBook(id);

  return <p>{book?.summary}</p>;
}
```

接著在書的頁面，把 `Summary` 放進 `Collapsible` 裡面。修改 `app/books/[id]/page.tsx`：

```tsx
// app/books/[id]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { books, getBook } from "@/app/lib/books";
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
    </main>
  );
}
```

打開 `/books/1`，點「看簡介」，簡介展開；再點一次，收起。

### 為什麼這樣可以

關鍵在這兩行：

```tsx
<Collapsible>
  <Summary id={id} />
</Collapsible>
```

`BookPage` 是 Server Component，`Summary` 是在 `BookPage` 裡被「使用」的，不是在 `Collapsible` 的檔案裡 `import` 的。所以：

- `Summary` 在**伺服器上**就渲染好了，產生 `<p>從一隻貓學寫第一行程式…</p>` 這個結果。
- `Collapsible` 拿到的 `children`，是一個「已經算好的結果」，不是一個要在瀏覽器裡執行的元件。
- 它的職責只剩下決定「要不要把這個結果顯示出來」。

你可以用 `view-source:` 看 `/books/1` 的原始碼。搜尋「從一隻貓學寫第一行程式」，你會發現這句話已經在網頁裡了，而且是算好的 `<p>`，也就是 `Summary` 的輸出。即使簡介目前是收起來的，內容已經準備好了，等你點按鈕才顯示。

### 把這個模式記起來

這個模式非常常見，可以整理成一句話：

> **Client Component 當外殼，用 `children`（或其他 props）接收 Server Component 傳進來的內容。**

常見的外殼有：對話視窗、可展開的區塊、分頁標籤、側邊欄。外殼負責互動，裡面的內容留在伺服器上。

對比一下錯誤的做法：如果在 `collapsible.tsx` 裡 `import Summary from "./summary"`，`Summary` 就會被拉進邊界裡，變成 Client Component。那時候它的 `getBook` 也要進瀏覽器，就失去了「在伺服器讀資料」的意義。

### 不只是 `children`

任何 prop 都可以這樣傳，例如：

```tsx
<Tabs
  overview={<Overview />}
  reviews={<Reviews />}
/>
```

`Tabs` 是 Client Component，負責切換分頁；`Overview` 和 `Reviews` 都是 Server Component，在伺服器上先算好。

## 重點整理

- Client Component 引入的東西會跟著進瀏覽器，所以不要在它裡面 `import` Server Component。
- 改用 `children`（或其他 props）傳入，Server Component 就會在伺服器上先渲染好。
- 這樣 Client Component 只負責互動的外殼，內容仍然在伺服器上算。
- 這個模式適用於對話視窗、可展開區塊、分頁標籤等需要互動的外殼。
