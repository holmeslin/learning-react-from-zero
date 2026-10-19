# 獨立檔案與 `'use server'`

## 本集目標

把 Server Function 搬到獨立的檔案，讓 Client Component 也能使用它。

## 正文

### 想在 Client Component 裡用

上一集的 `sign` 寫在 Server Component 裡，沒有問題。但如果你想讓按鈕在送出時顯示「送出中……」，就需要 `useFormStatus`，而 Hook 只能在 Client Component 裡用。

那把 `sign` 直接寫在 Client Component 裡可以嗎？新增 `app/ui/sign-form.tsx` 試試：

```tsx
// app/ui/sign-form.tsx
"use client";

export function SignForm() {
  async function sign(formData: FormData) {
    "use server";
    console.log("收到簽名：", formData.get("name"));
  }

  return (
    <form action={sign}>
      <input name="name" />
    </form>
  );
}
```

執行 `npm run build`，會出現這個錯誤：

```text
Error: It is not allowed to define inline "use server" annotated Server Actions in Client Components.
```

意思是：**不能在 Client Component 裡直接定義 Server Function。** 原因很簡單：Client Component 的程式碼會被送到瀏覽器，而 Server Function 應該留在伺服器上，兩者不能放在同一個檔案裡。

### 解法：獨立的檔案

把 Server Function 搬到另一個檔案，並且把 `"use server"` 寫在**整個檔案的最上面**。新增 `app/guestbook/actions.ts`：

```ts
// app/guestbook/actions.ts
"use server";

export async function sign(formData: FormData) {
  const name = formData.get("name");
  console.log("收到簽名：", name);
}
```

檔案最上面有 `"use server"`，代表這個檔案裡**所有 `export` 出去的函式**，都是 Server Function。

接著 Client Component 就可以用 `import` 把它拿來用：

```tsx
// app/ui/sign-form.tsx
"use client";

import { useFormStatus } from "react-dom";
import { sign } from "@/app/guestbook/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? "送出中……" : "簽名"}
    </button>
  );
}

export function SignForm() {
  return (
    <form action={sign}>
      <input name="name" placeholder="你的名字" />
      <SubmitButton />
    </form>
  );
}
```

然後把頁面改成使用它：

```tsx
// app/guestbook/page.tsx
import { SignForm } from "@/app/ui/sign-form";

export default function GuestbookPage() {
  return (
    <main>
      <h1>留言板</h1>
      <SignForm />
    </main>
  );
}
```

存檔後試試看，終端機一樣會印出「收到簽名：……」。

### 瀏覽器拿到的是什麼

`sign-form.tsx` 是 Client Component，它 `import` 了 `sign`，但瀏覽器**沒有**拿到 `sign` 裡面的程式碼。瀏覽器拿到的只是「要呼叫伺服器上哪一個函式」的一個代號。按下按鈕時，瀏覽器把代號和表單內容送給伺服器，伺服器再去執行真正的函式。

所以放在 Server Function 裡的東西（讀檔案、金鑰、資料庫連線）不會洩漏給瀏覽器。

### 檔案裡只能匯出非同步函式

`"use server"` 檔案有一個限制。如果你在 `actions.ts` 裡匯出一個普通的常數：

```ts
// app/guestbook/actions.ts
"use server";

export const MAX_LENGTH = 20;
```

建置時會出現錯誤：

```text
Error: Only async functions are allowed to be exported in a "use server" file.
```

只有 `async function` 能匯出。常數、普通函式要放在別的檔案，這一章稍後會看到這樣的安排。（型別，例如 `export type`，因為建置時就會被拿掉，所以可以匯出。）

### 什麼時候寫在元件裡，什麼時候放獨立檔案

- 只在一個 Server Component 裡用，函式很短：直接寫在元件裡（上一集的做法）。
- 要在 Client Component 裡用，或是好幾個地方共用：放在獨立的 `"use server"` 檔案。

之後這一章的 Server Function，都會放在 `app/guestbook/actions.ts`。

## 重點整理

- Client Component 裡不能直接定義 Server Function。
- 在檔案最上面寫 `"use server"`，檔案裡所有匯出的函式都是 Server Function。
- Client Component 可以 `import` 這些函式，瀏覽器只會拿到呼叫它們的代號，拿不到內容。
- `"use server"` 檔案只能匯出 `async function`。
