# 第一個路由

## 本集目標

安裝 React Router，讓 `/` 和 `/about` 兩個網址顯示不同的元件。

## 正文

### 安裝

在 `hello-react` 專案的終端機執行：

```bash
npm install react-router
```

這本書用的是 React Router 8。它所有的東西都從 `react-router` 這個套件匯入。如果你在網路上看到舊教學寫 `react-router-dom`，那是舊版的套件名稱，現在不需要了。

### 把應用程式包進 `BrowserRouter`

路由需要知道瀏覽器現在的網址，所以要把整個應用程式包在 `BrowserRouter` 裡面。打開 `src/main.jsx`：

```jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
```

和之前相比，只多了 `BrowserRouter` 那一層。這個檔案以後不用再動。

### 寫兩個頁面元件

頁面也只是元件，沒有什麼特別的。建立 `src/pages/Home.jsx`：

```jsx
export default function Home() {
  return <h1>首頁</h1>;
}
```

再建立 `src/pages/About.jsx`：

```jsx
export default function About() {
  return <h1>關於我們</h1>;
}
```

### 用 `Routes` 和 `Route` 對應網址

打開 `src/App.jsx`，改成這樣：

```jsx
import { Routes, Route } from "react-router";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="about" element={<About />} />
    </Routes>
  );
}
```

- `Routes` 是所有路由的容器。它會看目前的網址，找出符合的那一個 `Route`，只渲染那一個。
- 每個 `Route` 有兩個屬性：`path` 是網址的路徑，`element` 是這個網址要顯示的元件。注意 `element` 放的是 JSX（`<Home />`），不是元件的名字。

執行 `npm run dev`，在瀏覽器打開開發伺服器的網址（通常是 `http://localhost:5173`），你會看到「首頁」。把網址改成 `http://localhost:5173/about`，畫面就變成「關於我們」。

### 路徑的寫法

`path="/"` 是網站的根，也就是首頁。其他路徑的開頭斜線可寫可不寫，這本書不寫，所以是 `path="about"`，對應的網址是 `/about`。

網址不是任何一個 `Route` 的 `path` 時，`Routes` 什麼都不會渲染，畫面會是空白。這個問題第 7 集會處理。

### 重新整理會怎樣

在 `/about` 這個網址按重新整理，網頁還在，這是因為 Vite 的開發伺服器會對所有網址都回傳同一份 `index.html`，再由 React Router 決定要顯示什麼。之後如果要把網站放到正式的主機上，主機也要做同樣的設定，否則直接打開 `/about` 會出現找不到頁面。託管服務通常有「單頁應用程式」的選項，把它開啟就好。

## 重點整理

- 單頁應用程式只載入一次網頁，換頁由 JavaScript 完成。
- 用 `npm install react-router` 安裝，所有東西都從 `react-router` 匯入。
- `BrowserRouter` 包在最外層，`Routes` 裡面放多個 `Route`。
- `Route` 的 `path` 是網址路徑，`element` 是要顯示的 JSX。
- 頁面就是普通的元件。
