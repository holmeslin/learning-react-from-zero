# 安裝 Vitest

## 本集目標

在 `hello-react` 專案裡裝好 Vitest 和 React Testing Library，並完成設定。

## 正文

### 繼續用 `hello-react`

這一章繼續在 `hello-react` 裡進行。它在第 10 章已經改成 TypeScript，第 9 章做的商品網站也還在，正好拿來測試。以下的指令都在 `hello-react` 的終端機執行。

### 安裝測試工具

```bash
npm install -D vitest jsdom
npm install -D @testing-library/react @testing-library/dom
npm install -D @testing-library/user-event @testing-library/jest-dom
```

`-D` 是「只在開發時用」，因為測試工具不會被放進最後給使用者的網頁裡。六個套件各自的工作：

| 套件 | 用途 |
| --- | --- |
| `vitest` | 執行測試 |
| `jsdom` | 在 Node.js 裡模擬瀏覽器的 DOM |
| `@testing-library/react` | 在測試裡渲染元件、查詢畫面 |
| `@testing-library/dom` | React Testing Library 需要的底層套件，要另外裝 |
| `@testing-library/user-event` | 模擬使用者點選、打字 |
| `@testing-library/jest-dom` | 多一批好用的比較方式，例如 `toBeInTheDocument()` |

**為什麼需要 `jsdom`？** 測試是在 Node.js 裡跑，不是在瀏覽器裡。Node.js 沒有網頁，沒有 `document`，也沒有 DOM。`jsdom` 用 JavaScript 做了一個「假的瀏覽器環境」，讓你的元件可以真的渲染出 DOM 元素，而不用打開真的瀏覽器。

### 設定 Vitest

Vitest 讀的就是 Vite 的設定檔。打開專案根目錄的 `vite.config.js`，改成：

```js
// vite.config.js
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
  },
});
```

和範本相比，改了三個地方：

- `defineConfig` 改成從 `vitest/config` 匯入。它多認得 `test` 這個欄位，編輯器才會提示裡面有哪些設定。
- `environment: "jsdom"`：測試跑在剛才說的假瀏覽器環境裡。
- `setupFiles`：每個測試檔執行之前，會先跑一次的檔案。

如果你在第 7 章第 4 集啟用了 React Compiler，原本 `plugins` 裡的 `babel({ presets: [reactCompilerPreset()] })` 和它的 `import` 要保留，只在這份設定上加 `test` 那一段就好。

### 建立 setup 檔

建立 `src/test/setup.ts`：

```ts
// src/test/setup.ts
import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});
```

兩件事：

1. `import "@testing-library/jest-dom/vitest"`：讓 `toBeInTheDocument()` 這類的比較方式在 Vitest 裡能用，TypeScript 也會認得它們。
2. `afterEach(() => cleanup())`：**每個測試跑完，就把剛才渲染的元件清掉**。不做這件事，上一個測試渲染的東西會留在畫面上，下一個測試就會找到兩份同樣的元素，出現「Found multiple elements」的錯誤。

### 加上 `test` 指令

打開 `package.json`，在 `scripts` 加上一行：

```json
"test": "vitest"
```

之後執行 `npm test` 就會開始測試。

### 執行看看

現在還沒有任何測試檔，先執行看看設定有沒有問題：

```bash
npm test
```

會看到 `No test files found`，這是正常的，代表 Vitest 正常啟動，只是找不到測試。按 `q` 離開。

`npm test` 預設是**監看模式**（watch mode）：測試跑完之後不會結束，而是一直等著，你存檔、改程式，它就自動只重跑相關的測試。開發的時候很方便。只想跑一次然後結束，用 `npx vitest run`。

### 測試檔放哪裡

Vitest 會找檔名裡有 `.test.` 或 `.spec.` 的檔案，例如 `price.test.ts`、`Counter.test.tsx`。這本書的慣例是：**測試檔放在被測的檔案旁邊**，名字是原檔名加上 `.test`：

```text
src/
  pages/
    Products.tsx
    Products.test.tsx
  utils/
    price.ts
    price.test.ts
```

`src` 底下的測試檔也會被 `tsconfig.json` 檢查，所以 `npm run build` 時，測試檔的型別錯誤一樣會被抓出來。

## 重點整理

- 安裝 `vitest`、`jsdom`，以及 `@testing-library` 的 `react`、`dom`、`user-event`、`jest-dom`。
- `jsdom` 讓測試能在 Node.js 裡渲染元件，不需要開真的瀏覽器。
- 設定寫在 `vite.config.js` 的 `test` 欄位，`defineConfig` 要從 `vitest/config` 匯入。
- `setup.ts` 要載入 jest-dom，並在每個測試後 `cleanup()`。
- 檔名含 `.test.` 的檔案會被當成測試；`npm test` 是監看模式，`npx vitest run` 只跑一次。
