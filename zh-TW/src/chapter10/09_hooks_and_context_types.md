# Hook 與 Context 的型別

## 本集目標

替自訂 Hook、`useReducer` 和 Context 標上型別。

## 正文

### 自訂 Hook：大多靠推論

自訂 Hook 在 TypeScript 裡通常不用額外標什麼。以一個計數 Hook 為例：

```ts
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

`initial = 0` 有預設值 0，TypeScript 推出參數是 `number`；回傳的物件有什麼屬性、什麼型別，也是自己推出來。使用這個 Hook 的人，輸入 `useCounter().` 就會看到完整的自動完成。

### `useReducer`：動作用聯集型別

`useReducer` 的 reducer 要處理各種「動作」。TypeScript 的聯集型別最適合描述這件事：每種動作都是一個物件，用一個 `type` 欄位區分：

```tsx
import { useReducer } from "react";

type Todo = { id: number; text: string; done: boolean };

type Action =
  | { type: "add"; text: string }
  | { type: "toggle"; id: number }
  | { type: "remove"; id: number };

function reducer(todos: Todo[], action: Action): Todo[] {
  switch (action.type) {
    case "add":
      return [...todos, { id: Date.now(), text: action.text, done: false }];
    case "toggle":
      return todos.map((todo) =>
        todo.id === action.id ? { ...todo, done: !todo.done } : todo,
      );
    case "remove":
      return todos.filter((todo) => todo.id !== action.id);
  }
}

export default function TodoApp() {
  const [todos, dispatch] = useReducer(reducer, []);

  return (
    <>
      <button onClick={() => dispatch({ type: "add", text: "新的事情" })}>
        新增
      </button>
      <ul>
        {todos.map((todo) => (
          <li
            key={todo.id}
            onClick={() => dispatch({ type: "toggle", id: todo.id })}
          >
            {todo.text}
          </li>
        ))}
      </ul>
    </>
  );
}
```

注意 `switch` 裡很神奇的地方：在 `case "add"` 裡，TypeScript 知道 `action` 一定是 `{ type: "add"; text: string }`，所以可以讀 `action.text`；在 `case "toggle"` 裡，它知道 `action` 有 `id`，但沒有 `text`。這是型別縮小，靠 `type` 欄位的字面型別來判斷。這種寫法叫**可辨識聯集**（discriminated union）。

`useReducer(reducer, [])` 也不用標型別：TypeScript 從 `reducer` 的參數就知道 state 是 `Todo[]`、`dispatch` 要收 `Action`。

派送錯誤的動作會被擋下。建立 `practice/Dispatch.tsx`：

```tsx,ignore
import { useReducer } from "react";

type Action = { type: "add"; text: string } | { type: "remove"; id: number };

function reducer(todos: string[], action: Action): string[] {
  switch (action.type) {
    case "add":
      return [...todos, action.text];
    case "remove":
      return todos;
  }
}

export function Bad() {
  const [, dispatch] = useReducer(reducer, []);
  dispatch({ type: "add" });
  dispatch({ type: "clear" });
  return null;
}
```

```text
practice/Dispatch.tsx:16:12 - error TS2345: Argument of type '{ type: "add"; }' is not assignable to parameter of type 'Action'.
  Property 'text' is missing in type '{ type: "add"; }' but required in type '{ type: "add"; text: string; }'.

16   dispatch({ type: "add" });
              ~~~~~~~~~~~~~~~

  practice/Dispatch.tsx:3:30 - 'text' is declared here.
    3 type Action = { type: "add"; text: string } | { type: "remove"; id: number };
                                   ~~~~

practice/Dispatch.tsx:17:14 - error TS2322: Type '"clear"' is not assignable to type '"add" | "remove"'.

17   dispatch({ type: "clear" });
                ~~~~

  practice/Dispatch.tsx:3:17 - The expected type comes from property 'type' which is declared here on type 'Action'
    3 type Action = { type: "add"; text: string } | { type: "remove"; id: number };
                      ~~~~


Found 2 errors in the same file, starting at: practice/Dispatch.tsx:16
```

漏了 `add` 動作的 `text`、派送不存在的 `clear`，都被抓到。

### Context：預設值的問題

`createContext` 要一個預設值，但真正的值是在 Provider 裡才有，預設值常常湊不出來。常見的做法是把預設值設成 `null`，型別寫成「值的型別或 `null`」，再搭配一個自訂 Hook 來處理 `null`：

```tsx
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

export function ThemeButton() {
  const { theme, toggleTheme } = useTheme();
  return <button onClick={toggleTheme}>目前是 {theme}</button>;
}
```

幾個重點：

- `createContext<ThemeContextValue | null>(null)`：型別用 `<>` 標出來，因為 `null` 看不出型別。
- 直接用 `useContext(ThemeContext)` 的結果有 `null` 的可能，每個使用的地方都要檢查，很煩。所以包成 `useTheme`，在裡面檢查一次：如果是 `null`，代表有人忘了加 `ThemeProvider`，直接丟出錯誤，訊息寫清楚。
- `useTheme` 回傳時，TypeScript 已經知道 `value` 不是 `null`，所以 `ThemeButton` 拿到的 `theme`、`toggleTheme` 都是確定有值的。
- `<ThemeContext value={...}>` 是 React 19 的寫法，Context 本身就能當 Provider 用，不用再寫 `.Provider`。

如果直接用 `useContext` 而不檢查，會被擋下來。建立 `practice/NoProvider.tsx`：

```tsx,ignore
import { createContext, useContext } from "react";

const ThemeContext = createContext<{ theme: string } | null>(null);

export function Bad() {
  const value = useContext(ThemeContext);
  return <p>{value.theme}</p>;
}
```

```text
practice/NoProvider.tsx:7:14 - error TS18047: 'value' is possibly 'null'.

7   return <p>{value.theme}</p>;
               ~~~~~


Found 1 error in practice/NoProvider.tsx:7
```

## 重點整理

- 自訂 Hook 大多靠推論，不用額外標型別。
- `useReducer` 的動作用「聯集型別加 `type` 欄位」描述，`switch` 時 TypeScript 會自動縮小到對應的動作。
- `createContext<值的型別 | null>(null)` 搭配自訂 Hook，把 `null` 的檢查集中在一處。
- React 19 可以直接把 Context 當 Provider：`<ThemeContext value={...}>`。
