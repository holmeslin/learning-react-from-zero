# ESLint 與 Prettier

## 本集目標

用 ESLint 自動找出程式碼裡的問題，用 Prettier 自動整理程式碼的排版。

## 正文

### 兩個工具各管一件事

- **ESLint**：檢查程式碼有沒有「可能出錯」的寫法，例如宣告了沒用到的變數、違反 Hook 規則。它管的是**對不對**。
- **Prettier**：自動整理縮排、換行、引號。它管的是**好不好看**。

兩個工具不衝突，可以一起用。

### 先看看範本附的是什麼

你用 Vite 建立專案時，範本已經附了一個檢查工具，執行 `npm run lint` 就會用它。Vite 8 的範本用的是 **oxlint**，一個速度很快的檢查工具，設定檔是 `.oxlintrc.json`。

這一集我們改學更廣泛使用的 **ESLint**。你在別人的專案、Next.js 的專案裡，遇到的主要是它。兩者的觀念一樣，會一個就很容易換另一個。

### 安裝 ESLint

在 Vite 專案的資料夾執行：

```bash
npm install -D eslint @eslint/js globals eslint-plugin-react-hooks
```

`-D` 的意思是裝成開發用的套件：只有寫程式的時候用得到，不會被放進網站裡。

四個套件各自的用途：

- `eslint`：工具本身。
- `@eslint/js`：官方的基本規則。
- `globals`：告訴 ESLint「瀏覽器環境裡有哪些內建的全域變數」，例如 `window`、`document`，避免它誤以為你用了沒宣告的變數。
- `eslint-plugin-react-hooks`：React 官方的規則，檢查 Hook 有沒有用對。

### 設定

在專案根目錄新增 `eslint.config.js`：

```js
// eslint.config.js
import js from "@eslint/js";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist"]),
  {
    files: ["**/*.{js,jsx}"],
    extends: [js.configs.recommended, reactHooks.configs.flat.recommended],
    languageOptions: {
      ecmaVersion: "latest",
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
]);
```

這份設定的意思是：

- `globalIgnores(["dist"])`：不要檢查 `dist` 資料夾，那是建置的輸出。
- `files`：檢查所有 `.js` 和 `.jsx` 檔案。
- `extends`：套用官方基本規則，加上 React Hook 的建議規則。
- `languageOptions`：使用最新的 JavaScript 語法、瀏覽器的全域變數、支援 JSX。

### 執行

```bash
npx eslint .
```

`.` 代表整個專案。如果沒有問題，它不會印出任何東西。

### 看看它會抓到什麼

建立一個故意寫錯的檔案 `src/Bad.jsx`：

```jsx
import { useEffect, useState } from "react";

export default function Bad({ show }) {
  if (show) {
    const [count, setCount] = useState(0);
    return <button onClick={() => setCount(count + 1)}>{count}</button>;
  }
  return null;
}

export function Timer({ step }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setN(n + step), 1000);
    return () => clearInterval(id);
  }, []);
  return <p>{n}</p>;
}

export function Unused() {
  const unused = 1;
  return <p>hi</p>;
}
```

再執行 `npx eslint .`，會看到：

```text
5:31  error    React Hook "useState" is called conditionally. React Hooks must be called in the exact same order in every component render. Did you accidentally call a React Hook after an early return?  react-hooks/rules-of-hooks
16:6  warning  React Hook useEffect has missing dependencies: 'n' and 'step'. Either include them or remove the dependency array. You can also do a functional update 'setN(n => ...)' if you only need 'n' in the 'setN' call  react-hooks/exhaustive-deps
21:9  error    'unused' is assigned a value but never used  no-unused-vars
```

三個問題都對：

1. 第 5 行：在 `if` 裡面呼叫 `useState`，違反了 Hook 規則（第 6 章學過）。
2. 第 16 行：`useEffect` 用到了 `n` 和 `step`，卻沒有寫進依賴陣列。
3. 第 21 行：`unused` 宣告了卻沒用。

每一行最後面是規則的名字，例如 `react-hooks/rules-of-hooks`。不懂的時候，拿這個名字去搜尋，就能找到說明。

`error` 和 `warning` 的差別：`error` 是一定要修的問題，`warning` 是建議。

### 它還會抓第 6 章教過的事

`eslint-plugin-react-hooks` 的建議規則還包含了第 6 章「你可能不需要 Effect」的檢查。例如：

```jsx
useEffect(() => {
  setFull(first + " " + last);
}, [first, last]);
```

在 Effect 裡同步呼叫 `setState`，ESLint 會回報：

```text
Error: Calling setState synchronously within an effect can trigger cascading renders
```

意思是：「在 Effect 裡同步呼叫 `setState`，可能造成連續的重新渲染。」這種值直接在渲染時算就好，不需要 state。

### 編輯器整合

在 VS Code 安裝「ESLint」擴充功能，這些問題就會在你寫程式的時候，直接用紅色或黃色底線標出來，不用等到執行指令。

### Prettier

接下來是 Prettier。安裝：

```bash
npm install -D prettier
```

找一個排得很亂的檔案，例如 `src/Messy.jsx`：

```jsx
export default function Messy( {name} ){
const items = ["a","b","c"]
  return <ul>{items.map(item=><li key={item}>{name}：{item}</li>)}</ul>
}
```

用 `--check` 檢查有沒有符合格式：

```bash
npx prettier --check src
```

```text
Checking formatting...
[warn] src/Messy.jsx
[warn] Code style issues found in the above file. Run Prettier with --write to fix.
```

用 `--write` 直接整理：

```bash
npx prettier --write src
```

整理後的檔案變成：

```jsx
export default function Messy({ name }) {
  const items = ["a", "b", "c"];
  return (
    <ul>
      {items.map((item) => (
        <li key={item}>
          {name}：{item}
        </li>
      ))}
    </ul>
  );
}
```

加上空格、補上分號、統一用雙引號、長的 JSX 自動換行縮排。這本書的所有範例都是照 Prettier 的預設風格排的。

Prettier 有幾個選項可以調整，不想用分號、想用單引號，就在專案根目錄新增 `.prettierrc`：

```json
{
  "semi": false,
  "singleQuote": true
}
```

但是建議你**不要調**。Prettier 的設計理念就是「少選擇」，用預設值，團隊裡就不會為了排版吵架。

### 在 VS Code 存檔時自動整理

安裝「Prettier - Code formatter」擴充功能，然後在 VS Code 設定裡打開「Format On Save」，每次存檔，程式碼就會自動整理好。

## 重點整理

- ESLint 檢查程式碼有沒有問題，Prettier 負責排版，兩個可以一起用。
- Vite 範本預設附的是 oxlint，ESLint 是更廣泛使用的選擇，觀念相同。
- `eslint-plugin-react-hooks` 會檢查 Hook 規則，也會抓出多餘的 Effect。
- `npx eslint .` 執行檢查；`npx prettier --check src` 檢查排版，`--write` 直接整理。
- Prettier 建議用預設值，不要調整。
