# `useTransition`

## 本集目標

用 `useTransition` 讓切換內容時保留舊畫面，而不是閃一下載入中。

## 正文

### 切換分頁時的閃爍

假設有三個分頁，每個分頁的內容要花一秒載入，用 `use` 讀取。先看最直覺的寫法：

```jsx
import { Suspense, use, useState } from "react";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const cache = new Map();

function loadTab(name) {
  if (!cache.has(name)) {
    cache.set(name, delay(1000).then(() => `${name}的內容`));
  }
  return cache.get(name);
}

function TabContent({ name }) {
  const content = use(loadTab(name));
  return <p>{content}</p>;
}

export default function App() {
  const [tab, setTab] = useState("首頁");

  return (
    <>
      {["首頁", "動態", "設定"].map((name) => (
        <button key={name} onClick={() => setTab(name)}>
          {name}
        </button>
      ))}
      <Suspense fallback={<p>載入中……</p>}>
        <TabContent name={tab} />
      </Suspense>
    </>
  );
}
```

重新整理後等「首頁」載入完成，再按「動態」：原本的「首頁的內容」**馬上消失**，換成「載入中……」，一秒後才出現「動態的內容」。

這很突兀：使用者本來看得好好的內容，一點按就被抽掉，換成一個載入畫面。

### 把更新標記成「轉場」

React 有個概念叫**轉場**（transition）：標記某個更新「不緊急，可以慢慢來」。如果轉場的更新會讓畫面暫停等資料，React 不會馬上換成 `fallback`，而是**繼續顯示舊的畫面**，在背景準備新的，準備好才一次換過去。

用 `useTransition` 來標記：

```jsx
import { Suspense, use, useState, useTransition } from "react";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const cache = new Map();

function loadTab(name) {
  if (!cache.has(name)) {
    cache.set(name, delay(1000).then(() => `${name}的內容`));
  }
  return cache.get(name);
}

function TabContent({ name }) {
  const content = use(loadTab(name));
  return <p>{content}</p>;
}

export default function App() {
  const [tab, setTab] = useState("首頁");
  const [isPending, startTransition] = useTransition();

  function selectTab(name) {
    startTransition(() => setTab(name));
  }

  return (
    <>
      {["首頁", "動態", "設定"].map((name) => (
        <button key={name} onClick={() => selectTab(name)}>
          {name}
        </button>
      ))}
      <p>{isPending ? "切換中……" : "　"}</p>
      <Suspense fallback={<p>載入中……</p>}>
        <TabContent name={tab} />
      </Suspense>
    </>
  );
}
```

這次按「動態」：

1. 「首頁的內容」**留在畫面上**，不會被抽掉。
2. 上方出現「切換中……」，告訴使用者正在處理。
3. 一秒後，畫面一次換成「動態的內容」，「切換中……」消失。

### 逐行看

```jsx,ignore
const [isPending, startTransition] = useTransition();
```

`useTransition()` 回傳兩個東西：

- **`isPending`**：轉場進行中時是 `true`，可以用來顯示「切換中」。
- **`startTransition`**：一個函式，把你的更新放進去，那個更新就會被視為轉場。

```jsx,ignore
startTransition(() => setTab(name));
```

把 `setTab(name)` 包進 `startTransition` 裡就好，其他程式碼不用改。

### 什麼時候用

轉場適合「更新會讓畫面暫停等資料」的情況：切換分頁、換頁、更換選取的項目。「使用者的輸入」例如在輸入框打字，不要放進轉場，那種更新要立刻反映，不能延後。

另外要注意：第一次載入頁面時，畫面上沒有舊的內容可以留，所以還是會顯示 `fallback`。轉場只管「已經有內容之後的切換」。

## 重點整理

- 一般的 `setState` 如果讓元件暫停，React 會立刻換成 `<Suspense>` 的 `fallback`，舊內容被抽掉。
- 用 `startTransition` 包住更新，React 會繼續顯示舊畫面，等新內容準備好再一次換過去。
- `useTransition()` 回傳 `[isPending, startTransition]`，`isPending` 可用來顯示「切換中」。
- 轉場用在切換內容；使用者打字這類需要立刻反映的更新不要用。
