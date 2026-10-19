# 陣列 state

## 本集目標

用不修改原陣列的方式，對陣列 state 做新增、刪除、修改。

## 正文

### 陣列和物件是同一個道理

陣列也是物件，所以上一集的規則完全適用：**不要直接修改 state 裡的陣列，要做一個新的取代它**。

JavaScript 的陣列方法分成兩類：

- 會修改原陣列的：`push`、`pop`、`splice`、`sort`、`reverse`，以及 `arr[0] = ...`。**在 state 裡不要用。**
- 不會修改、而是回傳新陣列的：`map`、`filter`、`slice`、展開語法 `[...arr]`。**用這些。**

### 新增、刪除、修改

做一個簡單的購物清單。把 `src/App.jsx` 換成：

```jsx
import { useState } from "react";

function App() {
  const [items, setItems] = useState([
    { id: 1, name: "牛奶", bought: false },
    { id: 2, name: "麵包", bought: false },
  ]);

  function handleAdd() {
    const egg = { id: crypto.randomUUID(), name: "雞蛋", bought: false };
    setItems([...items, egg]);
  }

  function handleRemove(id) {
    setItems(items.filter((item) => item.id !== id));
  }

  function handleToggle(id) {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, bought: !item.bought } : item
      )
    );
  }

  return (
    <div>
      <button onClick={handleAdd}>加入雞蛋</button>
      <ul>
        {items.map((item) => (
          <li key={item.id}>
            <span
              style={{ textDecoration: item.bought ? "line-through" : "none" }}
            >
              {item.name}
            </span>
            <button onClick={() => handleToggle(item.id)}>買了</button>
            <button onClick={() => handleRemove(item.id)}>刪除</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
```

每個動作各用一個非變異的方法：

| 動作 | 做法 |
| --- | --- |
| 新增 | `[...items, 新的項目]`：把舊的全部展開，再接上新的 |
| 刪除 | `items.filter(...)`：留下「不是這一個」的 |
| 修改 | `items.map(...)`：碰到那一個就換成新物件，其他的原封不動 |

修改的時候要留意兩層：陣列是新的（`map` 回傳新陣列），被改的那一項也要是新的物件（`{ ...item, bought: !item.bought }`），因為項目本身也是物件，不能直接 `item.bought = true`。

### 關於 `id`

新增項目時，我們用 `crypto.randomUUID()` 產生 id。這是瀏覽器內建的函式，每次呼叫都會得到一個獨一無二的字串，不需要自己安裝或計算。它只能在 `localhost` 或使用 `https` 的網頁上使用，你現在開發用的 `localhost` 沒有問題。

為什麼不用陣列的長度，例如 `id: items.length + 1`？因為刪除之後，長度會變小，可能和既有的 id 撞號。回想第 4 章：`key` 一定要獨一無二而且穩定。

### 如果用了 `push`

用 `push` 看看會發生什麼，把 `handleAdd` 改成：

```jsx,ignore
function handleAdd() {
  items.push({ id: crypto.randomUUID(), name: "雞蛋", bought: false });
  setItems(items);
}
```

按「加入雞蛋」，畫面不會有任何反應。原因和上一集的物件一樣：`push` 是在原本那個陣列上動手腳，`setItems(items)` 傳進去的還是同一個陣列，React 比對後認為沒有變化。

### 排序也要小心

`sort` 和 `reverse` 都會直接修改原陣列。如果要排序，先複製一份再排：

```jsx,ignore
const sorted = [...items].sort((a, b) => a.name.localeCompare(b.name));
```

`[...items]` 先做出一個新陣列，再對新陣列排序，原本的 `items` 不會被動到。

## 重點整理

- 陣列 state 不能用 `push`、`splice`、`sort`、`reverse` 或 `arr[i] = ...` 修改。
- 新增用 `[...items, 新項目]`，刪除用 `filter`，修改用 `map`。
- 修改某一項時，那一項也要複製成新物件。
- `crypto.randomUUID()` 可以產生獨一無二的 id。
- 排序前先用 `[...items]` 複製。
