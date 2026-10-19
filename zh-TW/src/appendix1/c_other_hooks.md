# 其他 Hook

## 本集目標

認識四個比較少用、但遲早會遇到的 Hook：`useId`、`useLayoutEffect`、`useSyncExternalStore`、`useImperativeHandle`。

## 正文

這四個 Hook 都有明確的用途，平常寫畫面不太需要，但是看到別人的程式碼時，知道它們在做什麼會很有幫助。

### `useId`：產生唯一的 id

表單的 `<label>` 要用 `htmlFor` 對應 `<input>` 的 `id`。如果一個元件會被使用很多次，`id` 就會重複，而 HTML 的 `id` 不能重複。`useId` 會幫你產生每次都不一樣的 id：

```jsx
// src/App.jsx
import { useId } from "react";

function Field({ label }) {
  const id = useId();

  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input id={id} />
    </div>
  );
}

export default function App() {
  return (
    <form>
      <Field label="姓名" />
      <Field label="信箱" />
    </form>
  );
}
```

在瀏覽器裡看 DOM，兩個 `<input>` 的 id 各是 `_r_0_` 和 `_r_1_`，`<label>` 的 `for` 也對得上。點「姓名」的文字，游標會跑進第一個輸入框。

注意：id 的格式是 React 內部決定的，不要依賴它，也不要拿它當 `list` 的 `key`。

### `useLayoutEffect`：在畫面畫出來之前執行

`useEffect` 是在畫面更新**之後**執行。`useLayoutEffect` 的寫法一模一樣，差別是它在畫面**畫出來之前**就執行。

什麼時候需要？當你要先量一個元素的大小，再依照它決定畫面的樣子，而且不想讓使用者看到「閃一下」：

```jsx
// src/App.jsx
import { useLayoutEffect, useRef, useState } from "react";

export default function App() {
  const boxRef = useRef(null);
  const [height, setHeight] = useState(0);

  useLayoutEffect(() => {
    setHeight(boxRef.current.getBoundingClientRect().height);
  }, []);

  return (
    <div>
      <div ref={boxRef} style={{ height: 50 }}>
        一個高度 50 像素的方塊
      </div>
      <p>量到的高度：{height}px</p>
    </div>
  );
}
```

畫面上會顯示「量到的高度：50px」。因為是 `useLayoutEffect`，量完、更新 `height` 的動作在使用者看到畫面之前就完成了，不會看到「0px」閃一下。

這種情況很少見，所以**預設用 `useEffect`**。只有當你發現畫面「閃一下」、而原因是需要先量測 DOM 時，才換成 `useLayoutEffect`。

### `useSyncExternalStore`：訂閱 React 以外的資料

有些資料不是 React 管的，例如瀏覽器是否有網路（`navigator.onLine`）、視窗大小。它們會自己改變，React 並不知道。要讓元件能跟著這些資料更新，用 `useSyncExternalStore`。

它需要兩個函式：

- `subscribe`：告訴 React「資料變了的時候，要怎麼通知你」。
- `getSnapshot`：告訴 React「現在的值是什麼」。

```jsx
// src/App.jsx
import { useSyncExternalStore } from "react";

function subscribe(callback) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function useOnlineStatus() {
  return useSyncExternalStore(
    subscribe,
    () => navigator.onLine,
    () => true,
  );
}

export default function App() {
  const isOnline = useOnlineStatus();

  return <p>{isOnline ? "✅ 有網路" : "❌ 沒有網路"}</p>;
}
```

`subscribe` 裡面註冊了 `online` 和 `offline` 事件，事件發生時呼叫 `callback`，React 就會重新讀取最新的值。它回傳的函式是清除用的，和 `useEffect` 的清除函式一樣。

第三個參數是「在伺服器上渲染時的值」。伺服器上沒有 `navigator`，所以給一個預設值。如果你只在瀏覽器裡用（像 Vite 專案），也要寫，避免日後搬到 Next.js 時出錯。

你可以在瀏覽器的開發者工具把網路切成「Offline」，畫面會立刻變成「❌ 沒有網路」。

### `useImperativeHandle`：決定父元件能拿到什麼

你在第 6 章學過 ref 可以拿到 DOM 元素。如果把 ref 傳給自己寫的元件，父元件拿到的是裡面那個 DOM 元素，它什麼都能做。

有時候你只想讓父元件能做「特定幾件事」，例如只能「聚焦」和「清空」。這時用 `useImperativeHandle`，自己決定 ref 上要放什麼：

```jsx
// src/App.jsx
import { useImperativeHandle, useRef } from "react";

function FancyInput({ ref }) {
  const inputRef = useRef(null);

  useImperativeHandle(ref, () => ({
    focus() {
      inputRef.current.focus();
    },
    clear() {
      inputRef.current.value = "";
    },
  }));

  return <input ref={inputRef} id="fancy" />;
}

export default function App() {
  const fancyRef = useRef(null);

  return (
    <div>
      <FancyInput ref={fancyRef} />
      <button onClick={() => fancyRef.current.focus()}>聚焦</button>
      <button onClick={() => fancyRef.current.clear()}>清空</button>
    </div>
  );
}
```

React 19 之後，`ref` 可以直接當 prop 傳進函式元件，像 `FancyInput({ ref })` 這樣，不需要 `forwardRef`（下一集會提）。

`useImperativeHandle(ref, () => ({...}))` 的第二個參數回傳一個物件，這個物件就是父元件從 `fancyRef.current` 拿到的東西。所以父元件只能呼叫 `focus()` 和 `clear()`，碰不到裡面的 `<input>`。

在輸入框打幾個字，按「清空」，文字會被清掉；按「聚焦」，游標會回到輸入框。

這個 Hook 是最後手段。大部分時候，用 props 傳資料和事件就夠了。

## 重點整理

- `useId` 產生唯一的 id，用來連結 `<label>` 和 `<input>`。
- `useLayoutEffect` 在畫面畫出來之前執行，只在需要先量 DOM 再決定畫面時使用，平常用 `useEffect`。
- `useSyncExternalStore` 用來訂閱 React 以外的資料，例如網路狀態。
- `useImperativeHandle` 讓元件自己決定，ref 要給父元件哪些功能。
