# 綜合練習：留言板

## 本集目標

確認留言板的每個功能都正常運作，再自己加上「按讚」，把這一章的觀念組合起來。

## 正文

這一集分成兩個部分：先用清單驗收你的留言板，再挑戰一個新功能。請先自己寫，卡住了再看提示，最後再對照參考解答。

### 第一部分：驗收清單

你的留言板應該符合下面每一項。對著你的程式，一項一項試過去：

1. 在 `/guestbook` 填名字和留言送出，留言立刻出現在列表上，而且重新整理後還在。
2. 只填名字或只填留言，會顯示錯誤訊息，而且剛剛填的欄位沒有被清空。
3. 名字超過 20 個字、留言超過 200 個字，伺服器會拒絕（用上一集的 `curl` 驗證）。
4. 送出的瞬間，留言就先出現（暫時把伺服器的等待加長 1 秒試試看）。
5. `/guestbook/new` 送出之後，會被導向 `/guestbook`。
6. 沒有 `admin` cookie 的人看不到刪除按鈕，用 `curl` 直接呼叫刪除也會失敗。
7. 有 `admin` cookie 的人可以刪除留言。
8. `npm run build` 可以成功。

如果有哪一項沒通過，回到對應的那一集檢查。

### 第二部分：挑戰：按讚

替每則留言加上「按讚」按鈕：

- 每則留言旁邊顯示「按讚 N」，N 是目前的讚數。
- 任何人都能按。按下去之後，數字**立刻**加一，不用等伺服器。
- 重新整理後，讚數還在。
- 舊的留言（`data/messages.json` 裡已經存在、沒有 `likes` 欄位的那些）要當成 0 個讚，不能出錯。
- 伺服器要檢查收到的資料：留言 `id` 不是字串，或是找不到這則留言的時候，什麼都不做。

### 提示

- `Message` 型別要多一個 `likes: number`。舊資料沒有這個欄位，讀檔的時候補成 0。
- 你需要一個新的 Server Function，接收留言的 `id`，在 JSON 檔裡找到這則留言，把 `likes` 加一，存檔，再通知畫面更新。
- 按讚按鈕要有自己的「樂觀的讚數」，所以把它拆成一個獨立的 Client Component，用 `useOptimistic` 管理讚數，更新函式是「目前的數字加上要加的量」。
- 按鈕可以做成一個只有隱藏 `id` 欄位的小表單，和刪除按鈕的做法一樣。

### 參考解答

寫完再看。

<details>
<summary>展開參考解答</summary>

首先是 `app/lib/guestbook.ts`。`Message` 多了 `likes`，讀檔時補上預設值，新增留言時從 0 開始，最後多一個 `likeMessage`：

```ts
// app/lib/guestbook.ts
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export type Message = {
  id: string;
  name: string;
  text: string;
  createdAt: string;
  likes: number;
};

const file = path.join(process.cwd(), "data", "messages.json");

export async function getMessages(): Promise<Message[]> {
  try {
    const messages: Message[] = JSON.parse(await readFile(file, "utf8"));
    // 舊留言沒有 likes 欄位，補成 0
    return messages.map((message) => ({
      ...message,
      likes: message.likes ?? 0,
    }));
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
    likes: 0,
  });
  await saveMessages(messages);
}

export async function removeMessage(id: string) {
  const messages = await getMessages();
  await saveMessages(messages.filter((message) => message.id !== id));
}

export async function likeMessage(id: string) {
  const messages = await getMessages();
  const message = messages.find((message) => message.id === id);
  if (!message) return;

  message.likes += 1;
  await saveMessages(messages);
}
```

接著在 `app/guestbook/actions.ts` 加一個 `like`，並把 `likeMessage` 加進最上面的 import：

```ts
// app/guestbook/actions.ts
import { addMessage, likeMessage, removeMessage } from "@/app/lib/guestbook";

// ...（原本的函式照舊）

export async function like(formData: FormData) {
  const id = formData.get("id");
  if (typeof id !== "string") return;

  await likeMessage(id);
  revalidatePath("/guestbook");
}
```

`like` 一開始就檢查 `id` 是不是字串，不是的話什麼都不做。`likeMessage` 裡找不到留言也會直接回傳。這就是上一集學的：不相信收到的任何資料。

然後新增按鈕元件 `app/ui/like-button.tsx`：

```tsx
// app/ui/like-button.tsx
"use client";

import { useOptimistic } from "react";
import { like } from "@/app/guestbook/actions";

export function LikeButton({ id, likes }: { id: string; likes: number }) {
  const [optimisticLikes, addLike] = useOptimistic(
    likes,
    (current, amount: number) => current + amount,
  );

  async function action(formData: FormData) {
    addLike(1);
    await like(formData);
  }

  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <button type="submit">按讚 {optimisticLikes}</button>
    </form>
  );
}
```

這裡的 `useOptimistic` 管理的是一個數字：真實的讚數是 `likes`，按下去先加 1，伺服器回應之後，`likes` 變成真正的新數字，樂觀的版本就被取代。

最後，在 `app/ui/guestbook-board.tsx` 匯入並使用它。因為 `Message` 多了 `likes`，建立樂觀留言的地方也要補上 `likes: 0`：

```tsx
// app/ui/guestbook-board.tsx（只列出有改的部分）
import { LikeButton } from "@/app/ui/like-button";

// 在 addOptimisticMessage({ ... }) 裡多加一行
//   likes: 0,

// 在每則留言的 <li> 裡，文字後面加上
<LikeButton id={message.id} likes={message.likes} />
```

完成後，我實際操作過：新增一則留言，按讚，數字在 100 毫秒內就變成 1；再按一次變成 2；重新整理後仍然是 2。

</details>

### 如果你想繼續挑戰

- 同一個人可以按無限多次讚，這不太合理。你能想到怎麼限制嗎？提示：伺服器得要「認得」是誰。
- 把按讚的 `likes += 1` 換成別的做法，思考「兩個人同時按讚」會發生什麼事。這和第 3 集提到的限制有關。

## 重點整理

- 這一章的 Server Function 有一套固定的流程：驗證輸入、檢查權限、改資料、通知畫面更新。
- 每個 Server Function 都是公開的入口，收到的資料一個都不能信。
- `useOptimistic` 不只可以管理列表，也可以管理一個數字，讓互動立刻有回應。
- 讀進來、改一筆、寫回去的做法，在多人同時操作時有風險，真正的資料庫會替你處理這個問題。
