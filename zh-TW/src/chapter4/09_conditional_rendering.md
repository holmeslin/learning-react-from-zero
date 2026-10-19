# 條件渲染

## 本集目標

讓畫面根據條件，決定要畫什麼、不畫什麼。

## 正文

第 1 章學過 `if` 和三元運算子。React 裡也一樣：**畫面要怎麼長，就用 JavaScript 的條件去決定**。React 沒有另外發明什麼特別的語法，只是這些條件要放在合適的位置。上一集講過，`{}` 裡只能放運算式，不能放 `if`，所以有三種常用的做法。

### 做法一：在 `return` 之前用 `if`

最直接的做法，就是在元件的函式裡先用 `if` 判斷，回傳不同的 JSX。建立 `src/StatusMessage.jsx`：

```jsx
function StatusMessage({ isLoggedIn }) {
  if (isLoggedIn) {
    return <p>歡迎回來！</p>;
  }
  return <p>請先登入。</p>;
}

export default StatusMessage;
```

如果有些情況什麼都不想畫，回傳 `null`：

```jsx
function Banner({ message }) {
  if (!message) {
    return null;
  }
  return <p className="banner">{message}</p>;
}

export default Banner;
```

`null` 的意思是「這個元件什麼都不畫」，不會出錯。

### 做法二：三元運算子

兩種情況只有一小塊不一樣的時候，用三元運算子直接放在 JSX 裡。把 `src/App.jsx` 換成：

```jsx
function App() {
  const isLoggedIn = false;

  return (
    <div>
      <h1>我的商店</h1>
      {isLoggedIn ? <p>歡迎回來！</p> : <p>請先登入。</p>}
    </div>
  );
}

export default App;
```

把 `isLoggedIn` 改成 `true` 存檔，畫面會變成「歡迎回來！」。

三元運算子也可以用在屬性上，例如依照條件換樣式：

```jsx,ignore
<p className={inStock ? "in-stock" : "sold-out"}>{name}</p>
```

### 做法三：`&&`，有就畫，沒有就不畫

很多時候你只想「條件成立就多畫一塊，不成立就什麼都不畫」，沒有「另一種情況」。這時候用 `&&` 最簡潔。把 `src/App.jsx` 換成：

```jsx
function App() {
  const unread = 3;

  return (
    <div>
      <h1>信箱</h1>
      {unread > 0 && <p>你有 {unread} 封未讀信件</p>}
    </div>
  );
}

export default App;
```

原理是 `&&` 的特性：`A && B`，如果 `A` 是 `false`，整個式子的值就是 `A`，也就是 `false`；如果 `A` 是 `true`，值就是 `B`。上一集說過 `false` 放進 `{}` 什麼都不會畫，所以：

- `unread > 0` 是 `true` → 結果是 `<p>...</p>`，會畫出來。
- `unread > 0` 是 `false` → 結果是 `false`，什麼都不畫。

### 一個很常見的陷阱：`0`

把 `src/App.jsx` 改成這樣：

```jsx
function App() {
  const count = 0;

  return (
    <div>
      <h1>購物車</h1>
      {count && <p>購物車裡有 {count} 件商品</p>}
    </div>
  );
}

export default App;
```

你本來想的是「沒有商品就不顯示」，結果畫面上多了一個孤零零的 `0`。

原因是 `count` 是 `0`，不是 `false`。`0 && ...` 的結果是左邊的 `0`，而數字 `0` 放進 `{}` 是會被畫出來的。

解法是**讓 `&&` 左邊永遠是真正的布林值**，把 `src/App.jsx` 改成：

```jsx
function App() {
  const count = 0;

  return (
    <div>
      <h1>購物車</h1>
      {count > 0 && <p>購物車裡有 {count} 件商品</p>}
    </div>
  );
}

export default App;
```

`count > 0` 的結果一定是 `true` 或 `false`，不會有 `0` 跑出來。

### 三種做法怎麼選

| 情況 | 用哪個 |
| --- | --- |
| 兩種畫面差很多、或邏輯比較長 | 在 `return` 之前用 `if` |
| 兩種情況，只有一小塊不同 | 三元運算子 `? :` |
| 只是「有就多畫一塊」 | `&&` |

### 綜合使用

在 `src/ProductCard.jsx` 裡把兩種都用上：

```jsx
function ProductCard({ name, price, isNew = false, inStock = true }) {
  return (
    <div style={{ opacity: inStock ? 1 : 0.4 }}>
      <h2>
        {name}
        {isNew && <span> 新品</span>}
      </h2>
      <p>{price} 元</p>
      {!inStock && <p>已售完</p>}
    </div>
  );
}

export default ProductCard;
```

用 `src/App.jsx` 試試看：

```jsx
import ProductCard from "./ProductCard.jsx";

function App() {
  return (
    <div>
      <ProductCard name="機械鍵盤" price={1200} isNew />
      <ProductCard name="無線滑鼠" price={600} inStock={false} />
    </div>
  );
}

export default App;
```

第一張卡片有「新品」標示；第二張變淡，並且多了一行「已售完」。

## 重點整理

- 條件渲染就是用 JavaScript 的條件決定畫什麼。
- 做法有三種：`return` 之前用 `if`、三元運算子、`&&`。
- 什麼都不想畫就回傳 `null`。
- `&&` 的左邊要是真正的布林值，不然 `0` 會被畫出來。
