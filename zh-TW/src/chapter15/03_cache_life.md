# `cacheLife`：快取多久

## 本集目標

用 `cacheLife` 決定被快取的內容多久之後要更新。

## 正文

### 預設是 15 分鐘

上一集 `/cached` 的路由表有 `Revalidate 15m` 和 `Expire 1y`。這是沒有指定任何設定時的**預設值**。我們可以用 `cacheLife` 明確決定。把 `app/cached/page.tsx` 改成：

```tsx
// app/cached/page.tsx
import { cacheLife } from "next/cache";

async function Clock() {
  "use cache";
  cacheLife({ stale: 300, revalidate: 10, expire: 3600 });
  return <p>{new Date().toLocaleTimeString("zh-TW")}</p>;
}

export default function CachedPage() {
  return (
    <main>
      <h1>快取過的時間</h1>
      <Clock />
    </main>
  );
}
```

`cacheLife` 要在 `"use cache"` 的範圍裡呼叫，它接收一個物件，裡面有三個數字（單位是秒）：

| 名稱 | 意思 |
| --- | --- |
| `stale` | 瀏覽器可以不問伺服器、直接使用手上資料的時間。 |
| `revalidate` | 伺服器上的快取，超過這個時間之後，下一次有人請求就會重新產生。 |
| `expire` | 超過這個時間完全作廢。之後的請求必須等新的內容做好才能得到回應。 |

重新 `npm run build`，路由表變成 `/cached  10s  1h`，就是我們剛剛設定的 `revalidate` 和 `expire`。

### 實際觀察

`npm run start` 之後，每 3 秒請求一次，看看時間怎麼變。我實際跑的結果是：

```text
t=0s  下午3:13:53
t=3s  下午3:13:53
t=6s  下午3:13:53
t=9s  下午3:14:03
t=12s 下午3:14:03
t=15s 下午3:14:03
t=18s 下午3:14:03
t=21s 下午3:14:15
```

規律是：快取記了 10 秒以上之後，**第一個請求仍然拿到舊的內容**，但是伺服器同時在背景重新產生；下一個請求，才拿到新的。

這個模式叫 **stale-while-revalidate**（先給舊的，同時更新）。好處是使用者永遠不用等：舊內容立刻有，新內容在背後準備好。代價是更新後，第一個人看到的還是舊的。

### 內建的設定檔

每次都寫三個數字很麻煩，所以 Next.js 準備了幾個名稱，直接傳字串就好：

```ts
cacheLife("hours");
```

| 名稱 | `stale` | `revalidate` | `expire` |
| --- | --- | --- | --- |
| `default` | 5 分鐘 | 15 分鐘 | 永不（路由表上顯示為 1 年） |
| `seconds` | 30 秒 | 1 秒 | 60 秒 |
| `minutes` | 5 分鐘 | 1 分鐘 | 1 小時 |
| `hours` | 5 分鐘 | 1 小時 | 1 天 |
| `days` | 5 分鐘 | 1 天 | 1 週 |
| `weeks` | 5 分鐘 | 1 週 | 30 天 |
| `max` | 5 分鐘 | 30 天 | 1 年 |

挑一個最接近你需求的就行。

### 太短的快取，會被當成動態

名稱叫 `seconds` 的設定，快取時間只有幾秒。時間這麼短，在建置時先做出來也沒有意義，使用者來的時候早就過期了。所以 Next.js 把它視為「請求時才產生」。新增 `app/fast/page.tsx` 試試：

```tsx
// app/fast/page.tsx
import { cacheLife } from "next/cache";
import { Suspense } from "react";

async function Clock() {
  "use cache";
  cacheLife("seconds");
  return <p>{new Date().toLocaleTimeString("zh-TW")}</p>;
}

export default function FastPage() {
  return (
    <main>
      <h1>只快取幾秒</h1>
      <Suspense fallback={<p>讀取時間中……</p>}>
        <Clock />
      </Suspense>
    </main>
  );
}
```

這一頁需要 `<Suspense>`。`npm run build` 後，`/fast` 的符號是 `◐`，而不是 `○`，和上一集的 `/time` 一樣。我實際連續請求，每隔 3 秒，每次都得到不同的時間。

### `stale` 太短也不行

如果你把 `/cached` 的 `stale` 寫成 5：

```ts
cacheLife({ stale: 5, revalidate: 10, expire: 3600 });
```

`npm run build` 會失敗，說這個頁面存取了未快取的資料，需要 `<Suspense>`。因為 `stale` 小於 30 秒，Next.js 認為使用者可能還沒點連結，預先載入的資料就過期了，所以這份快取不能放進預先渲染的結果。

簡單的規則：**時間太短（`revalidate` 為 0、`expire` 不到 5 分鐘、`stale` 不到 30 秒），這塊內容就變成「動態」，要用 `<Suspense>` 包起來。**

## 重點整理

- `cacheLife` 在 `"use cache"` 的範圍裡呼叫，決定快取的壽命。
- 三個數字：`stale`（瀏覽器多久不用問）、`revalidate`（伺服器多久之後重新產生）、`expire`（多久之後徹底作廢）。
- 過了 `revalidate` 之後，第一個請求拿到舊的，同時在背景更新，下一個請求才是新的（stale-while-revalidate）。
- 可以直接用 `"seconds"`、`"minutes"`、`"hours"`、`"days"`、`"weeks"`、`"max"` 這些名稱。
- 快取壽命太短的內容會被當成動態，要用 `<Suspense>` 包起來。
