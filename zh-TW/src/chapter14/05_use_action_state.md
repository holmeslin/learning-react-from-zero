# 搭配 `useActionState` 回傳錯誤

## 本集目標

讓 Server Function 在輸入有問題時，把錯誤訊息送回表單顯示。

## 正文

### 目前的問題

現在不管使用者填什麼，`sign` 都照單全收。名字或留言是空的，也會存進去。我們需要檢查輸入，在有問題的時候告訴使用者。

第 8 章你學過 `useActionState`：它接收一個 action 和初始狀態，回傳 `[state, formAction, pending]`。action 的回傳值會變成新的 `state`。這正好可以拿來傳錯誤訊息。

### 讓 Server Function 回傳狀態

用 `useActionState` 的 action，有兩個固定的規則：**第一個參數是上一次的狀態，第二個參數才是 `FormData`**。把 `sign` 改成這樣：

```ts
// app/guestbook/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { addMessage } from "@/app/lib/guestbook";

export type FormState = {
  error?: string;
  name?: string;
  text?: string;
};

export async function sign(
  _previous: FormState,
  formData: FormData,
): Promise<FormState> {
  const name = String(formData.get("name")).trim();
  const text = String(formData.get("text")).trim();

  if (name === "") return { error: "請輸入名字", name, text };
  if (text === "") return { error: "請輸入留言內容", name, text };

  await addMessage(name, text);
  revalidatePath("/guestbook");
  return {};
}
```

幾個細節：

- `FormState` 是我們自己定義的型別：`error` 是錯誤訊息，`name` 和 `text` 是使用者剛剛填的內容。型別可以從 `"use server"` 檔案匯出，因為它只存在於 TypeScript，建置時就會被拿掉。
- 第一個參數 `_previous` 這個例子用不到，所以開頭加底線，表示「我知道它在，但我不用」。
- `.trim()` 把前後的空白去掉，這樣只輸入空白鍵也會被當成沒填。
- 有錯誤時，我們回傳 `error`，同時把使用者填的內容也送回去，原因待會說明。
- 成功時回傳一個空物件 `{}`，表示沒有錯誤。

### 在表單裡使用

把 `app/ui/sign-form.tsx` 改成：

```tsx
// app/ui/sign-form.tsx
"use client";

import { useActionState } from "react";
import { sign, type FormState } from "@/app/guestbook/actions";

const initialState: FormState = {};

export function SignForm() {
  const [state, formAction, pending] = useActionState(sign, initialState);

  return (
    <form action={formAction}>
      <input name="name" placeholder="你的名字" />
      <textarea name="text" placeholder="想說的話" />
      {state.error && <p role="alert">{state.error}</p>}
      <button type="submit" disabled={pending}>
        {pending ? "送出中……" : "送出留言"}
      </button>
    </form>
  );
}
```

這個版本不用再自己寫 `useFormStatus` 的按鈕，因為 `useActionState` 第三個回傳值 `pending` 就能告訴你「正在送出」。

試試看：只填名字，不填留言，按送出。畫面會出現「請輸入留言內容」。

### 但是名字不見了

你可能注意到了：錯誤訊息出現，可是剛剛填的名字**被清空**了。

這是 React 的行為：用 `<form action={...}>` 送出表單之後，不管 action 成功或失敗，React 都會把表單的欄位重設成初始值。使用者辛辛苦苦打好的內容消失，很惱人。

這就是為什麼 `sign` 在失敗時把 `name` 和 `text` 一起回傳。我們可以把它們當成欄位的**預設值**：

```tsx,ignore
// app/ui/sign-form.tsx（只列出有改的部分）
<input name="name" placeholder="你的名字" defaultValue={state.name} />
<textarea name="text" placeholder="想說的話" defaultValue={state.text} />
```

欄位被重設的時候，會回到 `defaultValue` 的值，也就是使用者剛剛填的內容。

再試一次：只填名字，送出，錯誤訊息出現，而名字還在。填完留言再送出，成功之後欄位會清空，因為成功時我們回傳 `{}`，`state.name` 和 `state.text` 都是 `undefined`。

完整的 `app/ui/sign-form.tsx`：

```tsx
// app/ui/sign-form.tsx
"use client";

import { useActionState } from "react";
import { sign, type FormState } from "@/app/guestbook/actions";

const initialState: FormState = {};

export function SignForm() {
  const [state, formAction, pending] = useActionState(sign, initialState);

  return (
    <form action={formAction}>
      <input name="name" placeholder="你的名字" defaultValue={state.name} />
      <textarea name="text" placeholder="想說的話" defaultValue={state.text} />
      {state.error && <p role="alert">{state.error}</p>}
      <button type="submit" disabled={pending}>
        {pending ? "送出中……" : "送出留言"}
      </button>
    </form>
  );
}
```

### 錯誤要用「回傳」，不要用 `throw`

你可能想問：為什麼不直接 `throw new Error("請輸入名字")`？

因為**預期中會發生的錯誤**（使用者忘了填），應該當成正常的結果回傳，讓表單能優雅地顯示。`throw` 是留給「不該發生的事」（檔案壞了、程式有 bug），丟出去之後，錯誤會交給第 12 章的 `error.tsx` 處理，整個區塊換成錯誤畫面，連表單都消失了，這不是你希望使用者在忘了填欄位時看到的。

## 重點整理

- 搭配 `useActionState` 的 Server Function，第一個參數是上一次的狀態，第二個參數才是 `FormData`。
- 預期內的錯誤（使用者輸入有誤）用「回傳」告訴表單，不要 `throw`。
- action 結束後 React 會重設表單欄位，要保留使用者的輸入，就把內容一起回傳，再放進 `defaultValue`。
- `useActionState` 的第三個值 `pending` 可以取代 `useFormStatus` 來控制按鈕。
- 型別可以從 `"use server"` 檔案匯出，因為建置時會被拿掉。
