# `'use client'`

## 本集目標

用 `"use client"` 把一個元件變成 Client Component，讓它可以使用狀態和事件。

## 正文

### 讓書有「喜歡」按鈕

我們來做一個按讚按鈕：點一下，數字加一。這需要 `useState` 和 `onClick`，所以必須是 Client Component。

新增 `app/ui/like-button.tsx`：

```tsx
// app/ui/like-button.tsx
"use client";

import { useState } from "react";

export default function LikeButton({ initialLikes }: { initialLikes: number }) {
  const [likes, setLikes] = useState(initialLikes);

  return <button onClick={() => setLikes(likes + 1)}>👍 {likes}</button>;
}
```

和你第一部寫的元件完全一樣，唯一的差別是**檔案的第一行**：

```tsx
"use client";
```

這行字叫做 `"use client"` **指令**（directive）。它一定要寫在檔案的最上面，在所有 `import` 之前。有了它，這個檔案裡的元件就會在瀏覽器裡執行，才能用 `useState`、`onClick`。

雙引號或單引號都可以，但分號不是必要的。

### 在頁面使用它

接著修改 `app/books/[id]/page.tsx`，把按鈕放進書的頁面：

```tsx
// app/books/[id]/page.tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { books, getBook } from "@/app/lib/books";
import LikeButton from "@/app/ui/like-button";

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
      <LikeButton initialLikes={book.likes} />
    </main>
  );
}
```

`BookPage` 是 Server Component，它從資料裡拿出 `book.likes`，用 props 傳給 Client Component `LikeButton`。打開 `/books/1`，會看到「👍 12」，點一下變成 13，再點變成 14。

這就是 Server Component 和 Client Component 合作的典型模式：**伺服器負責讀資料，瀏覽器負責互動。** 資料單向地從 Server 流向 Client。

### Client Component 也會在伺服器上跑一次

這裡有一個常見的誤會：「Client Component 只在瀏覽器裡執行。」不完全對。

為了讓使用者一打開網頁就有內容可看，Next.js 會先在伺服器上把 Client Component 也渲染成 HTML，放進送出去的網頁裡。瀏覽器收到後，再下載它的 JavaScript，讓按鈕「活起來」，這個過程叫做 **hydration**（注水）。

你可以用 `view-source:` 看 `/books/1` 的原始碼，會找到按鈕已經以初始狀態出現在 HTML 裡了：數字 12 就在裡面。

所以 Client Component 的真正意思是：**這個元件的程式碼會被送到瀏覽器，並且在瀏覽器裡執行（包含互動）。** 它第一次的畫面，還是先在伺服器上算出來。

這也意味著，Client Component 在第一次渲染的時候，同樣沒有 `window` 可以用，因為那時它還在伺服器上。要用 `window` 之類的東西，要放在 `useEffect` 裡，那時候已經在瀏覽器了。

### 什麼時候需要 `"use client"`

當元件需要這些東西，就要寫：

- `useState`、`useReducer`、`useEffect` 等 Hook
- `onClick`、`onChange` 等事件處理
- 只有瀏覽器才有的東西，例如 `window`、`localStorage`
- 自訂 Hook（因為它們通常會用到上面那些東西）

如果沒有這些需求，就不要寫。Server Component 是預設，也是比較好的選擇。

## 重點整理

- 在檔案最上面寫 `"use client"`，檔案裡的元件就變成 Client Component，才能用狀態和事件。
- Server Component 讀資料，用 props 傳給 Client Component，資料單向流動。
- Client Component 第一次的畫面也會先在伺服器上算成 HTML，之後再到瀏覽器 hydration。
- 預設用 Server Component，只有需要 Hook、事件或瀏覽器專屬功能時才加 `"use client"`。
