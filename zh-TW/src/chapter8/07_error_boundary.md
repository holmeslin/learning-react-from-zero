# 錯誤邊界

## 本集目標

用錯誤邊界接住渲染時的錯誤，顯示替代畫面，並提供重試。

## 正文

### 沒人接住的錯誤

上一集的 Suspense 處理「載入中」，那「載入失敗」呢？如果 `use` 讀的 Promise 失敗了，元件在渲染時會丟出錯誤。沒有人處理的話，**整個 React 應用程式的畫面會變成一片空白**。

**錯誤邊界**（error boundary）的作用，就是在畫面上畫一個範圍：範圍裡的元件如果在渲染時出錯，只有這個範圍換成錯誤畫面，不影響其他部分。

### 安裝 `react-error-boundary`

React 內建的錯誤邊界只能用「類別元件」寫，那是比較舊的寫法（附錄會簡單介紹）。React 官方也建議直接用現成的函式庫 `react-error-boundary`，它用起來和一般元件差不多。

在專案資料夾的終端機執行：

```bash
npm install react-error-boundary
```

### 範例：失敗後重試

```jsx
import { Suspense, use, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const cache = new Map();

async function fetchUser(shouldFail) {
  await delay(500);
  if (shouldFail) throw new Error("伺服器忙線中");
  return { name: "小明" };
}

// 第一次（attempt 為 0）刻意失敗，重試之後才成功
function loadUser(attempt) {
  if (!cache.has(attempt)) cache.set(attempt, fetchUser(attempt === 0));
  return cache.get(attempt);
}

function UserCard({ attempt }) {
  const user = use(loadUser(attempt));
  return <p>使用者：{user.name}</p>;
}

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <p>出錯了：{error.message}</p>
      <button onClick={resetErrorBoundary}>重試</button>
    </div>
  );
}

export default function App() {
  const [attempt, setAttempt] = useState(0);

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => setAttempt(attempt + 1)}
    >
      <Suspense fallback={<p>載入中……</p>}>
        <UserCard attempt={attempt} />
      </Suspense>
    </ErrorBoundary>
  );
}
```

流程是這樣的：

1. 重新整理頁面，先顯示「載入中……」。
2. 約 0.5 秒後，第一次請求失敗，畫面換成「出錯了：伺服器忙線中」和一顆「重試」按鈕。
3. 按下「重試」，又出現「載入中……」，這次成功，顯示「使用者：小明」。

（打開 Console，你會看到 React 印出的錯誤紀錄，這是開發模式下的正常行為。）

### 逐一看

- **`<ErrorBoundary>`**：包住可能出錯的部分，外面還可以再包別的內容。
- **`FallbackComponent`**：出錯時要顯示的元件。它會收到兩個 props：`error`（錯誤物件，用 `error.message` 取得文字）和 `resetErrorBoundary`（呼叫它就會重設邊界，讓它重新嘗試渲染子元件）。
- **`onReset`**：重設邊界時要做的事。這裡把 `attempt` 加一，讓 `loadUser(attempt)` 換成一個全新的請求；否則快取裡存的還是那個已經失敗的 Promise，重試也沒用。

### 邊界和 Suspense 的順序

範例中 `<ErrorBoundary>` 包在 `<Suspense>` 的外面。兩者各管一件事：

- `<Suspense>` 管「還沒好」：顯示載入中。
- `<ErrorBoundary>` 管「壞掉了」：顯示錯誤畫面。

同時包住同一個區塊，就能完整處理「載入中、成功、失敗」三種情況。

### 錯誤邊界接不到什麼

錯誤邊界只負責「渲染過程」中丟出的錯誤。**事件處理函式裡的錯誤**（例如按鈕點按後 `fetch` 失敗）、**Effect 裡的非同步錯誤**，錯誤邊界接不到，要自己用 `try`/`catch` 處理，再用 state 把錯誤顯示在畫面上。

## 重點整理

- 渲染時丟出的錯誤沒人接，整個畫面會變空白；錯誤邊界可以把影響範圍限縮在一個區塊。
- 用 `react-error-boundary` 的 `<ErrorBoundary>`：用 `FallbackComponent` 指定錯誤畫面，`resetErrorBoundary` 讓使用者重試，`onReset` 處理重試前的準備。
- `<Suspense>` 管載入中，`<ErrorBoundary>` 管出錯，通常成對使用。
- 錯誤邊界接不到事件處理函式裡的錯誤，那部分要自己 `try`/`catch`。
