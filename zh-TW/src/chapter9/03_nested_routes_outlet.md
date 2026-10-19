# 巢狀路由與 `Outlet`

## 本集目標

讓多個頁面共用同一個版面，例如同一個導覽列。

## 正文

### 每一頁都要放導覽列嗎

上一集我們把 `<Nav />` 放在 `App` 裡，剛好每一頁都有。但真實的網站不只有導覽列，還有頁尾、側邊欄，而且有些頁面（例如登入頁）不想要這些東西。把它們硬塞進 `App` 很快就不夠用。

React Router 的解法是**巢狀路由**（nested routes）：讓一個 `Route` 當作外層，裡面包著其他 `Route`。外層負責共用的版面，內層負責各自的內容。

### 版面元件與 `Outlet`

建立 `src/Layout.jsx`：

```jsx
import { NavLink, Outlet } from "react-router";

export default function Layout() {
  return (
    <>
      <nav>
        <NavLink to="/" end>
          首頁
        </NavLink>{" "}
        <NavLink to="/products">商品</NavLink>{" "}
        <NavLink to="/about">關於</NavLink>
      </nav>
      <main>
        <Outlet />
      </main>
    </>
  );
}
```

`Outlet` 是「出口」，意思是：「內層路由的內容，渲染在這裡」。它很像第 4 章學過的 `children`，只是內容是由網址決定的。

### 把內層路由包進外層

現在把 `App.jsx` 改成：

```jsx
import { Routes, Route } from "react-router";
import Layout from "./Layout.jsx";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
      </Route>
    </Routes>
  );
}
```

兩個新東西：

- 外層的 `Route` **沒有 `path`**，只有 `element`。沒有 `path` 的路由不會在網址上加任何東西，單純是提供版面。這種路由叫 layout route。
- 首頁改用 `index` 取代 `path="/"`。`index` 的意思是「外層網址剛好符合、沒有更多路徑的時候，顯示這一個」。

網址是 `/about` 時，React Router 會先渲染 `Layout`，再把 `About` 放進 `Layout` 裡面的 `Outlet`。換頁時，`Layout` 本身不會重新建立，只有 `Outlet` 裡的內容換掉。上一集的 `src/Nav.jsx` 已經用不到，可以刪掉。

### 共同的路徑開頭

外層 `Route` 有 `path` 但沒有 `element` 時，它就變成「共同的路徑開頭」：底下所有的內層路由，網址都會加上這段開頭。我們用這個做商品頁。先建立 `src/products.js`：

```js
export const products = [
  { id: 1, name: "機械鍵盤", price: 2400, category: "keyboard" },
  { id: 2, name: "無線滑鼠", price: 890, category: "mouse" },
  { id: 3, name: "人體工學滑鼠", price: 1990, category: "mouse" },
  { id: 4, name: "60% 小鍵盤", price: 1800, category: "keyboard" },
];
```

再建立 `src/pages/Products.jsx`，先簡單列出名字：

```jsx
import { products } from "../products.js";

export default function Products() {
  return (
    <>
      <h1>商品</h1>
      <ul>
        {products.map((product) => (
          <li key={product.id}>{product.name}</li>
        ))}
      </ul>
    </>
  );
}
```

在 `App.jsx` 加上商品路由：

```jsx
<Route path="products">
  <Route index element={<Products />} />
</Route>
```

放在 `<Route path="about" ... />` 的下面，也別忘了在檔案開頭 `import Products from "./pages/Products.jsx";`。現在 `/products` 會顯示商品列表。下一集會在 `products` 底下加上單一商品的頁面。

## 重點整理

- 巢狀路由讓外層 `Route` 提供版面，內層 `Route` 提供內容。
- 外層元件用 `<Outlet />` 標出內層內容要出現的位置。
- 沒有 `path` 的外層 `Route` 只提供版面，不影響網址。
- `index` 路由在外層網址剛好符合時顯示。
- 有 `path` 沒有 `element` 的 `Route`，是共同的路徑開頭。
