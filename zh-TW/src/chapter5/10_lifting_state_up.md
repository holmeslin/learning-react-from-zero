# 提升 state

## 本集目標

當兩個元件需要共用同一份資料時，把 state 放到它們共同的父元件。

## 正文

### 一個搜尋功能

做一個商品搜尋：上面一個搜尋框，下面一個商品列表，列表只顯示名稱包含搜尋文字的商品。

這個功能拆成兩個元件：`SearchBox` 負責輸入，`ProductList` 負責顯示。問題來了：**搜尋文字這個 state 要放在誰那裡？**

如果放在 `SearchBox`，它自己知道使用者輸入了什麼，但是 `ProductList` 是另一個元件，拿不到。如果放在 `ProductList`，輸入框又在 `SearchBox`，沒辦法更新它。

React 的解法是：**把 state 放到這兩個元件共同的父元件**。這個動作叫做「提升 state」（lifting state up）。

### 實作

建立 `src/SearchBox.jsx`：

```jsx
function SearchBox({ query, onQueryChange }) {
  return (
    <input
      value={query}
      onChange={(event) => onQueryChange(event.target.value)}
      placeholder="搜尋商品"
    />
  );
}

export default SearchBox;
```

建立 `src/ProductList.jsx`：

```jsx
function ProductList({ products }) {
  if (products.length === 0) {
    return <p>找不到符合的商品。</p>;
  }

  return (
    <ul>
      {products.map((product) => (
        <li key={product.id}>
          {product.name}：{product.price} 元
        </li>
      ))}
    </ul>
  );
}

export default ProductList;
```

然後把 `src/App.jsx` 換成：

```jsx
import { useState } from "react";
import SearchBox from "./SearchBox.jsx";
import ProductList from "./ProductList.jsx";

const products = [
  { id: 1, name: "機械鍵盤", price: 1200 },
  { id: 2, name: "無線滑鼠", price: 600 },
  { id: 3, name: "螢幕", price: 5000 },
  { id: 4, name: "滑鼠墊", price: 250 },
];

function App() {
  const [query, setQuery] = useState("");

  const visibleProducts = products.filter((product) =>
    product.name.includes(query)
  );

  return (
    <div>
      <SearchBox query={query} onQueryChange={setQuery} />
      <ProductList products={visibleProducts} />
    </div>
  );
}

export default App;
```

試試看：在搜尋框輸入「滑鼠」，列表只剩「無線滑鼠」和「滑鼠墊」；輸入找不到的字，會顯示「找不到符合的商品」。

### 資料向下，事件向上

看看這個結構裡，資訊是怎麼流動的：

- **資料往下傳**：`App` 擁有 `query` 這個 state，透過 props 把 `query` 交給 `SearchBox`，用來顯示輸入框的內容。算好的 `visibleProducts` 則交給 `ProductList`。
- **事件往上傳**：使用者在輸入框打字時，`SearchBox` 自己改不了 `query`，因為它是 `App` 的 state。所以 `App` 把 `setQuery` 當成 props（`onQueryChange`）傳下去，`SearchBox` 在需要的時候呼叫它，通知 `App`：「有人輸入了新的字」。`App` 更新 state，重新渲染，新的 `query` 再往下傳。

資料永遠是從上往下流，想改資料就呼叫往下傳來的函式，通知擁有者去改。這一章第 1 集學到的「把事件處理函式當成 props 傳下去」，現在派上用場了。

這樣做的好處是：`query` 只存在一個地方，不可能出現「輸入框是一個值，列表用的是另一個值」這種不同步的情況。

### 另一個例子：同時只能打開一個

提升 state 也能用來協調兄弟元件。做一個簡單的摺疊面板：同一時間只有一個面板是展開的。

建立 `src/Panel.jsx`：

```jsx
function Panel({ title, isOpen, onShow, children }) {
  return (
    <section>
      <h3>{title}</h3>
      {isOpen ? <p>{children}</p> : <button onClick={onShow}>顯示</button>}
    </section>
  );
}

export default Panel;
```

把 `src/App.jsx` 換成：

```jsx
import { useState } from "react";
import Panel from "./Panel.jsx";

function App() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div>
      <Panel
        title="關於"
        isOpen={activeIndex === 0}
        onShow={() => setActiveIndex(0)}
      >
        我們是一間賣電腦周邊的小店。
      </Panel>
      <Panel
        title="營業時間"
        isOpen={activeIndex === 1}
        onShow={() => setActiveIndex(1)}
      >
        週一到週五，早上九點到晚上六點。
      </Panel>
    </div>
  );
}

export default App;
```

`Panel` 自己不記得「我是不是展開的」，是 `App` 用 `activeIndex` 決定。按下第二個面板的「顯示」，`activeIndex` 變成 1，第一個面板自動收起，第二個展開。如果讓每個 `Panel` 各自管理自己的 `isOpen`，它們彼此不知道對方的狀態，就做不到「只能開一個」。

### 提升 state 的步驟

1. 找出需要用到這份資料的所有元件。
2. 找出它們最近的共同父元件。
3. 把 state 移到那個父元件。
4. 用 props 把值往下傳，把更新用的函式也當成 props 往下傳。

## 重點整理

- 兩個元件需要共用同一份資料，就把 state 放到它們共同的父元件。
- 資料用 props 往下傳，更新用的函式也用 props 往下傳。
- 子元件想改資料，是呼叫父元件傳來的函式，通知它去改。
- 資料只存在一個地方，就不會有不同步的問題。
