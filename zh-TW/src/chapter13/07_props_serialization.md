# 哪些 props 可以傳

## 本集目標

知道從 Server Component 傳給 Client Component 的 props 有什麼限制，並且看懂違反限制時的錯誤訊息。

## 正文

### 為什麼有限制

Server Component 在伺服器上，Client Component 在瀏覽器裡，兩邊是不同的電腦，中間隔著網路。要傳資料過去，必須先把資料變成一串可以在網路上傳送的文字，到了瀏覽器再還原。這個過程叫**序列化**（serialization）。

所以 props 的值必須是「能被序列化」的東西。不是所有 JavaScript 的值都可以。

### 可以傳的

React 官方列出的可序列化類型：

- **基本型別**：字串、數字、布林值、`null`、`undefined`、`bigint`
- **陣列、`Map`、`Set`**，裡面的值也要是可序列化的
- **`Date`**
- **純物件**：用大括號 `{}` 建立的物件，屬性的值也要可序列化
- **JSX 元素**：就是上一集傳進去的 `children`
- **Promise**：第 8 集會用到
- **Server Function**：第 14 章會講

用我們的資料來驗證。建立一個 Client Component，只顯示收到的值是什麼型別：

```tsx
// app/ui/show-type.tsx
"use client";

export default function ShowType({ data }: { data: unknown }) {
  const name = (data as object | null)?.constructor?.name ?? String(data);

  return <p>{name}</p>;
}
```

然後從 Server Component 傳進各種值。暫時把首頁 `app/page.tsx` 換成下面這段，試完再改回來：

```tsx
import ShowType from "@/app/ui/show-type";

export default function Page() {
  return (
    <main>
      <ShowType data={new Date("2026-01-01")} />
      <ShowType data={new Map([["a", 1]])} />
      <ShowType data={new Set([1, 2])} />
      <ShowType data={[1, 2, 3]} />
      <ShowType data={{ title: "書", price: 380 }} />
      <ShowType data={undefined} />
    </main>
  );
}
```

頁面上會依序顯示：`Date`、`Map`、`Set`、`Array`、`Object`、`undefined`，每一個都成功傳過去了。

注意這裡用的是固定的日期 `new Date("2026-01-01")`，不是 `new Date()`。這是 Cache Components 的規定：每次執行都會不一樣的值（現在的時間、隨機數字），在頁面預先渲染的時候不能直接使用。如果寫 `new Date()`，建置時會看到：

```text
Error: Route "/": Next.js encountered the unstable value `new Date()` while prerendering.
This value can change between renders, so it must be either prerendered or computed later.
```

意思是：「這個值每次渲染都會變，你必須讓它預先算好並快取，或是之後再算。」第 15 章會教你怎麼處理。

### 不能傳的

#### 函式

這是最常遇到的錯誤。你想傳一個函式，讓按鈕被按下時呼叫它：

```tsx
// 在 Server Component 裡
function handleLike() {
  console.log("喜歡");
}

<LikeButton onLike={handleLike} />;
```

會得到錯誤：

```text
Error: Event handlers cannot be passed to Client Component props.
  <... onLike={function handleLike}>
              ^^^^^^^^^^^^^^^^^^^^^
If you need interactivity, consider converting part of this to a Client Component.
```

意思是：「事件處理函式不能傳給 Client Component。如果需要互動，考慮把這一部分改成 Client Component。」

如果函式的 prop 名字不是 `on` 開頭，錯誤訊息會稍微不同：

```text
Error: Functions cannot be passed directly to Client Components unless you explicitly expose it by marking it with "use server". Or maybe you meant to call this function rather than return it.
```

意思是：「函式不能直接傳給 Client Component，除非你用 `"use server"` 明確標示它。」`"use server"` 是第 14 章的內容。

為什麼函式不能傳？函式是程式碼，不是資料，沒辦法變成文字再還原。而且那個函式是跑在伺服器上的，瀏覽器裡根本沒有它。

**怎麼解決？** 把事件處理寫在 Client Component 裡面，需要的資料用 props 傳進去。就像 `LikeButton` 一樣：Server Component 傳 `initialLikes`（資料），`onClick` 的邏輯在 Client Component 內部。

#### 類別的實體

```tsx
class Point {
  constructor(
    public x: number,
    public y: number,
  ) {}
}

<ShowType data={new Point(1, 2)} />;
```

會得到錯誤：

```text
Error: Only plain objects, and a few built-ins, can be passed to Client Components from Server Components. Classes or null prototypes are not supported.
```

意思是：「只有純物件和少數內建的類型，才能從 Server Component 傳給 Client Component。不支援類別（的實體）。」

**怎麼解決？** 傳之前先轉成純物件，例如 `{ x: point.x, y: point.y }`。

### 一個實用的原則

傳給 Client Component 的 props，**只傳它「真正需要」的資料**。因為所有傳過去的資料，都會被放進網頁裡，使用者可以在原始碼裡看到。不要把整個資料庫的資料列，連同不該讓人看到的欄位（例如密碼、內部備註），一股腦傳過去。

## 重點整理

- Server 傳給 Client 的 props 必須能序列化：基本型別、陣列、`Map`、`Set`、`Date`、純物件、JSX、Promise 都可以。
- 函式和類別的實體不能傳。要互動的邏輯寫在 Client Component 裡面。
- 在 Cache Components 下，`new Date()` 這種每次都不同的值不能在預先渲染時直接用。
- 傳給 Client Component 的資料會出現在網頁原始碼裡，只傳需要的欄位。
