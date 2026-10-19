# 讀寫 JSON 檔

## 本集目標

把留言存進 JSON 檔，並且在頁面上把它們讀出來。

## 正文

### 資料放哪裡

留言要保存下來，重新啟動伺服器也不能消失，所以不能只放在變數裡。正式的網站會用資料庫，但這本書的重點是 React 和 Next.js，所以我們用最簡單的做法：**一個 JSON 檔**。

JSON 你在第 2 章用過，`JSON.parse` 把文字變成物件，`JSON.stringify` 把物件變回文字。

### 讀寫檔案的函式

新增 `app/lib/guestbook.ts`：

```ts
// app/lib/guestbook.ts
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type Message = {
  id: string;
  name: string;
  text: string;
  createdAt: string;
};

const file = path.join(process.cwd(), "data", "messages.json");

export async function getMessages(): Promise<Message[]> {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    // 檔案還不存在，代表還沒有人留言
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

async function saveMessages(messages: Message[]) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, JSON.stringify(messages, null, 2));
}

export async function addMessage(name: string, text: string) {
  const messages = await getMessages();
  messages.push({
    id: crypto.randomUUID(),
    name,
    text,
    createdAt: new Date().toISOString(),
  });
  await saveMessages(messages);
}
```

幾個地方解釋一下：

- `node:fs/promises` 是 Node.js 內建的檔案功能，`readFile` 讀檔、`writeFile` 寫檔，兩個都回傳 Promise，所以要 `await`。這個模組只能在伺服器上用，這正是 Server Component 和 Server Function 的好處。
- `process.cwd()` 是「目前專案的資料夾」，所以資料會存在專案根目錄的 `data/messages.json`。
- 檔案不存在的時候，`readFile` 會丟出錯誤，錯誤的 `code` 是 `"ENOENT"`。我們把這個情況當成「還沒有留言」，回傳空陣列；其他錯誤照樣丟出去，不要吞掉。
- `crypto.randomUUID()` 產生一串不會重複的亂數，當作留言的 `id`。
- `mkdir(..., { recursive: true })` 會在資料夾不存在時建立它；已經存在就什麼也不做。

`data/` 資料夾是執行時才會出現的資料，不是程式碼，建議你把 `data/` 加進專案的 `.gitignore`。

### 改 Server Function 和表單

把 `app/guestbook/actions.ts` 改成真的存檔：

```ts
// app/guestbook/actions.ts
"use server";

import { addMessage } from "@/app/lib/guestbook";

export async function sign(formData: FormData) {
  const name = String(formData.get("name"));
  const text = String(formData.get("text"));
  await addMessage(name, text);
}
```

表單多一個留言欄位：

```tsx
// app/ui/sign-form.tsx
"use client";

import { useFormStatus } from "react-dom";
import { sign } from "@/app/guestbook/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? "送出中……" : "送出留言"}
    </button>
  );
}

export function SignForm() {
  return (
    <form action={sign}>
      <input name="name" placeholder="你的名字" />
      <textarea name="text" placeholder="想說的話" />
      <SubmitButton />
    </form>
  );
}
```

`String(formData.get("name"))` 是先暫時的寫法，用來把可能是 `null` 或檔案的值硬轉成字串。第 8 集會告訴你這樣做有什麼問題。

### 在頁面上顯示留言

最直覺的寫法，是把頁面改成 `async`，直接 `await getMessages()`：

```tsx,ignore
// app/guestbook/page.tsx
import { getMessages } from "@/app/lib/guestbook";
import { SignForm } from "@/app/ui/sign-form";

export default async function GuestbookPage() {
  const messages = await getMessages();

  return (
    <main>
      <h1>留言板</h1>
      <SignForm />
      <ul>
        {messages.map((message) => (
          <li key={message.id}>
            <strong>{message.name}</strong>：{message.text}
          </li>
        ))}
      </ul>
    </main>
  );
}
```

執行 `npm run build`，會看到你在第 12 章遇過的錯誤：

```text
Error: Route "/guestbook": Next.js encountered uncached or runtime data during prerendering.
```

讀檔案是在等外部的資料，Next.js 沒辦法在建置時替它預先準備。解法和第 12 章一樣：用 `<Suspense>` 給它一個載入中的畫面。把讀留言的工作切成自己的元件：

```tsx
// app/guestbook/page.tsx
import { Suspense } from "react";
import { getMessages } from "@/app/lib/guestbook";
import { SignForm } from "@/app/ui/sign-form";

async function MessageList() {
  const messages = await getMessages();

  return (
    <ul>
      {messages.map((message) => (
        <li key={message.id}>
          <strong>{message.name}</strong>：{message.text}
        </li>
      ))}
    </ul>
  );
}

export default function GuestbookPage() {
  return (
    <main>
      <h1>留言板</h1>
      <SignForm />
      <Suspense fallback={<p>讀取留言中……</p>}>
        <MessageList />
      </Suspense>
    </main>
  );
}
```

這次 `npm run build` 會成功，`/guestbook` 旁邊的符號是 `◐`，意思是「外殼先送出去，留言串流進來」，第 15 章會詳細說明。

### 試試看

輸入一則留言送出。你會發現：**畫面上什麼都沒有改變。**

檢查專案裡的 `data/messages.json`，留言已經存進去了。重新整理頁面，留言就出現了。

資料有存進去，只是頁面沒有重新讀取。這是下一集要解決的問題。

### JSON 檔不是資料庫

這個做法適合學習和小型的自架網站，但要知道它的限制：

- 兩個人在同一瞬間送出留言，可能會互相蓋掉對方的資料，因為「讀進來、加一筆、寫回去」這三步中間沒有任何保護。
- 有些部署平台的檔案系統是唯讀的，或是每次部署就清空，檔案寫不進去或是會消失。第 15 章會再回頭談這件事。

網站要認真上線，就該換成真正的資料庫。好消息是：換掉的時候，只需要改 `app/lib/guestbook.ts` 這一個檔案，其他程式不用動。

## 重點整理

- 用 `node:fs/promises` 的 `readFile` 和 `writeFile` 讀寫 JSON 檔，這些功能只能在伺服器上用。
- 檔案不存在時，錯誤的 `code` 是 `"ENOENT"`，把它當成空資料，其他錯誤要丟出去。
- 在 Server Component 裡讀檔案要用 `<Suspense>` 包起來，不然 `npm run build` 會失敗。
- 光是改了資料，畫面不會自動更新，這是下一集的主題。
- JSON 檔適合學習，不適合同時有很多人寫入的網站。
