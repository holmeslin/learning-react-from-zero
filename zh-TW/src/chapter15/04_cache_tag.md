# `cacheTag`、`updateTag` 與 `revalidateTag`

## 本集目標

資料一改變，就主動讓相關的快取過期。

## 正文

### 回到留言板

第 14 章，我們用 `revalidatePath("/guestbook")` 通知畫面更新。現在我們要把留言列表**快取起來**，因為留言不會一直變動，沒必要每個人來都重新讀一次檔案。

但快取了就有個問題：有人新增留言的時候，快取要怎麼知道該更新了？

### 貼標籤：`cacheTag`

做法是替被快取的資料貼上一個「標籤」。之後只要對這個標籤說「過期了」，所有貼著它的快取就一起作廢。

打開 `app/lib/guestbook.ts`。我們要把「讀留言」拆成兩個函式：

- `readMessages`：直接讀檔案，沒有快取，永遠讀到最新的。
- `getMessages`：給畫面用的，加上快取和標籤。

修改後的相關部分如下：

```ts
// app/lib/guestbook.ts
import { cacheLife, cacheTag } from "next/cache";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

// ...（Message 型別和 file 常數不變）

async function readMessages(): Promise<Message[]> {
  try {
    return JSON.parse(await readFile(file, "utf8"));
  } catch (error) {
    // 檔案還不存在，代表還沒有人留言
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
}

export async function getMessages(): Promise<Message[]> {
  "use cache";
  cacheLife("max");
  cacheTag("messages");
  return readMessages();
}

// saveMessages 不變

export async function addMessage(name: string, text: string) {
  const messages = await readMessages();
  // ...（其餘不變）
}

export async function removeMessage(id: string) {
  const messages = await readMessages();
  // ...（其餘不變）
}
```

注意三件事：

- 原本叫 `getMessages` 的那個讀檔函式，改名成 `readMessages`；新的 `getMessages` 是包在外面、有快取的版本。
- `addMessage` 和 `removeMessage` 要**寫入之前先讀現在的資料**，所以它們用 `readMessages`，不能用有快取的版本，否則可能根據過期的資料去覆蓋檔案。
- `cacheLife("max")` 搭配 `cacheTag`：因為我們打算在資料改變時主動讓它過期，不需要靠時間，所以壽命開到最長。

建置之後，`/guestbook` 的路由表多了時間資訊：

```text
├ ◐ /guestbook               30d      1y
```

### 不通知會怎樣

先看看沒有通知的後果。把 `app/guestbook/actions.ts` 裡所有的 `revalidatePath("/guestbook")` 先暫時註解掉，`npm run build` 再 `npm run start`，然後送出一則留言。

我實際試過：檔案裡有 2 則留言，但是不管我送出之後，還是重新整理，頁面都**一直只顯示 1 則**。快取沒有過期，頁面一直拿舊的。

### 通知：`updateTag`

把 `revalidatePath("/guestbook")` 換成 `updateTag("messages")`，並把 import 也改掉：

```ts
// app/guestbook/actions.ts
import { updateTag } from "next/cache";

// 在 sign、signThenLeave、deleteMessage 裡，
// 原本呼叫 revalidatePath("/guestbook") 的地方，改成
updateTag("messages");
```

重新建置後，送出留言，列表立刻更新了，不需要重新整理。

`updateTag` 的意思是「這個標籤的快取馬上作廢，下一次讀取就要等新資料」，適合使用者剛剛動手改了資料、馬上就想看到結果的情況。它只能在 Server Function 裡呼叫。

### 另一個選擇：`revalidateTag`

還有一個函式也能讓標籤過期，叫 `revalidateTag`，行為不太一樣：

```ts
import { revalidateTag } from "next/cache";

revalidateTag("messages", "max");
```

它使用的是剛剛學的 **stale-while-revalidate**：先把快取標成「過期」，下一個請求仍然拿到舊的，同時在背景重新產生，再下一個才是新的。第二個參數 `"max"` 是「舊的可以留多久」，官方建議填 `"max"`。

我實際試過：送出留言之後，頁面仍然顯示舊資料；重新整理一次，還是舊的；再重新整理一次，才是新的。

兩個怎麼選：

| | `updateTag` | `revalidateTag` |
| --- | --- | --- |
| 可以呼叫的地方 | 只有 Server Function | Server Function、Route Handler |
| 效果 | 馬上作廢 | 先給舊的，背景更新 |
| 適合 | 使用者自己改了資料，要立刻看到 | 稍微晚一點更新沒關係，例如別人更新的文章 |

留言板是使用者自己送出、自己要看到，所以選 `updateTag`。

### `revalidatePath` 呢

`revalidatePath` 不是不能用，但是它是用「網址」來判斷，而 `updateTag` 是用「資料」來判斷。同一份留言如果出現在好幾個頁面，貼一個標籤就一次全部更新，不用逐頁指定網址。官方文件也建議，能用標籤就用標籤。

## 重點整理

- 替快取貼標籤：`"use cache"` 的範圍裡呼叫 `cacheTag("名稱")`。
- 資料改變時，用標籤通知快取過期；沒有通知，快取就會一直是舊的。
- `updateTag` 馬上作廢，只能在 Server Function 裡用，適合使用者要立刻看到結果的情況。
- `revalidateTag(標籤, "max")` 是先給舊的、背景更新，Server Function 和 Route Handler 都能用。
- 會「讀了再寫」的函式，要用沒有快取的版本，避免根據過期資料覆蓋檔案。
