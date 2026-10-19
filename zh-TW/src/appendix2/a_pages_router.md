# Pages Router 簡介

## 本集目標

看得懂用 Pages Router 寫成的專案，知道它和 App Router 有哪些對應的差別。

## 正文

### 為什麼還要看它

這本書第二部教的是 **App Router**，也就是 `app/` 資料夾。但是在 App Router 出現之前，Next.js 用的是 **Pages Router**，資料夾叫 `pages/`。網路上有大量的教學和既有的專案是用它寫的，你很可能會遇到。

兩種路由可以放在同一個專案裡，官方也提供了逐步搬家的方式，所以很多專案其實是兩種混用。

### 建立一個 Pages Router 專案

`create-next-app` 預設建立 App Router 的專案，要改成 Pages Router，加上 `--no-app`：

```bash
npx create-next-app@latest hello-pages --no-app --yes
```

專案裡你會看到 `pages/` 資料夾，而不是 `app/`：

```text
pages/
├── _app.tsx
├── _document.tsx
├── api/
│   └── hello.ts
└── index.tsx
```

### 檔案就是路由

規則和 App Router 很像：`pages/` 底下的檔案，就對應一個網址。`pages/index.tsx` 是 `/`，`pages/about.tsx` 是 `/about`。

差別是：**每個檔案本身就是頁面**，不用像 App Router 那樣，每個資料夾裡放一個叫 `page.tsx` 的檔案。

- `pages/_app.tsx`：所有頁面的外框，類似 App Router 的根 `layout.tsx`。
- `pages/_document.tsx`：自訂最外層的 `<html>` 和 `<body>`。
- `pages/api/`：API 路由，對應 App Router 的 Route Handler。

### 資料怎麼來：`getServerSideProps`

Pages Router 沒有 Server Component。這個資料夾裡的頁面，**都是**第一部那種一般的 React 元件（官方文件稱它們是 Client Components）。那資料要怎麼從伺服器來？

靠頁面檔案匯出一個特殊的函式。**`getServerSideProps`** 會在每次請求時，在伺服器上執行，回傳的資料變成頁面元件的 props。新增 `pages/messages.tsx`：

```tsx
// pages/messages.tsx
import type { GetServerSideProps } from "next";

type Props = { messages: string[]; renderedAt: string };

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const messages = ["你好", "哈囉"];
  return { props: { messages, renderedAt: new Date().toISOString() } };
};

export default function MessagesPage({ messages, renderedAt }: Props) {
  return (
    <main>
      <h1>留言（每次請求都重新產生）</h1>
      <p>產生時間：{renderedAt}</p>
      <ul>
        {messages.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    </main>
  );
}
```

流程是：請求進來，伺服器先執行 `getServerSideProps`，把資料交給元件，渲染成 HTML 送出。和 App Router 比起來，**資料讀取和元件是分開的**：資料在上面的函式裡，元件只接收 props。App Router 則是元件自己 `await`。

### 預先產生：`getStaticProps`

如果頁面的內容不需要每次都變，用 **`getStaticProps`**，它在**建置時**執行一次。新增 `pages/about.tsx`：

```tsx
// pages/about.tsx
import type { GetStaticProps } from "next";

type Props = { builtAt: string };

export const getStaticProps: GetStaticProps<Props> = async () => {
  return { props: { builtAt: new Date().toISOString() }, revalidate: 10 };
};

export default function AboutPage({ builtAt }: Props) {
  return (
    <main>
      <h1>關於（建置時產生，每 10 秒最多更新一次）</h1>
      <p>產生時間：{builtAt}</p>
    </main>
  );
}
```

`revalidate: 10` 的意思是：這份靜態頁面最多 10 秒就可以換新一次，和第 15 章的 `cacheLife` 的 `revalidate` 是同一個概念，也一樣是先給舊的、背景重新產生。

### API 路由

`pages/api/` 底下的檔案就是 API，寫法和 App Router 的 Route Handler 不同，用的是 Node.js 風格的 `req` 和 `res`：

```ts
// pages/api/messages.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "只支援 GET" });
    return;
  }
  res.status(200).json(["你好", "哈囉"]);
}
```

一個檔案只有一個預設匯出的函式，在函式裡自己檢查 `req.method`；App Router 的 Route Handler 則是用不同的函式名稱（`GET`、`POST`）區分。

### 建置的結果

`npm run build` 輸出的表也不太一樣，標題是 `Route (pages)`：

```text
Route (pages)      Revalidate  Expire
┌ ○ /
├   /_app
├ ○ /404
├ ● /about                10s      1y
├ ƒ /api/hello
├ ƒ /api/messages
└ ƒ /messages

○  (Static)   prerendered as static content
●  (SSG)      prerendered as static HTML (uses getStaticProps)
ƒ  (Dynamic)  server-rendered on demand
```

多了一個 `●`（SSG，使用 `getStaticProps` 的頁面）。`/messages`（用 `getServerSideProps`）是 `ƒ`，API 路由也是 `ƒ`。

我實際執行 `npm run start` 的結果：`/messages` 每次請求時間都不一樣；`/about` 的時間在 10 秒內不變，超過 10 秒後的第一次請求還是舊的，下一次才是新的。

### 兩邊對照

| 想做的事 | Pages Router | App Router |
| --- | --- | --- |
| 頁面 | `pages/about.tsx` | `app/about/page.tsx` |
| 共用外框 | `_app.tsx` | `layout.tsx` |
| 每次請求取得資料 | `getServerSideProps` | 元件裡直接 `await`，搭配 `connection()` |
| 建置時取得資料 | `getStaticProps` | 元件裡直接 `await` |
| 定時更新 | `revalidate: 10` | `cacheLife` |
| API | `pages/api/xxx.ts` | `route.ts` |
| 預設的元件種類 | 都是 Client Component | 預設是 Server Component |
| 改 `<head>` | `next/head` | `metadata` |

### 該選哪個

**新專案請用 App Router**，這也是 Next.js 官方主推的方向。你學過的 Server Component、Server Function 和 Cache Components，Pages Router 都沒有。

Pages Router 仍然被支援，既有的專案不需要為了追新而急著搬。需要的時候，可以一個頁面一個頁面慢慢搬到 `app/` 底下。

## 重點整理

- Pages Router 用 `pages/` 資料夾，一個檔案就是一個頁面；App Router 用 `app/`，一個資料夾加 `page.tsx`。
- Pages Router 的頁面都是一般的 React 元件，資料要靠 `getServerSideProps`（每次請求）或 `getStaticProps`（建置時）傳進來。
- `pages/api/` 是 API 路由，一個檔案一個函式，自己檢查 `req.method`。
- 兩種路由可以並存，新專案請使用 App Router。
