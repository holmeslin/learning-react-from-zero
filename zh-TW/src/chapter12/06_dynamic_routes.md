# 動態路由

## 本集目標

用一個頁面檔案，對應「很多個長得很像的網址」，例如 `/books/1`、`/books/2`、`/books/3`。

## 正文

### 一本書一個檔案？

書店有三本書，每本書都要有自己的頁面：`/books/1`、`/books/2`、`/books/3`。難道要建三個資料夾、三個檔案嗎？當然不用，如果有一千本書呢？

這種「網址的一段是變數」的情況，要用**動態路由**（dynamic route）。做法是：把資料夾的名字用**中括號**包起來。

建立 `app/books/[id]/page.tsx`。資料夾名字就叫 `[id]`，中括號也是名字的一部分：

```tsx
// app/books/[id]/page.tsx
import { books, getBook } from "@/app/lib/books";

export function generateStaticParams() {
  return books.map((book) => ({ id: book.id }));
}

export default async function BookPage(props: PageProps<"/books/[id]">) {
  const { id } = await props.params;
  const book = getBook(id);

  return (
    <main>
      <h1>{book?.title}</h1>
      <p>{book?.summary}</p>
    </main>
  );
}
```

存檔，打開 <http://localhost:3000/books/1>，你會看到「貓咪的程式課」。改成 `/books/2`，就換成河馬那本。

### `params` 是 Promise

這個頁面元件有幾個值得停下來看的地方。

網址裡 `[id]` 那一段的值，會放進 `props.params`。但是注意：**`params` 是一個 Promise**，所以要用 `await` 取值：

```tsx
const { id } = await props.params;
```

為什麼是 Promise？因為網址是請求到達時才知道的資訊，Next.js 要把它當成「還沒準備好的資料」來處理。這也是為什麼 `BookPage` 要寫成 `async` 函式，這種寫法第 13 章會細講，現在先照著寫。

`PageProps<"/books/[id]">` 和上一集的 `LayoutProps` 一樣，是 Next.js 自動產生的全域型別。有了它，`params` 的型別會自動被推出來：`id` 是 `string`，不用你自己標。

網址裡的值永遠是字串，所以 `id` 是 `"1"` 而不是數字 `1`。我們的資料裡 `id` 也是字串，這樣比較起來才對得上。

### `generateStaticParams`

你可能注意到了 `generateStaticParams` 這個函式。它的作用是告訴 Next.js：「建置網站的時候，請預先把這幾個網址的頁面準備好。」它回傳的是一個陣列，每個元素是一組 `params`：

```ts
[{ id: "1" }, { id: "2" }, { id: "3" }]
```

為什麼一定要寫它？拿掉試試看：把整個 `generateStaticParams` 函式刪掉，然後在終端機執行 `npm run build`。你會看到建置失敗：

```text
Error: Route "/books/[id]": Next.js encountered uncached or runtime data during prerendering.

`fetch(...)`, `cookies()`, `headers()`, `params`, `searchParams`, or `connection()` accessed outside of `<Suspense>` prevents the route from being prerendered, blocking the page load and leading to a slower user experience.
```

意思是：「這個路由在預先渲染的時候，碰到了執行期才會知道的資料（`params`），而且它沒有被 `<Suspense>` 包住。」因為不加 `generateStaticParams`，Next.js 在建置時根本不知道 `id` 會是什麼，沒辦法把頁面準備好。這是 Cache Components 開著的緣故。

解決的方法有兩個：

- **告訴它有哪些網址**：這就是 `generateStaticParams` 做的事，也是這一集採用的做法。
- **用 `<Suspense>` 包起來**，讓頁面先送出一個外殼，資料之後再補上。第 8 集和第 13 章會講。

在開發伺服器（`npm run dev`）上，拿掉 `generateStaticParams` 之後頁面還是會顯示出來，只是終端機會印出類似的錯誤訊息，不會像 `npm run build` 那樣直接失敗。所以養成習慣，改完重要的東西就跑一次 `npm run build`。

把 `generateStaticParams` 放回去，再次執行 `npm run build`，成功之後會看到路由列表：

```text
Route (app)
┌ ○ /
├ ○ /_not-found
├ ○ /about
├ ○ /books
└   /books/[id]
  ├ ◐ /books/[id]
  ├ ○ /books/1
  ├ ○ /books/2
  └ ○ /books/3

○  (Static)             prerendered as static content
◐  (Partial Prerender)  prerendered as static HTML with dynamic server-streamed content
```

`/books/1`、`/books/2`、`/books/3` 前面是 `○`，代表它們在建置時就已經做成靜態的 HTML。

### 不存在的書呢？

試試看打開 <http://localhost:3000/books/999>。頁面可以打開，但是標題是空的，因為 `getBook("999")` 找不到書，回傳 `undefined`，所以 `book?.title` 也是 `undefined`。

這顯然不對：沒有這本書，應該告訴使用者「找不到」才是。第 9 集會處理這個問題。

## 重點整理

- 資料夾名稱用中括號包起來，例如 `[id]`，就是動態路由，網址那一段的值會放進 `params`。
- `params` 是 Promise，要 `await`；網址裡的值永遠是字串。
- `PageProps<"/books/[id]">` 是自動產生的型別，會推出 `params` 的型別。
- `generateStaticParams` 告訴 Next.js 建置時要預先準備哪些網址，不寫的話 `npm run build` 會失敗。
- 網址對應不到資料時要自己處理，下一步會學。
