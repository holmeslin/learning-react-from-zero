# `useContext`

## 本集目標

用 Context 讓深處的元件直接取得資料，不用一層一層傳 props。

## 正文

### 問題：props 要穿過很多層

假設最上層的 `App` 持有「目前是淺色還是深色模式」，最底層的按鈕要根據它改變外觀。中間隔了 `Toolbar` 和 `Panel` 兩層，這兩層本身根本不關心主題，卻得幫忙把 `theme` 這個 prop 一路轉傳下去。這種情形叫做 **prop drilling**（prop 層層傳遞），層數一多就很煩。

### 用 Context 直通

**Context** 讓上層的元件，把一份資料「廣播」給底下所有的元件，底下的元件想用就直接拿，中間的元件完全不用知道。

```jsx
import { createContext, useContext, useState } from "react";

const ThemeContext = createContext("light");

function ThemedButton({ children }) {
  const theme = useContext(ThemeContext);
  const style =
    theme === "dark"
      ? { background: "#222", color: "#fff" }
      : { background: "#eee", color: "#000" };
  return (
    <button style={style}>
      {children}（{theme}）
    </button>
  );
}

function Panel({ title, children }) {
  return (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function Toolbar() {
  return (
    <Panel title="工具列">
      <ThemedButton>儲存</ThemedButton>
    </Panel>
  );
}

export default function App() {
  const [theme, setTheme] = useState("light");

  return (
    <>
      <ThemeContext value={theme}>
        <label>
          <input
            type="checkbox"
            checked={theme === "dark"}
            onChange={(e) => setTheme(e.target.checked ? "dark" : "light")}
          />
          深色模式
        </label>
        <Toolbar />
      </ThemeContext>
      <ThemedButton>在 Provider 外面</ThemedButton>
    </>
  );
}
```

勾選「深色模式」，「儲存」按鈕立刻變成深色。`Toolbar` 和 `Panel` 都沒有收到任何跟主題有關的 props。

### 三個步驟

1. **建立 Context**：`createContext("light")`。括號裡的 `"light"` 是**預設值**，下面會解釋。
2. **提供值**：用 `<ThemeContext value={theme}>` 把子元件包起來。被包住的所有元件，不管多深，都能讀到這個 `value`。
3. **使用值**：在需要的元件裡呼叫 `useContext(ThemeContext)`，拿到最近的 Provider 提供的值。

React 19 起，Context 本身就可以當成元件使用，寫成 `<ThemeContext value={...}>`。如果你看到舊的教學寫 `<ThemeContext.Provider value={...}>`，兩種寫法效果一樣，新寫法比較短。

### 預設值什麼時候用

範例最下面，有一個放在 Provider **外面**的按鈕，它顯示的是「在 Provider 外面（light）」。因為它的上層找不到任何 `ThemeContext`，所以拿到的是 `createContext("light")` 的預設值。

換句話說：`useContext` 會往上找最近的 Provider；找得到就用它的值，找不到就用預設值。

### Context 變了，誰會重新渲染

當 Provider 的 `value` 改變，所有用 `useContext` 讀這個 Context 的元件，都會重新渲染，不管它們在多深的地方。

### 該不該用 Context

Context 很方便，但不要看到 props 要傳兩層就想用它。先想想這些做法：

- 先用 props 傳，最直接、最容易追蹤資料從哪裡來。
- 如果只是因為中間元件只是「路過」，考慮把子元件直接當成 `children` 傳進去。

如果很多元件、很深的層級都需要同一份資料，例如主題、目前登入的使用者、語言設定，才是 Context 的好時機。

## 重點整理

- Context 讓上層元件把資料提供給底下所有元件，避免 prop 層層傳遞。
- 三步驟：`createContext` 建立，`<XxxContext value={...}>` 提供，`useContext` 讀取。
- 找不到 Provider 時，`useContext` 回傳 `createContext` 的預設值。
- Provider 的值改變，所有讀取它的元件都會重新渲染。
- 資料只傳兩層時，用 props 就好，不必急著用 Context。
