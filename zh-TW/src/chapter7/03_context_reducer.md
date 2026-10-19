# Context 搭配 Reducer

## 本集目標

把 `useReducer` 和 Context 合起來，讓整個應用程式的任何元件都能讀取資料、更新資料。

## 正文

### 兩個工具的互補

- `useReducer` 讓更新邏輯集中，但 `state` 和 `dispatch` 仍然只在持有它的元件裡，要傳給深處的元件還是得靠 props。
- `useContext` 解決傳遞的問題，但它只負責「提供」，不管資料怎麼更新。

兩個合在一起：用 `useReducer` 管理資料，再用 Context 把 `state` 和 `dispatch` 提供給整棵樹。

### 完整範例

下面把待辦清單改寫成這個模式：

```jsx
import { createContext, useContext, useReducer, useState } from "react";

const TasksContext = createContext(null);
const TasksDispatchContext = createContext(null);

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

function TasksProvider({ children }) {
  const [tasks, dispatch] = useReducer(tasksReducer, initialTasks);

  return (
    <TasksContext value={tasks}>
      <TasksDispatchContext value={dispatch}>{children}</TasksDispatchContext>
    </TasksContext>
  );
}

function useTasks() {
  return useContext(TasksContext);
}

function useTasksDispatch() {
  return useContext(TasksDispatchContext);
}

let nextId = 3;

function AddTask() {
  const [text, setText] = useState("");
  const dispatch = useTasksDispatch();

  return (
    <>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <button
        onClick={() => {
          dispatch({ type: "added", id: nextId++, text });
          setText("");
        }}
      >
        新增
      </button>
    </>
  );
}

function Task({ task }) {
  const dispatch = useTasksDispatch();

  return (
    <li>
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
  );
}

function TaskList() {
  const tasks = useTasks();

  return (
    <ul>
      {tasks.map((task) => (
        <Task key={task.id} task={task} />
      ))}
    </ul>
  );
}

export default function App() {
  return (
    <TasksProvider>
      <AddTask />
      <TaskList />
    </TasksProvider>
  );
}
```

功能和上一集一模一樣。差別在結構：`App` 變得乾乾淨淨，沒有任何 state，也沒有任何 props 往下傳。`AddTask`、`TaskList`、`Task` 各自需要什麼，就自己跟 Context 拿。

### 值得學的幾個設計

**1. 用 `TasksProvider` 把邏輯包起來。**
`useReducer` 和兩個 Context 都集中在 `TasksProvider` 這個元件裡。使用的人只要用它包住子元件，不必知道裡面怎麼運作。

**2. state 和 dispatch 分成兩個 Context。**
`dispatch` 函式在整個生命週期都是同一個，永遠不變；`tasks` 則會一直更新。分開之後，只需要 `dispatch` 的元件（例如 `AddTask`），不會因為 `tasks` 變了而被迫重新渲染。

**3. 用自訂 Hook 取用。**
`useTasks()` 和 `useTasksDispatch()` 是兩個很薄的自訂 Hook（第 6 章學過），只是把 `useContext(...)` 包起來。好處是：元件不必知道 Context 的名字，以後想改實作也只需要改一個地方。

**4. 實務上會拆檔。**
這裡為了方便複製貼上，全部放在同一個檔案。真實專案會把 Context、reducer、Provider 和 Hook 放進一個 `TasksContext.jsx`，其他元件從那裡 `import` 需要的東西。

### 什麼時候用這個模式

當一份資料有複雜的更新邏輯，而且很多元件都需要讀取或更新它時，這個組合很好用，是 React 不依賴其他函式庫、內建的全域 state 解法。

小型專案、元件層級不深的時候，不需要這麼麻煩。需要時再加上就好。

## 重點整理

- `useReducer` 管理資料與更新邏輯，Context 負責把它提供給整棵元件樹。
- 把 `useReducer` 和 Provider 包成一個元件（如 `TasksProvider`），使用端只要包住子元件即可。
- 把 `state` 和 `dispatch` 放進兩個 Context，只用到 `dispatch` 的元件不會因為資料更新而重新渲染。
- 用自訂 Hook 包住 `useContext`，讓元件不必直接依賴 Context。
