# `useDeferredValue`

## 本集目標

用 `useDeferredValue` 讓輸入框保持順暢，搜尋結果慢一點更新。

## 正文

### 搜尋框的兩難

做一個即時搜尋：使用者每打一個字，就依照目前的內容載入搜尋結果。結果要花時間載入，這時候有兩個選擇：

- 輸入框和結果同步更新：每打一個字，畫面都要等結果出來，輸入框可能卡住。
- 輸入框**立刻**反映打的字，搜尋結果**稍後**才跟上，這才是好的體驗。

`useDeferredValue` 就是為了第二種：

```jsx
import { Suspense, use, useDeferredValue, useState } from "react";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const cache = new Map();

function search(query) {
  if (!cache.has(query)) {
    cache.set(
      query,
      delay(1000).then(() =>
        ["蘋果", "香蕉", "芭樂"].filter((fruit) => fruit.includes(query)),
      ),
    );
  }
  return cache.get(query);
}

function Results({ query }) {
  const results = use(search(query));
  return (
    <ul>
      {results.map((fruit) => (
        <li key={fruit}>{fruit}</li>
      ))}
    </ul>
  );
}

export default function App() {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query);
  const isStale = query !== deferredQuery;

  return (
    <>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="搜尋水果"
      />
      <div style={{ opacity: isStale ? 0.5 : 1 }}>
        <Suspense fallback={<p>搜尋中……</p>}>
          <Results query={deferredQuery} />
        </Suspense>
      </div>
    </>
  );
}
```

先等第一次載入完成，會看到三種水果。接著在輸入框打「蘋」：

1. 輸入框**立刻**出現「蘋」，一點都不卡。
2. 下面的清單**仍然顯示三種水果**，但變成半透明（`opacity: 0.5`），表示「這是舊的結果，新的還在載入」。
3. 一秒後，清單換成只有「蘋果」，恢復不透明。

### 它做了什麼

```jsx,ignore
const [query, setQuery] = useState("");
const deferredQuery = useDeferredValue(query);
```

`useDeferredValue(query)` 回傳 `query` 的「延遲版本」：

- 平常（沒有在忙）時，`deferredQuery` 和 `query` 一樣。
- 當 `query` 變了、而新的內容需要等待時，React 會**先用舊的值**畫畫面，同時在背景準備新的。準備好之前，`deferredQuery` 維持舊值；準備好之後，才更新成新值。

所以：

- 輸入框用 `query`，每次打字馬上更新。
- 搜尋結果用 `deferredQuery`，等新結果準備好才換。
- `query !== deferredQuery` 就代表「結果還沒跟上」，範例用它把清單變半透明。

### 為什麼沒有出現「搜尋中……」

這裡有個細節：打字之後，清單區域**沒有**跳出 `<Suspense>` 的「搜尋中……」。原因和上一集的轉場相同：延遲的更新會讓 React 繼續顯示舊的內容，不會退回 `fallback`。只有第一次載入（還沒有舊內容可以留）才會看到「搜尋中……」。

### 和 `useTransition` 怎麼選

兩者目的類似，都是「讓舊畫面先撐著」，差別在你「控制得到哪裡」：

- **`useTransition`**：你有辦法修改 `setState` 的那一行，用 `startTransition` 把它包起來。
- **`useDeferredValue`**：你只**拿到**一個值（例如從 props 傳進來，或是來自你不能動的程式碼），沒辦法包住更新它的地方，就改成對這個值做「延遲版本」。

## 重點整理

- `useDeferredValue(值)` 回傳該值的延遲版本：值變了而新內容還在準備時，先維持舊值。
- 輸入框用原本的值、結果用延遲的值，打字不卡，結果稍後跟上。
- `值 !== 延遲值` 表示結果還沒跟上，可以用來顯示過期的提示。
- 延遲的更新和轉場一樣，會保留舊畫面，不會立刻退回 `fallback`。
- 能包住 `setState` 就用 `useTransition`；只拿到值就用 `useDeferredValue`。
