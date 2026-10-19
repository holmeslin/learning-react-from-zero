# state 是快照

## 本集目標

理解「每一次渲染的 state 都是固定不變的快照」，避開最常見的 state 陷阱。

## 正文

### 一個令人困惑的實驗

把 `src/App.jsx` 換成：

```jsx
import { useState } from "react";

function App() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount(count + 1);
    setCount(count + 1);
    setCount(count + 1);
  }

  return (
    <div>
      <p>count：{count}</p>
      <button onClick={handleClick}>加三</button>
    </div>
  );
}

export default App;
```

按鈕的名稱是「加三」，裡面呼叫了三次 `setCount(count + 1)`。你可能預期按一下會加 3，但實際點下去，畫面是 `count：1`。

再點一下，變成 2。每次只加 1。為什麼？

### state 是一張照片

關鍵在於：**每一次渲染，都會拿到一份固定的 state 值，在這一次渲染的過程中，它不會變。**

可以把每一次渲染想成拍一張照片。第一次渲染的時候，`count` 是 0，這張照片裡 `count` 永遠是 0，包括裡面的 `handleClick`，它看到的 `count` 也永遠是 0。所以：

```jsx,ignore
setCount(count + 1);  // setCount(0 + 1)
setCount(count + 1);  // setCount(0 + 1)
setCount(count + 1);  // setCount(0 + 1)
```

三行其實都是 `setCount(1)`，做了三次一模一樣的事，結果當然是 1。

`setCount` 的工作不是「馬上改掉 `count` 這個變數」，而是「跟 React 說：下一次渲染的時候，請把 `count` 換成這個值」。換新值要等到下一次渲染，也就是拍下一張照片的時候。

### 在 `set` 之後立刻讀，還是舊的

這個觀念可以用另一個實驗再確認一次。把 `src/App.jsx` 換成：

```jsx
import { useState } from "react";

function App() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount(count + 5);
    console.log("剛剛呼叫 setCount，count 是", count);
  }

  return (
    <div>
      <p>count：{count}</p>
      <button onClick={handleClick}>加五</button>
    </div>
  );
}

export default App;
```

打開 Console 點按鈕。第一次，畫面變成 5，但 Console 印出的是：

```text
剛剛呼叫 setCount，count 是 0
```

第二次點，畫面變成 10，Console 印出：

```text
剛剛呼叫 setCount，count 是 5
```

Console 永遠印出「按下按鈕當下那張照片裡的值」，也就是畫面上更新前的值。`setCount` 沒有讓 `handleClick` 裡的 `count` 突然變成新的值，它只是安排了下一次渲染。

### 那怎麼辦

這種設計一開始有點違反直覺，但它帶來一個很大的好處：**在任何一次渲染裡，state 的值都是確定的，不會在你看的時候悄悄變掉**，所以程式的行為很好預測。

至於剛才「想連續加三次」的需求，React 有專門的寫法，下一集就會學到。

現在要記住的觀念是：

- 事件處理函式裡的 state，是**這一次渲染的快照**。
- `setState` 不會立刻改變手上這份值，只會讓 React 在下一次渲染時用新的值。

## 重點整理

- 每次渲染，state 都是一份固定的快照，在這一次渲染裡不會改變。
- 事件處理函式看到的 state，是它所屬那一次渲染的值。
- `setState(新值)` 的意思是「請下一次渲染用這個值」，不是立刻改變變數。
- 連續呼叫三次 `setCount(count + 1)`，等於呼叫三次 `setCount(同一個數字)`。
