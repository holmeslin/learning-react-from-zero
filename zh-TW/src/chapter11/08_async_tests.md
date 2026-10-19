# 非同步測試

## 本集目標

測試「過一下子才會出現」的畫面，例如資料載入完成後的名單。

## 正文

### 問題：畫面不是馬上就有

第 6 章教過，抓資料的元件一開始顯示「載入中」，等資料回來才換成真正的內容。測試要怎麼辦？資料回來之前，畫面是一個樣子；回來之後，又是另一個樣子。

### 要測的元件

為了讓測試單純，這個元件**不自己抓資料**，而是從 props 接收一個「載入資料的函式」。真正使用時傳入會呼叫網路的函式；測試時傳入一個馬上回傳假資料的函式。建立 `src/components/UserList.tsx`：

```tsx
// src/components/UserList.tsx
import { useEffect, useState } from "react";

type UserListProps = {
  loadUsers: () => Promise<string[]>;
};

export default function UserList({ loadUsers }: UserListProps) {
  const [users, setUsers] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadUsers()
      .then(setUsers)
      .catch(() => setError("載入失敗"));
  }, [loadUsers]);

  if (error !== null) {
    return <p>{error}</p>;
  }
  if (users === null) {
    return <p>載入中…</p>;
  }
  return (
    <ul>
      {users.map((user) => (
        <li key={user}>{user}</li>
      ))}
    </ul>
  );
}
```

這種把「做事的東西」從外面傳進來的作法，讓元件更好測試，也更有彈性。

### 用 `findBy` 等它出現

建立 `src/components/UserList.test.tsx`：

```tsx
// src/components/UserList.test.tsx
import { expect, test } from "vitest";
import { render, screen } from "@testing-library/react";
import UserList from "./UserList.tsx";

const loadUsers = () => Promise.resolve(["小明", "小華"]);
const loadFail = () => Promise.reject(new Error("網路斷線"));

test("先顯示載入中，載入完成後顯示名單", async () => {
  render(<UserList loadUsers={loadUsers} />);

  expect(screen.getByText("載入中…")).toBeInTheDocument();

  expect(await screen.findByText("小明")).toBeInTheDocument();
  expect(screen.getAllByRole("listitem")).toHaveLength(2);
  expect(screen.queryByText("載入中…")).not.toBeInTheDocument();
});

test("載入失敗時顯示錯誤訊息", async () => {
  render(<UserList loadUsers={loadFail} />);

  expect(await screen.findByText("載入失敗")).toBeInTheDocument();
});
```

`Promise.resolve(...)` 是「馬上成功、結果是這個值」的 Promise，`Promise.reject(...)` 是「馬上失敗」的 Promise。這是第 2 章學的 Promise 在測試裡的用途：用最簡單的方式做出一個假的非同步結果。

重點是 `await screen.findByText("小明")`：

- `findBy…` 是第 6 集提過的第三種查詢。它會**等**：每隔一小段時間找一次，找到就回傳，等太久（預設 1 秒）還沒出現才丟錯誤。
- 它回傳 Promise，所以前面要加 `await`，測試函式也要加 `async`。
- 資料一回來、畫面一換，它就找得到了。之後的檢查（有兩個列表項目、「載入中」不見了）就都是畫面已經更新完的狀態。

測試的順序也值得注意：先確認「載入中」在，再 `await` 等名單出現，最後確認「載入中」不在。完整檢查了前後兩個狀態。

### 不等待就找，會失敗

如果用 `getByText` 而不是 `findByText`：

```tsx,ignore
render(<UserList loadUsers={loadUsers} />);
expect(screen.getByText("小明")).toBeInTheDocument();
```

```text
TestingLibraryElementError: Unable to find an element with the text: 小明. This could be because the text is broken up by multiple elements. In this case, you can provide a function for your text matcher to make your matcher more flexible.

Ignored nodes: comments, script, style
<body>
  <div>
    <p>
      載入中…
    </p>
  </div>
</body>
```

印出來的 HTML 說明了一切：畫面上還是「載入中…」，因為 `getBy` 是立刻找，一秒都不等。**非同步出現的東西，一律用 `findBy`**。

### 其他等待的工具

- `findAllByRole("listitem")`：等多個元素出現，回傳陣列。
- `waitFor(() => { expect(...) })`：反覆執行裡面的檢查，直到通過或逾時。`findBy` 其實就是 `getBy` 加 `waitFor`。需要等的不是「某個元素出現」，而是更複雜的條件時才用。
- `waitForElementToBeRemoved(...)`：等某個元素消失，例如等「載入中」不見。

大多數的情況，`findBy` 就夠了。

## 重點整理

- 非同步才會出現的東西，用 `await screen.findBy…` 等它，不要用 `getBy…`。
- `findBy…` 會每隔一小段時間重找，預設最多等 1 秒。
- 測試用 `Promise.resolve(資料)` 和 `Promise.reject(錯誤)` 做出假的非同步結果。
- 把「載入資料的函式」從 props 傳進元件，元件會更好測試。
- 完整的非同步測試會檢查前後兩個狀態：載入中、載入完成。
