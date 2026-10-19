# `forwardRef` 等舊寫法

## 本集目標

認得 React 19 之前常見的舊寫法，知道現在有什麼替代，哪些已經完全移除了。

## 正文

網路上有大量用 React 18 或更早版本寫的文章。照抄它們的範例，有些還能跑，有些在 React 19 已經不能用了。這一集整理最常見的幾個。

### `forwardRef`：還能用，但不用了

React 18 以前，如果你自己寫的元件要接收 `ref`，必須用 `forwardRef` 包起來：

```jsx
import { forwardRef } from "react";

const OldInput = forwardRef(function OldInput(props, ref) {
  return <input ref={ref} />;
});
```

React 19 之後，`ref` 就是一般的 prop，直接從參數拿：

```jsx
function NewInput({ ref }) {
  return <input ref={ref} />;
}
```

兩種寫法在 React 19 都能運作，用 `forwardRef` 寫的元件，父元件還是拿得到 `<input>` 元素。但是新的程式碼用第二種就好，更簡短，也少一層包裝。

### `Context.Provider`：現在可以直接用 Context

建立 Context 之後，提供值的寫法以前是 `.Provider`：

```jsx
const ThemeContext = createContext("light");

<ThemeContext.Provider value="dark">
  <App />
</ThemeContext.Provider>;
```

React 19 之後，可以把 Context 本身當成元件用：

```jsx
<ThemeContext value="dark">
  <App />
</ThemeContext>
```

兩種寫法在 React 19 都能運作，裡面的元件都能用 `useContext` 讀到 `"dark"`。新的程式碼用第二種。

### `defaultProps`：函式元件已經不支援了

以前可以用 `defaultProps` 設定 props 的預設值：

```jsx
function Greeting({ name }) {
  return <p>你好，{String(name)}</p>;
}
Greeting.defaultProps = { name: "訪客" };
```

在 React 19，函式元件的 `defaultProps` **會被忽略**。實際執行，畫面顯示「你好，undefined」，預設值沒有生效，也沒有任何警告。

替代的寫法是用 JavaScript 的預設參數：

```jsx
function Greeting({ name = "訪客" }) {
  return <p>你好，{name}</p>;
}
```

這是你在第 2 章學過的解構預設值。如果你升級舊專案到 React 19，要特別找出有沒有 `defaultProps`，因為它不會報錯，只會悄悄失效。（類別元件的 `defaultProps` 沒有被移除，因為類別沒有預設參數可以替代。）

### `ReactDOM.render`：已經移除

React 18 以前，把應用程式掛到網頁上的寫法是：

```jsx
import ReactDOM from "react-dom";

ReactDOM.render(<App />, document.getElementById("root"));
```

React 19 已經把 `ReactDOM.render` 整個移除，執行會得到錯誤：

```text
ReactDOM.render is not a function
```

現在的寫法是你在第 4 章看過的 `createRoot`：

```jsx
import { createRoot } from "react-dom/client";

createRoot(document.getElementById("root")).render(<App />);
```

同樣被移除的還有 `ReactDOM.findDOMNode`（直接拿元件對應的 DOM 節點）。需要 DOM 節點，請用 `ref`。

### `PropTypes`：被 TypeScript 取代

舊專案常常用 `prop-types` 套件，在執行時檢查 props 的型別：

```jsx
import PropTypes from "prop-types";

function Greeting({ name }) {
  return <p>你好，{name}</p>;
}
Greeting.propTypes = { name: PropTypes.string.isRequired };
```

React 19 不再檢查 `propTypes`，寫了也沒有效果。要檢查型別，請用 TypeScript（第 10 章）。

### `useMemo` 和 `useCallback`

舊的程式碼常常到處是 `useMemo` 和 `useCallback`，用來避免不必要的重新計算。如果專案開了 React Compiler，編譯器會自動處理這些最佳化，手動寫的大多可以拿掉（第 7 章提過）。看到它們，知道是為了效能，在讀懂邏輯時可以先忽略。

### 怎麼判斷一份教學是不是過時

看到這些寫法，就代表那份教學是比較舊的：

- 類別元件（`class X extends Component`）
- `ReactDOM.render`
- `forwardRef`、`.Provider`、`defaultProps`、`propTypes`
- `create-react-app`（React 官方在 2025 年已宣布棄用它，現在建議用框架，或是 Vite 這類建置工具）

遇到的時候，不是說它「錯」，而是知道現在有更好的寫法，可以照本書教的版本改寫。

## 重點整理

- `forwardRef` 和 `.Provider` 在 React 19 還能用，但新寫法更簡單：ref 當 prop、Context 當元件。
- 函式元件的 `defaultProps` 在 React 19 會被悄悄忽略，改用預設參數。
- `ReactDOM.render` 和 `findDOMNode` 已移除，改用 `createRoot` 和 `ref`。
- `propTypes` 不再檢查，改用 TypeScript。
- 看到舊寫法時，知道它們的現代替代就夠了。
