# State 與事件的型別

## 本集目標

替 `useState` 標上型別，並知道事件處理函式的參數型別怎麼寫。

## 正文

### `useState` 大多數時候自己推

```tsx
import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);
  const [name, setName] = useState("");

  return (
    <>
      <button onClick={() => setCount(count + 1)}>{count}</button>
      <input value={name} onChange={(event) => setName(event.target.value)} />
    </>
  );
}
```

`useState(0)` 的初始值是數字，TypeScript 推出 `count` 是 `number`；`useState("")` 推出 `name` 是 `string`。什麼都不用標。

而且 `onChange={(event) => ...}` 的 `event` 也沒有標，因為 TypeScript 知道這是 `<input>` 的 `onChange`，自動把 `event` 推成對應的事件型別，所以 `event.target.value` 能直接用。**直接寫在 JSX 裡的處理函式，通常什麼都不用標。**

### 初始值看不出來的時候：標在 `<>` 裡

第 3 集說過，空陣列和 `null` 看不出型別。建立 `practice/Bad.tsx`：

```tsx,ignore
import { useState } from "react";

export default function Bad() {
  const [todos, setTodos] = useState([]);
  setTodos([{ id: 1 }]);
  console.log(todos);
  return null;
}
```

```text
practice/Bad.tsx:5:13 - error TS2322: Type '{ id: number; }' is not assignable to type 'never'.

5   setTodos([{ id: 1 }]);
              ~~~~~~~~~


Found 1 error in practice/Bad.tsx:5
```

`useState([])` 讓 TypeScript 推出「一個永遠什麼都放不進去的陣列」（`never[]`），所以放任何東西都錯。`useState(null)` 也有同樣的問題。

解法是用角括號 `<>` 明確告訴 `useState` 狀態的型別：

```tsx
import { useState } from "react";

type Todo = { id: number; text: string; done: boolean };

export default function Example() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [error, setError] = useState<string | null>(null);

  function addTodo(text: string) {
    setTodos([...todos, { id: Date.now(), text, done: false }]);
    setError(null);
  }

  return (
    <>
      <button onClick={() => addTodo("買牛奶")}>新增</button>
      {error !== null && <p>{error}</p>}
      <p>共 {todos.length} 項</p>
    </>
  );
}
```

`useState<Todo[]>([])` 讀作「狀態是 `Todo` 陣列，初始值是空的」；`useState<string | null>(null)` 是「可能是字串、也可能是 `null`，一開始是 `null`」。這個 `<>` 的寫法叫**泛型**，第 8 集會解釋。

### 獨立寫的事件處理函式

處理函式如果拉出來寫成獨立的函式，就沒有 JSX 幫你推論了，要自己標 `event` 的型別。React 提供了對應的型別，全部要用 `import type` 匯入：

```tsx
import { useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

export default function TodoForm() {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setText(event.target.value);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    console.log(text);
    setText("");
    inputRef.current?.focus();
  }

  return (
    <form onSubmit={handleSubmit}>
      <input ref={inputRef} value={text} onChange={handleChange} />
      <button>新增</button>
    </form>
  );
}
```

- `ChangeEvent<HTMLInputElement>`：`<input>` 內容改變的事件。尖括號裡寫的是事件發生在哪種元素上。
- `FormEvent<HTMLFormElement>`：表單送出的事件。
- `useRef<HTMLInputElement>(null)`：指向 `<input>` 的 ref。因為 ref 一開始是 `null`，等元件渲染後才指到元素，所以用的時候要寫 `inputRef.current?.focus()`，用 `?.` 處理 `null`。

常用的事件型別：

| 事件 | 型別 |
| --- | --- |
| `<input>` 的 `onChange` | `ChangeEvent<HTMLInputElement>` |
| `<form>` 的 `onSubmit` | `FormEvent<HTMLFormElement>` |
| `<button>` 的 `onClick` | `MouseEvent<HTMLButtonElement>` |

不用背。最省力的方法：**先把處理函式直接寫在 JSX 裡，把游標移到 `event` 上看 TypeScript 推出什麼型別，再抄過去**。

## 重點整理

- `useState(0)`、`useState("")` 這種看得出型別的初始值，不用標。
- 初始值是 `[]` 或 `null` 時，用 `useState<型別>(初始值)` 標出來。
- 直接寫在 JSX 裡的處理函式，`event` 的型別會自動推論。
- 獨立寫的處理函式要自己標，例如 `ChangeEvent<HTMLInputElement>`，從 `react` 用 `import type` 匯入。
- `useRef<HTMLInputElement>(null)` 的 `current` 可能是 `null`，用 `?.` 處理。
