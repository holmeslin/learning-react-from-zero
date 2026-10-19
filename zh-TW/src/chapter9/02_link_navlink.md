# `Link` 與 `NavLink`

## 本集目標

用 `Link` 換頁而不重新載入網頁，並用 `NavLink` 標示目前所在的頁面。

## 正文

### 為什麼不能用 `<a>`

HTML 的 `<a href="/about">` 會讓瀏覽器重新載入整個網頁，React 的狀態全部消失。來做個實驗。建立 `src/Nav.jsx`：

```jsx
import { useState } from "react";
import { Link } from "react-router";

export default function Nav() {
  const [clicks, setClicks] = useState(0);

  return (
    <nav>
      <button onClick={() => setClicks(clicks + 1)}>按了 {clicks} 次</button>{" "}
      <a href="/about">普通連結</a> <Link to="/about">Link</Link>
    </nav>
  );
}
```

然後在 `App.jsx` 把 `<Nav />` 放在 `<Routes>` 上面：

```jsx
import { Routes, Route } from "react-router";
import Nav from "./Nav.jsx";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";

export default function App() {
  return (
    <>
      <Nav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="about" element={<About />} />
      </Routes>
    </>
  );
}
```

打開網頁，先按幾下按鈕讓次數變大，再點「Link」：網址變成 `/about`，畫面換成「關於我們」，按鈕的次數**還在**。回到首頁，再按幾下按鈕，這次點「普通連結」：整個網頁重新載入，次數歸零。

`Link` 的用法就像 `<a>`，只是屬性叫 `to`，不是 `href`。它會攔下使用者的點選，只改網址和畫面，不重新載入。**站內的連結一律用 `Link`**；連到別人的網站才用普通的 `<a>`。

### `NavLink`：知道自己是不是目前這頁

導覽列常常需要把目前所在的頁面標出來。`NavLink` 是加強版的 `Link`，目前網址符合它的 `to` 時，它會自動加上 `active` 這個 class。

把 `Nav.jsx` 改成：

```jsx
import { NavLink } from "react-router";

export default function Nav() {
  return (
    <nav>
      <NavLink to="/" end>
        首頁
      </NavLink>{" "}
      <NavLink to="/about">關於</NavLink>
    </nav>
  );
}
```

再加上一行 CSS，到 `src/index.css`：

```css
nav a.active {
  font-weight: bold;
}
```

現在在哪一頁，那一頁的連結就是粗體。

### `end` 是什麼

注意首頁那個連結多了一個 `end`。`NavLink` 預設用「開頭符合」來判斷：目前網址是 `/about` 時，`to="/"` 也算符合，因為所有網址都是從 `/` 開頭的。結果首頁的連結會永遠是粗體。

加上 `end`，意思是「必須完全一樣才算」，首頁連結就只會在 `/` 時亮起來。其他連結不需要 `end`，這樣 `/products/3` 也能讓 `to="/products"` 的連結亮著。

### 用函式決定 class 或 style

想自己決定 active 時的外觀，`className` 可以傳一個函式，參數裡有 `isActive`：

```jsx
import { NavLink } from "react-router";

export default function Nav() {
  return (
    <nav>
      <NavLink
        to="/about"
        className={({ isActive }) => (isActive ? "tab tab-on" : "tab")}
      >
        關於
      </NavLink>
    </nav>
  );
}
```

`style` 和 `children` 也可以這樣用。用預設的 `active` class 就夠用的時候，不需要這麼麻煩。

## 重點整理

- 站內連結用 `Link`，屬性是 `to`；`<a>` 會讓網頁重新載入，狀態全部消失。
- `NavLink` 在目前網址符合時，自動加上 `active` class。
- 指向 `/` 的 `NavLink` 要加 `end`，不然它會永遠是 active。
- `className` 可以傳函式，參數有 `isActive`。
