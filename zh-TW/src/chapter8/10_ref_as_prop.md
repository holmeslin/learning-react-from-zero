# ref 直接當 prop

## 本集目標

讓自己寫的元件接收 `ref`，不需要 `forwardRef`；並認識 ref 的清除函式。

## 正文

### 第 6 章的 ref 掛在原生元素上

第 6 章第 2 集，我們把 `ref` 掛在 `<input>` 這種原生元素上。如果想把 `ref` 掛在**自己寫的元件**上，讓父元件能控制元件裡的某個 DOM 元素，該怎麼做？

在 React 19 之前，要用 `forwardRef` 包住元件，寫法很繞。React 19 起，函式元件可以**直接**把 `ref` 當成一個普通的 prop 接收：

```jsx
import { useRef } from "react";

function MyInput({ placeholder, ref }) {
  return <input placeholder={placeholder} ref={ref} />;
}

export default function App() {
  const inputRef = useRef(null);

  return (
    <>
      <MyInput placeholder="你的名字" ref={inputRef} />
      <button onClick={() => inputRef.current.focus()}>聚焦輸入框</button>
    </>
  );
}
```

按下「聚焦輸入框」，輸入框就取得游標。

做法非常單純：

1. 父元件寫 `<MyInput ref={inputRef} />`。
2. `MyInput` 像接收其他 props 一樣，在參數裡解構出 `ref`。
3. `MyInput` 把 `ref` 繼續傳給裡面的 `<input ref={ref} />`。

`inputRef.current` 最後指向的就是那個 `<input>` DOM 元素。

### 那 `forwardRef` 呢

你在比較舊的程式碼和教學裡，會看到這樣的寫法：

```jsx,ignore
const MyInput = forwardRef(function MyInput({ placeholder }, ref) {
  return <input placeholder={placeholder} ref={ref} />;
});
```

`forwardRef` 在 React 19 還能運作，但新的元件已經不需要它，React 團隊表示未來的版本會棄用它。看到舊程式碼時知道它在做什麼就好，自己寫新元件直接用 `ref` prop。

### ref 的清除函式

除了傳 `useRef` 的物件，`ref` 也可以傳一個**函式**，叫做 ref callback。React 會在 DOM 元素掛上畫面時，呼叫這個函式並傳入該元素。React 19 起，這個函式也可以回傳一個**清除函式**，元素從畫面上移除時會被呼叫，跟第 6 章 Effect 的清除函式很像：

```jsx
import { useState } from "react";

function trackInput(node) {
  console.log("掛上", node.tagName);
  return () => console.log("卸下", node.tagName);
}

export default function App() {
  const [show, setShow] = useState(true);

  return (
    <>
      <button onClick={() => setShow(!show)}>{show ? "移除" : "加回來"}</button>
      {show && <input ref={trackInput} />}
    </>
  );
}
```

Console 一開始會印出：

```text
掛上 INPUT
```

按「移除」，輸入框從畫面上消失：

```text
卸下 INPUT
```

按「加回來」又會再印一次「掛上 INPUT」。這很適合用在「元素出現時要做某件事（例如開始觀察它的大小）、消失時要收拾」的情況。

### 小提醒：不要在 JSX 裡直接寫 ref 函式

範例把 ref 函式 `trackInput` 寫在元件外面，是刻意的。如果你直接在 JSX 寫成 `ref={(node) => { ... }}`，這個函式會在**每次渲染**都是全新的。React 發現 `ref` 變了，就會先「卸下」舊的、再「掛上」新的，每次渲染都這樣來一輪。需要 ref 函式時，把它定義成固定的函式。

## 重點整理

- React 19 起，函式元件可以直接把 `ref` 當 prop 接收，再傳給內部的元素。
- 不必再使用 `forwardRef`；舊程式碼看得懂就好，未來的 React 會棄用它。
- ref 也可以是函式（ref callback），並且能回傳清除函式，在元素移除時被呼叫。
- ref 函式不要直接寫在 JSX 裡，否則每次渲染都會卸下再掛上。
