# Hook 規則

## 本集目標

記住使用 Hook 的兩條規則，並看懂違反規則時的錯誤訊息。

## 正文

Hook 是 React 的特殊函式，有兩條必須遵守的規則。這一集透過一個故意寫錯的範例，讓你看到違反規則時會發生什麼事。

### 規則一：只在最上層呼叫 Hook

**不能在條件判斷、迴圈或巢狀函式裡呼叫 Hook。** 每次渲染，Hook 都要以完全相同的順序被呼叫。

```jsx
import { useState } from "react";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);

  if (loggedIn) {
    const [nickname] = useState("小明");
    console.log(nickname);
  }

  return <button onClick={() => setLoggedIn(true)}>登入</button>;
}
```

第一次渲染時 `loggedIn` 是 `false`，所以只有一個 `useState` 被呼叫。按下「登入」後，`loggedIn` 變成 `true`，這次渲染多了一個 `useState`。畫面會出錯，Console 會出現類似這樣的訊息：

```text
React has detected a change in the order of Hooks called by App.
This will lead to bugs and errors if not fixed.
```

接著還有一個錯誤：

```text
Rendered more hooks than during the previous render.
```

意思是：這次渲染呼叫的 Hook 比上次多。

### 為什麼有這條規則

React 沒辦法知道每個 `useState` 是誰，它是靠**呼叫的順序**來記錄：「第一個 `useState` 的值是 A，第二個是 B……」。如果某次渲染少呼叫或多呼叫了一個，順序就亂了，React 會把值配給錯誤的 Hook。

所以 Hook 的呼叫次數與順序，每次渲染都必須一樣。

### 修正：把條件放進 Hook 的下面

要依條件做事，把條件判斷放在 Hook 之後：

```jsx,ignore
export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [nickname] = useState("小明");

  if (loggedIn) {
    console.log(nickname);
  }

  return <button onClick={() => setLoggedIn(true)}>登入</button>;
}
```

`useState` 全部放在最上面，每次渲染都會被呼叫；只有「要不要用它的值」放進條件裡。

### 規則二：只在元件或自訂 Hook 裡呼叫 Hook

Hook 只能在兩種地方呼叫：

- React 元件的函式主體。
- 自訂 Hook（名稱以 `use` 開頭）的函式主體。

不能在普通函式、事件處理函式、類別裡呼叫 Hook。需要的話，把邏輯整理成自訂 Hook。

```jsx,ignore
function handleClick() {
  const [count, setCount] = useState(0); // 錯：事件處理函式不是元件
}
```

### 交給 ESLint 把關

這兩條規則，Vite 範本內建的 ESLint 都會自動檢查，違反時編輯器會直接標出紅線。你不必背誦，只要**不要忽略那些提醒**，寫的時候也不要故意關掉這條規則。

## 重點整理

- 規則一：只在最上層呼叫 Hook，不放進條件、迴圈或巢狀函式。
- 規則二：只在元件或自訂 Hook 裡呼叫 Hook。
- React 靠呼叫順序記住每個 Hook，順序不一致就會出錯，錯誤訊息是 `Rendered more hooks than during the previous render.`。
- 要依條件做事，把條件判斷放在 Hook 的下面。
- 讓 ESLint 幫你檢查這兩條規則。
