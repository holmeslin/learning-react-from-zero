# CSS 檔

## 本集目標

用獨立的 CSS 檔為元件加上樣式，並且知道它的限制。

## 正文

上一集你用 `style={{ ... }}` 寫行內樣式。少量的樣式還好，但只要樣式一多，程式碼就會被擠得亂七八糟，而且行內樣式沒辦法處理 `:hover` 這類狀態。第 3 章你學過 CSS 檔，在 React 裡也能直接用。

### 每個元件配一個 CSS 檔

慣例是替元件建立一個同名的 CSS 檔。建立 `src/ProductCard.css`：

```css
.product-card {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.product-card h2 {
  margin: 0 0 0.5rem;
  font-size: 1.25rem;
}

.product-card .price {
  color: crimson;
  font-weight: bold;
}

.product-card.sold-out {
  opacity: 0.4;
}

.product-card:hover {
  border-color: steelblue;
}
```

然後在元件裡匯入它，並且用 `className` 套用。把 `src/ProductCard.jsx` 換成：

```jsx
import "./ProductCard.css";

function ProductCard({ name, price, inStock = true }) {
  return (
    <div className={inStock ? "product-card" : "product-card sold-out"}>
      <h2>{name}</h2>
      <p className="price">{price} 元</p>
      {!inStock && <p>已售完</p>}
    </div>
  );
}

export default ProductCard;
```

最上面的 `import "./ProductCard.css"` 沒有 `from`，因為我們不需要從 CSS 檔拿東西出來，只是告訴 Vite「這個元件需要這份樣式」。Vite 會負責把它加進網頁。

在 `src/App.jsx` 用用看：

```jsx
import ProductCard from "./ProductCard.jsx";

function App() {
  return (
    <div>
      <ProductCard name="機械鍵盤" price={1200} />
      <ProductCard name="無線滑鼠" price={600} inStock={false} />
    </div>
  );
}

export default App;
```

兩張卡片有框線、圓角，價格是紅色粗體，滑鼠移上去框線會變藍色，已售完的那張變淡。

幾個要注意的地方：

- 在 JSX 裡寫 `class` 要寫成 `className`（第 4 集學過）。
- 有兩個 class 的時候，是寫在同一個字串裡，用空格隔開：`"product-card sold-out"`。
- CSS 檔本身的寫法和第 3 章完全一樣，用的是一般的 CSS。

### 它的限制：樣式是全域的

這種做法有個很大的陷阱：**不管你在哪個元件匯入 CSS 檔，裡面的規則都會套用到整個網頁**，而不是只對那個元件有效。

假設你另外有一個 `Card` 元件，它的 CSS 也剛好寫了一個 `.title`；而 `ProductCard` 的 CSS 裡也有一個 `.title`。兩份樣式都會套到所有 class 叫 `title` 的元素上，後載入的會蓋掉先載入的，兩個元件的樣式就會互相干擾。專案越大，撞名的機會越高，而且出了問題很難找原因。

目前有兩種解法：

1. **自己遵守命名規則**：每個元件的 class 都以元件名稱開頭，例如 `product-card`、`product-card-title`，就像上面的範例。這是最簡單的做法，小專案夠用。
2. **讓工具幫你避免撞名**：這就是下一集要學的 CSS Modules。

## 重點整理

- 為元件建立同名的 CSS 檔，用 `import "./元件.css"` 匯入。
- 用 `className` 套用 class，多個 class 用空格隔開寫在同一個字串。
- 匯入的 CSS 是全域的，不同元件的 class 名稱撞名會互相影響。
- 小專案可以用元件名稱當 class 的開頭來避免撞名。
