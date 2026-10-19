# 自訂 Hook

## 本集目標

把重複的 Effect 和 state 邏輯，抽成自己的 Hook。

## 正文

### 邏輯重複了

假設網頁有兩個地方都需要知道使用者有沒有連上網路：頂端的狀態列，和一個「儲存」按鈕。兩邊都要寫同樣的 state 和 Effect，非常重複。

這時候可以把重複的邏輯抽成一個函式，而且這個函式裡面可以放 `useState`、`useEffect` 這些 Hook。這種函式叫做**自訂 Hook**（custom Hook）。

```jsx
import { useEffect, useState } from "react";

function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  return isOnline;
}

function StatusBar() {
  const isOnline = useOnlineStatus();
  return <p>{isOnline ? "✅ 已連線" : "❌ 已斷線"}</p>;
}

function SaveButton() {
  const isOnline = useOnlineStatus();
  return (
    <button disabled={!isOnline}>
      {isOnline ? "儲存" : "斷線中，無法儲存"}
    </button>
  );
}

export default function App() {
  return (
    <>
      <StatusBar />
      <SaveButton />
    </>
  );
}
```

`navigator.onLine` 是瀏覽器內建的布林值，表示目前有沒有連上網路；斷線和恢復時，瀏覽器會分別發出 `offline` 和 `online` 事件。

要看效果：打開瀏覽器開發者工具，在「Network」分頁把節流設定改成「Offline」，狀態列和按鈕會立刻變成斷線的樣子，改回來又恢復。

`StatusBar` 和 `SaveButton` 都只要一行 `const isOnline = useOnlineStatus()`，就拿到最新的連線狀態，監聽與清除的細節全都藏在 `useOnlineStatus` 裡。

### 自訂 Hook 的規則

- **名稱一定要以 `use` 開頭**，後面接大寫字母，例如 `useOnlineStatus`、`useCounter`。這是約定，React 和 ESLint 靠這個名字判斷它是 Hook，並檢查你有沒有遵守 Hook 的規則。
- **裡面可以呼叫其他 Hook**，這正是它跟普通函式的差別。
- **回傳什麼由你決定**：值、陣列、物件都可以。

實務上，自訂 Hook 通常放在自己的檔案裡，用 `export` 匯出，再從需要的元件 `import`。這裡為了方便複製貼上，才放在同一個檔案。

### 共用的是邏輯，不是 state

這一點很重要：兩個元件呼叫同一個自訂 Hook，**各自擁有獨立的 state**。

```jsx
import { useState } from "react";

function useCounter(initial = 0) {
  const [count, setCount] = useState(initial);
  const increase = () => setCount((c) => c + 1);
  return [count, increase];
}

function Counter({ label }) {
  const [count, increase] = useCounter();
  return (
    <button onClick={increase}>
      {label}：{count}
    </button>
  );
}

export default function App() {
  return (
    <>
      <Counter label="甲" />
      <Counter label="乙" />
    </>
  );
}
```

按「甲」兩次、「乙」一次，畫面會是「甲：2」和「乙：1」。兩個按鈕各算各的，因為每個 `Counter` 呼叫 `useCounter()` 時，都建立了屬於自己的 `useState`。

如果你想讓兩個元件共用同一份 state，要用第 5 章學的「提升 state」，或是第 7 章會教的 Context。

### 什麼時候該抽成 Hook

當你發現兩個以上的元件，寫了同樣的 `useState` 加 `useEffect` 組合，就是抽成自訂 Hook 的好時機。反過來，如果只是一個普通的計算、不需要用到任何 Hook，用普通函式就好，不必硬加上 `use`。

## 重點整理

- 自訂 Hook 是名稱以 `use` 開頭、裡面呼叫其他 Hook 的函式，用來抽出重複的邏輯。
- 每次呼叫自訂 Hook，都會得到一份獨立的 state，共用的是邏輯，不是資料。
- 自訂 Hook 通常放在獨立的檔案，再匯入使用。
- 不需要用到 Hook 的邏輯，用普通函式就好。
