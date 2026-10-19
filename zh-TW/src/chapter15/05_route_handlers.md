# Route Handlers

## 本集目標

自己寫一個 API：讓別的程式用網址取得留言，也能用網址送出留言。

## 正文

### 為什麼還需要它

Server Function 很方便，但它是專門給你自己的網頁用的。如果你想讓**別的程式**，例如手機 App、另一個網站、或是自動化腳本，也能讀寫留言，就需要一個正式的 API：有固定的網址、固定的 HTTP 方法。

在 Next.js 裡，這叫 **Route Handler**。

### 第一個 Route Handler

在 `app` 底下建立資料夾 `api/messages`，裡面新增檔案 `route.ts`（注意檔名是 `route`，不是 `page`）：

```ts
// app/api/messages/route.ts
import { revalidateTag } from "next/cache";
import { addMessage, getMessages } from "@/app/lib/guestbook";
import { validateMessage } from "@/app/lib/validate";

export async function GET() {
  return Response.json(await getMessages());
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const result = validateMessage(body?.name, body?.text);
  if (!result.ok) {
    return Response.json({ error: result.error }, { status: 400 });
  }

  await addMessage(result.name, result.text);
  revalidateTag("messages", { expire: 0 });
  return Response.json({ ok: true }, { status: 201 });
}
```

這個檔案做的事情：

- **檔名 `route.ts`**：只要資料夾裡有 `route.ts`，這個網址就是一個 API。路徑就是資料夾的路徑，這裡是 `/api/messages`。
- **匯出的函式名稱就是 HTTP 方法**：`GET` 處理 `GET` 請求，`POST` 處理 `POST` 請求。支援 `GET`、`POST`、`PUT`、`PATCH`、`DELETE`、`HEAD`、`OPTIONS`。沒寫的方法，Next.js 自動回傳 405（不允許這個方法）。
- **用標準的 `Request` 和 `Response`**：這是瀏覽器和 Node.js 都有的標準，不是 Next.js 發明的。`Response.json(資料)` 會把資料轉成 JSON 回應。
- **還是要驗證輸入**：`POST` 是公開的入口，和第 14 章一樣。我們直接用同一個 `validateMessage`。`request.json()` 如果收到不是 JSON 的內容會丟出錯誤，所以後面接 `.catch(() => null)`，這時候 `body` 是 `null`，`body?.name` 就是 `undefined`，驗證函式會把它擋下來。
- **`revalidateTag("messages", { expire: 0 })`**：Route Handler 裡不能用 `updateTag`（它只限 Server Function），所以改用 `revalidateTag`。第二個參數寫 `{ expire: 0 }`，意思是「舊的快取不要再給任何人，下一個請求等新的」，這樣用 API 新增完留言，馬上用 `GET` 就能看到。

### 用 `curl` 試試看

先 `npm run build`，再 `npm run start`。我實際執行的結果如下。

取得留言（目前是空的）：

```bash
curl -s localhost:3000/api/messages
```

```text
[]
```

新增一則留言：

```bash
curl -s -w " [%{http_code}]\n" -X POST localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -d '{"name":"小明","text":"來自 API"}'
```

```text
{"ok":true} [201]
```

再取得一次，新留言已經在裡面：

```bash
curl -s localhost:3000/api/messages
```

```text
[{"id":"39cbea87-2213-4dfe-a63f-389edcd79b9c","name":"小明","text":"來自 API","createdAt":"2026-10-19T07:20:40.501Z"}]
```

送一個缺少名字的請求：

```bash
curl -s -w " [%{http_code}]\n" -X POST localhost:3000/api/messages \
  -H "Content-Type: application/json" \
  -d '{"text":"沒有名字"}'
```

```text
{"error":"請輸入名字"} [400]
```

試一個沒有寫的方法：

```bash
curl -s -o /dev/null -w "[%{http_code}]\n" -X DELETE localhost:3000/api/messages
```

```text
[405]
```

`400` 是「你的請求有問題」，`405` 是「不支援這個方法」，`201` 是「已建立」。API 回傳正確的狀態碼是良好的習慣，呼叫的人才能靠它判斷成功或失敗。

### 在 Route Handler 裡也能用快取

我們這個 `GET` 呼叫的是有快取的 `getMessages`，所以它回傳的是快取的結果，資料改變時由 `revalidateTag` 通知更新。要注意：如果你想在 Route Handler 本身使用 `"use cache"`，不能直接寫在處理函式的本體，要抽成一個獨立的函式（`getMessages` 就是）。

### `page.tsx` 和 `route.ts` 不能同層

在同一個資料夾裡，`page.tsx` 和 `route.ts` 不能同時存在，因為它們都想接管這個網址。所以 API 通常會放在 `app/api/...` 底下，和頁面分開。

### 什麼時候用哪一個

- 你自己網頁上的表單、按鈕要改資料：**Server Function**，最簡單。
- 要給別人的程式呼叫（手機 App、第三方服務、Webhook）：**Route Handler**。

## 重點整理

- 在 `app` 的資料夾裡建立 `route.ts`，匯出 `GET`、`POST` 等函式，就是一個 API。
- 它用的是標準的 `Request` 和 `Response`，用 `Response.json()` 回傳 JSON，並且設定正確的狀態碼。
- Route Handler 是公開入口，一樣要驗證輸入。
- Route Handler 裡用 `revalidateTag(標籤, { expire: 0 })` 立刻讓快取過期，不能用 `updateTag`。
- 自己網頁用 Server Function，給外部程式用 Route Handler。
