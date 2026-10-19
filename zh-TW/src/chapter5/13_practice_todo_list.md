# 綜合練習：待辦清單

## 本集目標

把這一章學到的 state、事件、表單、列表，組合成一個完整的待辦清單。

## 正文

這一集沒有新東西，只有一個題目。它會用到這一章的每個觀念，也是第一個「像樣的」React 應用程式。請先自己做，卡住再看提示，最後再對照參考解答。**自己做得出來，才算真的學會。**

### 題目

在 `hello-react` 專案裡，把 `src/App.jsx` 做成一個待辦清單，要有這些功能：

1. **新增**：上面有一個輸入框和「新增」按鈕。輸入文字後按按鈕（或按 Enter），新增一個待辦事項，並清空輸入框。如果輸入框是空的、或只有空白，不要新增。
2. **勾選**：每個待辦事項前面有核取方塊，勾選表示完成，完成的事項文字要畫上刪除線。再勾一次可以取消。
3. **刪除**：每個事項有一個「刪除」按鈕。
4. **計數**：顯示「還有 N 項未完成」。
5. **篩選**：有「全部」、「未完成」、「已完成」三個按鈕，點了之後只顯示對應的事項。目前選取的篩選按鈕不能再點（`disabled`）。
6. **清除已完成**：有一個「清除已完成」按鈕，一次刪掉所有已完成的事項。如果沒有已完成的事項，這個按鈕不要出現。
7. **空狀態**：完全沒有事項的時候，顯示「還沒有待辦事項，新增一個吧！」；有事項、但目前篩選的分類裡沒有東西時，顯示「這個分類沒有項目。」

### 提示

先想資料長什麼樣子，再想畫面。

- 每個待辦事項是一個物件：`{ id, title, done }`。整份清單是這種物件的陣列，放在 state 裡。
- 需要三個 state：待辦事項陣列、輸入框的文字、目前的篩選（`"all"`、`"active"`、`"done"` 三種值之一）。
- **「還有 N 項未完成」和「篩選後要顯示的清單」都是算得出來的**，不要另外存成 state，在渲染的時候用 `filter` 算。（第 11 集）
- 新增用 `[...todos, 新事項]`，勾選用 `map`，刪除與清除已完成用 `filter`。（第 7 集）
- `id` 用 `crypto.randomUUID()` 產生。
- 輸入的文字用 `text.trim()` 去掉頭尾空白再判斷。
- 建議分階段做，每完成一個功能就存檔測試：先做新增和顯示，再做勾選和刪除，再做計數，最後做篩選和清除。

### 參考解答

寫完再看。

<details>
<summary>展開參考解答</summary>

`src/App.jsx`：

```jsx
import { useState } from "react";

const FILTERS = [
  { value: "all", label: "全部" },
  { value: "active", label: "未完成" },
  { value: "done", label: "已完成" },
];

function App() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState("");
  const [filter, setFilter] = useState("all");

  function handleSubmit(event) {
    event.preventDefault();
    const title = text.trim();
    if (title === "") {
      return;
    }
    setTodos([...todos, { id: crypto.randomUUID(), title, done: false }]);
    setText("");
  }

  function handleToggle(id) {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, done: !todo.done } : todo
      )
    );
  }

  function handleDelete(id) {
    setTodos(todos.filter((todo) => todo.id !== id));
  }

  function handleClearDone() {
    setTodos(todos.filter((todo) => !todo.done));
  }

  const remaining = todos.filter((todo) => !todo.done).length;
  const visibleTodos = todos.filter((todo) => {
    if (filter === "active") {
      return !todo.done;
    }
    if (filter === "done") {
      return todo.done;
    }
    return true;
  });

  return (
    <div>
      <h1>待辦清單</h1>

      <form onSubmit={handleSubmit}>
        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="要做什麼？"
        />
        <button type="submit">新增</button>
      </form>

      <div>
        {FILTERS.map((item) => (
          <button
            key={item.value}
            onClick={() => setFilter(item.value)}
            disabled={filter === item.value}
          >
            {item.label}
          </button>
        ))}
      </div>

      {todos.length === 0 && <p>還沒有待辦事項，新增一個吧！</p>}
      {todos.length > 0 && visibleTodos.length === 0 && (
        <p>這個分類沒有項目。</p>
      )}

      <ul>
        {visibleTodos.map((todo) => (
          <li key={todo.id}>
            <label>
              <input
                type="checkbox"
                checked={todo.done}
                onChange={() => handleToggle(todo.id)}
              />
              <span
                style={{ textDecoration: todo.done ? "line-through" : "none" }}
              >
                {todo.title}
              </span>
            </label>
            <button
              onClick={() => handleDelete(todo.id)}
              aria-label={`刪除 ${todo.title}`}
            >
              刪除
            </button>
          </li>
        ))}
      </ul>

      {todos.length > 0 && <p>還有 {remaining} 項未完成</p>}
      {todos.some((todo) => todo.done) && (
        <button onClick={handleClearDone}>清除已完成</button>
      )}
    </div>
  );
}

export default App;
```

幾個值得注意的地方：

- 只有三個 state：`todos`、`text`、`filter`。`remaining` 和 `visibleTodos` 都是每次渲染時算出來的普通變數，所以永遠不會和 `todos` 不同步。
- `FILTERS` 放在元件外面，因為它是不會變的常數。篩選按鈕用 `map` 從它產生，所以按鈕不用寫三次。
- 所有對 `todos` 的修改，都是做一個新陣列取代：`[...todos, x]`、`map`、`filter`，沒有用 `push` 或直接改物件。
- 勾選時，被改的那一項也複製成新物件：`{ ...todo, done: !todo.done }`。
- 刪除按鈕有 `aria-label`，螢幕閱讀器會唸出「刪除 買牛奶」，而不是一堆無法分辨的「刪除」。

</details>

### 延伸挑戰

想多練一點的話，試試看：

- 把每個待辦事項拆成獨立的 `TodoItem` 元件，放進 `src/TodoItem.jsx`，用 props 傳入事項和 `onToggle`、`onDelete`。
- 讓使用者可以編輯已經新增的事項標題。
- 加一個「全部標示為完成」的按鈕。
- 現在重新整理頁面，所有待辦事項都消失了。要讓它們存下來，需要第 6 章的 Effect，再搭配瀏覽器內建的 `localStorage`（一個可以把字串存在瀏覽器裡的功能，請自行查 MDN 文件）。學完第 6 章後，可以回來試試看。

## 重點整理

- 這一章的所有觀念，組合起來已經可以做出完整的互動應用程式。
- 設計時先決定資料的樣子，再決定 state 有哪些，算得出來的不要存成 state。
- 對陣列和物件 state 的任何修改，都是做一份新的取代它。
- 受控輸入、表單、列表、條件渲染、事件處理，都是用 state 串在一起的。
