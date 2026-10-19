# 用 `vi.fn` 與 `vi.mock` 模擬

## 本集目標

用「假的函式」和「假的模組」取代真的，讓測試不依賴網路、也能檢查函式有沒有被呼叫。

## 正文

### 為什麼要用假的

有些東西不適合在測試裡真的執行：

- 呼叫真的 API：很慢、需要網路、資料會變，測試結果不穩定。
- 元件傳給父元件的回呼函式：你想檢查「它有沒有被呼叫、用什麼參數呼叫」。

這時候用**模擬**（mock）：做一個假的東西頂替真的，測試可以控制它回傳什麼，還能查它被呼叫的紀錄。

### `vi.fn()`：假的函式

建立 `src/components/SearchBox.tsx`，一個搜尋框，送出時呼叫父元件傳進來的 `onSearch`：

```tsx
// src/components/SearchBox.tsx
import { useState } from "react";
import type { FormEvent } from "react";

type SearchBoxProps = {
  onSearch: (keyword: string) => void;
};

export default function SearchBox({ onSearch }: SearchBoxProps) {
  const [keyword, setKeyword] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSearch(keyword);
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        搜尋
        <input value={keyword} onChange={(e) => setKeyword(e.target.value)} />
      </label>
      <button>送出</button>
    </form>
  );
}
```

`SearchBox` 自己不知道搜尋怎麼做，它只負責「使用者送出時，用關鍵字呼叫 `onSearch`」。測試就是檢查這件事。建立 `src/components/SearchBox.test.tsx`：

```tsx
// src/components/SearchBox.test.tsx
import { expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SearchBox from "./SearchBox.tsx";

test("送出時，用輸入的關鍵字呼叫 onSearch", async () => {
  const user = userEvent.setup();
  const onSearch = vi.fn();
  render(<SearchBox onSearch={onSearch} />);

  await user.type(screen.getByRole("textbox", { name: "搜尋" }), "滑鼠");
  await user.click(screen.getByRole("button", { name: "送出" }));

  expect(onSearch).toHaveBeenCalledTimes(1);
  expect(onSearch).toHaveBeenCalledWith("滑鼠");
});

test("還沒送出時，不會呼叫 onSearch", async () => {
  const user = userEvent.setup();
  const onSearch = vi.fn();
  render(<SearchBox onSearch={onSearch} />);

  await user.type(screen.getByRole("textbox", { name: "搜尋" }), "滑鼠");

  expect(onSearch).not.toHaveBeenCalled();
});
```

`vi.fn()` 做出一個什麼都不做的假函式，但它會**記住每次被呼叫的情形**。之後可以用這些比較方式檢查：

| 比較方式 | 意思 |
| --- | --- |
| `toHaveBeenCalled()` | 被呼叫過 |
| `toHaveBeenCalledTimes(n)` | 被呼叫了 `n` 次 |
| `toHaveBeenCalledWith(...)` | 曾經用這些參數呼叫過 |

參數不符的時候，錯誤訊息會列出實際的呼叫紀錄。例如預期 `"鍵盤"`，實際是 `"滑鼠"`：

```text
AssertionError: expected "vi.fn()" to be called with arguments: [ '鍵盤' ]

Received:

  1st vi.fn() call:

  [
-   "鍵盤",
+   "滑鼠",
  ]

Number of calls: 1
```

### `vi.mock()`：假的模組

當元件自己 `import` 了一個會連網路的函式，就沒辦法像上面那樣從 props 傳假的進去。這時用 `vi.mock` 把整個模組換成假的。先建立 `src/api/products.ts`：

```ts
// src/api/products.ts
export type Product = { id: number; name: string };

export async function fetchProducts(): Promise<Product[]> {
  const response = await fetch("/products.json");
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json();
}
```

再建立用它的元件 `src/components/ProductPage.tsx`：

```tsx
// src/components/ProductPage.tsx
import { useEffect, useState } from "react";
import { fetchProducts } from "../api/products.ts";
import type { Product } from "../api/products.ts";

export default function ProductPage() {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts()
      .then(setProducts)
      .catch(() => setError("商品載入失敗"));
  }, []);

  if (error !== null) {
    return <p>{error}</p>;
  }
  if (products === null) {
    return <p>載入中…</p>;
  }
  return (
    <ul>
      {products.map((product) => (
        <li key={product.id}>{product.name}</li>
      ))}
    </ul>
  );
}
```

測試時，把 `../api/products.ts` 整個換成假的。建立 `src/components/ProductPage.test.tsx`：

```tsx
// src/components/ProductPage.test.tsx
import { beforeEach, expect, test, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import ProductPage from "./ProductPage.tsx";
import { fetchProducts } from "../api/products.ts";

vi.mock("../api/products.ts", () => ({
  fetchProducts: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

test("顯示 fetchProducts 回傳的商品", async () => {
  vi.mocked(fetchProducts).mockResolvedValue([
    { id: 1, name: "機械鍵盤" },
    { id: 2, name: "無線滑鼠" },
  ]);

  render(<ProductPage />);

  expect(await screen.findByText("機械鍵盤")).toBeInTheDocument();
  expect(screen.getByText("無線滑鼠")).toBeInTheDocument();
  expect(fetchProducts).toHaveBeenCalledTimes(1);
});

test("fetchProducts 失敗時顯示錯誤訊息", async () => {
  vi.mocked(fetchProducts).mockRejectedValue(new Error("伺服器壞了"));

  render(<ProductPage />);

  expect(await screen.findByText("商品載入失敗")).toBeInTheDocument();
});
```

重點逐一看：

- `vi.mock("../api/products.ts", () => ({ ... }))`：告訴 Vitest：「這個測試檔裡，任何人 import 這個模組，都換成我給的假版本」。第二個參數是一個函式，回傳假模組的內容，這裡只有一個假的 `fetchProducts`。路徑要和元件裡 import 的是同一個模組。
- `vi.mock` 寫在檔案裡 import 的下面，但實際上 Vitest 會把它**提到最前面執行**，所以 `ProductPage` import 到的已經是假的。不用去管順序。
- `vi.mocked(fetchProducts)`：讓 TypeScript 知道 `fetchProducts` 是假的，才能呼叫 `.mockResolvedValue`。
- `.mockResolvedValue(資料)`：這個假函式被呼叫時，回傳一個成功、結果是這份資料的 Promise。`.mockRejectedValue(錯誤)` 則是失敗。
- `beforeEach(() => vi.clearAllMocks())`：每個測試開始前，清掉前一個測試留下的呼叫紀錄，不然 `toHaveBeenCalledTimes(1)` 在第二個測試會算到前面的呼叫。`beforeEach` 是在每個測試之前執行的函式，和 `setup.ts` 裡的 `afterEach` 是一對的。

這樣測試完全不碰網路，想要什麼資料就給什麼資料，成功、失敗的情況都能輕易做出來。

### 另一種做法：模擬 `fetch` 本身

如果你想測的就是 `fetchProducts` 本身，那就不能把它換掉。這時可以只換掉更底層的 `fetch`，用 `vi.spyOn`。建立 `src/api/products.test.ts`：

```ts
// src/api/products.test.ts
import { afterEach, expect, test, vi } from "vitest";
import { fetchProducts } from "./products.ts";

afterEach(() => {
  vi.restoreAllMocks();
});

test("成功時回傳解析後的 JSON", async () => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    Response.json([{ id: 1, name: "機械鍵盤" }]),
  );

  expect(await fetchProducts()).toEqual([{ id: 1, name: "機械鍵盤" }]);
  expect(fetch).toHaveBeenCalledWith("/products.json");
});

test("伺服器回傳錯誤時丟出例外", async () => {
  vi.spyOn(globalThis, "fetch").mockResolvedValue(
    new Response("找不到", { status: 404 }),
  );

  await expect(fetchProducts()).rejects.toThrow("HTTP 404");
});
```

- `vi.spyOn(globalThis, "fetch")`：把全域的 `fetch` 換成假的，測完之後（`restoreAllMocks`）再還原成真的。
- `Response.json(資料)` 和 `new Response("文字", { status: 404 })`：做出假的伺服器回應。
- 測試丟出例外的非同步函式，寫成 `await expect(函式()).rejects.toThrow(...)`。

### 模擬的原則

模擬很方便，但不要過度使用。每換掉一個真的東西，測試就離真實情況遠一點。原則是：**只換掉「不可控」或「很慢」的東西**，例如網路。你自己寫的邏輯，盡量用真的。

## 重點整理

- `vi.fn()` 做出假函式，會記住被呼叫的紀錄，用 `toHaveBeenCalledWith` 等檢查。
- `vi.mock("模組路徑", () => ({ ... }))` 把整個模組換成假的；`vi.mocked(函式).mockResolvedValue(資料)` 指定它回傳什麼。
- `beforeEach(() => vi.clearAllMocks())` 清掉前一個測試的呼叫紀錄。
- 想測 `fetch` 本身，用 `vi.spyOn(globalThis, "fetch")`，測完用 `vi.restoreAllMocks()` 還原。
- 只模擬不可控或很慢的東西，其他盡量用真的。
