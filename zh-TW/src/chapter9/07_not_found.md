# 404 頁面

## 本集目標

使用者打了不存在的網址時，顯示友善的「找不到頁面」，並替整章做個總結。

## 正文

### 沒有路由符合的時候

打開 `/xyz` 這種沒有任何 `Route` 符合的網址，目前的畫面是空白的，什麼提示都沒有。使用者會以為網站壞了。

### 用 `path="*"` 接住所有其他網址

`*` 是萬用字元，代表「任何東西」。把它放在最後面，當作其他路由都沒符合時的後備：

```jsx
<Route path="*" element={<NotFound />} />
```

React Router 會挑最符合的路由，所以 `/about` 還是會去 `about` 那一個，不會被 `*` 搶走。`*` 只接住沒人要的網址。

建立 `src/pages/NotFound.jsx`：

```jsx
import { Link } from "react-router";

export default function NotFound() {
  return (
    <>
      <h1>找不到這一頁</h1>
      <Link to="/">回首頁</Link>
    </>
  );
}
```

放進 `Layout` 裡面，這樣找不到頁面時，導覽列還在，使用者可以直接點去別的地方：

```jsx
<Route element={<Layout />}>
  <Route index element={<Home />} />
  <Route path="about" element={<About />} />
  <Route path="*" element={<NotFound />} />
</Route>
```

### 兩種「找不到」

注意這是兩件不同的事：

- **這個網址根本沒有對應的頁面**：例如 `/xyz`，交給 `path="*"`。
- **有對應的頁面，但是找不到資料**：例如 `/products/99`。路由本身符合（`:id` 什麼都接受），只是商品不存在，這要由本章第 4 集 `ProductDetail` 裡的 `if (product === undefined)` 處理。

兩個都要做，使用者才不會看到壞掉的畫面。

### 整章總結：最後的 `App.jsx`

這一章做完之後，`App.jsx` 長這樣：

```jsx
import { Routes, Route } from "react-router";
import Layout from "./Layout.jsx";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Products from "./pages/Products.jsx";
import ProductDetail from "./pages/ProductDetail.jsx";
import Contact from "./pages/Contact.jsx";
import Thanks from "./pages/Thanks.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="products">
          <Route index element={<Products />} />
          <Route path=":id" element={<ProductDetail />} />
        </Route>
        <Route path="contact" element={<Contact />} />
        <Route path="thanks" element={<Thanks />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
```

讀這份路由表，就能一眼看出整個網站有哪些網址。這是 Declarative mode 的好處：路由全部寫在一個地方，用 JSX 讀起來就像一棵樹。

### 接下來

React Router 其實還有另外兩種模式（Data mode 和 Framework mode），可以在換頁前先載入資料、處理表單送出。這本書不教。第二部的 Next.js 會用另一種方式解決同樣的問題，兩邊都學容易混淆。附錄二有一集簡單介紹 React Router 的框架模式，需要時再去看就好。

接下來兩章都繼續在 `hello-react` 裡進行：第 10 章學 TypeScript，最後把這個專案整個改成 TypeScript，讓編輯器在你執行程式之前，就抓出像「商品找不到卻還去讀它的名字」這種錯誤；第 11 章再替這個商品網站寫測試。

## 重點整理

- `path="*"` 接住所有其他路由都沒符合的網址，放在 `Layout` 裡可以保留導覽列。
- 「網址沒有對應頁面」和「頁面有但資料找不到」是兩件事，都要處理。
- 把所有 `Route` 寫在一起，就是整個網站的地圖。
