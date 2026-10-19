# 更新函式

## 本集目標

用「更新函式」讓 state 根據上一個值計算出新的值。

## 正文

上一集留下的問題：怎麼在一個事件裡連續更新同一個 state 好幾次，而且每次都以前一次的結果為基礎。

### 更新函式

`setCount` 除了可以傳入一個新值，也可以傳入一個**函式**。React 會呼叫這個函式，把「目前最新的值」交給它，函式回傳的就是新的值。把 `src/App.jsx` 換成：

```jsx
import { useState } from "react";

function App() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount((current) => current + 1);
    setCount((current) => current + 1);
    setCount((current) => current + 1);
  }

  return (
    <div>
      <p>count：{count}</p>
      <button onClick={handleClick}>加三</button>
    </div>
  );
}

export default App;
```

這次點一下，`count` 真的加 3 了。

`(current) => current + 1` 就是「更新函式」。它接收「目前的 state」，回傳「新的 state」。

### 為什麼這樣可以

React 會把你在同一個事件裡呼叫的 `setCount`，依序排成一個佇列，等事件處理函式跑完之後，再一次處理：

1. 起始值是 0。
2. 第一個更新函式拿到 0，回傳 1。
3. 第二個拿到 1，回傳 2。
4. 第三個拿到 2，回傳 3。
5. 最後的結果 3，成為下一次渲染的 `count`。

每一個更新函式拿到的，都是前一個更新的結果，所以可以接續累積。而上一集的 `setCount(count + 1)`，用的是照片裡固定的 `count`，三次都算出一樣的數字。

### 傳值和傳函式混著用會怎樣

兩種寫法可以混在一起，React 一樣按順序處理，把 `src/App.jsx` 換成：

```jsx
import { useState } from "react";

function App() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount(count + 5);
    setCount((current) => current + 1);
  }

  return (
    <div>
      <p>count：{count}</p>
      <button onClick={handleClick}>點我</button>
    </div>
  );
}

export default App;
```

第一次點，從 0 開始：先是「換成 5」，然後更新函式拿到 5、回傳 6，結果是 6。

要特別小心順序：如果寫成 `setCount((current) => current + 1)` 在前、`setCount(count + 5)` 在後，結果會是 5。因為後面那一行是「換成 0 + 5 = 5」，把前面的結果整個蓋掉了。

### 什麼時候該用更新函式

規則很簡單：**新的值要根據舊的值計算的時候，就用更新函式。**

```jsx,ignore
setCount((current) => current + 1);    // 根據舊的值 → 用更新函式
setIsOpen((current) => !current);      // 開關 → 用更新函式
setName("小明");                        // 和舊的值無關 → 直接傳值
```

更新函式的參數名稱可以隨意取，常見的是 `current`、`prev`（previous 的縮寫），或是 state 名稱的第一個字母，例如 `c`。這本書用 `current`。

### 本書的習慣

一個事件裡只更新一次的時候，直接寫 `setItems([...items, newItem])` 這種用目前的值算出新值的寫法也完全正確，後面的範例大多這樣寫，因為讀起來比較直接。

真正需要更新函式的情況是：同一個事件裡要連續更新好幾次，或是更新發生在計時器、等待資料回來這類「晚一點才執行」的程式碼裡。這時候目前的值可能已經過時，用更新函式才保證拿到最新的值。拿不定主意時，用更新函式永遠不會錯。

## 重點整理

- `setState` 可以傳入一個函式：`setCount((current) => current + 1)`。
- React 會依序執行同一個事件裡的更新，每個更新函式拿到的是前一個的結果。
- 同一個事件要更新好幾次、或在晚一點才執行的程式碼裡更新時，一定要用更新函式；只更新一次時，兩種寫法都可以。
- 更新函式的參數名稱隨意，這本書用 `current`。
