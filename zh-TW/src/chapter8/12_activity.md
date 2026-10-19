# `<Activity>`

## 本集目標

用 `<Activity>` 把暫時用不到的元件藏起來，但保留它的 state。

## 正文

### 條件渲染會丟掉 state

假設有「收件匣」和「草稿」兩個分頁，草稿頁有一個輸入框。用第 4 章的條件渲染來切換：

```jsx
import { useEffect, useState } from "react";

function Draft() {
  const [text, setText] = useState("");

  useEffect(() => {
    console.log("草稿：Effect 設定");
    return () => console.log("草稿：Effect 清除");
  }, []);

  return (
    <textarea
      value={text}
      onChange={(e) => setText(e.target.value)}
      placeholder="寫點東西"
    />
  );
}

function Inbox() {
  return <p>你沒有新信件</p>;
}

export default function App() {
  const [tab, setTab] = useState("draft");

  return (
    <>
      <button onClick={() => setTab("inbox")}>收件匣</button>
      <button onClick={() => setTab("draft")}>草稿</button>
      {tab === "inbox" && <Inbox />}
      {tab === "draft" && <Draft />}
    </>
  );
}
```

在草稿裡打幾個字，切到「收件匣」，再切回「草稿」：**剛打的內容不見了**。因為切走的時候，`Draft` 從畫面上被移除，它的 state 跟著銷毀；切回來時，是全新建立的 `Draft`，state 回到初始值。

### 用 `<Activity>` 保留

React 19.2 加入的 `<Activity>` 可以解決這個問題：

```jsx
import { Activity, useEffect, useState } from "react";

function Draft() {
  const [text, setText] = useState("");

  useEffect(() => {
    console.log("草稿：Effect 設定");
    return () => console.log("草稿：Effect 清除");
  }, []);

  return (
    <textarea
      value={text}
      onChange={(e) => setText(e.target.value)}
      placeholder="寫點東西"
    />
  );
}

function Inbox() {
  return <p>你沒有新信件</p>;
}

export default function App() {
  const [tab, setTab] = useState("draft");

  return (
    <>
      <button onClick={() => setTab("inbox")}>收件匣</button>
      <button onClick={() => setTab("draft")}>草稿</button>
      <Activity mode={tab === "inbox" ? "visible" : "hidden"}>
        <Inbox />
      </Activity>
      <Activity mode={tab === "draft" ? "visible" : "hidden"}>
        <Draft />
      </Activity>
    </>
  );
}
```

同樣的操作：在草稿打字、切到「收件匣」、再切回「草稿」。這次**內容還在**。

### `mode` 屬性

`<Activity>` 只有一個重要的屬性 `mode`，兩個值：

- `"visible"`：正常顯示，和沒有包 `<Activity>` 一樣。
- `"hidden"`：藏起來。

藏起來的時候，React 做了三件事：

1. **畫面上看不到**：用 CSS 的 `display: none` 把裡面的元素隱藏，但元素還在，`textarea` 的內容也還在。
2. **保留 state**：元件沒有被銷毀，`useState` 的值都留著。
3. **清除 Effect**：藏起來時，裡面所有 Effect 的清除函式會執行；重新顯示時，Effect 會再設定一次。

看 Console，切到「收件匣」會印出「草稿：Effect 清除」，切回「草稿」又印出「草稿：Effect 設定」。這很合理：被藏起來的元件，不該繼續維持連線、計時器或事件監聽。

### 預先準備

如果一開始就把 `<Activity>` 設成 `hidden`，React 還是會把裡面的元件渲染出來（內容會在背景用較低的優先順序先準備好），但**不會**設定 Effect。等使用者切換過去的時候，畫面已經準備好了，可以更快顯示。

### 什麼時候用

- **分頁、側邊欄、可以收合的區塊**：使用者會來回切換，而且希望回來時狀態都還在（表單填到一半、捲動位置、展開的項目）。
- **預先載入使用者可能下一步會去的畫面**。

要注意的是，被藏起來的元件仍然存在，會佔用記憶體，裡面的 DOM 也還在。不要把大量用不到的東西通通用 `<Activity>` 藏著，只有真的需要保留狀態的地方才用。如果切走之後不在意狀態，用一般的條件渲染更單純。

### 這一章結束了

這一章學到的，都是 React 19 為「表單與非同步」帶來的新做法，加上幾個讓畫面更順暢的工具。第 9 章要學的是 React Router，讓你的應用程式有多個「頁面」。

## 重點整理

- 條件渲染會銷毀元件和它的 state；切回來時是全新的。
- `<Activity mode="hidden">` 把元件藏起來（`display: none`）但保留 state；`mode="visible"` 則正常顯示。
- 藏起來時，元件裡的 Effect 會被清除，重新顯示時再重新設定。
- 初始就設為 `hidden` 的內容會先在背景渲染，但不會執行 Effect。
- 只在需要保留狀態、使用者會來回切換的地方使用；不需要保留狀態時用一般的條件渲染。
