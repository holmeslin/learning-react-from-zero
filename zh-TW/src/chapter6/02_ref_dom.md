# 用 ref 操作 DOM

## 本集目標

用 ref 拿到真正的 DOM 元素，並呼叫它的瀏覽器內建方法。

## 正文

React 幫你管理畫面，大部分時候你不需要碰 DOM。但有些事情只能直接對 DOM 元素下指令，例如讓輸入框取得游標（`focus`）、捲動到某個位置、播放或暫停影片。

### 把 ref 掛在元素上

把 `useRef` 回傳的物件傳給元素的 `ref` 屬性，React 就會在元素建立好之後，把那個 DOM 元素放進 `ref.current`：

```jsx
import { useRef } from "react";

export default function App() {
  const inputRef = useRef(null);

  return (
    <>
      <input ref={inputRef} placeholder="你的名字" />
      <button onClick={() => inputRef.current.focus()}>聚焦輸入框</button>
    </>
  );
}
```

按下按鈕，輸入框就會取得游標。

- `useRef(null)`：一開始沒有東西，所以給 `null`。
- `<input ref={inputRef} />`：告訴 React「這個元素請放進 `inputRef.current`」。
- `inputRef.current.focus()`：`inputRef.current` 就是瀏覽器裡真正的 `<input>` 元素，`focus()` 是它內建的方法。

### 什麼時候才拿得到

元件第一次渲染的時候，畫面還沒有真的建立，所以 `inputRef.current` 是 `null`。要等 React 把元素放上畫面之後，`current` 才會有值。

這就是為什麼上面的範例把 `focus()` 放在按鈕的點按事件裡：使用者能點到按鈕時，畫面早就建好了。不要在元件函式的主體裡直接寫 `inputRef.current.focus()`，那時候它還是 `null`，會出錯。

### 常見的 DOM 方法

拿到 DOM 元素之後，可以呼叫瀏覽器提供的方法，常用的有：

- `element.focus()`：取得游標。
- `element.scrollIntoView()`：把元素捲動到可見範圍。
- `videoElement.play()` / `videoElement.pause()`：播放與暫停影片。

### 不要用 ref 改 React 管的東西

ref 是留給 React 做不到的事情用的「逃生口」。React 已經會處理的部分，例如要顯示什麼文字、元素要不要出現，一律交給 state 和 JSX，不要用 ref 去改元素的內容或刪掉元素，否則 React 和你會互相打架。

```jsx,ignore
// 不要這樣做：React 不知道你改了什麼
inputRef.current.value = "小明";
```

## 重點整理

- 把 `useRef(null)` 的結果傳給元素的 `ref`，React 會把 DOM 元素放進 `ref.current`。
- 元件第一次渲染時 `ref.current` 是 `null`，要在事件處理函式或 Effect 裡才拿得到元素。
- 拿到元素後可以呼叫 `focus()`、`scrollIntoView()` 這類瀏覽器內建方法。
- 畫面內容交給 state 管，ref 只用在 React 做不到的事。
