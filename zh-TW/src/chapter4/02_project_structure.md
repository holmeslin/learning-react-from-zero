# 專案結構

## 本集目標

看懂 Vite 產生的檔案各自的用途，知道 React 是怎麼「接」到網頁上的。

## 正文

### 檔案總覽

展開 `hello-react` 資料夾，你會看到這些東西：

```text
hello-react/
├── index.html
├── package.json
├── package-lock.json
├── vite.config.js
├── .oxlintrc.json
├── public/
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── assets/
└── node_modules/
```

另外還有 `.gitignore` 和 `README.md`，這裡不談。

其中你會天天碰的是 `src/` 資料夾，**你寫的程式碼幾乎都放在這裡**。其他檔案多半設定好之後就不太會動。

### `index.html`：整個網站只有這一頁

用 VS Code 打開 `index.html`，最重要的是 `<body>` 這兩行：

```html
<div id="root"></div>
<script type="module" src="/src/main.jsx"></script>
```

React 做出來的網頁，HTML 本身幾乎是空的，只有一個叫 `root` 的空 `<div>`。畫面上看到的所有東西，都是 React 用 JavaScript 在這個空盒子裡一塊一塊畫出來的。

第二行 `<script>` 告訴瀏覽器：載入 `/src/main.jsx` 這支程式。這是整個 React 程式的起點。

### `src/main.jsx`：把 React 接上網頁

打開 `src/main.jsx`：

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
```

一行一行看：

- 前兩行從 `react` 和 `react-dom/client` 這兩個套件匯入需要的東西。
- `import './index.css'` 載入全域的樣式檔。
- `import App from './App.jsx'` 匯入你的第一個元件，名字叫 `App`，下一集會看它的內容。
- `document.getElementById('root')` 是第 3 章學過的 DOM 操作，找出 `index.html` 裡那個空 `<div>`。
- `createRoot(...)` 的意思是「把這個盒子交給 React 管」，`.render(...)` 則是「把這個東西畫進去」。
- 被畫進去的是 `<StrictMode><App /></StrictMode>`。`App` 就是你的整個應用程式。`StrictMode` 是 React 提供的檢查工具，只在開發時幫你找出可疑的寫法，發布後就沒有作用，第 11 集會用到它。

這個檔案你**幾乎不會再改**。之後做的事，都是在 `App` 裡面擴充。

### `src/App.jsx`：你的第一個元件

`App.jsx` 現在裝的是範本的歡迎頁，內容很長，也有點亂。下一集我們會把它換成自己寫的。

看一下它的第一行就好：

```jsx,ignore
import { useState } from 'react'
```

這是 React 提供的工具之一，第 5 章會學。

### `package.json`：專案的身分證

打開 `package.json`，有兩段值得看：

```json
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "lint": "oxlint",
  "preview": "vite preview"
},
```

這是「指令別名」。你輸入 `npm run dev`，npm 就會去執行 `vite`。四個指令的用途：

| 指令 | 用途 |
| --- | --- |
| `npm run dev` | 啟動開發伺服器，平常寫程式用 |
| `npm run build` | 打包成可以發布的版本，輸出到 `dist/` 資料夾 |
| `npm run preview` | 在本機預覽打包後的結果 |
| `npm run lint` | 用 Oxlint 檢查程式碼有沒有可疑的寫法 |

另一段是專案用到的套件：

```json
"dependencies": {
  "react": "^19.2.8",
  "react-dom": "^19.2.8"
},
```

`react` 是 React 本身，`react-dom` 負責把 React 的東西畫到網頁上。版本號碼前面的 `^` 表示「這個版本以上、但不跨大版本」，所以實際安裝的可能比這裡寫的新。你可以在終端機輸入 `npm ls react` 看實際裝了哪個版本，這本書寫的時候是 19.3。

### 其他檔案

- `package-lock.json`：記錄每個套件實際裝了哪個版本，npm 自己維護，不用手動改。
- `vite.config.js`：Vite 的設定，現在只有啟用 React 的支援，不用動。
- `.oxlintrc.json`：Oxlint 的設定。
- `public/`：放不需要處理的靜態檔案，網址直接對應，例如 `public/favicon.svg` 在網站上就是 `/favicon.svg`。
- `node_modules/`：所有下載來的套件。不要改，也不用擔心它的大小。

## 重點整理

- `index.html` 只有一個空的 `<div id="root">`，畫面都是 React 畫進去的。
- `src/main.jsx` 把 `App` 元件交給 React 畫進 `root`，是整個程式的起點。
- 你寫的程式碼放在 `src/` 裡。
- `npm run dev` 開發、`npm run build` 打包。
- `node_modules/` 和 `package-lock.json` 都不要手動修改。
