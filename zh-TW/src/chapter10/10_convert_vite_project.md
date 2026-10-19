# 把 Vite 專案改成 TypeScript

## 本集目標

把 `hello-react` 專案裡的程式碼，全部改成 TypeScript。

## 正文

### 從練習到真的專案

前面 9 集，TypeScript 只檢查 `practice` 資料夾，`src` 裡的程式還是 JavaScript。這一集把 `src` 也改成 TypeScript。`typescript` 已經在第 1 集裝好了，`tsconfig.json` 也有了，剩下的工作是：改設定、改檔名、修錯誤。

如果你之後開新專案，用 Vite 的 `react-ts` 範本建立，一開始就是 TypeScript，不用做這些事。這一集示範的是更常見的情況：手上已經有一個 JavaScript 專案，想把它改過去。

改之前先存一份備份，例如把整個 `hello-react` 資料夾複製一份放到別處（不用複製 `node_modules`），改壞了還能回頭。

### 步驟 1：改 `tsconfig.json`

打開第 1 集建立的 `tsconfig.json`，改兩個地方：

```json
{
  "compilerOptions": {
    "target": "es2023",
    "lib": ["ES2023", "DOM"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "moduleDetection": "force",
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "skipLibCheck": true,
    "types": ["vite/client"]
  },
  "include": ["src"]
}
```

- `"include"` 從 `["practice"]` 改成 `["src"]`：從現在起檢查的是真正的程式碼。`practice` 資料夾不再被檢查，留著或刪掉都可以。
- 多了 `"types": ["vite/client"]`：載入 Vite 提供的型別，讓 TypeScript 看得懂 `import "./index.css"` 這種 Vite 才有的寫法。為什麼需要它，等一下的錯誤訊息會說明。

### 步驟 2：改檔名

TypeScript 看的是副檔名：

- `.jsx` 改成 `.tsx`（有 JSX 的檔案）
- `.js` 改成 `.ts`（沒有 JSX 的檔案）

要改的是 `src/` 底下全部的檔案。在 VS Code 的檔案清單裡，對檔案按右鍵選「重新命名」就能改，VS Code 會問你要不要順便更新 import，選「是」。根目錄的 `vite.config.js` 不在 `src` 裡，維持原樣就好。

接著手動確認兩處：

- `index.html` 裡的 `<script type="module" src="/src/main.jsx">` 要改成 `main.tsx`。
- 所有 import 的副檔名跟著改，例如 `import App from "./App.tsx"`、`import { products } from "../products.ts"`。`tsconfig.json` 裡的 `allowImportingTsExtensions` 就是允許 import 時寫 `.tsx` 副檔名。

### 步驟 3：改 `package.json` 的 build 指令

```json
"build": "tsc && vite build"
```

`tsc && vite build` 的意思是：先用 TypeScript 檢查，**沒有錯誤才**繼續建置。這樣有型別錯誤的程式碼，就不會被部署出去。

### 步驟 4：修錯誤

如果先不加步驟 1 的 `"types"`，執行 `npx tsc`，第 9 章的專案實際會出現這三個錯誤：

```text
src/main.tsx:5:8 - error TS2882: Cannot find module or type declarations for side-effect import of './index.css'.

5 import "./index.css";
         ~~~~~~~~~~~~~

src/main.tsx:7:12 - error TS2345: Argument of type 'HTMLElement | null' is not assignable to parameter of type 'Container'.
  Type 'null' is not assignable to type 'Container'.

7 createRoot(document.getElementById("root")).render(
             ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

src/pages/Contact.tsx:6:25 - error TS7006: Parameter 'event' implicitly has an 'any' type.

6   function handleSubmit(event) {
                          ~~~~~


Found 3 errors in 2 files.

Errors  Files
     2  src/main.tsx:5
     1  src/pages/Contact.tsx:6
```

逐一處理。

**`import "./index.css"`**：匯入 CSS 檔是 Vite 提供的功能，不是 JavaScript 本身的功能，TypeScript 預設不認得。步驟 1 加上的 `"types": ["vite/client"]` 就是告訴它「這個專案用 Vite，CSS 檔可以匯入」。加上之後這個錯誤就會消失。

**`main.tsx` 的 `getElementById`**：`document.getElementById("root")` 可能找不到元素而回傳 `null`，但 `createRoot` 不接受 `null`。我們知道 `index.html` 裡一定有 `id="root"`，可以用 `!` 告訴 TypeScript「這裡不會是 `null`，我保證」：

```tsx,ignore
createRoot(document.getElementById("root")!).render(
```

`!` 放在值的後面，叫**非空斷言**。它是用你的保證換掉 TypeScript 的檢查，保證錯了的話，執行時一樣會出錯，所以只用在像這裡「確定一定存在」的地方。

**`Contact.tsx`**：獨立寫的處理函式要標 `event` 的型別，第 7 集學過：

```tsx
import type { FormEvent } from "react";
import { useNavigate } from "react-router";

export default function Contact() {
  const navigate = useNavigate();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    navigate("/thanks");
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>聯絡我們</h1>
      <label>
        訊息 <input name="message" />
      </label>
      <button>送出</button>
      <button type="button" onClick={() => navigate(-1)}>
        回上一頁
      </button>
    </form>
  );
}
```

修完再跑一次 `npx tsc`，沒有輸出就是通過了。接著 `npm run build`，成功的話專案就轉換完成。`npm run dev` 打開網頁，第 9 章做的每一頁都應該和之前一模一樣，因為型別在執行時根本不存在。

### 順手加上型別

轉換完成後，可以順便把資料的型別補上。打開 `src/products.ts`：

```ts
export type Product = {
  id: number;
  name: string;
  price: number;
  category: "keyboard" | "mouse";
};

export const products: Product[] = [
  { id: 1, name: "機械鍵盤", price: 2400, category: "keyboard" },
  { id: 2, name: "無線滑鼠", price: 890, category: "mouse" },
  { id: 3, name: "人體工學滑鼠", price: 1990, category: "mouse" },
  { id: 4, name: "60% 小鍵盤", price: 1800, category: "keyboard" },
];
```

### 報酬：抓到第 9 章的 bug

還記得第 9 章 `ProductDetail` 有一個一開始沒處理 `/products/99` 的版本，打開就整個畫面壞掉嗎？現在把 `src/pages/ProductDetail.tsx` 暫時改回那個版本：

```tsx,ignore
import { useParams } from "react-router";
import { products } from "../products.ts";

export default function ProductDetail() {
  const { id } = useParams();
  const product = products.find((item) => item.id === Number(id));

  return (
    <>
      <h1>{product.name}</h1>
      <p>售價 {product.price} 元</p>
    </>
  );
}
```

```text
src/pages/ProductDetail.tsx:10:12 - error TS18048: 'product' is possibly 'undefined'.

10       <h1>{product.name}</h1>
              ~~~~~~~

src/pages/ProductDetail.tsx:11:14 - error TS18048: 'product' is possibly 'undefined'.

11       <p>售價 {product.price} 元</p>
                ~~~~~~~


Found 2 errors in the same file, starting at: src/pages/ProductDetail.tsx:10
```

當時要等到打開 `/products/99` 才發現的錯誤，現在在你寫完的瞬間，編輯器就用紅線告訴你：`find` 可能找不到，找不到就是 `undefined`。補回 `if (product === undefined)` 的檢查，紅線就會消失。這就是 TypeScript 的價值。

### 漸進式轉換

專案很大的時候，不需要一次全部改完。在 `tsconfig.json` 的 `compilerOptions` 裡加一行 `"allowJs": true`，`.js` 和 `.ts` 就可以混在同一個專案裡，一個檔案一個檔案慢慢改。`hello-react` 很小，一次改完比較單純。

從下一章開始，`hello-react` 就是一個 TypeScript 專案了。

## 重點整理

- 轉換專案的步驟：`tsconfig.json` 的 `include` 改成 `src` 並加上 `vite/client` 型別、改副檔名、改 `build` 指令、修錯誤。
- `"types": ["vite/client"]` 讓 TypeScript 認得 `import "./index.css"` 這類 Vite 的寫法。
- `build` 指令用 `tsc && vite build`，有型別錯誤就不會建置。
- `document.getElementById("root")!` 的 `!` 是你替 TypeScript 保證「不會是 `null`」，用在確定存在的地方。
- 轉換後，第 9 章那種「找不到資料卻還去讀它」的 bug，會在寫的時候被標出來。
