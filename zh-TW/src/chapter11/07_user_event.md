# 用 `user-event` 模擬操作

## 本集目標

在測試裡模擬使用者點選和打字，並檢查畫面的變化。

## 正文

### 為什麼需要 `user-event`

前面的測試只檢查「一開始的畫面」。但元件的重點是互動：按一下按鈕數字加一，打字畫面跟著變。要測這些，得在測試裡**模擬使用者的操作**。`@testing-library/user-event` 就是做這件事的，它模擬得很像真的使用者：點的時候，滑鼠移上去、按下、放開的事件都會依序發生。

### 測試按鈕

回到 `src/components/Counter.test.tsx`，加上互動的測試：

```tsx
// src/components/Counter.test.tsx
import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Counter from "./Counter.tsx";

test("一開始顯示 0", () => {
  render(<Counter />);

  expect(screen.getByText("目前數字：0")).toBeInTheDocument();
});

test("按一下按鈕，數字加一", async () => {
  const user = userEvent.setup();
  render(<Counter />);

  await user.click(screen.getByRole("button", { name: "加一" }));

  expect(screen.getByText("目前數字：1")).toBeInTheDocument();
});

test("連按三下，數字變成 3", async () => {
  const user = userEvent.setup();
  render(<Counter />);
  const button = screen.getByRole("button", { name: "加一" });

  await user.click(button);
  await user.click(button);
  await user.click(button);

  expect(screen.getByText("目前數字：3")).toBeInTheDocument();
});
```

新的東西：

- `userEvent.setup()`：建立一個「使用者」。每個測試開頭都建立一個新的。
- `await user.click(元素)`：模擬使用者點那個元素。
- 測試函式前面多了 `async`，因為裡面用了 `await`。

這個測試的結構，也就是前面提過的三個動作：**準備**（`render` 並找到按鈕）、**操作**（`user.click`）、**檢查**（`expect`）。

### 一定要 `await`

`user.click` 回傳的是 Promise，使用者操作不是瞬間完成的。如果忘了 `await`：

```tsx,ignore
user.click(screen.getByRole("button", { name: "加一" }));

expect(screen.getByText("目前數字：1")).toBeInTheDocument();
```

點選還沒完成，`expect` 就先執行了，畫面上還是 0，測試失敗：

```text
TestingLibraryElementError: Unable to find an element with the text: 目前數字：1.
```

錯誤訊息只會告訴你「找不到」，看不出是漏了 `await`。**只要是 `user.` 開頭的操作，前面都要加 `await`**，這是 `user-event` 最常見的錯誤。

### 測試整個網站的操作流程

第 9 章的商品網站有很多互動：按分類按鈕、點商品連結、填表單送出後換頁。這些流程牽涉到好幾個頁面和路由，最好的測法是直接渲染整個 `App`，再像使用者一樣操作。建立 `src/App.test.tsx`：

```tsx
// src/App.test.tsx
import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import App from "./App.tsx";

function renderAt(url: string) {
  render(
    <MemoryRouter initialEntries={[url]}>
      <App />
    </MemoryRouter>,
  );
}

test("按下分類按鈕，只列出那一類商品", async () => {
  const user = userEvent.setup();
  renderAt("/products");

  await user.click(screen.getByRole("button", { name: "mouse" }));

  expect(screen.getAllByRole("listitem")).toHaveLength(2);
  expect(screen.getByRole("button", { name: "mouse" })).toBeDisabled();
});

test("點商品連結，進到商品頁", async () => {
  const user = userEvent.setup();
  renderAt("/products");

  await user.click(screen.getByRole("link", { name: "無線滑鼠" }));

  expect(screen.getByRole("heading", { name: "無線滑鼠" })).toBeInTheDocument();
  expect(screen.getByText("售價 890 元")).toBeInTheDocument();
});

test("填寫聯絡表單並送出，換到感謝頁", async () => {
  const user = userEvent.setup();
  renderAt("/contact");

  await user.type(screen.getByRole("textbox", { name: "訊息" }), "你好");
  await user.click(screen.getByRole("button", { name: "送出" }));

  expect(
    screen.getByRole("heading", { name: "謝謝你的來信" }),
  ).toBeInTheDocument();
});
```

幾個重點：

- `App` 裡面有 `Routes`，但沒有 `BrowserRouter`（那個在 `main.tsx`），所以和上一集一樣，外面包一層 `MemoryRouter`。`renderAt` 是為了少寫重複的程式碼而包的小函式，傳入起始網址就好。
- `user.type(元素, "文字")` 模擬在輸入框打字。輸入框是用它的標籤「訊息」找到的。
- 第三個測試從 `/contact` 開始，打字、按送出之後，`Contact` 裡的 `navigate("/thanks")` 讓畫面換到感謝頁。測試只檢查使用者看得到的結果：標題變成「謝謝你的來信」。它不在乎換頁是用 `navigate` 還是別的方法做的。

這種測試很接近真實的使用情況，一次就驗證了路由、元件和事件處理是不是串在一起正常運作。哪天你重構了 `Products` 的內部寫法，只要使用者看到的行為一樣，這些測試一行都不用改。

### 常用的操作

| 操作 | 說明 |
| --- | --- |
| `await user.click(元素)` | 點一下 |
| `await user.dblClick(元素)` | 連點兩下 |
| `await user.type(元素, "文字")` | 在輸入框打字 |
| `await user.clear(元素)` | 清空輸入框 |
| `await user.keyboard("{Enter}")` | 按鍵盤上的按鍵 |
| `await user.selectOptions(元素, "值")` | 在下拉選單裡選一個 |

## 重點整理

- 模擬操作用 `user-event`：每個測試先 `userEvent.setup()`，再 `await user.click(...)`、`await user.type(...)`。
- 用了 `await` 的測試函式要加 `async`。
- `user.` 開頭的操作一定要 `await`，漏了的話，畫面還沒更新就檢查，錯誤訊息只會說「找不到」。
- 測試結構是準備、操作、檢查三步。
- 渲染整個 `App` 並包在 `MemoryRouter` 裡，可以測跨頁面的操作流程。
- 測試只做使用者會做的事，不碰元件內部的 state，所以內部怎麼改都不用動測試。
