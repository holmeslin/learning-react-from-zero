# 列表與 `key`

## 本集目標

把一個陣列的資料，畫成一串元件，並且知道為什麼要加 `key`。

## 正文

### 一個陣列，一串畫面

網站上到處都是列表：商品清單、留言、搜尋結果。資料是一個陣列，畫面就要把陣列裡的每一筆，各畫成一個元件。

你在第 2 章學過 `map`，它可以把陣列的每個東西轉成別的東西。React 就用它把「資料」轉成「元件」。

把 `src/App.jsx` 換成（`ProductCard` 用第 9 集的版本）：

```jsx
import ProductCard from "./ProductCard.jsx";

const products = [
  { id: 1, name: "機械鍵盤", price: 1200, inStock: true },
  { id: 2, name: "無線滑鼠", price: 600, inStock: false },
  { id: 3, name: "螢幕", price: 5000, inStock: true },
];

function App() {
  return (
    <div>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          name={product.name}
          price={product.price}
          inStock={product.inStock}
        />
      ))}
    </div>
  );
}

export default App;
```

`products.map(...)` 的結果是一個陣列，裡面裝著三個 `<ProductCard />`。上一集說過陣列可以直接放進 `{}`，React 會把裡面的元件依序畫出來。資料多一筆，畫面就自動多一張卡片，不用改元件。

### 為什麼需要 `key`

注意 `<ProductCard>` 上有一個 `key={product.id}`。它不是 `ProductCard` 的 props，不會傳進元件裡，是專門給 React 看的。

如果不寫，畫面照樣會出來，但主控台會出現警告：

```text
Each child in a list should have a unique "key" prop.
```

意思是「列表裡的每一個項目都需要一個獨一無二的 `key`」。

`key` 的功用是讓 React **認得每一個項目是誰**。想像一個班級點名：如果名單排序變了，老師靠名字（`key`）還是知道誰是誰；如果只靠座位號碼，新同學插進來之後，所有人的號碼都錯位了。React 一樣，列表的內容增加、刪除、換順序時，它靠 `key` 判斷哪些項目是舊的、哪些是新的，才能只更新有變的部分。下一章你會看到，沒有正確的 `key`，輸入框裡打的字、勾選的狀態都可能跑到別的項目上。

### 怎麼選 `key`

- **用資料本身的 id**。資料庫裡的編號、商品代碼，都是最好的 `key`：獨一無二，而且不會因為排序而改變。
- **不要用陣列索引**（`map` 的第二個參數）。它看起來方便，但列表一旦增加、刪除或換順序，同一筆資料的索引就變了，React 會認錯人。如果列表永遠不會改變，用索引才不會出事，但這很少見，所以養成不用的習慣。
- **不要在畫面更新時隨機產生**，像 `key={Math.random()}`。每次畫面更新都是新的 `key`，React 會把全部項目都當成新的，整個列表砍掉重畫。

另外，`key` 要放在 `map` **直接回傳的那一層元素**上。如果回傳的外層是元件，`key` 就寫在元件標籤上，就像上面的 `<ProductCard key=... />`，寫在元件裡面的 `<div>` 上是沒用的。

### 先過濾，再畫出來

`filter` 和 `map` 可以接在一起用，把 `src/App.jsx` 換成：

```jsx
import ProductCard from "./ProductCard.jsx";

const products = [
  { id: 1, name: "機械鍵盤", price: 1200, inStock: true },
  { id: 2, name: "無線滑鼠", price: 600, inStock: false },
  { id: 3, name: "螢幕", price: 5000, inStock: true },
];

function App() {
  const available = products.filter((product) => product.inStock);

  return (
    <div>
      <h1>現貨商品（{available.length} 項）</h1>
      {available.map((product) => (
        <ProductCard
          key={product.id}
          name={product.name}
          price={product.price}
        />
      ))}
    </div>
  );
}

export default App;
```

先用 `filter` 挑出有庫存的，存成一個變數，再 `map`。這樣程式碼比較好讀。

### 列表是空的時候

資料可能一筆都沒有，這時候與其留一片空白，不如給使用者一個說明。結合上一集的條件渲染，把 `src/App.jsx` 換成：

```jsx
import ProductCard from "./ProductCard.jsx";

function App() {
  const products = [];

  return (
    <div>
      {products.length === 0 ? (
        <p>目前沒有商品。</p>
      ) : (
        products.map((product) => (
          <ProductCard
            key={product.id}
            name={product.name}
            price={product.price}
          />
        ))
      )}
    </div>
  );
}

export default App;
```

### 需要 `key` 的 Fragment

一個項目要畫成好幾個相鄰的元素，又不想多包一層 `<div>` 的時候，需要用 Fragment，而且這時候要寫完整的 `<Fragment>`，不能用簡寫的 `<>`，因為簡寫沒辦法加 `key`：

```jsx
import { Fragment } from "react";

const terms = [
  { id: 1, word: "元件", meaning: "回傳畫面的函式" },
  { id: 2, word: "props", meaning: "傳給元件的資料" },
];

function Glossary() {
  return (
    <dl>
      {terms.map((term) => (
        <Fragment key={term.id}>
          <dt>{term.word}</dt>
          <dd>{term.meaning}</dd>
        </Fragment>
      ))}
    </dl>
  );
}

export default Glossary;
```

## 重點整理

- 用 `map` 把資料陣列轉成元件陣列，放進 `{}` 就能畫出列表。
- 每個項目都要加 `key`，寫在 `map` 直接回傳的那個元素上。
- `key` 用資料本身的 id；不要用陣列索引或隨機值。
- `filter` 和 `map` 可以接在一起用，空列表要另外處理。
- 需要 `key` 的 Fragment 要寫成 `<Fragment key=...>`。
