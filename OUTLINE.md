# 全書大綱

這是規劃用的大綱，`zh-TW/src/SUMMARY.md` 只列已經寫好的集數。寫完一章就把那一章加進 `SUMMARY.md`。

鎖定版本：React 19.3、Vite 8、React Router 8（Declarative mode）、Next.js 16、Node.js 24 LTS、npm。

## 第一部

### 第 1 章 JavaScript 第一步（已完成）

網頁是怎麼組成的、安裝 Node.js 與 VS Code、第一個程式、`const` 與 `let`、註解、數字與算術、字串與樣板字面值、布林值與比較、`if` 與 `else`、邏輯運算子、三元運算子、陣列基礎、`for...of`、物件基礎、`null` 與 `undefined`、綜合練習

### 第 2 章 函式與現代 JavaScript

函式宣告、參數與回傳值、箭頭函式、函式也是值（callback）、`map`、`filter`、其他陣列方法（`find`、`some`、`includes`、`reduce`）、物件解構、陣列解構、展開語法、不可變更新、`?.` 與 `??`、`import` / `export`、Promise 與 `async` / `await`、`fetch` 與 JSON、綜合練習

### 第 3 章 HTML 與 CSS

HTML 結構、常用標籤、屬性、表單元素、CSS 選擇器、盒模型、Flexbox、DOM 是什麼以及為什麼需要 React

### 第 4 章 第一個 React 程式

用 Vite 建立專案、專案結構、第一個元件、JSX 規則、JSX 裡的 `{}`、元件組合與拆檔、props、`children`、條件渲染、列表與 `key`、元件要是純函式、CSS 檔、CSS Modules、React DevTools

### 第 5 章 互動與 state

事件處理、為什麼普通變數不行、`useState`、state 是快照、更新函式、物件 state、陣列 state、受控輸入、多欄位表單、提升 state、state 該放哪裡、`key` 與重設 state、綜合練習：待辦清單

### 第 6 章 Ref 與 Effect

`useRef` 存值、ref 操作 DOM、`useEffect`、依賴陣列、清除函式、StrictMode 為什麼執行兩次、你可能不需要 Effect、用 Effect 抓資料、`useEffectEvent`、自訂 Hook、Hook 規則

### 第 7 章 管理複雜 state

`useReducer`、`useContext`、Context 搭配 Reducer、`memo` / `useMemo` / `useCallback` 與 React Compiler

### 第 8 章 React 19 的新功能

`<form action>`、`useActionState`、`useFormStatus`、`useOptimistic`、`use`、Suspense、錯誤邊界、`useTransition`、`useDeferredValue`、ref 直接當 prop、在元件裡寫 `<title>`、`<Activity>`

### 第 9 章 React Router

第一個路由、`Link` / `NavLink`、巢狀路由與 `Outlet`、`useParams`、`useSearchParams`、`useNavigate`、404 頁面

### 第 10 章 TypeScript

為什麼要用 TypeScript、基本型別、型別推論、物件型別、聯集型別、props 型別、state 與事件型別、泛型入門、Hook 與 Context 的型別、把 Vite 專案改成 TypeScript

### 第 11 章 測試

為什麼要寫測試、安裝 Vitest、第一個測試、`describe` / `test` / `expect`、用 React Testing Library 渲染元件、用 `getByRole` 找元素、用 `user-event` 模擬操作、非同步測試（`findBy`）、`vi.fn` 與 `vi.mock`、用 `renderHook` 測自訂 Hook

### 附錄一

Tailwind CSS、ESLint 與 Prettier、其他 Hook（`useId`、`useLayoutEffect`、`useSyncExternalStore`、`useImperativeHandle`）、`createPortal`、看懂舊式類別元件、`forwardRef` 等舊寫法、生態系簡介（TanStack Query、Zustand）

## 第二部（全部用 TypeScript）

### 第 12 章 Next.js 入門

為什麼需要框架、`create-next-app`、專案結構、`page` 與 `layout`、檔案路由、動態路由 `[id]`、`Link`、`loading` 與 `error`、`not-found`、metadata、`next/image` 與 `next/font`

### 第 13 章 Server Components

伺服器與瀏覽器、Server Component 是什麼、`async` 元件直接讀資料、`'use client'`、Server 與 Client 的邊界、把 Server Component 當 `children` 傳入、哪些 props 可以傳、串流與 Suspense

### 第 14 章 Server Functions

`'use server'`、表單呼叫 Server Function、讀寫 JSON 檔、`revalidatePath`、搭配 `useActionState` 回傳錯誤、搭配 `useOptimistic`、`redirect`、輸入驗證、綜合練習：留言板

### 第 15 章 快取、渲染與部署

靜態與動態渲染、Cache Components（`'use cache'`）、Route Handlers、`proxy.ts`、環境變數、`next build` 與 `next start`、Vercel 簡介

### 附錄二

Pages Router 簡介、React Router 框架模式簡介

## 其他檔案

- `foreword.md`、`afterword.md`
- `GUIDE.md`（AI 助教操作規格）與 `EXERCISES.md`（固定題庫，第 1、2、4、5 章有固定題）：正文寫完再寫
