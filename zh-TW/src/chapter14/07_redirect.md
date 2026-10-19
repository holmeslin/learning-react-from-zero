# `redirect`

## 本集目標

在 Server Function 做完事情之後，把使用者帶到另一個頁面。

## 正文

### 另一種流程：寫完留言就回列表

有些網站的設計是「專門一個頁面寫留言，送出之後回到列表」。這時候，Server Function 需要在存完資料後，把使用者導向別的網址。

這就是 `redirect` 的工作。新增一個專門寫留言的頁面 `app/guestbook/new/page.tsx`：

```tsx
// app/guestbook/new/page.tsx
import { signThenLeave } from "@/app/guestbook/actions";

export default function NewMessagePage() {
  return (
    <main>
      <h1>寫一則留言</h1>
      <form action={signThenLeave}>
        <input name="name" placeholder="你的名字" />
        <textarea name="text" placeholder="想說的話" />
        <button type="submit">送出</button>
      </form>
    </main>
  );
}
```

在 `app/guestbook/actions.ts` 加上 `signThenLeave`，並且在最上面多匯入 `redirect`：

```ts
// app/guestbook/actions.ts
import { redirect } from "next/navigation";

// ...（原本的 sign 照舊）

export async function signThenLeave(formData: FormData) {
  const name = String(formData.get("name")).trim();
  const text = String(formData.get("text")).trim();
  if (name === "" || text === "") return;

  await addMessage(name, text);
  revalidatePath("/guestbook");
  redirect("/guestbook");
}
```

`redirect` 要從 `next/navigation` 匯入，不是 `next/cache`。

打開 <http://localhost:3000/guestbook/new>，填完送出，你會被帶回 `/guestbook`，新留言已經在列表裡了。

目前如果名字或留言是空的，函式什麼都不做就 `return`，使用者按了沒反應。這不是好設計，第 8 集會改善。

### 順序很重要：先 `revalidatePath`，再 `redirect`

注意 `signThenLeave` 的最後兩行。`redirect` 一定要放在最後，因為它的運作方式是**丟出一個特殊的例外**，一呼叫，函式就在那一行結束，後面的程式碼都不會執行。

所以任何要做的事，包括 `revalidatePath`，都要寫在 `redirect` 前面。

### 不要把 `redirect` 放進 `try`/`catch`

這是最常見的錯誤。想像你為了保險，把整段包進 `try`/`catch`：

```ts
export async function signThenLeave(formData: FormData) {
  // ...驗證略

  try {
    await addMessage(name, text);
    revalidatePath("/guestbook");
    redirect("/guestbook");
  } catch (error) {
    console.log("抓到錯誤：", error);
    return;
  }
}
```

再送出一次留言。留言存進去了，但是你**沒有被導向**，還留在 `/guestbook/new`，而伺服器的終端機印出：

```text
抓到錯誤： Error: NEXT_REDIRECT
```

原因就是剛才說的：`redirect` 是用丟出例外的方式運作，名字叫 `NEXT_REDIRECT`。你的 `catch` 把它接住了，Next.js 就收不到「請導向」的訊息。

解決辦法很簡單：**只把真正可能出錯的部分放進 `try`，`redirect` 留在 `try`/`catch` 的外面。**

```ts
export async function signThenLeave(formData: FormData) {
  // ...驗證略

  try {
    await addMessage(name, text);
  } catch (error) {
    console.error("寫入留言失敗：", error);
    return;
  }

  revalidatePath("/guestbook");
  redirect("/guestbook");
}
```

這樣寫檔案出錯時會被你接住，而 `redirect` 丟出的例外不會被誤抓。

### `redirect` 的用途

除了表單送出後導向，`redirect` 也常用在「沒有權限就導去登入頁」之類的判斷。在 Server Component 裡也能使用。

## 重點整理

- 在 Server Function 裡呼叫 `redirect("/網址")`，使用者就會被帶到那個頁面。
- `redirect` 從 `next/navigation` 匯入。
- `redirect` 是丟出一個例外，一呼叫後面的程式碼就不會執行，所以要放在最後，`revalidatePath` 放在它前面。
- 不要把 `redirect` 包在 `try`/`catch` 裡，否則導向會被你的 `catch` 吃掉。
