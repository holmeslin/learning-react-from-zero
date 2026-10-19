# 用 `getByRole` 找元素

## 本集目標

學會用「角色」和「名稱」這種貼近使用者的方式找元素，並測試第 9 章寫的商品頁。

## 正文

### `getByText` 不夠用

上一集用 `getByText` 找文字。但畫面上除了文字，還有按鈕、連結、輸入框，同樣一段文字也可能同時出現在標題和按鈕裡，找起來會撞在一起。

Testing Library 的建議是：**優先用使用者（包括使用螢幕閱讀器的人）找東西的方式去找**。使用者想的是「那個叫『mouse』的按鈕」、「寫著『無線滑鼠』的連結」，而不是 `p` 底下第三個 `button`。

### 測試第 9 章的商品頁

第 9 章做的 `src/pages/Products.tsx`（第 10 章已經改成 TypeScript）有標題、三個分類按鈕和商品連結，很適合拿來練習。在它旁邊建立 `src/pages/Products.test.tsx`：

```tsx
// src/pages/Products.test.tsx
import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import Products from "./Products.tsx";

test("商品頁有標題、分類按鈕和商品連結", () => {
  render(
    <MemoryRouter>
      <Products />
    </MemoryRouter>,
  );

  expect(screen.getByRole("heading", { name: "商品" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "all" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "mouse" })).toBeEnabled();
  expect(screen.getAllByRole("listitem")).toHaveLength(4);
  expect(screen.getByRole("link", { name: "無線滑鼠" })).toHaveAttribute(
    "href",
    "/products/2",
  );
});

test("網址帶著分類時，只列出那一類", () => {
  render(
    <MemoryRouter initialEntries={["/products?category=mouse"]}>
      <Products />
    </MemoryRouter>,
  );

  expect(screen.getAllByRole("listitem")).toHaveLength(2);
  expect(
    screen.queryByRole("link", { name: "機械鍵盤" }),
  ).not.toBeInTheDocument();
});
```

### 為什麼要包 `MemoryRouter`

`Products` 用了 `useSearchParams` 和 `Link`，它們都需要外面有一個路由器。在網頁上，這個路由器是 `main.tsx` 裡的 `BrowserRouter`；但測試只渲染 `Products` 一個元件，外面什麼都沒有。直接 `render(<Products />)` 會失敗：

```text
Error: useLocation() may be used only in the context of a <Router> component.
```

測試裡改用 React Router 提供的 `MemoryRouter`：它和 `BrowserRouter` 一樣是路由器，只是網址存在記憶體裡，不需要真的瀏覽器網址列。`initialEntries` 指定一開始的網址，第二個測試就是用它模擬「使用者打開 `/products?category=mouse`」。

### `getByRole` 的寫法

`getByRole("角色", { name: "名稱" })` 是最推薦的查詢方式。**角色**（role）是網頁元素對輔助工具所表達的「身分」，常見的對照：

| 元素 | role |
| --- | --- |
| `<button>` | `button` |
| `<a href>`（包括 `Link`） | `link` |
| `<h1>` ～ `<h6>` | `heading` |
| `<input type="text">`、`<textarea>` | `textbox` |
| `<input type="checkbox">` | `checkbox` |
| `<ul>`、`<ol>` | `list` |
| `<li>` | `listitem` |

**名稱**（name）是使用者看到的名字：按鈕和連結是上面的文字，輸入框是它的 `<label>` 的文字。

這種查詢有個額外的好處：**它同時在檢查你的網頁對輔助工具友善**。如果你忘了替輸入框加 `<label>`，用 `getByRole("textbox", { name: "訊息" })` 就找不到它，測試失敗，等於幫你抓到無障礙的問題。

測試裡還用了幾個 jest-dom 的比較方式：`toBeDisabled()`、`toBeEnabled()` 檢查按鈕能不能按，`toHaveAttribute("href", "/products/2")` 檢查連結的網址對不對。

有一個例外要知道：`<input type="password">` **沒有對應的 role**，`getByRole` 找不到它。碰到這種輸入框，改用 `getByLabelText("密碼")`，也就是用標籤的文字找。

### 找不到時，看看有哪些角色

`getByRole` 找不到時，錯誤訊息會列出畫面上所有找得到的角色，非常好用。例如在 `?category=mouse` 的畫面上查詢 `getByRole("button", { name: "滑鼠" })`（其實按鈕上寫的是 `mouse`），輸出的開頭是：

```text
TestingLibraryElementError: Unable to find an accessible element with the role "button" and name "滑鼠"

Here are the accessible roles:

  heading:

  Name "商品":
  <h1 />

  --------------------------------------------------
  paragraph:

  Name "":
  <p />

  --------------------------------------------------
  button:

  Name "all":
  <button />

  Name "keyboard":
  <button />

  Name "mouse":
  <button
    disabled=""
  />
```

後面還會列出 `list`、`listitem`、`link`，以及整個畫面的 HTML。一看就知道按鈕的名稱是 `mouse`，改成正確的名字就好。

### `getBy`、`queryBy`、`findBy`

Testing Library 的查詢函式有三種開頭，差別在找不到時的行為：

| 開頭 | 找到 | 找不到 | 用途 |
| --- | --- | --- | --- |
| `getBy…` | 回傳元素 | 丟出錯誤 | 確定一定在的東西 |
| `queryBy…` | 回傳元素 | 回傳 `null` | 確認某個東西**不在** |
| `findBy…` | 回傳元素（會等） | 等一下還是找不到才丟錯誤 | 非同步才會出現的東西，第 8 集講 |

第二個測試確認「機械鍵盤」不在畫面上，用的就是 `queryByRole`。如果用 `getByRole`，找不到時它會先丟出錯誤，`.not.toBeInTheDocument()` 根本沒機會執行。

每種開頭還有 `All` 版本，例如 `getAllByRole("listitem")` 回傳符合的所有元素組成的陣列，用在清單上。

### 查詢方式的優先順序

由好到差：

1. `getByRole`：首選，幾乎所有互動元素都能用。
2. `getByLabelText`：表單欄位，特別是沒有 role 的密碼欄位。
3. `getByText`：非互動的文字內容。
4. `getByTestId`：最後手段。在元素上加 `data-testid="名字"` 再用它找，和使用者看到的東西無關，能不用就不用。

## 重點整理

- 優先用 `getByRole("角色", { name: "名稱" })`，貼近使用者找東西的方式。
- 用到 `Link`、`useSearchParams` 等路由功能的元件，測試時要包在 `MemoryRouter` 裡，`initialEntries` 指定起始網址。
- 密碼欄位沒有 role，用 `getByLabelText`。
- `getBy` 找不到會丟錯誤，`queryBy` 找不到回傳 `null`，要確認「不存在」用 `queryBy`。
- 找不到時，錯誤訊息會列出畫面上有哪些角色，照著改就好。
