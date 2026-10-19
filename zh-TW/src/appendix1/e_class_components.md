# 看懂舊式類別元件

## 本集目標

讀得懂用 `class` 寫的 React 元件，知道它和函式元件的對應關係，以及為什麼錯誤邊界至今還要用它。

## 正文

### 為什麼要看這個

在 2019 年 Hook 出現之前，有狀態的元件都是用 `class` 寫的。今天新的程式碼幾乎都用函式元件，但網路上很多舊文章、舊專案，仍然是類別元件。你不需要學會怎麼寫它，但要看得懂。

### 一個類別元件

這是一個按讚按鈕：

```jsx
// src/App.jsx
import { Component } from "react";

class Counter extends Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
    this.handleClick = this.handleClick.bind(this);
  }

  componentDidMount() {
    document.title = `${this.props.label}：${this.state.count}`;
  }

  componentDidUpdate() {
    document.title = `${this.props.label}：${this.state.count}`;
  }

  handleClick() {
    this.setState({ count: this.state.count + 1 });
  }

  render() {
    return (
      <button onClick={this.handleClick}>
        {this.props.label}：{this.state.count}
      </button>
    );
  }
}

export default function App() {
  return <Counter label="按讚" />;
}
```

按鈕會顯示「按讚：0」，每按一次加一，同時網頁分頁的標題也跟著更新。

### 和函式元件對照

| 類別元件 | 函式元件 |
| --- | --- |
| `class X extends Component` | `function X(props)` |
| `render()` 回傳 JSX | 函式本身回傳 JSX |
| `this.props.label` | `props.label` 或 `{ label }` |
| `this.state = { count: 0 }` | `const [count, setCount] = useState(0)` |
| `this.setState({ count: ... })` | `setCount(...)` |
| `componentDidMount` | `useEffect(() => {...}, [])` |
| `componentDidUpdate` | `useEffect(() => {...}, [依賴])` |
| `componentWillUnmount` | `useEffect` 回傳的清除函式 |

幾個看起來奇怪的地方：

- **`this`**：類別元件的資料都存在 `this` 上，所以到處都是 `this.props`、`this.state`。
- **`constructor` 和 `super(props)`**：初始化元件，一定要先呼叫 `super(props)`。
- **`this.handleClick = this.handleClick.bind(this)`**：JavaScript 裡的函式，單獨拿出來傳給 `onClick` 的時候，不會記得它原本屬於哪個物件（`this` 會丟失），所以要用 `bind` 綁住。這是類別元件最常見的絆腳石，函式元件完全沒有這個問題。
- **生命週期方法**：`componentDidMount`（掛上畫面之後）、`componentDidUpdate`（更新之後）、`componentWillUnmount`（移除之前），這幾個方法做的事，現在都由 `useEffect` 處理。

用函式元件改寫同一個元件：

```jsx
import { useEffect, useState } from "react";

function Counter({ label }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = `${label}：${count}`;
  }, [label, count]);

  return (
    <button onClick={() => setCount(count + 1)}>
      {label}：{count}
    </button>
  );
}
```

短很多，沒有 `this`，沒有 `bind`，也不用把「掛上」和「更新」的邏輯寫兩次。

### 現在還有一個地方一定要用類別：錯誤邊界

第 8 章你學過錯誤邊界（error boundary）。目前，**要自己寫一個錯誤邊界，只能用類別元件**，沒有對應的 Hook：

```jsx
// src/App.jsx
import { Component } from "react";

class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <p>出了點問題</p>;
    }
    return this.props.children;
  }
}

function Bomb() {
  throw new Error("爆炸了");
}

export default function App() {
  return (
    <ErrorBoundary>
      <Bomb />
    </ErrorBoundary>
  );
}
```

`Bomb` 渲染時丟出錯誤，`ErrorBoundary` 接住了，畫面顯示「出了點問題」，而不是整個網站白屏。

`static getDerivedStateFromError()` 是特殊的方法：子元件丟出錯誤的時候，React 會呼叫它，它回傳的物件會更新 state。

實務上，你很少自己寫這個類別，通常會用現成的套件（例如 `react-error-boundary`），或是像 Next.js 那樣用 `error.tsx`。但是知道它背後是一個類別元件，看到原始碼時就不會困惑。

## 重點整理

- 類別元件是 Hook 出現之前的寫法，用 `this.props`、`this.state`、`this.setState`。
- 生命週期方法（`componentDidMount` 等）對應到 `useEffect`。
- `bind(this)` 是為了避免函式的 `this` 丟失，函式元件沒有這個問題。
- 目前自己寫錯誤邊界，仍然只能用類別元件的 `getDerivedStateFromError`。
- 新的程式碼用函式元件，類別元件只需要看得懂。
