# 第一個測試

## 本集目標

替一個純函式寫第一個測試，並看懂測試通過和失敗時的輸出。

## 正文

### 先有要測的東西

建立 `src/utils/price.ts`，寫一個把數字變成價格字串的函式：

```ts
// src/utils/price.ts
export function formatPrice(price: number): string {
  return `NT$ ${price.toLocaleString("zh-TW")}`;
}
```

`toLocaleString("zh-TW")` 會把 `1200` 變成有千分位的 `"1,200"`。

### 寫測試

在旁邊建立 `src/utils/price.test.ts`：

```ts
// src/utils/price.test.ts
import { expect, test } from "vitest";
import { formatPrice } from "./price.ts";

test("formatPrice 會加上千分位與 NT$", () => {
  expect(formatPrice(1200)).toBe("NT$ 1,200");
});
```

逐行看：

- `import { expect, test } from "vitest"`：從 Vitest 匯入兩個東西。
- `test("說明", () => { ... })`：定義**一個測試**。第一個參數是用中文描述這個測試在驗證什麼，第二個參數是一個函式，裡面放測試內容。
- `expect(formatPrice(1200))`：「我預期這個值……」。
- `.toBe("NT$ 1,200")`：「……會是 `"NT$ 1,200"`」。

合起來讀就是：**預期 `formatPrice(1200)` 的結果是 `"NT$ 1,200"`**。

測試的三個動作：準備資料、執行要測的東西、檢查結果。這個測試很短，三件事擠在一行裡；之後的測試會把它們分開寫。

### 執行

```bash
npx vitest run
```

```text
 RUN  v5.0.5 /你的路徑/hello-react

 ✓ src/utils/price.test.ts (1 test) 11ms

 Test Files  1 passed (1)
      Tests  1 passed (1)
   Start at  15:12:04
   Duration  337ms
```

打勾 `✓` 就是通過。後面的時間和日期每次不一樣，不用在意。

> 如果你的輸出只有 `Test Files` 和 `Tests` 兩行摘要、沒有打勾的那一行，是因為有些 AI 輔助工具會設定環境變數，讓 Vitest 切換成精簡模式。在一般的終端機裡，會看到上面的完整輸出。

### 讓它失敗

測試最重要的能力，是「該失敗的時候會失敗」。把預期的值故意改錯，把 `"NT$ 1,200"` 改成 `"NT$ 1200"`，再執行一次：

```text
 FAIL  src/utils/price.test.ts > formatPrice 會加上千分位與 NT$
AssertionError: expected 'NT$ 1,200' to be 'NT$ 1200' // Object.is equality

Expected: "NT$ 1200"
Received: "NT$ 1,200"

 ❯ src/utils/price.test.ts:5:29
      3|
      4| test("formatPrice 會加上千分位與 NT$", () => {
      5|   expect(formatPrice(1200)).toBe("NT$ 1200");
       |                             ^
      6| });
      7|

 Test Files  1 failed (1)
      Tests  1 failed (1)
```

輸出清楚地告訴你：

- **哪個測試失敗**：`price.test.ts` 裡的「formatPrice 會加上千分位與 NT$」。
- **預期值（Expected）和實際值（Received）**：預期 `"NT$ 1200"`，實際得到 `"NT$ 1,200"`。
- **哪一行**：第 5 行，並附上那一行的程式碼。

改回正確的值，測試又會通過。養成一個習慣：**新寫的測試，先確認它真的會失敗一次**，不然你不知道它到底有沒有在檢查東西。

### 在監看模式下寫測試

用 `npm test` 開著監看模式，一邊寫程式一邊看結果，是最順手的方式：存檔的瞬間測試就重跑，右邊的終端機一直亮著綠燈或紅燈。

## 重點整理

- 測試檔放在原檔旁邊，檔名是原檔名加 `.test`。
- `test("說明", () => { ... })` 定義一個測試，`expect(實際值).toBe(預期值)` 檢查結果。
- `✓` 是通過；失敗時會顯示預期值、實際值和出錯的那一行。
- 新寫的測試先讓它失敗一次，確認它真的在檢查東西。
