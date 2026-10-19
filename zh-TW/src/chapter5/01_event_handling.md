# 事件處理

## 本集目標

在元件裡處理使用者的操作，例如點按鈕、送出表單。

## 正文

### 第一個事件

使用者做出的動作，例如點按鈕、打字、送出表單，瀏覽器稱為**事件**（event）。在 React 裡，你在元素上加一個 `onClick` 這樣的屬性，告訴它「發生這個事件的時候，執行這個函式」。

把 `src/App.jsx` 換成：

```jsx
function App() {
  function handleClick() {
    console.log("按鈕被點了！");
  }

  return <button onClick={handleClick}>點我</button>;
}

export default App;
```

存檔後，打開瀏覽器的開發者工具（F12），切到 Console 分頁，然後點按鈕。每點一次，Console 就會多一行「按鈕被點了！」。

拆開來看：

- `handleClick` 是一個**事件處理函式**（event handler），寫在元件裡面。習慣上名稱用 `handle` 開頭。
- `onClick={handleClick}` 把這個函式交給按鈕。事件名稱用 camelCase，`onClick`、`onChange`、`onSubmit` 都是。
- 如果處理邏輯很短，也可以直接寫成箭頭函式，`src/App.jsx` 可以改成：

```jsx
function App() {
  return <button onClick={() => console.log("點了")}>點我</button>;
}

export default App;
```

### 傳的是函式，不是呼叫結果

這是新手最常犯的錯。比較這兩種寫法：

```jsx,ignore
<button onClick={handleClick}>點我</button>
<button onClick={handleClick()}>點我</button>
```

第一個正確：把函式本身交給 `onClick`，等使用者點的時候，React 才去呼叫它。第二個是錯的：`handleClick()` 後面的括號代表「現在就呼叫」，所以函式會在畫面渲染的時候就被執行，`onClick` 拿到的是它的回傳值，點的時候什麼都不會發生。

用剛才的例子試試看，把按鈕改成 `onClick={handleClick()}`：存檔之後你會發現，Console 在**還沒點的時候**就出現了訊息（因為 `<StrictMode>` 會多渲染一次，訊息還會出現兩次），而且點按鈕沒有任何反應。記得這個症狀：事件處理函式在載入時就自己跑了，通常就是多寫了括號。

那如果要傳參數怎麼辦？用箭頭函式包起來，把 `src/App.jsx` 換成：

```jsx
function App() {
  function handleBuy(name) {
    console.log("買了", name);
  }

  return (
    <div>
      <button onClick={() => handleBuy("鍵盤")}>買鍵盤</button>
      <button onClick={() => handleBuy("滑鼠")}>買滑鼠</button>
    </div>
  );
}

export default App;
```

`() => handleBuy("鍵盤")` 是一個「被點的時候才會執行」的函式，所以括號是在它裡面，不會提前執行。

### 事件物件

事件處理函式會自動收到一個參數，通常取名為 `event`，裡面有這次事件的詳細資訊。把 `src/App.jsx` 換成：

```jsx
function App() {
  function handleClick(event) {
    console.log(event.type);
    console.log(event.target.tagName);
  }

  return <button onClick={handleClick}>點我</button>;
}

export default App;
```

點了之後 Console 會印出 `click` 和 `BUTTON`：事件的種類，以及被點的元素是什麼標籤。接下來的幾集，你會常用到 `event.target`。

### 常見的事件

| 事件 | 什麼時候發生 |
| --- | --- |
| `onClick` | 點一下 |
| `onChange` | 輸入框的內容改變 |
| `onSubmit` | 表單送出 |
| `onKeyDown` | 按下鍵盤的某個鍵 |
| `onMouseEnter` | 滑鼠移進元素 |

### 阻止預設行為

表單送出的時候，瀏覽器預設會重新載入整個頁面。在 React 裡，我們不要這個行為，要用 `event.preventDefault()` 阻止它，把 `src/App.jsx` 換成：

```jsx
function App() {
  function handleSubmit(event) {
    event.preventDefault();
    console.log("表單送出了，但頁面沒有重新整理");
  }

  return (
    <form onSubmit={handleSubmit}>
      <button type="submit">送出</button>
    </form>
  );
}

export default App;
```

如果忘了 `event.preventDefault()`，一按送出，整個頁面就重新整理，剛才輸入的東西全部消失。

### 把事件處理函式傳給別的元件

事件處理函式也只是一個函式，可以當成 props 傳給子元件。習慣上這種 props 用 `on` 開頭，把 `src/App.jsx` 換成：

```jsx
function ActionButton({ label, onClick }) {
  return <button onClick={onClick}>{label}</button>;
}

function App() {
  function handleSave() {
    console.log("已儲存");
  }

  return <ActionButton label="儲存" onClick={handleSave} />;
}

export default App;
```

`ActionButton` 自己不知道按下去要做什麼，只負責把「被點了」這件事通知出去。真正的行為由使用它的 `App` 決定。這個設計在第 10 集會再用到。

### 事件處理函式是做事的好地方

第 4 章第 11 集說過，渲染的時候不可以做修改外面東西的事。事件處理函式不一樣：它只在使用者操作時才執行，不是渲染的一部分，所以在裡面可以放心地改資料、印東西、呼叫別的函式。

## 重點整理

- 在元素上用 `onClick` 這類屬性指定事件處理函式，事件名稱用 camelCase。
- 傳的是函式本身 `onClick={handleClick}`，不是 `onClick={handleClick()}`。
- 要傳參數，用箭頭函式包起來：`onClick={() => handleBuy("鍵盤")}`。
- 事件處理函式會收到事件物件，常用 `event.target`。
- 表單的 `onSubmit` 要呼叫 `event.preventDefault()`。
- 事件處理函式可以當成 props 傳給子元件，名稱習慣用 `on` 開頭。
