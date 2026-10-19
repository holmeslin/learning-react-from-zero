# 多欄位表單

## 本集目標

用一個物件 state 管理整份表單，並且處理送出。

## 正文

### 欄位少的時候：一個欄位一個 state

只有兩個欄位的時候，最直接的做法是各用一個 state。把 `src/App.jsx` 換成：

```jsx
import { useState } from "react";

function App() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    console.log("送出：", name, email);
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        姓名
        <input value={name} onChange={(event) => setName(event.target.value)} />
      </label>
      <label>
        信箱
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>
      <button type="submit">註冊</button>
    </form>
  );
}

export default App;
```

幾個細節：

- `<label>` 把文字和輸入框包在一起，點文字也會讓輸入框取得焦點，對使用者和螢幕閱讀器都友善。
- 按鈕的 `type="submit"` 配合 `<form onSubmit>`，不管是按按鈕還是在輸入框按 Enter，都會觸發 `handleSubmit`。
- `handleSubmit` 第一件事是 `event.preventDefault()`，這一章第 1 集說過了。

### 欄位多了：改用一個物件

如果有六個、十個欄位，就要寫六個、十個 `useState` 和六個、十個 `onChange`，很囉嗦。改成**一個物件 state，加上一個共用的處理函式**。

把 `src/App.jsx` 換成：

```jsx
import { useState } from "react";

const initialForm = { name: "", email: "", plan: "free", agreed: false };

function App() {
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(null);

  function handleChange(event) {
    const { name, value, type, checked } = event.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  }

  function handleSubmit(event) {
    event.preventDefault();
    setSubmitted(form);
    setForm(initialForm);
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        姓名
        <input name="name" value={form.name} onChange={handleChange} />
      </label>
      <label>
        信箱
        <input name="email" value={form.email} onChange={handleChange} />
      </label>
      <label>
        方案
        <select name="plan" value={form.plan} onChange={handleChange}>
          <option value="free">免費方案</option>
          <option value="pro">專業方案</option>
        </select>
      </label>
      <label>
        <input
          type="checkbox"
          name="agreed"
          checked={form.agreed}
          onChange={handleChange}
        />
        我同意使用條款
      </label>
      <button type="submit" disabled={!form.agreed}>
        註冊
      </button>
      {submitted && (
        <p>
          已送出：{submitted.name}（{submitted.email}），
          {submitted.plan === "pro" ? "專業" : "免費"}方案
        </p>
      )}
    </form>
  );
}

export default App;
```

這份程式的新東西集中在 `handleChange`：

```jsx,ignore
function handleChange(event) {
  const { name, value, type, checked } = event.target;
  setForm({ ...form, [name]: type === "checkbox" ? checked : value });
}
```

- `event.target` 是觸發事件的那個輸入元素，上面有它的 `name`、`value`、`type`、`checked`。這裡用解構一次取出來。每個輸入框上都有 `name="..."`，名稱和 `form` 物件的屬性名稱一致。
- `{ ...form, [name]: ... }`：展開舊的 `form`，再覆蓋其中一個屬性。**屬性名稱外面的中括號 `[name]`，代表「用變數 `name` 的內容當屬性名稱」。** 使用者在 `email` 欄位打字時，`name` 是 `"email"`，這行就等於 `{ ...form, email: value }`。
- 核取方塊要取的是 `checked`，其他的取 `value`，所以用 `type === "checkbox"` 判斷。

這樣一來，不管表單再多幾個欄位，`handleChange` 都不用改，只要新的輸入框有正確的 `name` 就好。

### 送出

`handleSubmit` 做了三件事：

1. `event.preventDefault()`：阻止頁面重新整理。
2. `setSubmitted(form)`：把送出的內容存進另一個 state，用來顯示結果。
3. `setForm(initialForm)`：把表單重設成最初的空白狀態。

這裡 `initialForm` 放在元件外面，因為它是不會變的常數，同時給 `useState` 的初始值和重設表單共用。

`submitted` 一開始是 `null`，所以 `{submitted && ...}` 一開始什麼都不畫；送出之後它變成一個物件，才會顯示結果。

最後按鈕的 `disabled={!form.agreed}`：沒勾選條款的時候，按鈕是灰色的。畫面上的各種狀態，都是由 state 算出來的。

## 重點整理

- 欄位少的時候，一個欄位一個 state 最直接。
- 欄位多的時候，用一個物件 state 加共用的 `handleChange`，輸入框的 `name` 對應物件的屬性。
- `{ ...form, [name]: value }` 的中括號表示用變數的內容當屬性名稱。
- 核取方塊要取 `checked`，其他取 `value`。
- 送出時 `event.preventDefault()`，要重設表單就把 state 設回初始值。
