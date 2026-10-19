# 靜態與動態渲染

## 本集目標

分辨「建置時產生」和「請求時產生」的差別，並看懂 `npm run build` 輸出的符號。

## 正文

### 兩種時間點

一個頁面的 HTML，可以在兩個時間點產生：

- **建置時**（`npm run build` 的時候）：只做一次，產生出來的檔案可以直接送給每一位使用者，非常快。這叫**靜態**（static）。
- **請求時**（有人打開網頁的時候）：每次都重新執行一遍。這叫**動態**（dynamic）。

內容永遠一樣的頁面，適合靜態；內容會依使用者或時間改變的，必須動態。

### 看建置的結果

新增一個內容永遠不變的頁面 `app/about/page.tsx`：

```tsx
// app/about/page.tsx
export default function AboutPage() {
  return (
    <main>
      <h1>關於這個留言板</h1>
      <p>這一頁的內容永遠一樣。</p>
    </main>
  );
}
```

執行 `npm run build`，結尾會有一張路由表：

```text
Route (app)
┌ ○ /
├ ○ /_not-found
├ ○ /about
├ ◐ /guestbook
└ ○ /guestbook/new

○  (Static)             prerendered as static content
◐  (Partial Prerender)  prerendered as static HTML with dynamic server-streamed content
```

每個路由前面的符號，說明它是怎麼產生的：

- `○`（Static）：建置時整頁產生，是純靜態的。`/about` 就是。
- `◐`（Partial Prerender，部分預先渲染）：外殼是建置時產生的靜態 HTML，裡面有一部分（例如 `<Suspense>` 包住的留言列表）是請求時才串流進來的。`/guestbook` 就是。
- `ƒ`（Dynamic）：每次請求時整頁現做。

這個表是你的好朋友。每次改完程式，都應該看看每個頁面的符號是不是你預期的。

### 怎麼知道真的是靜態

啟動正式環境的伺服器：`npm run start`。接著用 `curl` 看 `/about` 的回應標頭：

```bash
curl -s -D - -o /dev/null localhost:3000/about
```

標頭裡有這兩行：

```text
x-nextjs-cache: HIT
Cache-Control: s-maxage=31536000
```

`HIT` 表示直接從快取送出，`s-maxage=31536000` 表示可以被 CDN 快取一年。對照一下等一下會做的動態頁面 `/time`，它的標頭是 `Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate`，意思是「不要記，每次都問我」。

### 會讓頁面變成動態的事

哪些程式碼會讓一個頁面無法在建置時完成？新增 `app/time/page.tsx`，顯示現在的時間：

```tsx
// app/time/page.tsx
export default function TimePage() {
  return (
    <main>
      <h1>現在幾點</h1>
      <p>{new Date().toLocaleTimeString("zh-TW")}</p>
    </main>
  );
}
```

`npm run build` 會失敗：

```text
Error: Route "/time": Next.js encountered the unstable value `new Date()` while prerendering.
This value can change between renders, so it must be either prerendered or computed later.
Ways to fix this:
  - [dynamic] Render at request time by adding a dynamic data access (e.g. `await connection()`) before this call
  - [cache] Prerender and cache the value with `"use cache"`
  - [client] Render the value on the client with `"use client"`
```

建置時的時間，和使用者打開網頁時的時間不一樣，Next.js 不確定你想要哪一個，所以拒絕替你決定，要你**明確選擇**。錯誤訊息列出了三種選擇：

1. **dynamic**：每次請求時才算，這一集會做。
2. **cache**：在建置時算一次，然後記起來，下一集會做。
3. **client**：交給瀏覽器去算（例如在 `useEffect` 裡才設定時間），你在第一部學過。

類似的東西還有 `Math.random()`、`fetch`、`cookies()`、`headers()`、`searchParams` 等，凡是「建置時不知道答案」的事，都要你明確選擇。

### 選擇「動態」：`connection()`

把時間改成請求時才算：

```tsx
// app/time/page.tsx
import { connection } from "next/server";
import { Suspense } from "react";

async function Clock() {
  await connection();
  return <p>{new Date().toLocaleTimeString("zh-TW")}</p>;
}

export default function TimePage() {
  return (
    <main>
      <h1>現在幾點</h1>
      <Suspense fallback={<p>讀取時間中……</p>}>
        <Clock />
      </Suspense>
    </main>
  );
}
```

`await connection()` 的意思是「等到真的有人來要這個頁面，我才繼續往下執行」。它前面的程式碼，可以在建置時完成；它後面的，只能等請求。

因為 `Clock` 要等請求，我們用 `<Suspense>` 包起來，這樣外殼 `<h1>` 和「讀取時間中……」可以先送出去。這和前面章節你做過的事一模一樣。

建置後，`/time` 旁邊的符號是 `◐`。重複請求兩次，每次得到的時間都不一樣：

```bash
curl -s localhost:3000/time | grep -o '[上下]午[0-9:]*' | head -1
```

### 第四個選擇：整頁阻塞

如果你不想用 `<Suspense>`，Next.js 還留了一條路：在頁面檔案裡寫 `export const instant = false`。頁面的符號會變成 `ƒ`，意思是整頁都等到請求時才產生，使用者得等它完成才看得到任何東西。這會讓網站變慢，是最後的手段，不建議作為習慣。

## 重點整理

- 靜態：建置時產生，很快；動態：請求時產生，內容最新。
- `npm run build` 的路由表：`○` 靜態、`◐` 外殼靜態加動態內容串流進來、`ƒ` 整頁動態。
- 建置時答案不確定的東西（`new Date()`、`Math.random()`、`cookies()`……），Next.js 要你明確選擇：動態、快取，或交給瀏覽器。
- `await connection()` 加上 `<Suspense>`，讓一小塊內容留到請求時才產生，其他部分仍然是靜態的。
