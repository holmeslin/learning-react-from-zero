# `useState`

## 本集目標

用 `useState` 讓元件記住資料，並且在資料改變時更新畫面。

## 正文

### 第一個計數器

把 `src/App.jsx` 換成：

```jsx
import { useState } from "react";

function App() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount(count + 1);
  }

  return (
    <div>
      <p>已點 {count} 次</p>
      <button onClick={handleClick}>加一</button>
    </div>
  );
}

export default App;
```

存檔，點按鈕，這次畫面真的會動了。

### 拆開來看

```jsx,ignore
const [count, setCount] = useState(0);
```

這一行包含很多東西：

- `useState` 是 React 提供的工具，要先從 `react` 匯入。像這種名字以 `use` 開頭的函式，叫做 **Hook**。
- `useState(0)` 的 `0` 是**初始值**：這個 state 第一次出現時的值。
- `useState` 會回傳一個長度為 2 的陣列：第一個是 state 目前的值，第二個是用來更新它的函式。
- 左邊用陣列解構（第 2 章學過）把它們取出來，命名成 `count` 和 `setCount`。

命名慣例是 `[something, setSomething]`，例如 `[name, setName]`、`[isOpen, setIsOpen]`。

接著看按鈕被點的時候發生了什麼：

```jsx,ignore
setCount(count + 1);
```

呼叫 `setCount`，並且傳入新的值。這個動作做了兩件事：

1. 把 `count` 這個 state 記成新的值。
2. 通知 React：「資料變了，請重新渲染這個元件。」

React 收到通知後，會再呼叫一次 `App`。這一次 `useState(0)` 不會把值重設成 0，而是回傳 React 記住的最新值。於是 `count` 變成 1，畫面也跟著更新成「已點 1 次」。

這就解決了上一集的兩個問題：state 由 React 保管，不會在重新渲染時被重設；而且透過 `setCount` 修改，React 就知道要更新畫面。

`useState(0)` 裡的 `0` 只在第一次渲染時有用，之後的渲染都會被忽略。

### 每個元件有自己的 state

state 是屬於「元件的每一個實例」的。把計數器抽出來做成元件，再用兩次，把 `src/App.jsx` 換成：

```jsx
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>已點 {count} 次</p>
      <button onClick={() => setCount(count + 1)}>加一</button>
    </div>
  );
}

function App() {
  return (
    <div>
      <Counter />
      <Counter />
    </div>
  );
}

export default App;
```

畫面上有兩個計數器，點其中一個，另一個不受影響。因為每次使用 `<Counter />`，React 都會為它建立一份獨立的 state。

### 不只能存數字

state 可以放任何型別的值：字串、布林值、陣列、物件。例如用一個布林值控制元素的顯示與隱藏，這種「開關」是 state 最常見的用途之一，把 `src/App.jsx` 換成：

```jsx
import { useState } from "react";

function App() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? "收起" : "展開"}
      </button>
      {isOpen && <p>這是被藏起來的內容。</p>}
    </div>
  );
}

export default App;
```

這裡把上一章的條件渲染和 state 組合起來：`isOpen` 是 `false` 的時候，段落不畫出來；點按鈕之後變成 `true`，段落就出現了。

### 使用 Hook 的規則

先記住一個規則：**Hook 只能寫在元件函式的最上層**，不能放在 `if`、迴圈或事件處理函式裡面。`useState` 永遠寫在元件函式最前面，這是一直以來的寫法。原因第 6 章會說明。

### 在 DevTools 看 state

第 4 章第 14 集安裝的 React DevTools 這時候派上用場了。在 Components 分頁點選 `Counter`，右邊面板除了 props，也會列出這個元件的 state 和它目前的值，而且可以直接修改，畫面會跟著變。

## 重點整理

- `const [value, setValue] = useState(初始值)`：要先從 `react` 匯入 `useState`。
- 呼叫 `setValue(新值)` 會更新 state，而且通知 React 重新渲染。
- state 由 React 保管，重新渲染不會把它重設。
- 每一個元件實例有自己獨立的 state。
- state 可以放任何型別的值，Hook 只能寫在元件函式的最上層。
