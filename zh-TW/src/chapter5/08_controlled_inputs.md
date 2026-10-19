# 受控輸入

## 本集目標

讓輸入框的內容由 state 掌控，隨時知道使用者輸入了什麼。

## 正文

### 把輸入框接上 state

網頁上的輸入框，原本是瀏覽器自己管理內容。在 React 裡，我們希望輸入框裡的字，就是我們的 state。把 `src/App.jsx` 換成：

```jsx
import { useState } from "react";

function App() {
  const [text, setText] = useState("");

  return (
    <div>
      <input value={text} onChange={(event) => setText(event.target.value)} />
      <p>你輸入了：{text}</p>
    </div>
  );
}

export default App;
```

在輸入框打字，下方的文字會同步變化。

這種做法叫做**受控輸入**（controlled input），因為輸入框裡顯示什麼，完全由 React 的 state 決定。運作流程是：

1. 輸入框顯示的是 `value={text}`，也就是目前的 state。
2. 使用者按下一個鍵，觸發 `onChange`。
3. `onChange` 裡用 `event.target.value`（輸入框目前的內容）呼叫 `setText`，更新 state。
4. React 重新渲染，輸入框拿到新的 `text` 作為 `value`。

重點是第 3 步：你必須自己把使用者打的字寫回 state。如果沒有，輸入框的內容永遠是 state 的值，也就是什麼都打不進去。

### 受控輸入的好處

state 就是輸入框的「單一事實來源」，所以你可以隨時用程式碼控制它。例如加上「清除」按鈕和字數統計，把 `src/App.jsx` 換成：

```jsx
import { useState } from "react";

function App() {
  const [text, setText] = useState("");

  return (
    <div>
      <input value={text} onChange={(event) => setText(event.target.value)} />
      <button onClick={() => setText("")}>清除</button>
      <p>共 {text.length} 個字</p>
    </div>
  );
}

export default App;
```

清除按鈕只要把 state 設成空字串，輸入框就自動清空了，不需要特別去碰輸入框。

### 只有 `value` 沒有 `onChange`

如果你只寫了 `value`，卻沒有 `onChange`：

```jsx,ignore
<input value="固定的字" />
```

這個輸入框會變成唯讀，什麼都打不進去，而且主控台會出現警告：

```text
You provided a `value` prop to a form field without an `onChange` handler.
This will render a read-only field. If the field should be mutable use
`defaultValue`. Otherwise, set either `onChange` or `readOnly`.
```

意思是「你給了 `value`，卻沒有 `onChange`，所以這是一個唯讀欄位。如果要讓它可以編輯，改用 `defaultValue`，或是補上 `onChange`」。

`defaultValue` 是只設定初始值、之後不受控的寫法。這本書不用它，一律用 `value` 加 `onChange` 的受控寫法，行為最容易預測。

### `event.target.value` 永遠是字串

輸入框裡拿到的值一定是字串，就算 `type="number"` 也是。要做數學運算，要先轉成數字，把 `src/App.jsx` 換成：

```jsx
import { useState } from "react";

function App() {
  const [price, setPrice] = useState("");

  const total = Number(price) * 3;

  return (
    <div>
      <input
        type="number"
        value={price}
        onChange={(event) => setPrice(event.target.value)}
      />
      <p>三個一共 {total} 元</p>
    </div>
  );
}

export default App;
```

`price` 這個 state 仍然用字串存，因為使用者可能正在輸入中。要算的時候，才用 `Number(...)` 轉換。

### 其他表單元素

- **`<textarea>`**：和 `<input>` 一樣，用 `value` 和 `onChange`。
- **`<select>`**：`value` 放在 `<select>` 上，`onChange` 一樣用 `event.target.value`。
- **核取方塊 `<input type="checkbox">`**：用 `checked` 取代 `value`，從 `event.target.checked` 拿到布林值。把 `src/App.jsx` 換成：

```jsx
import { useState } from "react";

function App() {
  const [agreed, setAgreed] = useState(false);

  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={agreed}
          onChange={(event) => setAgreed(event.target.checked)}
        />
        我同意使用條款
      </label>
      <button disabled={!agreed}>送出</button>
    </div>
  );
}

export default App;
```

沒勾選的時候，送出按鈕是灰色不能按的（`disabled={!agreed}`）；勾選之後才會啟用。這是 state 控制畫面的另一個小例子。

## 重點整理

- 受控輸入：`value={state}` 加上 `onChange` 把輸入寫回 state。
- `onChange` 裡用 `event.target.value` 拿到輸入框的內容。
- 只有 `value` 沒有 `onChange` 會變成唯讀。
- 輸入框的值永遠是字串，要運算時用 `Number()` 轉換。
- 核取方塊用 `checked` 和 `event.target.checked`。
