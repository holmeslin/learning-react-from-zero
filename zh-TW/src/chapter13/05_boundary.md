# Server 與 Client 的邊界

## 本集目標

理解 `"use client"` 劃出的是一條「邊界」，邊界以下的東西都會進到瀏覽器，並且學會保護只能在伺服器使用的程式碼。

## 正文

### `"use client"` 是邊界，不是標籤

上一集你可能以為：`"use client"` 就是替那一個元件貼標籤。其實更精確的說法是：它是**一條邊界**。

邊界的意思是：**從這個檔案開始，這個檔案 import 進來的所有東西，都會被包進瀏覽器要下載的 JavaScript 裡**，包括它直接渲染的子元件。

來看個例子：

```tsx
// app/ui/like-button.tsx（示意，不用輸入）
"use client";

import Heart from "./heart";   // 這個 Heart 沒寫 "use client"

export default function LikeButton() {
  return <button><Heart /></button>;
}
```

`Heart` 自己沒有寫 `"use client"`，但是它被一個 Client Component 引入，所以它也會變成 Client Component，跟著送到瀏覽器。

這是一個很重要的規則：**不需要在每一個要在瀏覽器執行的檔案都寫 `"use client"`，只要在邊界的入口寫一次就好。**

### 邊界越靠近葉子越好

既然邊界以下的東西都會送到瀏覽器，那麼邊界應該畫在哪裡？答案是：**盡量往下、越小越好。**

比較這兩種做法：

```text
壞的做法：整個 layout 加 "use client"
  layout（Client）
    導覽列（被迫變成 Client）
    搜尋框
    頁面內容（被迫變成 Client）
```

```text
好的做法：只有搜尋框加 "use client"
  layout（Server）
    導覽列（Server）
    搜尋框（Client）
    頁面內容（Server）
```

只有搜尋框真的需要互動，那就只替搜尋框寫 `"use client"`。其他部分留在伺服器上，使用者就少下載一大堆 JavaScript。

這也是為什麼上一集的 `LikeButton` 只有一個按鈕：我們沒有把整個書本頁面都變成 Client Component，只有「按讚」這一小塊是。

### 保護只能在伺服器用的程式碼

邊界還有另一個意思：被引入 Client Component 的檔案，會被使用者下載。如果那個檔案裡有金鑰，就等於把金鑰送給了所有人。

為了防止這種意外，有一個保險的辦法：在只能給伺服器用的檔案最上面，加上這一行：

```ts
import "server-only";
```

新增 `app/lib/secret.ts`：

```ts
// app/lib/secret.ts
import "server-only";

export const apiKey = "abc-123-secret";
```

`server-only` 的作用是：萬一有人（可能是未來的你）不小心在 Client Component 裡引入這個檔案，建置的時候就會直接報錯，而不是默默地把金鑰送出去。Next.js 內建支援它，不用另外安裝。

來試試看。建立一個 Client Component，故意去引入這個檔案：

```tsx
"use client";

import { apiKey } from "@/app/lib/secret";

export default function UsesSecret() {
  return <p>{apiKey}</p>;
}
```

並且在任何一個頁面使用它之後，會看到錯誤：

```text
Error: You're importing a module that depends on "server-only" into a React Client Component module. This API is only available in Server Components but one of its parents is marked with "use client", so this module is also a Client Component.
```

意思是：「你把依賴 `server-only` 的模組引入了 Client Component。這個 API 只能在 Server Component 使用，但它的某一個上層標記了 `"use client"`，所以這個模組也變成了 Client Component。」

看完之後，把這個故意寫錯的 Client Component 刪掉。`app/lib/secret.ts` 可以留著，只要沒有人引入它就不會有問題。

什麼樣的檔案值得加 `server-only`？任何放了金鑰、直接碰資料庫、或是只應該在伺服器上執行的檔案。

## 重點整理

- `"use client"` 是一條邊界：從這個檔案開始，它引入的所有東西都會進到瀏覽器。
- 不用替每個檔案都寫 `"use client"`，在邊界的入口寫一次就夠了。
- 邊界要畫得越靠近葉子越好，只讓真正需要互動的那一小塊變成 Client Component。
- 只能在伺服器使用的檔案，加上 `import "server-only"`，萬一被 Client Component 引入就會報錯。
