# `useEffect`

## 本集目標

用 `useEffect` 在畫面更新之後，執行跟外部系統同步的程式碼。

## 正文

### 渲染要保持純粹

元件函式的工作，是根據 props 和 state 算出 JSX。它不該做別的事。如果你在元件函式的主體裡直接修改瀏覽器分頁的標題，React 可能會因為各種原因重複執行它，你就很難預期標題什麼時候被改、改了幾次。

所以「跟外部系統同步」的程式碼，要放進 **Effect**。外部系統指的是 React 管不到的東西：瀏覽器的分頁標題、計時器、伺服器連線、網路請求。

### 第一個 Effect

```jsx
import { useEffect, useState } from "react";

export default function App() {
  const [count, setCount] = useState(0);

  console.log("渲染，count 是", count);

  useEffect(() => {
    console.log("Effect 執行，count 是", count);
    document.title = `你點了 ${count} 次`;
  });

  return <button onClick={() => setCount(count + 1)}>點了 {count} 次</button>;
}
```

點幾次按鈕，同時觀察瀏覽器分頁上的標題，會跟著變成「你點了 N 次」。

`useEffect` 接收一個函式，React 會在**畫面更新完成之後**才執行它。Console 的輸出順序是：

```text
渲染，count 是 0
Effect 執行，count 是 0
渲染，count 是 1
Effect 執行，count 是 1
```

每一輪都是「先渲染，畫面更新，再執行 Effect」。

### Effect 不是用來處理點按的

你可能會想：點按鈕時改標題，直接寫在 `onClick` 裡不就好了嗎？

```jsx,ignore
// 這樣也行，但改標題這件事跟「點按」綁死了
onClick={() => {
  setCount(count + 1);
  document.title = `你點了 ${count + 1} 次`;
}}
```

兩種寫法的差別在於**原因**：

- 因為**使用者做了某個動作**（點按、輸入、送出）而要做的事，放在事件處理函式裡。
- 因為**元件出現在畫面上，或是它顯示的內容變了**而要做的事，放在 Effect 裡。

標題應該永遠反映 `count` 目前的值，不管 `count` 是被哪個按鈕、哪個動作改掉的。這種「讓外部系統跟著 state 走」的需求，就是 Effect 的工作。

### 每次渲染後都執行？

仔細看上面的範例，`useEffect` 只傳了一個函式，所以它在**每次渲染之後**都會執行。這常常不是你要的，例如連線到聊天室，你不會希望每次畫面更新都重新連一次。

下一集會教你用「依賴陣列」控制 Effect 什麼時候執行。

## 重點整理

- 元件函式主體只負責算出畫面；跟外部系統同步的事要放進 `useEffect`。
- Effect 會在畫面更新之後才執行。
- 因為使用者的動作而要做的事，放在事件處理函式；因為畫面顯示的內容變了而要同步的事，放在 Effect。
- 只傳一個函式給 `useEffect`，它會在每次渲染後都執行。
