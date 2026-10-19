# 你可能不需要 Effect

## 本集目標

學會判斷什麼時候「不該」用 Effect，並用更簡單的寫法取代它。

## 正文

Effect 很好用，所以新手容易濫用。React 官方文件有一篇文章的標題就叫〈你可能不需要 Effect〉。這一集看最常見的誤用。

### 誤用一：用 Effect 算出另一個 state

假設有「姓」和「名」兩個輸入框，要顯示全名。很多人會這樣寫：

```jsx
import { useEffect, useState } from "react";

export default function App() {
  const [firstName, setFirstName] = useState("小");
  const [lastName, setLastName] = useState("明");
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    setFullName(firstName + lastName);
  }, [firstName, lastName]);

  console.log("渲染，fullName 是", fullName);

  return (
    <>
      <input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
      <input value={lastName} onChange={(e) => setLastName(e.target.value)} />
      <p>全名：{fullName}</p>
    </>
  );
}
```

能動，但有兩個問題。看 Console，頁面剛載入時：

```text
渲染，fullName 是 
渲染，fullName 是 小明
```

第一次渲染時 `fullName` 還是空字串，畫面短暫地顯示錯誤的內容；接著 Effect 呼叫 `setFullName`，觸發第二次渲染才補上。每次改輸入框也是一樣，多渲染一次，而且第一次渲染顯示的是舊的全名。

**全名可以直接由姓和名算出來**，不需要另外存成 state，也不需要 Effect：

```jsx
import { useState } from "react";

export default function App() {
  const [firstName, setFirstName] = useState("小");
  const [lastName, setLastName] = useState("明");
  const fullName = firstName + lastName;

  console.log("渲染，fullName 是", fullName);

  return (
    <>
      <input value={firstName} onChange={(e) => setFirstName(e.target.value)} />
      <input value={lastName} onChange={(e) => setLastName(e.target.value)} />
      <p>全名：{fullName}</p>
    </>
  );
}
```

載入時 Console 只有一行：

```text
渲染，fullName 是 小明
```

**原則：能由現有的 props 或 state 直接算出來的值，就在渲染時直接算，不要存進 state。** 這樣少一個 state、少一次渲染，也永遠不會「兩個 state 對不上」。

### 誤用二：用 Effect 處理使用者的動作

假設按下「送出」要把資料傳給伺服器。有人會把「傳送」寫進 Effect，再用一個 state 當開關去觸發它。這樣繞了一圈，其實直接寫在事件處理函式裡就好：

```jsx,ignore
function handleSubmit() {
  fetch("/api/save", { method: "POST", body: JSON.stringify(data) });
}
```

使用者按了送出，才該傳送，這是「某個動作」引發的事，屬於事件處理函式。

### 誤用三：prop 變了，就用 Effect 重設 state

如果想在 `userId` 這個 prop 改變時，重設表單裡的 state，不要在 Effect 裡呼叫 `setState`。第 5 章學過的 `key` 就能做到：換了 `key`，React 就把整個元件當成全新的，所有 state 自動重設。

```jsx,ignore
<Profile key={userId} userId={userId} />
```

### 判斷方法

遇到想用 Effect 的時候，先問自己：

| 問題 | 答案 |
| --- | --- |
| 這個值能由現有的 props 或 state 算出來嗎？ | 直接在渲染時算，不用 state，也不用 Effect |
| 這件事是因為使用者做了某個動作嗎？ | 放進事件處理函式 |
| 這件事是因為元件出現在畫面上，需要和外部系統同步嗎？ | 這才是 Effect 的工作 |

Effect 是「逃生口」，用來和 React 之外的世界打交道：瀏覽器 API、計時器、伺服器連線。只有 React 內部的資料流動，通常不需要它。

## 重點整理

- 能由 props 或 state 算出來的值，直接在渲染時算，不要再存成 state。
- 因使用者動作而要做的事，放事件處理函式，不要繞道 Effect。
- prop 變了要重設 state，用 `key`，不要用 Effect。
- Effect 只用來和外部系統同步。
