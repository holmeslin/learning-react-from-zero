# 輸入驗證與安全

## 本集目標

知道 Server Function 是對外公開的入口，並學會在函式內檢查輸入、確認使用者有沒有權限。

## 正文

這一集是整章最重要的一集。請慢慢讀。

### Server Function 是公開的

直覺上你會覺得：Server Function 只有我的表單會呼叫它，所以表單怎麼設計，使用者就怎麼用。

這個想法是**錯的**。Server Function 的本質是一個 `POST` 端點，任何人只要知道怎麼發請求，就能直接呼叫它，完全不需要經過你的網頁。你在表單上設定的 `required`、`maxLength`，只是在瀏覽器裡幫使用者的小提示，**不是防線**。

我們實際來試試。下面的 `curl` 指令是 macOS 或 Linux 終端機的寫法，Windows 的讀者照著打不一定能跑，只要看懂結果就好。

確認你的 `npm run dev` 還開著，先取得 `signThenLeave` 這個 Server Function 的代號（`/guestbook/new` 頁面的表單裡有）：

```bash
curl -s localhost:3000/guestbook/new | grep -o 'ACTION_ID_[0-9a-f]*' | head -1
```

會印出一串像 `ACTION_ID_4004129c8…` 的東西。把它複製下來，接著用 `curl` 直接送出一個**沒有名字欄位**、而且留言長達 5000 字的請求（把指令裡的 `ACTION_ID_…` 換成你剛剛複製的）：

```bash
curl -s -o /dev/null -w "%{http_code}\n" \
  -F '$ACTION_ID_複製來的那一串=' \
  --form-string "text=$(printf '啊%.0s' $(seq 1 5000))" \
  localhost:3000/guestbook/new
```

打開 `data/messages.json`，你會看到一則名字叫 `"null"`、內容有 5000 個「啊」的留言。

這裡有兩個問題：

1. 沒有名字欄位時，`formData.get("name")` 回傳 `null`，我們用 `String(null)` 把它轉成了字串 `"null"`。
2. 沒有人限制留言長度。`maxLength={200}` 只是表單上的設定，繞過表單就沒用了。

Next.js 有幫你做的事：官方文件說明，Server Function 會比對請求的 `Origin` 和 `Host`，不相同就拒絕，所以別的網站上的網頁，沒辦法偷偷替你的使用者送出表單。我試過帶一個陌生的 `Origin` 送出，伺服器回了 500，資料沒有寫入。

但這擋不住直接在自己電腦上發請求的人。**所以每個 Server Function，都要把收到的所有資料當成不可信的，在函式裡面自己檢查。**

### 寫一個驗證函式

驗證邏輯會被好幾個地方用到，把它獨立成一個普通的函式（不是 Server Function）。新增 `app/lib/validate.ts`：

```ts
// app/lib/validate.ts
const maxNameLength = 20;
const maxTextLength = 200;

export type ValidationResult =
  | { ok: true; name: string; text: string }
  | { ok: false; error: string; name: string; text: string };

export function validateMessage(
  rawName: unknown,
  rawText: unknown,
): ValidationResult {
  const name = typeof rawName === "string" ? rawName.trim() : "";
  const text = typeof rawText === "string" ? rawText.trim() : "";

  if (name === "") return { ok: false, error: "請輸入名字", name, text };
  if (name.length > maxNameLength) {
    return { ok: false, error: `名字最多 ${maxNameLength} 個字`, name, text };
  }
  if (text === "") {
    return { ok: false, error: "請輸入留言內容", name, text };
  }
  if (text.length > maxTextLength) {
    return { ok: false, error: `留言最多 ${maxTextLength} 個字`, name, text };
  }
  return { ok: true, name, text };
}
```

重點在前兩行：參數的型別是 `unknown`，意思是「我不知道它是什麼」，這正是實際的情況。`typeof rawName === "string"` 先確認它真的是字串，不是的話就當成空字串，絕不會再出現 `"null"` 這種結果。

回傳值是一個「有兩種可能」的型別：`ok` 是 `true` 時帶著乾淨的資料，`ok` 是 `false` 時帶著錯誤訊息。呼叫的人檢查 `result.ok` 之後，TypeScript 就知道該用哪一種。

> 這裡我們手寫驗證。如果表單有很多欄位、規則很複雜，官方文件建議用 Zod 或 Valibot 這類專門的函式庫，用一份「規格」描述資料該長什麼樣子。原理一樣：永遠在伺服器上檢查。我們只有兩個欄位，就不多裝一個套件了。

### 在 Server Function 裡使用

把 `app/guestbook/actions.ts` 的 `sign` 和 `signThenLeave` 都改成呼叫它：

```ts
// app/guestbook/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { addMessage } from "@/app/lib/guestbook";
import { validateMessage } from "@/app/lib/validate";

export type FormState = {
  error?: string;
  name?: string;
  text?: string;
};

export async function sign(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const result = validateMessage(formData.get("name"), formData.get("text"));
  if (!result.ok) {
    return { error: result.error, name: result.name, text: result.text };
  }

  await addMessage(result.name, result.text);
  revalidatePath("/guestbook");
  return {};
}

export async function signThenLeave(formData: FormData) {
  const result = validateMessage(formData.get("name"), formData.get("text"));
  if (!result.ok) return;

  await addMessage(result.name, result.text);
  revalidatePath("/guestbook");
  redirect("/guestbook");
}
```

用 `result.name`、`result.text` 存檔，這兩個是驗證過、去掉空白的乾淨資料。

表單上也可以順手加上 `maxLength`，讓正常使用者在輸入時就得到提示。把 `app/ui/guestbook-board.tsx` 的兩個欄位改成：

```tsx,ignore
<input
  name="name"
  placeholder="你的名字"
  maxLength={20}
  defaultValue={state.name}
/>
<textarea
  name="text"
  placeholder="想說的話"
  maxLength={200}
  defaultValue={state.text}
/>
```

再把剛剛那兩個 `curl` 指令重新跑一次：這次什麼都沒有寫進 `data/messages.json`。這就是驗證擋住了它。

**前端的檢查是給使用者看的體貼，伺服器的檢查才是真正的防線。兩個都要有。**

### 輸出會不會被注入？

你可能聽過 XSS：有人留言寫 `<script>alert(1)</script>`，結果在別人的瀏覽器裡執行。

好消息是 React 在渲染文字的時候，會自動把 `<`、`>` 這類字元轉義。你可以試試：送出一則內容是 `<script>alert(1)</script>` 的留言，頁面上會看到這串字原封不動地顯示出來，沒有任何東西被執行。只要你沒有用 `dangerouslySetInnerHTML`（名字就是在警告你），就不用擔心。

### 權限：誰可以刪除留言

驗證確保「資料長得對」，**權限**確保「這個人有資格做這件事」。我們來加一個只有管理者能用的刪除功能。

我們沒有登入系統，所以用最簡單的方式示範原理：管理者的瀏覽器裡有一個叫 `admin` 的 cookie，內容要等於一組只有伺服器知道的暗號。真實的網站會用正式的登入機制，但「在伺服器上檢查身分」這個觀念完全一樣。

暗號放在環境變數裡，不寫在程式碼中。在專案根目錄新增 `.env.local`，內容如下（環境變數第 15 章會仔細說明，先照抄；改完要重新啟動 `npm run dev`）：

```text
ADMIN_TOKEN=demo-secret-token
```

先在 `app/lib/guestbook.ts` 最後面加上刪除的函式：

```ts
// app/lib/guestbook.ts（接在檔案最後）
export async function removeMessage(id: string) {
  const messages = await getMessages();
  await saveMessages(messages.filter((message) => message.id !== id));
}
```

接著在 `app/guestbook/actions.ts` 加上 `deleteMessage`。最上面的 import 要補上 `cookies`，並把 `removeMessage` 加進 `@/app/lib/guestbook` 的 import：

```ts
// app/guestbook/actions.ts
import { cookies } from "next/headers";
import { addMessage, removeMessage } from "@/app/lib/guestbook";

// ...（原本的函式照舊）

export async function deleteMessage(formData: FormData) {
  const expected = process.env.ADMIN_TOKEN;
  const token = (await cookies()).get("admin")?.value;
  if (!expected || token !== expected) {
    throw new Error("Unauthorized");
  }

  const id = formData.get("id");
  if (typeof id !== "string") return;

  await removeMessage(id);
  revalidatePath("/guestbook");
}
```

這個函式最重要的是前四行：**一開始就檢查身分，不通過就丟出錯誤，什麼事都不做。**

`!expected` 這一段不能省。如果你忘了設定 `ADMIN_TOKEN`，`expected` 是 `undefined`；沒有 cookie 的人，`token` 也是 `undefined`，而 `undefined !== undefined` 是 `false`，檢查就放行了！加上 `!expected`，沒設定暗號的時候一律拒絕。

### 頁面上的按鈕只是方便

頁面上要讓管理者看到刪除按鈕，其他人看不到。把 `app/guestbook/page.tsx` 的 `Board` 改成：

```tsx
// app/guestbook/page.tsx
import { cookies } from "next/headers";
import { Suspense } from "react";
import { getMessages } from "@/app/lib/guestbook";
import { GuestbookBoard } from "@/app/ui/guestbook-board";

async function Board() {
  const messages = await getMessages();
  const expected = process.env.ADMIN_TOKEN;
  const token = (await cookies()).get("admin")?.value;
  const isAdmin = !!expected && token === expected;
  return <GuestbookBoard messages={messages} isAdmin={isAdmin} />;
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

`app/ui/guestbook-board.tsx` 收下 `isAdmin`，並且在每則留言旁邊，管理者才看得到刪除按鈕：

```tsx
// app/ui/guestbook-board.tsx（只列出有改的部分）
import { deleteMessage, sign, type FormState } from "@/app/guestbook/actions";

type Props = { messages: Message[]; isAdmin: boolean };

export function GuestbookBoard({ messages, isAdmin }: Props) {
  // ...（中間不變）

  return (
    <>
      {/* ...（表單不變）*/}
      <ul>
        {optimisticMessages.map((message) => (
          <li key={message.id}>
            <strong>{message.name}</strong>：{message.text}
            {isAdmin && (
              <form action={deleteMessage}>
                <input type="hidden" name="id" value={message.id} />
                <button type="submit">刪除</button>
              </form>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
```

看到了嗎？頁面和 `deleteMessage` 各檢查了一次，**這不是重複，是必要的**。頁面上的檢查，只決定「要不要把按鈕畫出來」；真正擋人的是 `deleteMessage` 裡面那一次。因為不用按鈕，任何人也可以直接對 `deleteMessage` 發請求。

證明給你看。先在瀏覽器登入成管理者：打開開發者工具，Application（或「儲存空間」）→ Cookies，新增一個叫 `admin`、值是 `demo-secret-token` 的 cookie，重新整理，每則留言旁邊就出現「刪除」按鈕了。

用管理者的身分，取得刪除表單的代號和一則留言的 `id`：

```bash
curl -s -b "admin=demo-secret-token" localhost:3000/guestbook \
  | grep -o 'ACTION_ID_[0-9a-f]*' | sort -u
```

然後**不帶 cookie** 直接送刪除請求（`id` 換成 `data/messages.json` 裡某一則的 `id`）：

```bash
curl -s -o /dev/null -w "%{http_code}\n" \
  -F '$ACTION_ID_複製來的那一串=' -F "id=某一則留言的id" \
  localhost:3000/guestbook
```

會回傳 `500`，`npm run dev` 的終端機印出 `Error: Unauthorized`，`data/messages.json` 的內容完全沒變。帶上 `-b "admin=demo-secret-token"` 再送一次，留言才會被刪掉。

### 回傳值也要小心

最後一件事：Server Function 的回傳值會被送到瀏覽器。只回傳畫面需要的東西，不要把整筆資料庫紀錄原封不動丟回去，裡面可能有不該給使用者看的欄位。我們的 `sign` 只回傳 `error`、`name`、`text`，這是刻意的。

## 重點整理

- Server Function 是公開的 `POST` 端點，任何人都能直接呼叫，不需要經過你的網頁。
- 表單上的 `required`、`maxLength` 只是給使用者的提示；真正的檢查必須在 Server Function 裡做。
- 收到的資料先當成 `unknown`，確認型別、去掉空白、檢查長度，再使用。
- 需要權限的操作（例如刪除），在函式一開始就檢查身分，不通過就丟出錯誤。
- 頁面上藏起按鈕不算保護，Server Function 自己一定要再檢查一次。
- 環境變數沒設定時，要拒絕而不是放行；只回傳畫面需要的資料。
