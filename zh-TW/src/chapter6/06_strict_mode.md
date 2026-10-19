# StrictMode 為什麼執行兩次

## 本集目標

理解開發模式下 Effect 和元件函式為什麼會多跑一次，以及這其實是在幫你抓錯。

## 正文

### 怪事：Effect 跑了兩次

用 Vite 建立的專案，`src/main.jsx` 裡有一個 `<StrictMode>` 包住整個 `<App />`：

```jsx,ignore
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

來看看它有什麼影響。把 `src/App.jsx` 換成：

```jsx
import { useEffect } from "react";

export default function App() {
  console.log("元件函式執行");

  useEffect(() => {
    console.log("✅ 連線");
    return () => console.log("❌ 斷線");
  }, []);

  return <p>聊天室</p>;
}
```

重新整理頁面，Console 裡會看到：

```text
元件函式執行
元件函式執行
✅ 連線
❌ 斷線
✅ 連線
```

只渲染了一次，卻出現兩次「元件函式執行」，而且 Effect 是「連線 → 斷線 → 連線」。這不是 bug。

### StrictMode 在做什麼

`StrictMode` 是 React 提供給**開發階段**用的檢查工具。它刻意做兩件事：

1. 把元件函式多執行一次，確認你的渲染是純粹的。純粹的函式跑兩次，結果會一樣。
2. 在元件第一次出現時，把 Effect 多跑一輪「設定 → 清除 → 設定」，確認你的清除函式有寫對。

這兩件事**只在開發模式發生**。用 `npm run build` 建置出來的正式版本，一切只會執行一次。

### 沒寫清除函式會怎樣

來看一個漏掉清除函式的錯誤範例：

```jsx
import { useEffect, useState } from "react";

export default function App() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    setInterval(() => setSeconds((s) => s + 1), 1000);
  }, []);

  return <p>{seconds} 秒</p>;
}
```

這個計時器應該每秒加 1，但在開發模式下，畫面上的數字**每秒加 2**。原因是 StrictMode 讓 Effect 跑了「設定 → 清除 → 設定」，而這個 Effect 沒有清除函式，第一個計時器沒被關掉，於是同時有兩個計時器在跑。

StrictMode 的多跑一輪，就是為了讓這種 bug 在開發時立刻浮現，而不是等到使用者的畫面出問題才發現。

修正的方法在上一集：加上清除函式。

```jsx,ignore
useEffect(() => {
  const id = setInterval(() => setSeconds((s) => s + 1), 1000);
  return () => clearInterval(id);
}, []);
```

加了之後，StrictMode 的「設定 → 清除 → 設定」就會變成：開一個計時器、關掉它、再開一個，最後只剩一個在跑，數字恢復成每秒加 1。

### 看到 Effect 執行兩次時該怎麼想

- **先檢查有沒有清除函式。** 大部分時候，Effect 跑兩次造成的問題，都是漏寫清除。
- **不要為了讓它只跑一次而移除 `StrictMode`。** 那只是把問題藏起來。
- **不要用 ref 去記「Effect 已經跑過了」來跳過第二次。** 好的 Effect 本來就該能承受「設定 → 清除 → 設定」。

## 重點整理

- 開發模式下，`StrictMode` 會把元件函式多執行一次，並讓 Effect 多跑一輪「設定 → 清除 → 設定」。
- 正式版本不會這樣，一切只執行一次。
- 這是刻意設計的檢查，用來抓出純粹性和清除函式的錯誤。
- Effect 跑兩次出問題，先找缺少的清除函式，不要拿掉 `StrictMode`。
