# `useNavigate`

## 本集目標

不靠使用者點連結，用程式碼自己換頁。

## 正文

### 什麼時候需要

`Link` 適合「使用者點了就換頁」。但有些時候是**程式決定要換頁**：表單送出之後跳到感謝頁、登入成功後回首頁、按「回上一頁」。這時候用 `useNavigate`。

### 基本用法

`useNavigate()` 回傳一個函式，傳入網址，就會換頁。建立 `src/pages/Contact.jsx`：

```jsx
import { useNavigate } from "react-router";

export default function Contact() {
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();
    navigate("/thanks");
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>聯絡我們</h1>
      <label>
        訊息 <input name="message" />
      </label>
      <button>送出</button>
    </form>
  );
}
```

按下送出，`handleSubmit` 先用 `event.preventDefault()` 擋掉瀏覽器預設的「重新載入網頁」（第 5 章講過），再呼叫 `navigate("/thanks")`，畫面就換到感謝頁。

建立感謝頁 `src/pages/Thanks.jsx`：

```jsx
export default function Thanks() {
  return <h1>謝謝你的來信</h1>;
}
```

在 `App.jsx` 加上兩個路由，放在 `Layout` 裡面，也別忘了 import：

```jsx,ignore
<Route path="contact" element={<Contact />} />
<Route path="thanks" element={<Thanks />} />
```

導覽列的 `Layout.jsx` 也加上 `<NavLink to="/contact">聯絡</NavLink>`。

### 回上一頁

`navigate` 傳數字，就是在瀏覽紀錄裡前進或後退。`-1` 是上一頁，`1` 是下一頁：

```jsx
<button type="button" onClick={() => navigate(-1)}>
  回上一頁
</button>
```

這個按鈕放在 `Contact` 的 `<form>` 裡面，要記得加 `type="button"`。表單裡的按鈕預設是送出按鈕，沒加的話，按下去會變成送出表單。

### `replace`：不留下紀錄

預設情況下，`navigate` 會在瀏覽紀錄裡新增一筆，所以使用者可以按瀏覽器的上一頁回來。有時候你不希望這樣，例如登入成功後換到首頁，使用者按上一頁卻回到登入表單，就很奇怪。這時加上 `replace`：

```jsx
navigate("/", { replace: true });
```

`replace: true` 是「用新的網址取代目前這一筆紀錄」，不新增。

### 優先用 `Link`

換頁如果是使用者點了某個東西就發生，優先用 `Link` 或 `NavLink`。原因有兩個：`Link` 本質是 `<a>`，可以用右鍵開新分頁，螢幕閱讀器也知道它是連結；用 `onClick` 加 `navigate` 的按鈕，這些都做不到。`useNavigate` 留給「程式碼決定換頁」的時機。

## 重點整理

- `useNavigate()` 回傳一個函式，`navigate("/網址")` 就會換頁。
- 適合用在表單送出後、登入成功後等「程式決定換頁」的時機。
- `navigate(-1)` 回上一頁。
- `navigate("/網址", { replace: true })` 取代目前的瀏覽紀錄，不新增。
- 使用者點了就換頁的地方，優先用 `Link`。
