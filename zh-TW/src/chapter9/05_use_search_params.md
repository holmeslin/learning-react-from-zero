# `useSearchParams`

## 本集目標

用網址問號後面的**查詢參數**記住篩選條件，例如 `/products?category=mouse`。

## 正文

### 什麼是查詢參數

網址 `/products?category=mouse` 中，問號後面的 `category=mouse` 叫**查詢參數**（query string，或 search params）。可以用 `&` 接多組，例如 `?category=mouse&sort=price`。

它和上一集的動態路徑不一樣：動態路徑決定「是哪一頁」，查詢參數是「這一頁的附加條件」，例如篩選、排序、頁碼，有沒有都可以。

為什麼要把篩選條件放在網址，而不放進 `useState`？因為網址可以複製貼上給別人，重新整理也不會消失，上一頁、下一頁也會正確運作。

### 讀取

`useSearchParams` 的用法很像 `useState`：回傳一個陣列，第一個是目前的查詢參數，第二個是修改它的函式。

```jsx
import { useSearchParams } from "react-router";

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("category") ?? "all";

  return <p>目前分類：{category}</p>;
}
```

`searchParams` 是瀏覽器內建的 `URLSearchParams` 物件，用 `.get("名稱")` 取值。網址上沒有這個參數時，`.get` 會回傳 `null`，所以後面接 `?? "all"`，用第 2 章學過的 `??` 給預設值。

### 修改

`setSearchParams` 傳入一個物件，網址就會跟著改，畫面也會重新渲染：

```jsx
setSearchParams({ category: "mouse" });
```

跟 `useState` 的 setter 一樣，改了之後元件會重新渲染。差別是這個狀態存在網址裡。

### 完整範例：分類篩選

把 `Products.jsx` 改成：

```jsx
import { Link, useSearchParams } from "react-router";
import { products } from "../products.js";

const categories = ["all", "keyboard", "mouse"];

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const category = searchParams.get("category") ?? "all";

  const visible =
    category === "all"
      ? products
      : products.filter((product) => product.category === category);

  return (
    <>
      <h1>商品</h1>
      <p>
        {categories.map((name) => (
          <button
            key={name}
            disabled={name === category}
            onClick={() => setSearchParams({ category: name })}
          >
            {name}
          </button>
        ))}
      </p>
      <ul>
        {visible.map((product) => (
          <li key={product.id}>
            <Link to={`/products/${product.id}`}>{product.name}</Link>
          </li>
        ))}
      </ul>
    </>
  );
}
```

按一下「mouse」，網址變成 `/products?category=mouse`，列表只剩兩支滑鼠。複製這個網址貼到新分頁，一樣是滑鼠的列表。

這裡的 `visible` 是從網址的 `category` 算出來的，不是另外存的 state。網址就是唯一的資料來源，這和 React 一貫的原則一樣：能算出來的，就不要另外存成 state。

### 小心：它會取代全部

`setSearchParams({ category: name })` 會把整串查詢參數換成新的。如果網址原本是 `?category=mouse&sort=price`，按了按鈕之後 `sort` 就不見了。想保留其他參數，可以傳一個函式，用法和 `useState` 的更新函式一樣：

```jsx
setSearchParams((prev) => {
  const next = new URLSearchParams(prev);
  next.set("category", name);
  return next;
});
```

函式收到目前的參數 `prev`，你複製一份、改掉要改的，再回傳。複製這一步不要省：直接改 `prev` 會動到原本的物件，容易出現畫面和網址對不上的怪事。

## 重點整理

- 查詢參數是網址問號後面的 `名稱=值`，適合放篩選、排序、頁碼。
- `useSearchParams()` 回傳 `[searchParams, setSearchParams]`。
- 用 `searchParams.get("名稱")` 取值，沒有就是 `null`，可以用 `??` 給預設值。
- `setSearchParams({ ... })` 會取代整串參數；要保留其他參數，傳函式並複製一份。
