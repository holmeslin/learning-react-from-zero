# Cache Components 與 `'use cache'`

## 本集目標

用 `"use cache"` 把一段內容在建置時算一次，然後記起來。

## 正文

### Cache Components

上一集你看到，Next.js 要你明確決定每一塊內容是靜態、動態還是快取。這套規則的名字叫 **Cache Components**。

用 `create-next-app` 建立的新專案，已經替你開好了。打開 `next.config.ts` 可以看到：

```ts
// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
};

export default nextConfig;
```

你在第 12 章遇到的「請用 `<Suspense>` 包起來」錯誤，就是 Cache Components 在檢查。

### `"use cache"`

上一集的第二個選擇是 **cache**：在建置時算一次，然後記起來。方法是在函式或元件的第一行寫 `"use cache"`。新增 `app/cached/page.tsx`：

```tsx
// app/cached/page.tsx
async function Clock() {
  "use cache";
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

跟上一集不同，這次不用 `<Suspense>`，也不用 `connection()`，`npm run build` 直接成功：

```text
Route (app)         Revalidate  Expire
┌ ○ /
├ ○ /_not-found
├ ○ /about
├ ○ /cached                15m      1y
...
```

`/cached` 是 `○` 靜態。右邊多了兩個數字：`Revalidate` 是 15 分鐘，`Expire` 是 1 年，下一集會說明它們的意思。

### 時間凍結了

執行 `npm run start`，重複請求：

```bash
curl -s localhost:3000/cached | grep -o '[上下]午[0-9:]*' | head -1
```

不管你請求幾次、等多久，顯示的時間都**一模一樣**，而且正是建置的那一刻。我實際跑過：三次請求，每次相隔 2 秒，三個結果都是 `下午3:13:02`，和 `.next/BUILD_ID` 檔案的修改時間完全相同。

`"use cache"` 讓 `Clock` 只執行一次，結果被記起來，之後所有人拿到的都是同一份。對時鐘來說這很荒謬，但是對「每個人都看到一樣、不常改變」的東西，這正是你想要的：文章、商品列表、設定。

### 可以用在函式，也可以用在元件

`"use cache"` 放在元件，快取的是整段渲染出來的結果；放在一般的 `async` 函式，快取的是函式的回傳值：

```ts
// 快取函式的回傳值
async function getProducts() {
  "use cache";
  return db.query("SELECT * FROM products");
}
```

下一集的 `getMessages` 就會這樣用。放在檔案的最上面，則整個檔案匯出的函式都會被快取。

### 傳進去的參數會成為快取的「鑰匙」

被快取的函式如果有參數，不同的參數會各自記一份：

```ts
async function getUser(id: string) {
  "use cache";
  // id 是 "1" 和 "2" 會分別快取
}
```

### 快取裡面不能直接讀 `cookies()`

`cookies()`、`headers()` 這些要看「這次是誰在請求」的資料，不能在 `"use cache"` 裡面直接讀，因為快取的內容是要給所有人共用的。官方文件的做法是：在快取的外面把需要的值讀出來，當成參數傳進去。這樣它就變成快取的「鑰匙」，不同的人（不同的參數值）各自快取。

### 但是，快取了要過期

如果資料會改變，被快取的東西就會過期。以留言板為例：有人新增留言，快取住的留言列表卻沒變。這是下面兩集要解決的事：

- **什麼時候自動過期？** `cacheLife`（下一集）
- **資料改變時怎麼主動讓它過期？** `cacheTag` 和 `updateTag`（再下一集）

## 重點整理

- Cache Components 是 Next.js 16 的新專案預設，要求你明確決定每一塊內容是靜態、動態還是快取。
- 在函式或元件的第一行寫 `"use cache"`，結果會被記起來，所有人共用。
- 建置時被快取的內容，在請求時不會重新執行，所以 `new Date()` 的結果是凍結的。
- 被快取的函式，不同的參數值會各自快取。
- `"use cache"` 裡面不能直接讀 `cookies()`，要在外面讀出來當參數傳進去。
