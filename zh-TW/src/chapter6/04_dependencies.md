# 依賴陣列

## 本集目標

用 `useEffect` 的第二個參數，控制 Effect 什麼時候重新執行。

## 正文

### 三種寫法

`useEffect` 的第二個參數是**依賴陣列**（dependency array），決定 Effect 什麼時候要重新執行。先看三種寫法的差別：

```jsx
import { useEffect, useState } from "react";

export default function App() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState("小明");

  useEffect(() => {
    console.log("A：每次渲染後都執行");
  });

  useEffect(() => {
    console.log("B：只有第一次渲染後執行");
  }, []);

  useEffect(() => {
    console.log("C：count 變了才執行，count 是", count);
  }, [count]);

  return (
    <>
      <button onClick={() => setCount(count + 1)}>點了 {count} 次</button>
      <input value={name} onChange={(e) => setName(e.target.value)} />
    </>
  );
}
```

打開 Console，重新整理頁面，會看到三個 Effect 都執行了一次：

```text
A：每次渲染後都執行
B：只有第一次渲染後執行
C：count 變了才執行，count 是 0
```

接著按一下按鈕：

```text
A：每次渲染後都執行
C：count 變了才執行，count 是 1
```

再到輸入框打字，每打一個字都只會印出 A：

```text
A：每次渲染後都執行
```

整理成表格：

| 寫法 | 什麼時候執行 |
| --- | --- |
| 不給陣列 | 每次渲染後 |
| `[]` | 只有第一次渲染後 |
| `[count]` | 第一次渲染後，以及 `count` 和上一次不一樣的那些渲染之後 |

### 依賴要填什麼

規則很簡單：**Effect 裡面用到的所有 props 和 state，都要寫進依賴陣列。**

這樣 React 才知道「Effect 用到的值變了，該重新同步了」。如果漏寫，Effect 看到的就會是過期的值：

```jsx
import { useEffect, useState } from "react";

export default function App() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState("小明");

  useEffect(() => {
    document.title = `${name} 點了 ${count} 次`;
  }, [count]);

  return (
    <>
      <button onClick={() => setCount(count + 1)}>點了 {count} 次</button>
      <input value={name} onChange={(e) => setName(e.target.value)} />
    </>
  );
}
```

這段程式的 Effect 用到了 `name` 和 `count`，但依賴陣列只寫了 `count`。試試看：

1. 一開始標題是「小明 點了 0 次」。
2. 在輸入框把名字改成「小華」，標題**沒有變**，還是「小明 點了 0 次」。
3. 按一下按鈕，標題才一次更新成「小華 點了 1 次」。

因為 `name` 不在依賴陣列裡，改名字時 React 不會重新執行 Effect。把 `[count]` 改成 `[name, count]` 就修好了。

### 讓工具幫你檢查

這種漏寫很難靠肉眼發現。Vite 範本內建的 ESLint 有一條規則專門檢查依賴陣列，漏寫時會在編輯器裡畫黃線提醒你。看到提醒時，不要把它關掉，而是照它說的把缺少的值補進去。

### 依賴怎麼比較

React 用 `Object.is` 比較前後兩次的值，也就是「是不是同一個」。數字、字串、布林值這類簡單的值，內容相同就算相同；物件和陣列則要是同一個才算相同。每次渲染都重新建立的物件或陣列，永遠被視為「變了」，會讓 Effect 一直重新執行。所以依賴陣列裡最好放數字、字串這種簡單的值。

## 重點整理

- 不給陣列：每次渲染後都執行；`[]`：只有第一次；`[a, b]`：`a` 或 `b` 變了才執行。
- Effect 裡用到的所有 props 和 state 都要寫進依賴陣列。
- 漏寫依賴，Effect 會看到過期的值。
- 讓 ESLint 的提示幫你把關，不要隨便關掉。
