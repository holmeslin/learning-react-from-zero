# `useFormStatus`

## 本集目標

讓表單裡面的子元件（例如送出按鈕）知道表單是不是正在送出。

## 正文

### 問題：按鈕要知道表單的狀態

上一集用 `useActionState` 的 `isPending` 讓按鈕變灰。但當按鈕被獨立成自己的元件（例如整個網站共用的 `SubmitButton`）時，要讓它知道表單的狀態，就得一層一層傳 props。

`useFormStatus` 讓子元件直接問「我所在的表單，現在是不是正在送出？」：

```jsx
import { useFormStatus } from "react-dom";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? "送出中……" : "送出"}
    </button>
  );
}

export default function App() {
  async function submit(formData) {
    await delay(1000);
    console.log("已送出", formData.get("email"));
  }

  return (
    <form action={submit}>
      <input name="email" type="email" placeholder="電子郵件" />
      <SubmitButton />
    </form>
  );
}
```

按下「送出」，按鈕立刻變灰並顯示「送出中……」，一秒後恢復成「送出」。`SubmitButton` 完全沒有收到任何 props，卻知道表單的狀態。

### `useFormStatus` 的用法

- 它從 `react-dom` 匯入，不是從 `react`。
- 呼叫它會得到一個物件，最常用的欄位是 **`pending`**：表單送出中是 `true`，否則是 `false`。
- 另外還有 `data`（正在送出的 `FormData`）、`method`、`action`，初學階段用不太到。

### 必須在 `<form>` 裡面的子元件使用

這是最容易犯的錯。`useFormStatus` 只能讀到「**它所在位置的上層**」那個 `<form>` 的狀態。如果你在渲染 `<form>` 的**同一個**元件裡呼叫它，它看不到那個表單：

```jsx
import { useFormStatus } from "react-dom";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export default function App() {
  const { pending } = useFormStatus();

  async function submit() {
    await delay(1000);
  }

  return (
    <form action={submit}>
      <button type="submit" disabled={pending}>
        {pending ? "送出中……" : "送出"}
      </button>
    </form>
  );
}
```

這段程式不會報錯，但是不管怎麼按，按鈕永遠不會變灰、也不會出現「送出中……」，因為 `pending` 永遠是 `false`。`App` 自己並不在任何 `<form>` 的裡面，它只是「擁有」那個 `<form>`。

解法就是上面第一個範例：把會用到 `useFormStatus` 的部分，拆成表單的**子元件**。

### 和 `useActionState` 的 `isPending` 怎麼選

- 狀態用在**同一個元件**（就是呼叫 `useActionState` 的那個）：直接用 `isPending`。
- 狀態要給**表單裡的其他子元件**用，尤其是想做成可重複使用的元件（如 `SubmitButton`）：用 `useFormStatus`，省去傳 props。

## 重點整理

- `useFormStatus()` 從 `react-dom` 匯入，回傳 `{ pending, data, method, action }`。
- `pending` 是 `true` 表示它所在的表單正在送出。
- 它必須在 `<form>` 的**子元件**裡呼叫，在渲染 `<form>` 的同一個元件裡呼叫，`pending` 永遠是 `false`。
- 適合做成共用的送出按鈕，不用層層傳 props。
