# `useParams`

## 本集目標

讓一個頁面元件依照網址裡的一段內容，顯示不同的資料。

## 正文

### 一個元件，很多網址

商品有四個：`/products/1`、`/products/2`、`/products/3`、`/products/4`。總不能替每一個商品都寫一個 `Route`。我們要的是「同一個元件，網址最後那段是什麼，就顯示哪一個商品」。

這個做法叫**動態路徑**（dynamic segment）：路徑裡用冒號開頭的名字代表「這一段可以是任何東西」。

### 設定動態路徑

在 `App.jsx` 的 `products` 這一層底下，再加一個路由：

```jsx
<Route path="products">
  <Route index element={<Products />} />
  <Route path=":id" element={<ProductDetail />} />
</Route>
```

`path=":id"` 的意思是：`/products/` 後面不管接什麼，都符合這個路由，而且把那一段記成 `id`。

### 用 `useParams` 讀出來

建立 `src/pages/ProductDetail.jsx`：

```jsx
import { useParams } from "react-router";
import { products } from "../products.js";

export default function ProductDetail() {
  const { id } = useParams();
  const product = products.find((item) => item.id === Number(id));

  return (
    <>
      <h1>{product.name}</h1>
      <p>售價 {product.price} 元</p>
    </>
  );
}
```

`useParams()` 回傳一個物件，裡面有所有動態路徑的值，名字就是你在 `path` 裡取的名字。網址是 `/products/2` 時，`id` 就是 `"2"`。

### 網址上的值一律是字串

注意 `id` 是**字串** `"2"`，不是數字 2。商品的 `id` 是數字，如果直接寫 `item.id === id`，永遠是 `false`，因為 `2 === "2"` 不成立（第 1 章講過 `===` 不會偷偷轉型別）。所以上面用 `Number(id)` 把字串轉成數字再比。

### 網址亂打會怎樣

現在打開 `/products/99`，畫面會直接壞掉：

```text
Cannot read properties of undefined (reading 'name')
```

這就是第 1 章講過的最常見錯誤：`find` 找不到時回傳 `undefined`，接著對它讀 `name`。使用者隨時可以在網址列亂打，所以一定要處理「找不到」的情況：

```jsx
import { Link, useParams } from "react-router";
import { products } from "../products.js";

export default function ProductDetail() {
  const { id } = useParams();
  const product = products.find((item) => item.id === Number(id));

  if (product === undefined) {
    return <p>找不到商品 {id}</p>;
  }

  return (
    <>
      <h1>{product.name}</h1>
      <p>售價 {product.price} 元</p>
      <Link to="/products">回到商品列表</Link>
    </>
  );
}
```

### 從列表連過來

最後把列表上每一項改成連結。打開 `Products.jsx`：

```jsx
import { Link } from "react-router";
import { products } from "../products.js";

export default function Products() {
  return (
    <>
      <h1>商品</h1>
      <ul>
        {products.map((product) => (
          <li key={product.id}>
            <Link to={`/products/${product.id}`}>{product.name}</Link>
          </li>
        ))}
      </ul>
    </>
  );
}
```

`to` 用樣板字面值組出每個商品自己的網址。點一下商品，就會到 `/products/2` 這樣的頁面，而且導覽列的「商品」連結還是粗體，因為 `/products/2` 也是以 `/products` 開頭。

### 多個參數

一條路徑可以有好幾個動態路徑，例如 `path="/c/:categoryId/p/:productId"`，用 `const { categoryId, productId } = useParams();` 一次讀出來。同一條路徑裡的名字不要重複。

## 重點整理

- 路徑裡以冒號開頭的一段，例如 `:id`，是動態路徑。
- `useParams()` 回傳物件，裡面有每個動態路徑的值。
- 網址上的值永遠是字串，要比對數字時先用 `Number()` 轉。
- 網址使用者說了算，一定要處理「找不到資料」的情況。
