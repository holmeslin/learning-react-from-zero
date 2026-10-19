# `useOptimistic`

## 本集目標

讓畫面「先假設成功」，不用等伺服器回應就先更新；失敗時自動還原。

## 正文

### 為什麼要「樂觀」

傳訊息時，如果要等伺服器回應才顯示在畫面上，網路一慢，使用者會覺得卡卡的。LINE 這類聊天軟體的做法是：訊息先立刻顯示出來，旁邊標示「傳送中」，伺服器確認後再變成正常的訊息。

這種「先假設會成功、直接更新畫面」的做法叫做**樂觀更新**（optimistic update）。React 提供 `useOptimistic` 來做這件事：

```jsx
import { startTransition, useOptimistic, useState } from "react";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function sendToServer(text) {
  await delay(1000); // 模擬網路很慢
  if (text.includes("壞")) throw new Error("伺服器拒絕了這則訊息");
  return text;
}

let nextId = 2;

export default function App() {
  const [messages, setMessages] = useState([{ id: 1, text: "你好" }]);
  const [error, setError] = useState(null);
  const [optimisticMessages, addOptimisticMessage] = useOptimistic(
    messages,
    (currentMessages, text) => [
      ...currentMessages,
      { id: `sending-${text}`, text, sending: true },
    ],
  );

  async function send(formData) {
    const text = formData.get("text");
    setError(null);
    addOptimisticMessage(text);
    try {
      const saved = await sendToServer(text);
      startTransition(() => {
        setMessages((current) => [...current, { id: nextId++, text: saved }]);
      });
    } catch (e) {
      startTransition(() => setError(e.message));
    }
  }

  return (
    <>
      <ul>
        {optimisticMessages.map((message) => (
          <li key={message.id}>
            {message.text}
            {message.sending && "（傳送中……）"}
          </li>
        ))}
      </ul>
      {error && <p role="alert">{error}</p>}
      <form action={send}>
        <input name="text" placeholder="輸入訊息" />
        <button type="submit">傳送</button>
      </form>
    </>
  );
}
```

試試看兩種情況：

1. **成功**：輸入「早安」，按「傳送」。訊息**馬上**出現在清單裡，後面帶著「（傳送中……）」；一秒後，「（傳送中……）」消失，變成正常的訊息。
2. **失敗**：輸入「壞訊息」（句子裡有「壞」字，範例刻意讓伺服器拒絕它）。同樣馬上出現，一秒後，訊息**自動消失**，並出現紅字「伺服器拒絕了這則訊息」。

### 兩份 state

這個範例裡有兩份資料：

- **`messages`**：真正的 state，只放伺服器已經確認的訊息。
- **`optimisticMessages`**：`useOptimistic` 算出來給畫面用的版本。沒有動作進行中時，它就等於 `messages`；動作進行中時，會是「`messages` 加上樂觀的那一筆」。

```jsx,ignore
const [optimisticMessages, addOptimisticMessage] = useOptimistic(
  messages,
  (currentMessages, text) => [...currentMessages, { ... }],
);
```

`useOptimistic` 接收兩個參數：

1. **真正的值**（`messages`）。
2. **一個函式**，說明「樂觀地加上一筆新資料後，畫面該長怎樣」。它收到目前的值和你傳入的內容，回傳樂觀的版本。

回傳 `[樂觀的值, 觸發樂觀更新的函式]`。呼叫 `addOptimisticMessage(text)`，畫面就立刻使用樂觀的版本。

### 樂觀的值只是「暫時的」

這是最關鍵的觀念：樂觀的值**只存在於動作進行的期間**。動作結束後，React 一律回到真正的 `messages`：

- 成功時，你把訊息加進 `messages`，畫面上看到的是正式的訊息。
- 失敗時，你沒有更新 `messages`，樂觀的那一筆就自然消失了。你不需要自己寫任何「還原」的程式。

### 必須在動作裡呼叫

`addOptimisticMessage` 必須在**動作**（Action）裡呼叫，例如 `<form action>` 的函式，或是 `startTransition` 裡。在一般的事件處理函式裡直接呼叫，React 會發出警告。

另外，動作函式裡 `await` 之後的 `setState`，要再包一層 `startTransition`，才能讓 React 把它視為同一個動作的一部分，所以範例裡成功與失敗的 `setMessages`、`setError` 都包了 `startTransition`。

## 重點整理

- `useOptimistic(真正的值, 合併函式)` 回傳 `[樂觀的值, 更新函式]`。
- 呼叫更新函式，畫面立刻顯示樂觀的版本；動作結束後，一律回到真正的值。
- 成功就更新真正的 state；失敗什麼都不用做，樂觀的內容會自動消失。
- 更新函式要在動作（`<form action>` 的函式或 `startTransition`）裡呼叫。
- `await` 之後的 `setState` 要包 `startTransition`。
