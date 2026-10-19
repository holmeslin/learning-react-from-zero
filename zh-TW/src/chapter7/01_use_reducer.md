# `useReducer`

## 本集目標

用 `useReducer` 把更新 state 的邏輯，集中寫在同一個函式裡。

## 正文

### 問題：邏輯散落各處

第 5 章做過待辦清單。清單的資料只有一個陣列，但改它的方式有好幾種：新增、勾選完成、刪除。如果用 `useState`，每一種改法都各自寫成一個事件處理函式：

```jsx,ignore
function handleAdd(text) {
  setTasks([...tasks, { id: nextId++, text, done: false }]);
}
function handleToggle(id) {
  setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
}
function handleDelete(id) {
  setTasks(tasks.filter((t) => t.id !== id));
}
```

功能少時還好，功能一多，這些改 state 的邏輯會散在元件各處，不容易看出全貌。

### 用 reducer 集中

`useReducer` 的想法是：元件不直接決定 state 怎麼改，只負責「報告發生了什麼事」；怎麼改，交給一個獨立的函式統一處理。

```jsx
import { useReducer, useState } from "react";

function tasksReducer(tasks, action) {
  switch (action.type) {
    case "added":
      return [...tasks, { id: action.id, text: action.text, done: false }];
    case "toggled":
      return tasks.map((task) =>
        task.id === action.id ? { ...task, done: !task.done } : task,
      );
    case "deleted":
      return tasks.filter((task) => task.id !== action.id);
    default:
      throw new Error(`未知的 action：${action.type}`);
  }
}

const initialTasks = [
  { id: 1, text: "買牛奶", done: true },
  { id: 2, text: "寫程式", done: false },
];
let nextId = 3;

export default function App() {
  const [tasks, dispatch] = useReducer(tasksReducer, initialTasks);
  const [text, setText] = useState("");

  function handleAdd() {
    dispatch({ type: "added", id: nextId++, text });
    setText("");
  }

  return (
    <>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <button onClick={handleAdd}>新增</button>
      <ul>
        {tasks.map((task) => (
          <li key={task.id}>
            <label>
              <input
                type="checkbox"
                checked={task.done}
                onChange={() => dispatch({ type: "toggled", id: task.id })}
              />
              {task.done ? <s>{task.text}</s> : task.text}
            </label>
            <button onClick={() => dispatch({ type: "deleted", id: task.id })}>
              刪除
            </button>
          </li>
        ))}
      </ul>
    </>
  );
}
```

試試看新增、勾選、刪除，功能和 `useState` 的版本完全一樣。

### 三個角色

1. **`tasksReducer`**：一個普通函式，接收「目前的 state」和「發生了什麼事（action）」，回傳「新的 state」。所有更新邏輯都集中在這裡。
2. **`action`**：描述「發生了什麼事」的物件，習慣上有一個 `type` 欄位，其他欄位是附帶資料。例如 `{ type: "toggled", id: 2 }` 就是「2 號項目被勾選了」。
3. **`dispatch`**：`useReducer` 回傳的函式。呼叫 `dispatch(action)`，React 就會把目前的 state 和 action 交給 reducer，拿回傳值當作新的 state，並重新渲染。

`useReducer(tasksReducer, initialTasks)` 回傳 `[state, dispatch]`，用法和 `useState` 的 `[state, setState]` 很像。

### reducer 的規則

- **必須是純函式**：同樣的 state 和 action，永遠回傳同樣的結果；不能在裡面傳送請求、修改外部變數。
- **不能直接修改 state**：和第 5 章一樣，要回傳新的陣列或物件，而不是改原本的。
- **產生 id 的工作交給呼叫端**：例子裡的 `nextId++` 寫在 `handleAdd`，再放進 action 傳進去，而不是寫在 reducer 裡。因為 reducer 必須是純的，開發模式下 React 還會刻意多呼叫一次來檢查。

### 該選 `useState` 還是 `useReducer`？

- 一兩個簡單的值（數字、字串、開關）：`useState` 更直覺。
- 一份資料有很多種改法，或是下一個 state 要依據複雜的規則算出來：`useReducer` 讓邏輯更集中、更好測試。

兩者沒有誰比較好，是工具的選擇。你隨時可以先用 `useState`，感覺亂了再換成 `useReducer`。

## 重點整理

- `useReducer(reducer, 初始值)` 回傳 `[state, dispatch]`。
- 元件呼叫 `dispatch(action)` 報告發生了什麼事，reducer 負責算出新的 state。
- reducer 是純函式，不修改傳進來的 state，要回傳新的值。
- 有多種改法的資料，適合用 `useReducer` 把更新邏輯集中在一處。
