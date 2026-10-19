# `useEffectEvent`

## 本集目標

用 `useEffectEvent` 讓 Effect 讀到最新的值，又不會因為那個值改變而重新執行。

## 正文

### 一個兩難

第 4 集說過，Effect 裡用到的 props 和 state 都要寫進依賴陣列。但有時候這會造成困擾。

來看一個聊天室：連上房間時，如果使用者沒有開靜音，就印出通知。

```jsx
import { useEffect, useState } from "react";

function ChatRoom({ roomId, muted }) {
  useEffect(() => {
    console.log(`連線到 ${roomId}`);
    const timer = setTimeout(() => {
      if (!muted) console.log(`🔔 已連上 ${roomId}`);
    }, 500);
    return () => {
      clearTimeout(timer);
      console.log(`離開 ${roomId}`);
    };
  }, [roomId, muted]);

  return <p>聊天室：{roomId}</p>;
}

export default function App() {
  const [muted, setMuted] = useState(false);

  return (
    <>
      <label>
        <input
          type="checkbox"
          checked={muted}
          onChange={(e) => setMuted(e.target.checked)}
        />
        靜音
      </label>
      <ChatRoom roomId="general" muted={muted} />
    </>
  );
}
```

這裡的計時器模擬「連線需要一點時間，連上才通知」。Effect 用到 `roomId` 和 `muted`，所以依賴陣列兩個都寫了，合乎規則。

但勾選「靜音」看看 Console：

```text
連線到 general
離開 general
連線到 general
```

只是切換靜音，卻整個重新連線了。這顯然不合理：**換不換房間，才需要重新連線；靜音與否只影響要不要通知。**

### 區分「同步」與「事件」

Effect 裡的程式碼其實有兩種：

- **同步**：連線到 `roomId` 這個房間。`roomId` 變了就該重新連。
- **事件**：連上之後「通知一下」。它只是剛好在 Effect 裡被觸發，每次觸發時只需要讀到最新的 `muted`，不需要因為 `muted` 變了而重跑整個 Effect。

React 提供 `useEffectEvent`，專門把「事件」的部分切出來：

```jsx
import { useEffect, useEffectEvent, useState } from "react";

function ChatRoom({ roomId, muted }) {
  const onConnected = useEffectEvent(() => {
    if (!muted) console.log(`🔔 已連上 ${roomId}`);
  });

  useEffect(() => {
    console.log(`連線到 ${roomId}`);
    const timer = setTimeout(() => onConnected(), 500);
    return () => {
      clearTimeout(timer);
      console.log(`離開 ${roomId}`);
    };
  }, [roomId]);

  return <p>聊天室：{roomId}</p>;
}

export default function App() {
  const [muted, setMuted] = useState(false);

  return (
    <>
      <label>
        <input
          type="checkbox"
          checked={muted}
          onChange={(e) => setMuted(e.target.checked)}
        />
        靜音
      </label>
      <ChatRoom roomId="general" muted={muted} />
    </>
  );
}
```

改了兩個地方：

1. 把「通知」的邏輯包進 `useEffectEvent`，得到 `onConnected`。
2. Effect 的依賴陣列只剩 `[roomId]`，不用再寫 `muted`，也不用寫 `onConnected`。

現在勾選靜音，Console 不會有任何新輸出，不會重新連線。而且如果你在連線的 0.5 秒內勾選靜音，通知也不會出現，因為 `onConnected` 被呼叫的時候，讀到的是**最新**的 `muted`。

### 使用規則

`useEffectEvent` 很容易被誤用，記住這幾條：

- **只能在 Effect 裡面呼叫**（或在另一個 Effect Event 裡），不要在渲染過程中呼叫，也不要把它當成 props 傳給別的元件。
- **不要把它放進依賴陣列。** 它每次渲染都是新的函式，放進去也沒有意義。
- **不要拿它來逃避依賴規則。** 如果某個值變了，Effect 確實應該重新同步，就該把它留在依賴陣列裡。`useEffectEvent` 只用在「概念上是事件，只是剛好從 Effect 裡面觸發」的邏輯。

### 版本與工具

`useEffectEvent` 從 React 19.2 起是正式功能，不需要額外設定。如果你的 ESLint 還是要求把 `onConnected` 加進依賴陣列，表示 `eslint-plugin-react-hooks` 的版本太舊，把它升到最新版就好。

## 重點整理

- Effect 裡有些邏輯是「同步」（值變了要重跑），有些是「事件」（只需要讀最新值）。
- `useEffectEvent` 把「事件」的部分切出來，它不會變成 Effect 的依賴，卻永遠讀到最新的 props 和 state。
- 只在 Effect 裡呼叫，不傳給別的元件，不放進依賴陣列。
- 值變了真的該重新同步時，不要用它來逃避依賴陣列。
