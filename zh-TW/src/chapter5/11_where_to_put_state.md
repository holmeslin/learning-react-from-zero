# state 該放哪裡

## 本集目標

學會設計 state：什麼該存成 state、什麼不該，以及放在哪一層。

## 正文

學會 `useState` 之後，新的難題是：什麼資料要變成 state？很多初學者的做法是「什麼都存成 state」，結果程式越寫越亂、畫面不同步。這一集整理幾個判斷的原則。

### 原則一：算得出來的，就不要存成 state

如果一個值可以從別的 state 或 props 算出來，就不要另外存成 state，在渲染的時候直接算。看這個錯誤示範，把 `src/App.jsx` 換成：

```jsx
import { useState } from "react";

function App() {
  const [count, setCount] = useState(0);
  const [doubled, setDoubled] = useState(0);

  function handleClick() {
    setCount(count + 1);
  }

  return (
    <div>
      <p>count：{count}，兩倍：{doubled}</p>
      <button onClick={handleClick}>加一</button>
    </div>
  );
}

export default App;
```

按幾下按鈕，`count` 一直在增加，但「兩倍」永遠是 0。因為 `doubled` 是另外一份 state，而 `handleClick` 忘了去更新它。

這就是把算得出來的東西存成 state 的風險：**同一份資訊存在兩個地方，遲早有一個會忘記更新**。正確的做法是直接算，把 `src/App.jsx` 換成：

```jsx
import { useState } from "react";

function App() {
  const [count, setCount] = useState(0);
  const doubled = count * 2;

  function handleClick() {
    setCount(count + 1);
  }

  return (
    <div>
      <p>count：{count}，兩倍：{doubled}</p>
      <button onClick={handleClick}>加一</button>
    </div>
  );
}

export default App;
```

`doubled` 是一個普通變數，每次渲染都會從 `count` 重新算一遍，永遠不會不同步。上一集的 `visibleProducts` 也是這樣：它是由 `query` 算出來的，所以沒有存成 state。

### 原則二：不要把 props 複製進 state

另一種常見的錯誤，是把收到的 props 當成 state 的初始值。把 `src/App.jsx` 換成：

```jsx
import { useState } from "react";

function PriceTag({ price }) {
  const [shown, setShown] = useState(price);
  return <p>{shown} 元</p>;
}

function App() {
  const [price, setPrice] = useState(100);

  return (
    <div>
      <PriceTag price={price} />
      <button onClick={() => setPrice(price + 50)}>漲價</button>
    </div>
  );
}

export default App;
```

按「漲價」，`App` 的 `price` 變成 150，`PriceTag` 也收到新的 props，但畫面上永遠是「100 元」。

原因是 `useState(price)` 的初始值只在第一次渲染時使用，之後 props 再怎麼變，`shown` 都不會跟著更新。（`setShown` 這個函式還根本沒被用到，這個 state 其實也不需要存在。）

要顯示的就是 props，直接用 `price`，不要經過 state。只有「我想拿 props 當起點，之後自己獨立變動」的時候，才適合把 props 複製進 state，而且這時候名字最好取成 `initialPrice` 之類，讓人一看就知道。

### 原則三：存 id，不要存整份資料的複本

如果要記住「使用者目前選了哪一個商品」，存它的 `id`，不要把整個商品物件複製一份存起來：

```jsx,ignore
const [selectedId, setSelectedId] = useState(null);
const selected = products.find((product) => product.id === selectedId);
```

如果存的是整個物件，一旦商品列表更新了（例如改了價格），`selected` 手上拿的還是舊的那一份，和列表不同步。存 `id`，每次渲染都從最新的列表裡找，永遠是最新的資料。

### 原則四：盡量讓 state 扁平

第 6 集看過，修改巢狀很深的物件時，每一層都要複製，很麻煩，也很容易出錯。設計 state 時盡量讓結構扁平：把深層的資料拆開，用 `id` 互相對應，而不是一層包一層。

### 判斷要不要用 state：四個問題

對每一個你想存的資料，依序問自己：

1. **它會隨時間改變嗎？** 不會的話，它是常數，寫在元件外面就好。
2. **它是父元件傳進來的 props 嗎？** 是的話，它不是這個元件的 state。
3. **能從現有的 state 或 props 算出來嗎？** 能的話，在渲染時直接算，不要存。
4. **以上都不是，而且它會影響畫面嗎？** 那就是 state。

最後一點：如果某個值會改變，但是**不影響畫面**（例如計時器的編號），也不該放在 state，因為改變 state 會觸發重新渲染。這類資料用 ref 保存，第 6 章會學。

### state 放在哪一層

放在**真正需要它的元件裡面**，如果只有一個元件用，就放在那個元件。如果兩個以上的元件要共用，就提升到它們最近的共同父元件，這是上一集學的。不用一開始就把所有 state 都放在 `App`，那樣所有元件之間都要傳 props，很累。需要的時候再提升就好。

## 重點整理

- 算得出來的值不要存成 state，渲染時直接算。
- 不要把 props 複製進 state，那只會在第一次渲染時生效。
- 記住選擇的項目時，存 id，不要存整份資料的複本。
- state 的結構盡量扁平，不要巢狀太深。
- 判斷是否要用 state：會變嗎、是 props 嗎、能算出來嗎，都不是才用。
- state 放在需要它的元件；要共用就提升到最近的共同父元件。
