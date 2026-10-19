# React Router 框架模式簡介

## 本集目標

知道 React Router 也能做出完整的網站，以及它和 Next.js 的做法有什麼不同。

## 正文

### 第 9 章學的是三種模式的第一種

第 9 章你學的 React Router，是**宣告式模式**（Declarative mode）：用 `<BrowserRouter>` 包住 `<App>`，在瀏覽器裡決定「這個網址要顯示哪個元件」。官方文件把 React Router 分成三種使用方式：

- **宣告式模式**：只負責網址對應元件，這是第 9 章的內容，也是最簡單的。
- **資料模式**（Data mode）：加上 `loader`、`action` 這些資料讀寫的功能，這裡不細談。
- **框架模式**（Framework mode）：功能最完整，變成一個像 Next.js 一樣的**框架**，支援在伺服器上渲染。這一篇就是介紹它。

### 為什麼要看它

Next.js 不是唯一的選擇。如果你已經很熟悉 React Router，或是不想採用 Server Component 的模型，框架模式提供另一條路：路由、資料讀取、伺服器渲染都有，但資料是用傳統的 `loader` 和 `action` 處理，沒有 Server Component。

### 建立專案

```bash
npx create-react-router@latest hello-router
cd hello-router
npm install
npm run dev
```

專案裡最重要的是 `app/` 資料夾：

```text
app/
├── root.tsx        最外層的 HTML 外框
├── routes.ts       路由的設定
└── routes/
    └── home.tsx
```

### 路由要自己設定

和 Next.js 用資料夾決定網址不同，框架模式預設是在 **`app/routes.ts`** 一個檔案裡，明確列出每個網址對應哪個檔案。新增一個留言板的路由：

```ts
// app/routes.ts
import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("guestbook", "routes/guestbook.tsx"),
] satisfies RouteConfig;
```

`index("routes/home.tsx")` 是首頁，`route("guestbook", "routes/guestbook.tsx")` 是說 `/guestbook` 這個網址，由 `routes/guestbook.tsx` 負責。

### `loader` 和 `action`

每個路由檔案可以匯出兩個特殊的函式：

- **`loader`**：負責**讀資料**，在伺服器上執行，頁面渲染之前先跑。
- **`action`**：負責**改資料**，表單送出時在伺服器上執行。

新增 `app/routes/guestbook.tsx`：

```tsx
// app/routes/guestbook.tsx
import { Form } from "react-router";
import type { Route } from "./+types/guestbook";

const messages: { name: string; text: string }[] = [];

export async function loader() {
  return { messages };
}

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const name = String(formData.get("name") ?? "").trim();
  const text = String(formData.get("text") ?? "").trim();
  if (name === "" || text === "") {
    return { error: "請輸入名字與留言" };
  }
  messages.push({ name, text });
  return { error: null };
}

export default function Guestbook({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  return (
    <main>
      <h1>留言板</h1>
      <Form method="post">
        <input name="name" placeholder="你的名字" />
        <textarea name="text" placeholder="想說的話" />
        {actionData?.error && <p role="alert">{actionData.error}</p>}
        <button type="submit">送出</button>
      </Form>
      <ul>
        {loaderData.messages.map((message, index) => (
          <li key={index}>
            <strong>{message.name}</strong>：{message.text}
          </li>
        ))}
      </ul>
    </main>
  );
}
```

逐段看：

- **`loader`**：回傳 `{ messages }`。這個資料會自動變成元件的 `loaderData`。這個範例的資料只存在記憶體裡的陣列，伺服器一重啟就沒了，只是為了簡化示範。
- **`action`**：從 `request.formData()` 取出表單內容，驗證，成功就加進陣列。回傳的東西變成元件的 `actionData`。
- **元件**：直接從 props 拿 `loaderData` 和 `actionData`，不需要自己 `fetch`，也不需要 `useEffect`。型別來自 `./+types/guestbook`，這是工具替每個路由自動產生的。
- **`<Form method="post">`**：來自 `react-router` 的表單。送出時，React Router 會自動呼叫這個路由的 `action`，完成後自動重新執行 `loader`，畫面就更新了，你不用像 Next.js 那樣手動通知。

官方文件說明，`loader` 這個函式會從送給瀏覽器的程式碼中移除，所以你可以放心在裡面使用只能在伺服器上用的功能。

### 建置與啟動

```bash
npm run typecheck
npm run build
npm run start
```

`typecheck` 先替每個路由產生型別再檢查；`build` 打包；`start` 用 `react-router-serve` 啟動伺服器，預設在 3000 埠。我實際執行：對 `/guestbook` 送出 `POST` 請求加一則留言，再 `GET`，列表裡就有那則留言；送出空白的表單，會看到「請輸入名字與留言」。

### 和 Next.js 的比較

| | React Router 框架模式 | Next.js（App Router） |
| --- | --- | --- |
| 路由怎麼定義 | `app/routes.ts` 明確列出 | 資料夾和 `page.tsx` |
| 讀資料 | `loader` 函式 | Server Component 直接 `await` |
| 改資料 | `action` 函式，搭配 `<Form>` | Server Function，搭配 `<form action>` |
| 表單送出後更新畫面 | 自動重新執行 `loader` | 要自己呼叫 `revalidatePath` 或 `updateTag` |
| Server Component | 沒有 | 有 |
| 快取 | 你自己管 | Cache Components |

兩者要解決的問題一樣：讓 React 能在伺服器上渲染，並且有一套標準的方式讀寫資料。差別在於思考方式。框架模式比較接近你在第一部學的 React 元件加上資料函式，Next.js 則是把 Server Component 當成核心。

沒有哪一個比較好，選擇你和團隊最順手的就行。

## 重點整理

- React Router 有三種使用方式：宣告式（第 9 章）、資料模式、框架模式。
- 框架模式是一個完整的全端框架，支援伺服器渲染，用 `create-react-router` 建立。
- 路由在 `app/routes.ts` 設定；每個路由檔案用 `loader` 讀資料、用 `action` 改資料。
- 元件透過 `loaderData` 和 `actionData` 這兩個 props 拿到結果。
- 它沒有 Server Component，表單送出後會自動重新執行 `loader` 來更新畫面。
