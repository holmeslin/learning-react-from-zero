# `useRef` 存值

## 本集目標

用 `useRef` 保存一個「改了不需要重新渲染」的值。

## 正文

### state 以外的另一種記憶

第 5 章學過，元件函式每次渲染都會重新執行，裡面的普通變數會被重設。要讓值在渲染之間保留下來，你用的是 `useState`；但 `useState` 有個副作用：每次更新都會觸發重新渲染。

有些值需要被記住，卻不需要影響畫面，這時候用 `useRef`：

```jsx
import { useRef, useState } from "react";

export default function App() {
  const countRef = useRef(0);
  const [count, setCount] = useState(0);

  return (
    <>
      <p>
        ref：{countRef.current}　state：{count}
      </p>
      <button
        onClick={() => {
          countRef.current += 1;
          console.log("ref 現在是", countRef.current);
        }}
      >
        ref +1
      </button>
      <button onClick={() => setCount(count + 1)}>state +1</button>
    </>
  );
}
```

`useRef(0)` 回傳一個物件，長得像 `{ current: 0 }`。你讀寫的是它的 `current` 屬性。React 保證這個物件在每次渲染之間都是同一個。

### 做個實驗

照順序操作：

1. 連按三次「ref +1」。畫面上的 `ref：` 還是 0，但 Console 印出 1、2、3。
2. 按一下「state +1」。畫面一口氣變成 `ref：3　state：1`。

```text
ref 現在是 1
ref 現在是 2
ref 現在是 3
```

`countRef.current` 確實一直在變，只是改它不會通知 React 重新渲染，所以畫面沒更新。直到你按了 state 的按鈕觸發渲染，畫面才讀到最新的值。

這個實驗是為了讓你看清楚 ref 和 state 的差別。實際寫程式時，**不要在渲染過程中讀寫 `ref.current`**，否則元件的畫面會變得不可預測。ref 只在事件處理函式和 Effect 裡讀寫。

### 什麼時候用 ref

典型的用途是保存「你需要記住、但畫面不需要知道」的東西，例如計時器的編號：

```jsx
import { useRef, useState } from "react";

export default function Stopwatch() {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef(null);

  function start() {
    if (intervalRef.current !== null) return;
    intervalRef.current = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);
  }

  function stop() {
    clearInterval(intervalRef.current);
    intervalRef.current = null;
  }

  return (
    <>
      <p>已經過 {seconds} 秒</p>
      <button onClick={start}>開始</button>
      <button onClick={stop}>停止</button>
    </>
  );
}
```

`setInterval` 會回傳一個編號，之後要停止就得拿這個編號去呼叫 `clearInterval`。這個編號需要在「開始」和「停止」兩個按鈕之間共用，但它不會顯示在畫面上，所以放在 ref 最合適。會顯示在畫面上的 `seconds` 則用 state。

這個範例有個小缺點：如果元件在計時中途消失，計時器還會繼續跑。第 5 集會教你怎麼處理。

### 怎麼選：ref 還是 state？

問自己一個問題：**這個值變了，畫面需要跟著變嗎？**

- 需要：用 state。
- 不需要：用 ref。

## 重點整理

- `useRef(初始值)` 回傳 `{ current: 初始值 }`，在每次渲染之間保持同一個物件。
- 改 `ref.current` 不會觸發重新渲染。
- 不要在渲染過程中讀寫 `ref.current`，只在事件處理函式和 Effect 裡用。
- 畫面要跟著變的用 state，不影響畫面的用 ref。
