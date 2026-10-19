# `<form action>`

## 本集目標

用函式處理表單送出，不用再自己寫 `preventDefault` 和一堆 state。

## 正文

### 傳統的寫法

以前在 React 裡處理表單，通常要這樣做：給每個輸入框一個 state，寫一個 `onSubmit` 處理函式，裡面先呼叫 `event.preventDefault()` 擋掉瀏覽器預設的換頁行為，再讀 state。

React 19 讓 `<form>` 的 `action` 屬性可以直接接收一個**函式**：

```jsx
import { useState } from "react";

let nextId = 1;

export default function App() {
  const [messages, setMessages] = useState([]);

  function addMessage(formData) {
    const text = formData.get("text");
    setMessages([...messages, { id: nextId++, text }]);
  }

  return (
    <>
      <form action={addMessage}>
        <input name="text" placeholder="說點什麼" />
        <button type="submit">送出</button>
      </form>
      <ul>
        {messages.map((message) => (
          <li key={message.id}>{message.text}</li>
        ))}
      </ul>
    </>
  );
}
```

在輸入框打字，按「送出」（或按 Enter），文字就會加進下面的清單。

### 發生了什麼事

- `<form action={addMessage}>`：把函式傳給 `action`。使用者送出表單時，React 就呼叫這個函式。
- **不需要 `preventDefault`**：傳函式的時候，React 會處理掉瀏覽器預設的換頁行為，頁面不會重新整理。
- **函式收到的是 `formData`**：它是一個 `FormData` 物件（瀏覽器內建的），裝著表單裡所有欄位的值。用 `formData.get("text")` 讀出名字叫 `text` 的欄位。
- **輸入框要有 `name`**：`formData` 是靠 `name` 屬性找欄位的。上面的 `<input name="text">` 就是 `formData.get("text")` 要讀的那一個。

### 沒有 state 的輸入框

仔細看範例：`<input>` 沒有 `value`，也沒有 `onChange`，沒有為它建立任何 state。這種輸入框叫做**非受控**（uncontrolled）輸入框，值由瀏覽器自己保管，需要的時候，才從 `formData` 一次讀出來。

還有一個貼心的行為：函式執行完之後，React 會自動把非受控的欄位**清空**。照著範例送出一次，你會發現輸入框自動清空，準備好輸入下一筆，不用自己呼叫 `setText("")`。

### 非同步也可以

`action` 函式可以是 `async`。React 會在函式執行期間，把表單視為「送出中」，等函式結束才算完成：

```jsx,ignore
async function addMessage(formData) {
  await saveToServer(formData.get("text"));
}
```

下一集會介紹 `useActionState`，讓你拿到「送出中」的狀態和函式的回傳值。

### 還是可以用傳統做法

`action` 如果是一個字串（網址），表單的行為跟以前一樣，由瀏覽器送出到那個網址。傳函式只是 React 多給你的選擇。到了第二部的 Next.js，這個寫法會變成處理伺服器動作的基礎。

## 重點整理

- `<form action={函式}>`：送出表單時，React 呼叫這個函式，函式收到一個 `FormData`。
- 用 `formData.get("欄位名稱")` 讀值，欄位需要有 `name` 屬性。
- 不必寫 `preventDefault`，頁面也不會重新整理。
- 函式執行完之後，非受控的輸入欄位會自動清空。
- `action` 函式可以是 `async`。
