# 在元件裡寫 `<title>`

## 本集目標

在元件裡直接寫 `<title>` 和 `<meta>`，讓 React 把它們放到網頁的 `<head>`。

## 正文

### 老問題：標題在 `<head>`，元件在 `<body>`

網頁的標題（分頁上顯示的文字）和說明文字（`<meta name="description">`）要放在 HTML 的 `<head>` 裡。但 React 元件畫出來的內容都在 `<body>` 的 `<div id="root">` 裡面，兩邊離得很遠。

第 6 章第 3 集用過 `document.title = ...` 配上 Effect 來改標題，可以用，但每個頁面都要寫。

React 19 提供更直覺的做法：**直接在元件的 JSX 裡寫 `<title>` 和 `<meta>`，React 會自動把它們搬到 `<head>`。**

```jsx
import { useState } from "react";

const posts = [
  { id: 1, title: "認識 React", summary: "從零開始學 React" },
  { id: 2, title: "認識 Effect", summary: "和外部系統同步" },
];

function BlogPost({ post }) {
  return (
    <article>
      <title>{post.title}</title>
      <meta name="description" content={post.summary} />
      <h1>{post.title}</h1>
      <p>{post.summary}</p>
    </article>
  );
}

export default function App() {
  const [index, setIndex] = useState(0);

  return (
    <>
      <button onClick={() => setIndex((index + 1) % posts.length)}>
        下一篇
      </button>
      <BlogPost post={posts[index]} />
    </>
  );
}
```

試試看：

1. 看瀏覽器分頁上的標題，是「認識 React」。
2. 按「下一篇」，分頁標題變成「認識 Effect」。
3. 打開開發者工具的「Elements」分頁，展開 `<head>`，可以看到 `<meta name="description">` 的內容也跟著換了。

### 發生了什麼

`BlogPost` 的 JSX 裡寫了 `<title>` 和 `<meta>`，但畫面的 `<article>` 裡看不到它們，因為 React 把這兩個標籤搬到了 `<head>`。

標題和說明文字就跟畫面上其他內容一樣，是由 `post` 這個 prop 決定的：資料換了，標題跟著換；元件從畫面上消失，這些標籤也會一併被移除。不用再寫 `useEffect`，也不用自己處理清除。

### 其他可以這樣寫的標籤

`<meta>` 和 `<title>` 之外，`<link>` 這類屬於 `<head>` 的標籤，React 19 也一樣會幫你處理。

### 這對 SEO 有什麼意義

目前我們用 Vite 做的是在瀏覽器裡才組出畫面的網頁（單頁應用程式），搜尋引擎看到的原始 HTML 裡沒有這些標籤。把標題和說明寫進元件，在這種專案裡的好處主要是**維護方便**。

等到第二部學 Next.js，它會在**伺服器**上先組好 HTML，那時標題和說明就能直接出現在傳給搜尋引擎的內容裡。Next.js 另外提供自己的 metadata 功能，第 12 章會介紹。

## 重點整理

- 在元件的 JSX 裡寫 `<title>`、`<meta>`、`<link>`，React 會自動把它們放到 `<head>`。
- 標題和說明可以直接依 props 或 state 決定，資料變了就跟著變。
- 元件從畫面上消失，對應的標籤也會被移除，不需要自己寫 Effect 與清除函式。
- 在 Vite 這種單頁應用程式裡主要是方便維護；Next.js 會在伺服器上就產生好這些標籤。
