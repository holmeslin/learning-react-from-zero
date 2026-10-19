# `revalidatePath`

## 本集目標

資料改變之後，通知 Next.js 重新讀取，讓畫面跟著更新。

## 正文

### 為什麼沒有更新

上一集的結果是：送出留言之後，資料存進去了，但畫面沒變，重新整理才看得到。

原因是 Next.js 為了讓頁面快，會把渲染的結果記起來。`sign` 只管寫檔案，它沒有告訴 Next.js「資料已經變了，請重新渲染」。所以頁面還是顯示舊的結果。

### 通知它：`revalidatePath`

`revalidatePath` 的意思是「這個網址的資料過期了，下次請重新產生」。在 Server Function 裡，寫完資料之後呼叫它：

```ts
// app/guestbook/actions.ts
"use server";

import { revalidatePath } from "next/cache";
import { addMessage } from "@/app/lib/guestbook";

export async function sign(formData: FormData) {
  const name = String(formData.get("name"));
  const text = String(formData.get("text"));
  await addMessage(name, text);
  revalidatePath("/guestbook");
}
```

再試一次：輸入留言，送出。這次留言**立刻**出現在列表裡，不用重新整理。

Next.js 在做的事情是：`sign` 執行完之後，伺服器知道 `/guestbook` 過期了，於是順便把更新後的畫面，跟 `sign` 的結果一起回傳給瀏覽器。整個過程只需要一次往返。

### 另一種：`refresh`

如果你只是想「重新載入目前這個頁面」，也可以用 `refresh`：

```ts
import { refresh } from "next/cache";

// 在 Server Function 的最後
refresh();
```

`refresh` 重新整理的是目前使用者正在看的頁面，不需要指定網址。要注意的是，它只是讓畫面重新讀取，**不會**讓第 15 章的快取失效。目前我們的頁面沒有用到快取，所以兩者效果一樣；`revalidatePath` 比較精確，也比較不容易在日後踩雷，所以這一章用它。

### 寫完資料就要通知

這是一個很容易忘記的步驟：**每一個會改變資料的 Server Function，結尾都要想一想「畫面上有哪些東西需要更新」。** 沒有通知，就會出現這一集一開始的狀況：資料改了，畫面沒變。

第 15 章會介紹更精確的做法：不指定網址，而是指定「哪一份資料」過期，所有用到它的頁面一起更新。

## 重點整理

- 光是修改資料，畫面不會自動更新，Next.js 會記住渲染的結果。
- 在 Server Function 結尾呼叫 `revalidatePath("/網址")`，通知 Next.js 重新渲染那個頁面。
- 更新後的畫面會跟 Server Function 的結果一起回傳，不需要多一次請求。
- 每個會改資料的 Server Function，都要記得通知畫面更新。
