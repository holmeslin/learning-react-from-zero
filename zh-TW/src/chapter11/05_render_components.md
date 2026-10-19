# 測試 React 元件

## 本集目標

用 React Testing Library 把元件渲染出來，並檢查畫面上有沒有預期的文字。

## 正文

### 要測的元件

建立 `src/components/Counter.tsx`，一個和第 5 章一樣的計數器。如果你的專案裡已經有第 5 章寫的計數器，寫法可能略有不同，這裡另外建一個就好：

```tsx
// src/components/Counter.tsx
import { useState } from "react";

export default function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>目前數字：{count}</p>
      <button onClick={() => setCount(count + 1)}>加一</button>
    </div>
  );
}
```

### 第一個元件測試

建立 `src/components/Counter.test.tsx`。注意副檔名是 `.tsx`，因為裡面有 JSX：

```tsx
// src/components/Counter.test.tsx
import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import Counter from "./Counter.tsx";

test("一開始顯示 0", () => {
  render(<Counter />);

  expect(screen.getByText("目前數字：0")).toBeInTheDocument();
});
```

兩個新東西：

- `render(<Counter />)`：把元件渲染到 jsdom 提供的假網頁裡。這一步之後，元件就像真的在瀏覽器裡一樣，有了 DOM 元素。
- `screen.getByText("目前數字：0")`：在畫面上找出「文字是 `目前數字：0`」的元素。找到的話回傳那個元素；找不到的話直接丟出錯誤，測試失敗。

`toBeInTheDocument()` 來自 `jest-dom`，意思是「這個元素在畫面上」。

注意這個測試**沒有碰到 `count`、`setCount` 這些內部的東西**，只看畫面上有什麼。這就是前面說的「站在使用者的角度」：使用者看不到 state，只看得到「目前數字：0」這幾個字。

執行 `npx vitest run`：

```text
 ✓ src/components/Counter.test.tsx (1 test) 14ms
```

### 找不到的時候

把預期的文字改成 `目前數字：1`，測試會失敗，而且輸出非常有用：

```text
TestingLibraryElementError: Unable to find an element with the text: 目前數字：1. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.

Ignored nodes: comments, script, style
<body>
  <div>
    <div>
      <p>
        目前數字：
        0
      </p>
      <button>
        加一
      </button>
    </div>
  </div>
</body>
```

錯誤訊息後面，Testing Library 把**當時畫面的 HTML** 整個印給你看，你一眼就看得出元件實際渲染了什麼，到底哪裡和預期不同。

注意這裡 `目前數字：` 和 `0` 被分成兩行，這是因為 React 把 `{count}` 前後當成兩段文字。但 `getByText` 比對的是整個 `<p>` 元素的文字，所以 `"目前數字：0"` 還是找得到。

### 隨時看看畫面：`screen.debug()`

測試寫到一半，不確定畫面現在長怎樣時，在測試裡加一行 `screen.debug()`，執行時就會把目前的 HTML 印出來，不必等到失敗才看到。確認完記得刪掉。

### 每個測試都是獨立的

還記得第 2 集 `setup.ts` 裡的 `cleanup()` 嗎？每個測試跑完，渲染的元件就被清掉，所以下一個測試的畫面是乾淨的。如果沒做這件事，第二個測試渲染 `Counter` 之後，畫面上會有兩個「目前數字：0」，`getByText` 就會報錯：

```text
TestingLibraryElementError: Found multiple elements with the text: 目前數字：0
```

這個錯誤訊息看起來像程式出了問題，其實是 `cleanup` 沒設好。看到它，回頭檢查 `src/test/setup.ts`。

## 重點整理

- `render(<元件 />)` 把元件渲染到假的網頁，`screen` 用來查詢畫面上的東西。
- `screen.getByText("文字")` 找得到就回傳元素，找不到就丟錯誤。
- `toBeInTheDocument()` 檢查元素在畫面上。
- 測試要看畫面上有什麼，而不是元件內部的 state。
- 找不到時，錯誤訊息會印出當時的 HTML；`screen.debug()` 可以隨時印出目前的畫面。
