# 第一個 Server Function

## 本集目標

寫出第一個 Server Function，讓表單送出時在伺服器上執行一段程式。

## 正文

### 先蓋出留言板的外殼

在小書店專案裡新增 `app/guestbook/page.tsx`：

```tsx
// app/guestbook/page.tsx
export default function GuestbookPage() {
  async function sign(formData: FormData) {
    "use server";
    const name = formData.get("name");
    console.log("收到簽名：", name);
  }

  return (
    <main>
      <h1>留言板</h1>
      <form action={sign}>
        <input name="name" placeholder="你的名字" />
        <button type="submit">簽名</button>
      </form>
    </main>
  );
}
```

這個頁面是 Server Component，所以函式可以直接寫在元件裡面。重點只有一行：

```ts
"use server";
```

把它放在函式的第一行，就是在告訴 Next.js：**這個函式只在伺服器上執行**。有這一行的函式，就叫 **Server Function**。

### 跑跑看

執行 `npm run dev`，打開 <http://localhost:3000/guestbook>，輸入名字，按「簽名」。

接著看你執行 `npm run dev` 的那個終端機，會看到：

```text
收到簽名： 小明
```

注意這行字是出現在**終端機**，不是瀏覽器的 Console。因為 `sign` 是在伺服器上執行的，`console.log` 當然也印在伺服器那邊。

### 剛剛發生了什麼事

你只寫了兩件事：一個函式，加上 `<form action={sign}>`。但是在背後，Next.js 做了這些事：

1. 使用者按下按鈕，瀏覽器把表單內容用 `POST` 請求送到伺服器。
2. 伺服器找到 `sign`，把表單內容包成 `FormData` 傳進去，執行它。
3. 執行完畢，伺服器把結果回傳給瀏覽器。

你沒有寫 API 路由，沒有寫 `fetch`，也不用管網址。這就是 Server Function 的方便之處：**從寫程式的角度，看起來就像是直接呼叫一個函式。**

### `FormData`

表單送出時，函式的參數是一個 `FormData` 物件，裡面裝著表單所有欄位。`formData.get("name")` 會拿出 `name` 屬性是 `"name"` 的那個輸入框的內容。

要注意的是，`formData.get(...)` 拿到的東西，型別可能是字串、檔案，也可能是 `null`（表單裡根本沒有這個欄位）。目前我們先不管，第 8 集會處理這個問題。

### 它只能用 `POST`

Server Function 在背後一定是用 `POST` 傳送的，只有 `POST` 能呼叫它。你不用自己選方法，只要知道：改變資料的動作用 `POST`，是 Web 的慣例，Next.js 替你遵守了。

## 重點整理

- 函式的第一行寫 `"use server"`，它就變成只在伺服器上執行的 Server Function。
- 把 Server Function 傳給 `<form action={...}>`，表單送出時伺服器會執行它，並且收到 `FormData`。
- `console.log` 印在執行 `npm run dev` 的終端機，不是瀏覽器。
- 你不用寫 API 路由或 `fetch`，Next.js 在背後用 `POST` 幫你處理。
