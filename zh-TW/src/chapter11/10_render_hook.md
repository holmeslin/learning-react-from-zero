# 測試自訂 Hook

## 本集目標

用 `renderHook` 單獨測試自訂 Hook，包括需要 Context 才能運作的 Hook。

## 正文

### Hook 不能直接呼叫

第 6 章說過，Hook 只能在元件裡呼叫。所以不能像測純函式那樣，直接在測試裡寫 `useCounter()`，會出現錯誤。

測自訂 Hook 有兩種做法：

1. 寫一個用到這個 Hook 的小元件，用前面學的方式測。
2. 用 React Testing Library 提供的 `renderHook`，它會在背後幫你建一個看不見的元件來執行 Hook。

Hook 本身有邏輯、想單獨測的時候，用第 2 種比較省事。

### 要測的 Hook

建立 `src/hooks/useCounter.ts`，一個很典型的計數 Hook：

```ts
// src/hooks/useCounter.ts
import { useState } from "react";

export function useCounter(initial = 0) {
  const [count, setCount] = useState(initial);

  function increment() {
    setCount((current) => current + 1);
  }

  function reset() {
    setCount(initial);
  }

  return { count, increment, reset };
}
```

### 用 `renderHook` 和 `act`

建立 `src/hooks/useCounter.test.ts`：

```ts
// src/hooks/useCounter.test.ts
import { expect, test } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useCounter } from "./useCounter.ts";

test("初始值預設是 0", () => {
  const { result } = renderHook(() => useCounter());

  expect(result.current.count).toBe(0);
});

test("increment 讓數字加一，reset 回到初始值", () => {
  const { result } = renderHook(() => useCounter(10));

  act(() => {
    result.current.increment();
  });
  expect(result.current.count).toBe(11);

  act(() => {
    result.current.reset();
  });
  expect(result.current.count).toBe(10);
});
```

- `renderHook(() => useCounter())`：傳入一個函式，裡面呼叫要測的 Hook。回傳的 `result.current` 就是 Hook 目前回傳的值。
- 為什麼是 `result.current`？因為 Hook 每次重新渲染可能回傳新的值，`current` 永遠指向最新的那一個。**每次檢查前都從 `result.current` 讀，不要把它存進變數**，不然你拿到的是舊的值。
- `act(() => { ... })`：呼叫 Hook 回傳的函式（像 `increment`）會改變 state，造成重新渲染。要把這種呼叫包在 `act` 裡面，告訴 React「這裡面的更新，請在我離開之後一起處理完」，離開 `act` 之後，`result.current` 就是更新後的值。測元件時用 `user-event`，它已經幫你包好 `act` 了，所以不用自己寫；只有直接呼叫 Hook 回傳的函式時才需要。

這個測試檔的副檔名是 `.ts`，因為裡面沒有 JSX。

### 需要 Context 的 Hook

有些 Hook 要在 Provider 裡才能運作，例如第 10 章寫過的 `useTheme`。`renderHook` 有一個 `wrapper` 選項，可以指定要用哪個元件包住它。把第 10 章第 9 集在 `practice` 裡寫的 `ThemeProvider` 和 `useTheme` 搬進 `src`，建立 `src/hooks/theme.tsx`：

```tsx
// src/hooks/theme.tsx
import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  function toggleTheme() {
    setTheme(theme === "light" ? "dark" : "light");
  }

  return (
    <ThemeContext value={{ theme, toggleTheme }}>{children}</ThemeContext>
  );
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (value === null) {
    throw new Error("useTheme 必須在 ThemeProvider 裡面使用");
  }
  return value;
}
```

建立 `src/hooks/theme.test.tsx`：

```tsx
// src/hooks/theme.test.tsx
import { expect, test } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { ThemeProvider, useTheme } from "./theme.tsx";

test("在 ThemeProvider 裡面，可以切換主題", () => {
  const { result } = renderHook(() => useTheme(), {
    wrapper: ThemeProvider,
  });

  expect(result.current.theme).toBe("light");

  act(() => {
    result.current.toggleTheme();
  });

  expect(result.current.theme).toBe("dark");
});

test("不在 ThemeProvider 裡面，會丟出錯誤", () => {
  expect(() => renderHook(() => useTheme())).toThrow(
    "useTheme 必須在 ThemeProvider 裡面使用",
  );
});
```

- `wrapper: ThemeProvider`：`renderHook` 會把那個看不見的元件包在 `ThemeProvider` 裡，所以 `useTheme` 找得到 Context。
- 第二個測試故意不給 `wrapper`，驗證「忘了加 Provider 的時候，會丟出我們寫的錯誤訊息」。這是第 10 章設計 `useTheme` 時的承諾，現在用測試把它固定下來。

### 全部跑一遍

```bash
npx vitest run
```

```text
 RUN  v5.0.5 /你的路徑/hello-react

 ✓ src/utils/cart.test.ts (8 tests) 3ms
 ✓ src/utils/matchers.test.ts (2 tests) 2ms
 ✓ src/api/products.test.ts (2 tests) 5ms
 ✓ src/utils/price.test.ts (1 test) 12ms
 ✓ src/hooks/theme.test.tsx (2 tests) 12ms
 ✓ src/hooks/useCounter.test.ts (2 tests) 8ms
 ✓ src/components/ProductPage.test.tsx (2 tests) 22ms
 ✓ src/components/UserList.test.tsx (2 tests) 62ms
 ✓ src/pages/Products.test.tsx (2 tests) 65ms
 ✓ src/components/Counter.test.tsx (3 tests) 85ms
 ✓ src/components/SearchBox.test.tsx (2 tests) 91ms
 ✓ src/App.test.tsx (3 tests) 112ms

 Test Files  12 passed (12)
      Tests  31 passed (31)
```

31 個測試全部通過，其中 `Products.test.tsx` 和 `App.test.tsx` 測的就是第 9 章做的商品網站。

### 這一章學到的，與接下來

你現在會用 Vitest 和 React Testing Library 測純函式、元件、互動、非同步行為和自訂 Hook，也知道什麼時候該用假的東西。更重要的是那個觀念：**測使用者看得到、做得到的事，不測實作細節**。

這本書第一部到這裡結束。你已經能用 React 做出有互動、有路由、有型別、有測試的網頁。第二部會進入 Next.js：讓你的 React 程式碼也能在伺服器上執行。

## 重點整理

- Hook 不能在測試裡直接呼叫，用 `renderHook(() => useXxx())`，從 `result.current` 讀最新的值。
- 呼叫 Hook 回傳的、會改 state 的函式，要包在 `act(() => { ... })` 裡。
- Hook 需要 Provider 時，用 `renderHook` 的 `wrapper` 選項。
- 測試元件時，`user-event` 已經處理好 `act`，不用自己寫。
- 測使用者看得到、做得到的事，不測實作細節。
