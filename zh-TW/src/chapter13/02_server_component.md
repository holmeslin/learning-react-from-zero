# Server Component 是什麼

## 本集目標

知道 Server Component 能做什麼、不能做什麼，並且看懂「在 Server Component 裡用了 `useState`」的錯誤訊息。

## 正文

### Server Component 就是一般的函式

Server Component 沒有任何特殊語法。它就是一個回傳 JSX 的函式，和第一部的元件一模一樣：

```tsx
export default function Greeting() {
  return <p>你好</p>;
}
```

差別只在於：它**在哪裡執行**。這個元件執行在伺服器上，算出 `<p>你好</p>` 之後，把結果送給瀏覽器。瀏覽器拿到的只有結果，沒有這個函式的程式碼。

### 為什麼要在伺服器上做

三個好處：

1. **能直接存取資料**。資料庫、檔案、內部的 API，伺服器都能直接碰，不需要先做一個 API 讓瀏覽器來呼叫。
2. **祕密留在伺服器**。金鑰、密碼寫在 Server Component 裡，使用者永遠看不到。
3. **瀏覽器下載的 JavaScript 比較少**。Server Component 的程式碼不會送到瀏覽器，用在元件裡的大型套件也是。例如你要把文字從 Markdown 轉成 HTML，用了一個很大的套件，這個套件如果只在 Server Component 用，使用者就不用下載它。

### 它不能做什麼

Server Component 只執行一次，把結果算出來就結束了，不會「活著」等使用者操作。所以這些東西都用不了：

- `useState`、`useReducer`：它沒有「之後會改變的狀態」。
- `useEffect`：它沒有「畫面出現之後再執行」這種時機。
- `onClick`、`onChange` 等事件處理：沒有瀏覽器，誰來點？
- 只有瀏覽器才有的東西，例如 `window`、`localStorage`。

### 看看會發生什麼

故意犯個錯。建立一個 `app/counter/page.tsx`：

```tsx
import { useState } from "react";

export default function CounterPage() {
  const [count, setCount] = useState(0);

  return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
```

儲存之後，開發伺服器會顯示錯誤：

```text
Error: You're importing a module that depends on `useState` into a React Server Component module. This API is only available in Client Components. To fix, mark the file (or its parent) with the `"use client"` directive.
```

意思是：「你在 Server Component 裡引入了依賴 `useState` 的東西。這個 API 只能在 Client Component 使用。要修正，請在檔案（或它的上層）加上 `"use client"`。」

這個錯誤訊息很實用，它直接告訴你問題在哪、怎麼修。下一集就會學到 `"use client"`。

看完之後，把 `app/counter` 整個資料夾刪掉。

### 常見的疑問

**「那使用者點按鈕，要由誰處理？」** 由 Client Component 處理，下一集就會學到。Server Component 負責把畫面準備好，互動的部分交給瀏覽器裡的元件。

**「那我到底該把元件寫成哪一種？」** 一個簡單的原則：**預設用 Server Component，只有真的需要互動的時候，才改用 Client Component。** 而且要讓 Client Component 越小越好，只包住需要互動的那一小塊。

## 重點整理

- Server Component 就是一般的元件函式，差別只在它在伺服器上執行，只把結果送給瀏覽器。
- 好處：直接存取資料、祕密不外洩、瀏覽器下載的 JavaScript 比較少。
- 不能用 `useState`、`useEffect`、`onClick`，也不能用 `window` 或 `localStorage`。
- 在 Server Component 用 `useState` 會得到明確的錯誤，提示你加上 `"use client"`。
- 預設用 Server Component，需要互動的地方才換成 Client Component。
