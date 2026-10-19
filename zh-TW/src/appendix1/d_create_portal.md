# `createPortal`

## 本集目標

把元件渲染到畫面上的另一個位置，解決對話視窗被父元素的樣式切掉的問題。

## 正文

### 問題：被切掉的對話視窗

假設你有一個容器，用 CSS 設定了 `overflow: hidden`，超出範圍的內容會被切掉。你在容器裡放了一個按鈕，按下去要跳出一個對話視窗。

這個對話視窗在 JSX 裡寫在容器裡面，所以它在 DOM 裡也是容器的子孫。容器切掉了超出的部分，對話視窗也跟著被切。`position: fixed`、`z-index` 也常常被某一層父元素的設定影響。

### 解法：`createPortal`

**Portal**（傳送門）讓元件在 React 裡的位置不變，但是在 DOM 裡，內容被渲染到你指定的別的地方，通常是 `document.body`。

```jsx
// src/App.jsx
import { useState } from "react";
import { createPortal } from "react-dom";

function Modal({ children, onClose }) {
  return createPortal(
    <div role="dialog" style={{ position: "fixed", top: 20, left: 20 }}>
      <p>{children}</p>
      <button onClick={onClose}>關閉</button>
    </div>,
    document.body,
  );
}

export default function App() {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ overflow: "hidden", height: 40 }}>
      <button onClick={() => setOpen(true)}>開啟視窗</button>
      {open && (
        <Modal onClose={() => setOpen(false)}>哈囉，我在 body 底下！</Modal>
      )}
    </div>
  );
}
```

`createPortal(內容, 目標)` 接收兩個參數：要渲染的 JSX，以及要放進哪個 DOM 節點。它要從 `react-dom` 引入，不是 `react`。

執行後，按下「開啟視窗」。這個對話視窗出現在畫面上，沒有被 `overflow: hidden` 的容器切掉。打開瀏覽器的開發者工具看 DOM，會發現 `<div role="dialog">` 是 `<body>` 的直接子元素，不在 React 的根容器 `<div id="root">` 裡面。

### 在 React 裡，它還是原本的位置

最特別的地方是：雖然 DOM 的位置換了，**在 React 的元件樹裡，它還是 `App` 的子孫**。所以：

- Context 照樣能傳進去，Portal 裡的元件讀得到上層 Provider 的值。
- 事件會照元件樹往上冒泡，Portal 裡被按下的按鈕，它父元件的 `onClick` 也會收到。

換句話說，你不用擔心「它搬到別的地方，狀態和 Context 是不是斷了」，React 都照元件樹處理。

### 什麼時候用

任何「要浮在所有東西上面」的 UI：對話視窗、下拉選單、提示氣泡、通知訊息。很多 UI 套件（例如 Radix、MUI）內部就是這樣做的，你直接用它們的元件，不需要自己寫 Portal。

不過注意，原生的 HTML `<dialog>` 元素現在也可以處理很多對話視窗的需求，它會自己顯示在最上層，不需要 Portal。需要的時候可以先考慮它。

## 重點整理

- `createPortal(內容, 目標節點)` 讓內容渲染到 DOM 的別處，通常是 `document.body`。
- 它要從 `react-dom` 引入。
- 在 React 的元件樹裡位置不變，所以 Context 和事件冒泡都照常運作。
- 適用於對話視窗、下拉選單、提示等需要浮在最上層的 UI。
