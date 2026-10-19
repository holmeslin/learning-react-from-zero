# 第一個元件

## 本集目標

清掉範本的內容，自己寫出第一個元件，並且在畫面上用它兩次。

## 正文

### 先把範本清乾淨

範本附的歡迎頁內容很多，我們用不到，先清掉。請依序做三件事。

第一，把 `src/App.jsx` 整個換成：

```jsx
function App() {
  return <h1>哈囉，React！</h1>;
}

export default App;
```

第二，刪掉 `src/App.css` 和 `src/assets/` 資料夾。它們是範本歡迎頁用的，現在沒人用了。

第三，把 `src/index.css` 整個換成下面這段簡單的樣式：

```css
body {
  font-family: system-ui, "Noto Sans TC", sans-serif;
  max-width: 40rem;
  margin: 2rem auto;
  padding: 0 1rem;
  line-height: 1.6;
}
```

存檔後看瀏覽器，畫面上只剩一行「哈囉，React！」。

### 元件就是一個函式

看剛才寫的 `App.jsx`：

```jsx
function App() {
  return <h1>哈囉，React！</h1>;
}
```

這就是一個 **元件**（component）。元件就是一個**回傳畫面內容的函式**。函式名稱是 `App`，它回傳了 `<h1>哈囉，React！</h1>`，那就是它在畫面上長出來的樣子。

回傳的那個長得像 HTML 的東西叫 **JSX**，下一集會講它的規則。現在只要知道：在 React 裡，你用 JSX 描述「畫面應該長怎樣」。React 呼叫元件函式、根據它回傳的 JSX 算出畫面的過程，叫做**渲染**（render）。之後會常常看到這個詞。

最後一行：

```jsx,ignore
export default App;
```

把 `App` 這個函式「匯出」，這樣 `main.jsx` 才能用 `import App from './App.jsx'` 拿到它。每個元件檔案最後都會有這一行。

### 元件的名字一定要大寫開頭

`App` 的 `A` 是大寫，這不是風格問題，是規定。React 靠首字母判斷你寫的是元件還是一般的 HTML 標籤：大寫開頭是元件，小寫開頭是 HTML 標籤。接下來你會看到為什麼。

### 做第二個元件，然後重複使用

元件的好處是可以重複使用。在同一個檔案裡再寫一個元件，把 `src/App.jsx` 換成：

```jsx
function Greeting() {
  return <p>歡迎來到我的第一個 React 網頁。</p>;
}

function App() {
  return (
    <div>
      <h1>哈囉，React！</h1>
      <Greeting />
      <Greeting />
    </div>
  );
}

export default App;
```

存檔後畫面會出現一個標題和兩段一模一樣的歡迎詞。

`<Greeting />` 就是「在這裡放一個 `Greeting` 元件」。它像 HTML 標籤，但名字是你自己取的。同一個元件想用幾次就寫幾次，每一次都會各自畫出一份。

為什麼 `<h1>` 和兩個 `<Greeting />` 外面要包一個 `<div>`？這是 JSX 的規定，下一集會解釋。

### 如果名字寫成小寫

試試看把 `<Greeting />` 改成 `<greeting />`：

```jsx,ignore
<greeting />
```

畫面上這個元件不見了，瀏覽器的主控台（按 F12 打開，切到 Console 分頁）出現一行警告：

```text
The tag <greeting> is unrecognized in this browser. If you meant to render a
React component, start its name with an uppercase letter.
```

意思是「`<greeting>` 這個標籤瀏覽器不認得；如果你要用的是 React 元件，名字要用大寫開頭」。React 把小寫的 `<greeting>` 當成 HTML 標籤，可是 HTML 根本沒有這個標籤，所以什麼也畫不出來。

看到這個警告，第一件事就是檢查元件名稱的大小寫。

## 重點整理

- 元件是回傳 JSX 的函式。
- 元件名稱一定要大寫開頭，小寫會被當成 HTML 標籤。
- 元件檔案最後用 `export default` 匯出，別的檔案才能 `import` 使用。
- 同一個元件可以重複使用，寫幾次就畫出幾份。
