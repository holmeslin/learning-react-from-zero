# `children`

## 本集目標

讓元件像 HTML 標籤一樣，可以包住其他內容。

## 正文

### 像標籤一樣包住東西

HTML 的標籤可以包東西：`<ul>` 裡面放 `<li>`，`<button>` 裡面放文字。自己寫的元件也可以這樣做，使用方式是：

```jsx,ignore
<Card title="今日特價">
  <p>機械鍵盤九折</p>
  <p>無線滑鼠八折</p>
</Card>
```

標籤中間的內容，會被 React 放進一個特別的 props，名字叫 **`children`**。

### 做一個 `Card`

建立 `src/Card.jsx`：

```jsx
function Card({ title, children }) {
  return (
    <section className="card">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

export default Card;
```

`children` 和一般的 props 一樣，是從參數解構出來的。要把它放在畫面的哪裡，就用 `{children}` 擺在那裡。

使用 `src/App.jsx`：

```jsx
import Card from "./Card.jsx";

function App() {
  return (
    <div>
      <Card title="今日特價">
        <p>機械鍵盤九折</p>
        <p>無線滑鼠八折</p>
      </Card>
      <Card title="聯絡我們">
        <p>電話：02-1234-5678</p>
      </Card>
    </div>
  );
}

export default App;
```

兩張卡片外框和標題的結構一樣，只是裡面的內容不同。

### `children` 可以是任何東西

標籤中間可以放：

- 一段文字：`<Card title="提醒">明天公休</Card>`
- 一個或多個元素，像上面的例子
- 別的元件，包括 `Card` 自己

`src/App.jsx` 改成（`ProductCard` 是第 7 集做的）：

```jsx
import Card from "./Card.jsx";
import ProductCard from "./ProductCard.jsx";

function App() {
  return (
    <Card title="熱銷商品">
      <ProductCard name="機械鍵盤" price={1200} />
      <ProductCard name="無線滑鼠" price={600} />
    </Card>
  );
}

export default App;
```

### 實用的用途：版面元件

`children` 最常見的用途，是做一個負責「外框」的元件，裡面的內容交給使用的人決定。例如一個每個頁面都要用的版面，建立 `src/Layout.jsx`（`Header` 和 `Footer` 是第 6 集做的）：

```jsx
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";

function Layout({ children }) {
  return (
    <div>
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

export default Layout;
```

用的時候，`src/App.jsx` 改成：

```jsx
import Layout from "./Layout.jsx";

function App() {
  return (
    <Layout>
      <p>這是頁面的內容。</p>
    </Layout>
  );
}

export default App;
```

這樣每個頁面都有相同的標題和頁尾，只有 `<Layout>` 中間不同。

### 沒有內容會怎樣

如果使用 `<Card title="空的" />` 卻沒傳內容，`children` 是 `undefined`，`{children}` 什麼都不會畫，不會出錯。這也代表你不用特別處理「沒有 children」的情況。

## 重點整理

- 標籤中間的內容，會透過特別的 props `children` 傳進元件。
- 在元件裡用 `{children}` 決定內容要擺在哪裡。
- `children` 可以是文字、元素，甚至是別的元件。
- 外框型的元件（卡片、版面）最適合用 `children`。
