# JSX 規則

## 本集目標

知道 JSX 和 HTML 不一樣的四個地方，看到相關錯誤時知道怎麼改。

## 正文

JSX 長得很像 HTML，所以一開始你會很自然地照 HTML 的習慣寫。但它其實是 JavaScript 的一部分，有幾個規定和 HTML 不同。違反這些規定，輕則警告，重則整個畫面壞掉。

### 規則一：只能回傳一個根元素

一個元件只能回傳**一個**最外層的元素。下面這樣寫是錯的：

```jsx,ignore
function Profile() {
  return (
    <h1>小明</h1>
    <p>前端學習者</p>
  );
}
```

Vite 會在瀏覽器上蓋一層紅色的錯誤訊息，終端機也會印出：

```text
Adjacent JSX elements must be wrapped in an enclosing tag.
Help: Did you want a JSX fragment `<>...</>`?
```

意思是「相鄰的 JSX 元素必須包在同一個外層標籤裡」，後面還建議你用 `<>...</>`。

原因是函式只能回傳一個東西，就像你只能遞給別人一個袋子，不能同時遞兩個。解法有兩種。

第一種，包一層 `<div>`：

```jsx
function Profile() {
  return (
    <div>
      <h1>小明</h1>
      <p>前端學習者</p>
    </div>
  );
}
```

第二種，用 **Fragment**，寫成一組空的 `<>` 和 `</>`：

```jsx
function Profile() {
  return (
    <>
      <h1>小明</h1>
      <p>前端學習者</p>
    </>
  );
}
```

兩者的差別是：`<div>` 會在網頁上多一層真的 `<div>` 元素；Fragment 只是 React 用來打包的，不會在網頁上留下任何東西。如果多一層 `<div>` 會讓排版出問題，就用 Fragment。

### 規則二：每個標籤都要關起來

HTML 允許 `<img>`、`<input>`、`<br>` 這類標籤不用結尾。JSX 不行，沒有內容的標籤要自己關起來，在 `>` 前面加一個 `/`：

```jsx
function Photo() {
  return (
    <div>
      <img src="/favicon.svg" alt="標誌" />
      <br />
      <input type="text" />
    </div>
  );
}
```

這種寫法叫做「自我結尾」（self-closing）。我們自己寫的元件也一樣，沒有內容的時候寫 `<Greeting />`，就是這個規則。

忘了關的時候，錯誤訊息通常會指向後面某一行，而不是真正忘記的那一行，看起來很莫名其妙。遇到看不懂的語法錯誤時，先回頭檢查有沒有標籤沒關。

### 規則三：屬性要用 camelCase

JSX 裡的屬性名稱，用的是 JavaScript 的命名習慣（camelCase，第 1 章教過），而且有幾個和 HTML 不一樣：

| HTML | JSX |
| --- | --- |
| `class` | `className` |
| `for` | `htmlFor` |
| `onclick` | `onClick` |
| `tabindex` | `tabIndex` |

`class` 會變成 `className`，是因為 `class` 在 JavaScript 裡是保留字。寫錯的話，畫面通常還是能跑，但主控台會出現警告：

```text
Invalid DOM property `class`. Did you mean `className`?
```

```jsx
function Label() {
  return (
    <label className="field-label" htmlFor="email">
      信箱
    </label>
  );
}
```

有兩種屬性例外，保持原本 HTML 的寫法，用連字號：`data-` 開頭的自訂屬性，和 `aria-` 開頭的無障礙屬性，例如 `data-id="3"`、`aria-label="關閉"`。

### 規則四：多行的 `return` 要加小括號

這是新手最容易踩的一個坑。看這兩個元件：

```jsx
function Wrong() {
  return
    <h1>你看不到我</h1>;
}

function Right() {
  return (
    <h1>你看得到我</h1>
  );
}
```

`Wrong` 的畫面是空白的，而且**沒有任何錯誤訊息**。原因是 JavaScript 看到 `return` 後面直接換行，會自動把它當成「什麼都不回傳」，下一行的 `<h1>` 根本不會被執行。

解法就是 `Right` 的寫法：只要 `return` 後面的 JSX 要跨行，就在外面加一組小括號，並且讓左括號和 `return` 在同一行。

## 重點整理

- 一個元件只能回傳一個根元素，用 `<div>` 或 Fragment `<>...</>` 包起來。
- 所有標籤都要關起來，沒有內容的寫成 `<img />`。
- 屬性用 camelCase：`className`、`htmlFor`、`onClick`；`data-` 和 `aria-` 開頭的例外。
- 跨行的 `return` 一定要加小括號，左括號和 `return` 同一行。
