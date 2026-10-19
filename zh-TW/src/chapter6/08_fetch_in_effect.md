# 用 Effect 抓資料

## 本集目標

用 Effect 從伺服器抓資料，並處理「載入中」與「請求順序錯亂」的問題。

## 正文

### 準備資料

網頁抓資料，是 Effect 最常見的用途之一。為了不依賴外部服務，我們在專案的 `public` 資料夾裡放一個 JSON 檔，Vite 會把 `public` 裡的檔案直接當成靜態檔案提供，在程式裡用 `/users.json` 就能讀到。

建立 `public/users.json`：

```json
[
  { "id": 1, "name": "小明" },
  { "id": 2, "name": "小華" }
]
```

真實世界的網路速度不會剛好那麼快，所以範例裡會用 `delay` 刻意讓請求變慢。

### 第一版：最直覺的寫法

```jsx
import { useEffect, useState } from "react";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchUser(id) {
  // 刻意讓 1 號比 2 號慢，模擬網路速度不穩
  await delay(id === 1 ? 2000 : 500);
  const response = await fetch("/users.json");
  const users = await response.json();
  return users.find((user) => user.id === id);
}

function UserProfile({ id }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser(id).then((data) => setUser(data));
  }, [id]);

  if (user === null) return <p>載入中……</p>;
  return <p>使用者：{user.name}</p>;
}

export default function App() {
  const [id, setId] = useState(1);

  return (
    <>
      <button onClick={() => setId(1)}>小明</button>
      <button onClick={() => setId(2)}>小華</button>
      <p>你選的是 {id} 號</p>
      <UserProfile id={id} />
    </>
  );
}
```

重新整理頁面，先顯示「載入中……」，兩秒後出現「使用者：小明」。看起來沒問題。

### 發現 bug：競態

現在重新整理頁面，然後**立刻**按「小華」。

1. 一開始請求 1 號（要等 2 秒）。
2. 你立刻改選 2 號，再發出請求（只要 0.5 秒）。
3. 0.5 秒後，2 號的結果先到，畫面顯示「使用者：小華」，正確。
4. 再過 1.5 秒，**1 號的結果才姍姍來遲**，把畫面蓋掉。

最後畫面上寫著「你選的是 2 號」，卻顯示「使用者：小明」，資料和選擇對不上。這種「先發出的請求，反而最後才回來」的問題叫做**競態**（race condition）。

### 修正：用清除函式忽略過期的請求

回想第 5 集的清除函式：依賴 `id` 改變時，React 會先呼叫舊的清除函式。我們可以在清除函式裡，把舊請求標記成「過期」：

```jsx
import { useEffect, useState } from "react";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchUser(id) {
  // 刻意讓 1 號比 2 號慢，模擬網路速度不穩
  await delay(id === 1 ? 2000 : 500);
  const response = await fetch("/users.json");
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const users = await response.json();
  return users.find((user) => user.id === id);
}

function UserProfile({ id }) {
  const [result, setResult] = useState(null);

  useEffect(() => {
    let ignore = false;

    fetchUser(id)
      .then((user) => {
        if (!ignore) setResult({ id, user });
      })
      .catch((error) => {
        if (!ignore) setResult({ id, error: error.message });
      });

    return () => {
      ignore = true;
    };
  }, [id]);

  if (result === null || result.id !== id) return <p>載入中……</p>;
  if (result.error) return <p>出錯了：{result.error}</p>;
  return <p>使用者：{result.user.name}</p>;
}

export default function App() {
  const [id, setId] = useState(1);

  return (
    <>
      <button onClick={() => setId(1)}>小明</button>
      <button onClick={() => setId(2)}>小華</button>
      <p>你選的是 {id} 號</p>
      <UserProfile id={id} />
    </>
  );
}
```

這一版改了三件事：

1. **`ignore` 旗標**：每個 Effect 都有自己的 `ignore`。改選 2 號時，React 先執行 1 號 Effect 的清除函式，把它的 `ignore` 設成 `true`。之後 1 號的結果就算回來，也會因為 `ignore` 是 `true` 而被丟掉。
2. **把 `id` 和結果存在一起**：`result` 同時記著這是哪個 `id` 的結果。畫面上 `result.id !== id` 時，表示手上的資料不是目前要的，就顯示「載入中……」，不會在切換的瞬間顯示上一位的資料。
3. **處理錯誤**：`catch` 接住失敗的情況，顯示錯誤訊息。

### 開發模式下的兩次請求

因為第 6 集學過的 StrictMode，開發模式下這個 Effect 會跑兩輪，所以 `fetch` 會被呼叫兩次。這是正常的，而且正好證明 `ignore` 寫對了：第一輪的結果會被丟掉，只有第二輪的結果被採用。

### 實務上的建議

自己用 Effect 抓資料，要處理競態、載入中、錯誤、快取、重新整理……事情一多就很麻煩。真實專案通常會用專門的工具處理，例如附錄介紹的 TanStack Query，或是第二部的 Next.js。但了解這一集的原理，你才看得懂這些工具幫你做了什麼。

## 重點整理

- 抓資料放在 Effect 裡，依賴陣列填上會影響請求的值（例如 `id`）。
- 先發出的請求可能後到，會用舊資料蓋掉新資料，這叫競態。
- 用清除函式把舊請求的 `ignore` 設成 `true`，丟掉過期的結果。
- 把結果連同它的 `id` 一起存，才能分辨手上的資料是不是目前要的。
- 記得處理失敗的情況。
