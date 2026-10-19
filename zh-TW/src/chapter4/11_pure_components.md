# 元件要是純函式

## 本集目標

理解 React 對元件的一個核心要求：渲染的時候，只能根據收到的資料算出畫面，不能偷偷改動外面的東西。

## 正文

### 什麼是純函式

有一種函式很單純：你給它同樣的輸入，它一定給你同樣的輸出，而且過程中不會動到函式外面的任何東西。這種函式叫**純函式**（pure function）。

```js
function double(n) {
  return n * 2;
}
```

`double(3)` 永遠是 6。就像計算機：按 `3 × 2`，不管按幾次、什麼時候按，答案都是 6。

React 要求你的元件也是這樣的純函式：**同樣的 props，一定要畫出同樣的畫面**。

### 為什麼 React 這麼要求

React 在需要的時候，會自己決定要不要重新呼叫你的元件，甚至在你沒察覺的時候多呼叫一次。如果元件是純的，呼叫幾次、什麼時候呼叫都沒差，結果永遠一致，React 才能放心地替你安排。如果元件會偷偷改動外面的東西，每多呼叫一次，外面就多一個變化，畫面就會出現莫名其妙的結果。

### 不純的元件長什麼樣子

把 `src/App.jsx` 換成這個，故意寫成不純的：

```jsx
let orderNumber = 0;

function Ticket() {
  orderNumber += 1;
  return <p>號碼牌 {orderNumber}</p>;
}

function App() {
  return (
    <div>
      <Ticket />
      <Ticket />
      <Ticket />
    </div>
  );
}

export default App;
```

你預期的畫面是號碼牌 1、2、3。實際上看到的是：

```text
號碼牌 2
號碼牌 4
號碼牌 6
```

為什麼？`Ticket` 在渲染的時候，修改了函式外面的變數 `orderNumber`，這讓它變成不純的元件。

還記得第 2 集看到的 `<StrictMode>` 嗎？它是 React 的開發工具，**在開發的時候，故意把每個元件的函式呼叫兩次**，專門用來抓出這種不純的寫法。因為 `Ticket` 被呼叫了兩次，`orderNumber` 每個元件加了兩次，所以變成 2、4、6。

如果你把 `main.jsx` 的 `<StrictMode>` 拿掉，畫面會變成 1、2、3，看起來就「正常」了。但這個元件仍然是有問題的：它的結果取決於被呼叫了幾次，而 React 並不保證每個元件剛好只呼叫一次。所以 `<StrictMode>` 沒有製造問題，它只是讓問題提早暴露。請保留它。

### 怎麼修

把變化的資料，改成從外面用 props 傳進來，把 `src/App.jsx` 改成：

```jsx
function Ticket({ number }) {
  return <p>號碼牌 {number}</p>;
}

function App() {
  return (
    <div>
      {[1, 2, 3].map((n) => (
        <Ticket key={n} number={n} />
      ))}
    </div>
  );
}

export default App;
```

現在 `Ticket` 的輸出完全取決於 `number`，不管呼叫幾次，`number` 是 2 就是畫出「號碼牌 2」。畫面就是 1、2、3，開著 `<StrictMode>` 也一樣。

### 在元件裡面改自己的東西是可以的

「不能改動外面的東西」，不代表元件裡面不能用變數。如果這個變數是**在這一次渲染裡才建立的**，隨便你怎麼改都沒關係：

```jsx
function TicketList({ count }) {
  const tickets = [];
  for (let i = 1; i <= count; i++) {
    tickets.push(<p key={i}>號碼牌 {i}</p>);
  }
  return <div>{tickets}</div>;
}

export default TicketList;
```

`tickets` 是在函式裡建立的陣列，每次渲染都是一個全新的，不會影響到別的地方，所以這樣寫沒問題。這種叫「區域變異」（local mutation）。

### 還有哪些是不純的

渲染的時候，這些事都不要做：

- 修改函式外面的變數、物件或陣列。
- 修改收到的 props（上一集看過，React 不讓你做）。
- 用 `Math.random()` 或 `Date.now()` 決定畫面，因為每次呼叫結果都不同。
- 直接去動 DOM（例如 `document.title = ...`）、送出網路請求。

### 那這些事要放在哪裡

網頁一定需要做這些事：使用者點按鈕要更新資料、畫面出現後要抓資料、要改頁面標題。這些動作叫做**副作用**（side effect），React 替它們準備了合適的位置：

- 由使用者操作觸發的，寫在**事件處理函式**裡，第 5 章第 1 集開始學。
- 要在畫面出現之後才做的，用 **Effect**，第 6 章學。

總之，渲染的時候只負責「根據資料算出畫面」，其他的事留到對的地方再做。

## 重點整理

- 純函式：同樣的輸入一定得到同樣的輸出，而且不改動函式外面的東西。
- 元件在渲染時要是純的：同樣的 props 畫出同樣的畫面。
- `<StrictMode>` 在開發時會把元件多呼叫一次，用來抓出不純的寫法，請保留它。
- 渲染時不要改外面的變數、不要改 props、不要用 `Math.random()` 或 `Date.now()`。
- 在元件裡建立、只用在這一次渲染的變數可以任意修改。
- 副作用放在事件處理函式或 Effect 裡。
