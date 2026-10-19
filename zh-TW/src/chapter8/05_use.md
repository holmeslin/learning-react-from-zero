# `use`

## 本集目標

用 `use` 在元件裡直接讀取 Promise 的結果，並認識它和一般 Hook 的不同。

## 正文

### 第 6 章的做法有點繁瑣

第 6 章用 Effect 抓資料，要自己管理 `useState`、載入中、競態、錯誤……寫起來很長。

React 19 提供了 `use`，讓元件可以**直接讀取** Promise 的結果，就像資料已經在手上一樣：

```jsx
import { Suspense, use } from "react";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const cache = new Map();

async function fetchUser(id) {
  await delay(1000);
  const response = await fetch("/users.json");
  const users = await response.json();
  return users.find((user) => user.id === id);
}

function loadUser(id) {
  if (!cache.has(id)) cache.set(id, fetchUser(id));
  return cache.get(id);
}

function UserCard({ id }) {
  const user = use(loadUser(id));
  return <p>使用者：{user.name}</p>;
}

export default function App() {
  return (
    <Suspense fallback={<p>載入中……</p>}>
      <UserCard id={1} />
    </Suspense>
  );
}
```

重新整理頁面，先看到一秒的「載入中……」，接著變成「使用者：小明」。

### 它是怎麼運作的

`UserCard` 裡的 `use(loadUser(id))` 看起來像是直接拿到了 `user`。實際上：

1. 如果 Promise **還沒完成**，`use` 會讓元件「暫停」渲染，React 會去找上面最近的 `<Suspense>`，顯示它的 `fallback`（載入中的畫面）。
2. Promise **完成**之後，React 重新渲染 `UserCard`，這次 `use` 直接回傳結果，元件就能繼續畫出畫面。

所以元件裡沒有 `useState`，沒有 `useEffect`，也不需要 `if (loading)`。「載入中」交給 `<Suspense>` 處理，下一集會詳細說明。

### Promise 必須是「同一個」

注意 `loadUser` 這個函式，它用一個 `cache` 把 Promise 存起來，同樣的 `id` 永遠回傳同一個 Promise。這一點非常重要。

元件每次渲染都會重新執行。如果你直接在元件裡寫：

```jsx
import { Suspense, use } from "react";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function UserCard() {
  const user = use(delay(500).then(() => ({ name: "小明" })));
  return <p>使用者：{user.name}</p>;
}

export default function App() {
  return (
    <Suspense fallback={<p>載入中……</p>}>
      <UserCard />
    </Suspense>
  );
}
```

那每次渲染都會建立一個**全新**的 Promise。新的 Promise 永遠還沒完成，元件又暫停、重來一次，結果畫面永遠卡在「載入中……」，資料永遠出不來。

所以規則是：**傳給 `use` 的 Promise，必須在渲染之間保持同一個。** 常見的做法有：

- 像範例一樣，用 `cache` 儲存 Promise。
- 把 Promise 當 props 傳進來，由建立它的地方負責保持穩定（例如在事件處理函式裡建立）。
- 使用資料抓取函式庫或框架（TanStack Query、第二部的 Next.js），它們幫你處理好快取。

自己手寫 `cache` 只適合學習，真實專案請用函式庫。

### `use` 也能讀 Context

`use` 不只能讀 Promise，也可以讀 Context，作用和第 7 章的 `useContext` 一樣：

```jsx
import { createContext, use, useState } from "react";

const ThemeContext = createContext("light");

function Heading({ showTheme }) {
  if (!showTheme) return <h1>標題</h1>;
  const theme = use(ThemeContext);
  return <h1>標題（{theme}）</h1>;
}

export default function App() {
  const [showTheme, setShowTheme] = useState(false);

  return (
    <ThemeContext value="dark">
      <button onClick={() => setShowTheme(!showTheme)}>切換</button>
      <Heading showTheme={showTheme} />
    </ThemeContext>
  );
}
```

按「切換」，標題從「標題」變成「標題（dark）」。

### `use` 不是 Hook

`use` 雖然也以 `use` 開頭，卻**不受第 6 章「Hook 規則」的限制**。你可以把它放在 `if` 裡面、放在提早 `return` 的後面（範例就是這樣用），這是 `useContext` 做不到的。

不過它還是有自己的限制：

- 只能在元件或 Hook 裡呼叫。
- 不能放在 `try`/`catch` 裡。Promise 失敗時要怎麼處理，第 7 集會說明。

## 重點整理

- `use(promise)` 讓元件直接讀取 Promise 的結果；Promise 還沒完成時，元件暫停，由上層的 `<Suspense>` 顯示載入中的畫面。
- 傳給 `use` 的 Promise 在每次渲染之間必須是同一個，否則畫面永遠卡在載入中。
- `use(Context)` 可以代替 `useContext`，而且能放在條件判斷之後。
- `use` 不受 Hook 規則限制，但不能放在 `try`/`catch` 裡。
