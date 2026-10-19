# 搭配 `useOptimistic`

## 本集目標

在伺服器還沒回應的時候，先把新留言顯示在畫面上。

## 正文

### 等待的時間

留言送出之後，要等伺服器寫完檔案、重新渲染，畫面才會更新。在自己的電腦上這很快，但真實的網路可能要等好幾百毫秒，使用者會懷疑「我有按到嗎？」

第 8 章的 `useOptimistic` 就是解決這個問題：**先假設一定會成功，立刻把結果顯示出來；等伺服器真的回應了，再用真實的資料取代它。**

### 先讓伺服器變慢

為了看清楚效果，我們在 `sign` 裡暫時加一段「等 1 秒」的程式碼，模擬網路很慢：

```ts
// app/guestbook/actions.ts（在 sign 裡，addMessage 之前）
await new Promise((resolve) => setTimeout(resolve, 1000));
await addMessage(name, text);
```

現在送出一則留言，你會發現：按鈕變成「送出中……」，但列表要等整整 1 秒才出現新留言。

### 讓列表和表單住在同一個 Client Component

`useOptimistic` 要同時管理列表和表單，所以它們得在同一個 Client Component 裡。新增 `app/ui/guestbook-board.tsx`，把上一集的 `sign-form.tsx` 的內容搬進去並擴充（完成後可以刪掉 `sign-form.tsx`）：

```tsx
// app/ui/guestbook-board.tsx
"use client";

import { useActionState, useOptimistic } from "react";
import type { Message } from "@/app/lib/guestbook";
import { sign, type FormState } from "@/app/guestbook/actions";

const initialState: FormState = {};

export function GuestbookBoard({ messages }: { messages: Message[] }) {
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (current, newMessage: Message) => [...current, newMessage],
  );

  const [state, formAction, pending] = useActionState(
    async (previous: FormState, formData: FormData) => {
      const name = String(formData.get("name")).trim();
      const text = String(formData.get("text")).trim();
      if (name !== "" && text !== "") {
        addOptimisticMessage({
          id: `optimistic-${Date.now()}`,
          name,
          text,
          createdAt: new Date().toISOString(),
        });
      }
      return sign(previous, formData);
    },
    initialState,
  );

  return (
    <>
      <form action={formAction}>
        <input name="name" placeholder="你的名字" defaultValue={state.name} />
        <textarea
          name="text"
          placeholder="想說的話"
          defaultValue={state.text}
        />
        {state.error && <p role="alert">{state.error}</p>}
        <button type="submit" disabled={pending}>
          {pending ? "送出中……" : "送出留言"}
        </button>
      </form>
      <ul>
        {optimisticMessages.map((message) => (
          <li key={message.id}>
            <strong>{message.name}</strong>：{message.text}
          </li>
        ))}
      </ul>
    </>
  );
}
```

這段程式碼比較長，我們拆開來看。

**`useOptimistic(messages, 更新函式)`**：第一個參數是「真實的資料」，也就是伺服器給的留言列表。第二個參數描述「怎麼把一則樂觀的新留言加進去」：拿到目前的列表 `current` 和新留言 `newMessage`，回傳加上新留言的新陣列。它回傳 `[optimisticMessages, addOptimisticMessage]`，畫面上要用 `optimisticMessages` 來渲染。

**在 action 裡先呼叫 `addOptimisticMessage`**：我們把原本直接傳給 `useActionState` 的 `sign`，包了一層。這個包裝函式先呼叫 `addOptimisticMessage(...)`，讓新留言馬上出現，再 `return sign(previous, formData)`，把真正的工作交給伺服器。

樂觀留言的 `id` 是暫時湊出來的 `optimistic-時間戳記`，只是為了讓 `key` 不重複。真正的 `id` 要等伺服器存檔後才有。

**只在欄位都有填的時候才樂觀更新**：如果名字或留言是空的，伺服器一定會拒絕，那就不要先假裝成功。這個判斷會多寫一份和伺服器重複的檢查，這是樂觀更新的代價：前端要猜伺服器的結果。

### 讓頁面把留言傳進去

`GuestbookBoard` 需要 `messages` 這個 props，所以頁面要在伺服器上讀完留言，再傳給它。把 `app/guestbook/page.tsx` 改成：

```tsx
// app/guestbook/page.tsx
import { Suspense } from "react";
import { getMessages } from "@/app/lib/guestbook";
import { GuestbookBoard } from "@/app/ui/guestbook-board";

async function Board() {
  const messages = await getMessages();
  return <GuestbookBoard messages={messages} />;
}

export default function GuestbookPage() {
  return (
    <main>
      <h1>留言板</h1>
      <Suspense fallback={<p>讀取留言中……</p>}>
        <Board />
      </Suspense>
    </main>
  );
}
```

這是上一章學過的「Server Component 讀資料，再用 props 傳給 Client Component」。

### 試試看

送出一則留言：按下按鈕的瞬間，留言就出現在列表裡，同時按鈕顯示「送出中……」。1 秒後伺服器回應，按鈕恢復，列表裡仍然只有這一則留言，沒有重複。

這是因為伺服器回應之後，`messages` 已經包含這則真正存好的留言，React 把樂觀的版本丟掉，換成真實的版本。如果伺服器出錯，樂觀的留言也一樣會消失，列表自動回到真實的狀態，使用者不會看到一則根本沒存成功的留言。

再試一次：只填名字，不填留言。你會看到錯誤訊息，列表裡沒有多出任何東西。

看完效果之後，記得把剛剛加的那行「等 1 秒」刪掉。

## 重點整理

- `useOptimistic(真實資料, 更新函式)` 回傳「樂觀的資料」和一個「新增樂觀項目」的函式。
- 在 action 裡先呼叫新增樂觀項目的函式，再去呼叫 Server Function，使用者就能立刻看到結果。
- 伺服器回應後，樂觀的資料會被真實的資料取代，失敗時也會自動還原。
- 列表和表單要共用樂觀的資料，所以得放進同一個 Client Component，由 Server Component 把資料傳進去。
- 樂觀更新要猜伺服器的結果，所以只對「幾乎一定會成功」的操作使用。
