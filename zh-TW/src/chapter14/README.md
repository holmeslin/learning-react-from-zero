# Server Functions

上一章你學會讓 Server Component 在伺服器上讀資料。這一章要反過來：讓瀏覽器**呼叫**伺服器上的函式，去改變資料。

這種函式叫 **Server Function**。留言送出、按讚、刪除一筆資料，這些「改變資料」的動作，都該交給它。你在第 8 章用過 `<form action={...}>`，當時 action 是在瀏覽器裡執行的函式；這一章的 action 會在伺服器上執行，可以直接讀寫檔案、查資料庫，而你不用自己寫 API，也不用自己寫 `fetch`。

這一章延續小書店，替它加一個「讀者留言板」，網址是 `/guestbook`。留言存在專案裡的 `data/messages.json`，所以不用另外安裝資料庫。做完之後，這個留言板會有這些功能：

- 送出留言，並且立刻出現在列表上
- 欄位沒填或太長時，顯示錯誤訊息
- 送出的瞬間，留言就先出現（樂觀更新）
- 管理者可以刪除留言，其他人不行

你需要先讀過第 8 章的 `useActionState`、`useOptimistic` 和 `useFormStatus`，以及上一章的 Server Component 與 `'use client'`。
