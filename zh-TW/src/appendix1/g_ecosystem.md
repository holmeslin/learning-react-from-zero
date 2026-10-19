# 生態系簡介

## 本集目標

認識兩個很多人用的函式庫：TanStack Query 管伺服器資料，Zustand 管全域的狀態，並知道什麼時候該考慮它們。

## 正文

React 本身很小，只管畫面。專案變大之後，常常會碰到「抓資料」和「跨元件共用狀態」這兩件事，React 內建的工具（`useEffect`、Context）能做，但寫起來比較辛苦。社群因此發展出一些函式庫，這一集介紹最常見的兩個，只示範最基本的用法，讓你知道它們長什麼樣子。

### TanStack Query：抓資料

第 6 章你用 `useEffect` 抓資料，要自己處理載入中、出錯、重新抓取、快取，程式碼一長，很容易出錯。**TanStack Query**（以前叫 React Query）幫你把這些都處理好。

安裝：

```bash
npm install @tanstack/react-query
```

先準備一個 JSON 檔放在 `public/books.json`：

```json
[
  { "id": 1, "title": "貓咪的程式課" },
  { "id": 2, "title": "河馬的資料結構" },
  { "id": 3, "title": "企鵝的網路世界" }
]
```

然後在 `src/App.jsx` 用 `useQuery` 抓：

```jsx
// src/App.jsx
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";

const queryClient = new QueryClient();

function Books() {
  const { data, isPending, error } = useQuery({
    queryKey: ["books"],
    queryFn: async () => {
      const res = await fetch("/books.json");
      if (!res.ok) throw new Error("抓取失敗");
      return res.json();
    },
  });

  if (isPending) return <p>載入中……</p>;
  if (error) return <p>出錯了：{error.message}</p>;

  return (
    <ul>
      {data.map((book) => (
        <li key={book.id}>{book.title}</li>
      ))}
    </ul>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Books />
    </QueryClientProvider>
  );
}
```

執行之後，先看到「載入中……」，很快換成三本書的列表。

拆開來看：

- `QueryClientProvider`：像 Context 的 Provider，讓底下的元件都能用 `useQuery`。
- `queryKey`：這筆資料的名字。相同名字的查詢，會共用同一份快取。
- `queryFn`：真正抓資料的函式，回傳 Promise。
- `useQuery` 回傳 `data`（資料）、`isPending`（還在載入）、`error`（錯誤），不用自己宣告三個 state。

除此之外它還會自動做：使用者切回這個分頁時重新抓資料、失敗時重試、不同元件用同樣的資料時只發一次請求。這些都是用 `useEffect` 自己寫會很辛苦的功能。

### Zustand：全域狀態

第 7 章你學了 Context 搭配 Reducer 來共用狀態。**Zustand** 提供一個更簡單的做法：你建立一個「store」，任何元件都可以直接從裡面讀資料、改資料，不需要 Provider。

安裝：

```bash
npm install zustand
```

寫一個購物車：

```jsx
// src/App.jsx
import { create } from "zustand";

const useCartStore = create((set) => ({
  items: [],
  add: (title) => set((state) => ({ items: [...state.items, title] })),
  clear: () => set({ items: [] }),
}));

function AddButton({ title }) {
  const add = useCartStore((state) => state.add);

  return <button onClick={() => add(title)}>買 {title}</button>;
}

function Cart() {
  const items = useCartStore((state) => state.items);
  const clear = useCartStore((state) => state.clear);

  return (
    <div>
      <p>購物車有 {items.length} 本書</p>
      <button onClick={clear}>清空</button>
    </div>
  );
}

export default function App() {
  return (
    <div>
      <AddButton title="貓咪的程式課" />
      <AddButton title="河馬的資料結構" />
      <Cart />
    </div>
  );
}
```

按兩次「買 貓咪的程式課」再按一次「買 河馬的資料結構」，購物車會顯示「購物車有 3 本書」，按「清空」變回 0。

說明：

- `create` 建立 store，裡面放資料（`items`）和修改資料的函式（`add`、`clear`）。
- 它回傳的 `useCartStore` 是一個 Hook。元件用 `useCartStore((state) => state.items)` 取出自己需要的那一部分。
- `set` 用來更新資料，用法像 `setState`：回傳一個新物件，Zustand 會把它合併進去。注意這裡用 `[...state.items, title]` 產生新陣列，不是 `push`，這個習慣你在第 5 章學過了。
- `AddButton` 和 `Cart` 沒有任何 props 往來，也沒有共同的父元件幫它們傳資料，卻能共用同一份購物車。

### 什麼時候考慮它們

不是每個專案都需要。一個大略的判斷：

- **資料來自伺服器**，需要快取、重新抓取、載入狀態：考慮 TanStack Query。注意：在 Next.js 裡，很多讀資料的需求可以由 Server Component 處理（第 13 章），不一定需要它。
- **很多不相干的元件要共用同一份狀態**，而且用 Context 覺得太繁瑣：考慮 Zustand。
- **只是一般的專案、狀態不多**：`useState` 加上提升 state，就綽綽有餘，不要為了用而用。

### 還有很多

React 生態系裡還有很多好用的東西：表單處理有 React Hook Form，動畫有 Motion，UI 元件有 shadcn/ui 和 Radix。你不需要全部學會，遇到問題的時候，知道「應該有人做過這個」，去查一查就好。選函式庫時，看它最近有沒有維護、有沒有人在用，會比追最新的東西更可靠。

## 重點整理

- TanStack Query 管伺服器的資料：自動處理載入中、錯誤、快取和重新抓取。
- Zustand 管全域狀態：建立一個 store，任何元件都能直接使用，不需要 Provider。
- 先用 React 內建的工具，遇到真正的痛點再考慮加函式庫。
- 在 Next.js 裡，Server Component 已經解決了很多讀資料的需求。
