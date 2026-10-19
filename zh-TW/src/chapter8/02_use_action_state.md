# `useActionState`

## 本集目標

用 `useActionState` 取得表單動作的結果，以及「處理中」的狀態。

## 正文

### 上一集缺了什麼

上一集的 `action` 函式只能「做事」，做完之後無法把結果傳回畫面，也不知道它還在不在進行中。比如：名字不能是空的，要顯示錯誤訊息；儲存要一秒鐘，這一秒鐘要讓按鈕變灰。

`useActionState` 就是為了這個需求：

```jsx
import { useActionState } from "react";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function saveName(previousState, formData) {
  const name = formData.get("name").trim();
  if (name === "") {
    return { name: previousState.name, error: "名字不能是空的" };
  }
  await delay(1000); // 模擬把資料存到伺服器
  return { name, error: null };
}

export default function App() {
  const [state, formAction, isPending] = useActionState(saveName, {
    name: "",
    error: null,
  });

  return (
    <form action={formAction}>
      <input name="name" defaultValue={state.name} />
      <button type="submit" disabled={isPending}>
        {isPending ? "儲存中……" : "儲存"}
      </button>
      {state.error && <p role="alert">{state.error}</p>}
      <p>已儲存的名字：{state.name || "（尚未儲存）"}</p>
    </form>
  );
}
```

試試看三種情況：

1. 輸入框留白，按「儲存」：立刻出現紅字「名字不能是空的」。
2. 輸入名字，按「儲存」：按鈕變灰、顯示「儲存中……」，一秒後下面變成「已儲存的名字：○○」。
3. 儲存成功後，錯誤訊息消失。

### 逐行看

```jsx,ignore
const [state, formAction, isPending] = useActionState(saveName, {
  name: "",
  error: null,
});
```

`useActionState` 接收兩個參數：

1. **動作函式**（`saveName`）：表單送出時要執行的函式。
2. **初始的 state**：第一次渲染時 `state` 的值。

回傳一個長度為三的陣列：

- **`state`**：目前的 state。一開始是初始值，每次動作執行完，就變成動作函式的**回傳值**。
- **`formAction`**：要傳給 `<form action>` 的函式。
- **`isPending`**：動作還在進行中時是 `true`。

### 動作函式的樣子

和上一集不同，動作函式現在有**兩個參數**：

```jsx,ignore
async function saveName(previousState, formData) { ... }
```

- 第一個是「上一次的 state」（第一次就是初始值）。
- 第二個是 `formData`，表單的資料。

函式的**回傳值**會成為新的 state。這就是「把結果傳回畫面」的方法。這和第 7 章的 reducer 有點像：拿著舊的 state 和新的輸入，算出新的 state；差別是它可以是 `async`，可以在裡面傳送請求。

### 錯誤要用回傳值，不要用 throw

這個範例裡，輸入不合法時是用 `return` 回傳錯誤訊息，而不是 `throw new Error(...)`。原因是：**預期會發生的錯誤**（輸入不合法、帳號已存在），回傳成 state 讓畫面顯示就好。如果在動作函式裡丟出錯誤，React 會把它交給最近的錯誤邊界（第 7 集會介紹），整個區塊會被換成錯誤畫面，不是你想要的效果。

### 為什麼輸入框要 `defaultValue`

上一集提過，動作執行完，非受控的欄位會被清空（重設回 `defaultValue`）。如果不設 `defaultValue`，儲存成功後輸入框會變成空白。範例用 `defaultValue={state.name}`，讓輸入框重設後，顯示的是剛儲存的名字。

如果你希望驗證失敗時，保留使用者打的內容，就要把使用者輸入的值也放進回傳的 state，再用 `defaultValue` 顯示回去。

## 重點整理

- `useActionState(動作函式, 初始 state)` 回傳 `[state, formAction, isPending]`。
- 動作函式收到 `(previousState, formData)`，回傳值會成為新的 state。
- `isPending` 在動作進行中是 `true`，可以用來停用按鈕、顯示「處理中」。
- 預期中的錯誤，用回傳值放進 state 顯示；不要 `throw`。
- 表單動作結束後欄位會重設，需要保留的值用 `defaultValue` 帶回去。
