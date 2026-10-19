# CSS Modules

## 本集目標

用 CSS Modules 讓每個元件的 class 名稱自動變成獨一無二，不再互相干擾。

## 正文

### 它是什麼

**CSS Modules** 的做法是：你照常寫 CSS，但 Vite 在處理的時候，會把每個 class 名稱換成一個不會重複的名字。換完之後，元件就用換好的名字套用樣式，所以不同元件的 `.title` 永遠不會撞在一起。

不用安裝任何東西，Vite 已經內建支援。唯一的條件是：**檔名要以 `.module.css` 結尾**。

### 改寫上一集的例子

把 `src/ProductCard.css` 改名成 `src/ProductCard.module.css`（在 VS Code 的檔案清單對它按右鍵選「重新命名」），內容換成：

```css
.card {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.card:hover {
  border-color: steelblue;
}

.price {
  color: crimson;
  font-weight: bold;
}

.soldOut {
  opacity: 0.4;
}
```

和上一集比，class 名稱變簡單了：因為它們不會跟別人撞名，就不需要再加元件名稱當開頭。`soldOut` 用的是 camelCase，原因馬上說明。

然後把 `src/ProductCard.jsx` 換成：

```jsx
import styles from "./ProductCard.module.css";

function ProductCard({ name, price, inStock = true }) {
  return (
    <div className={inStock ? styles.card : `${styles.card} ${styles.soldOut}`}>
      <h2>{name}</h2>
      <p className={styles.price}>{price} 元</p>
      {!inStock && <p>已售完</p>}
    </div>
  );
}

export default ProductCard;
```

這次的 `import styles from ...` 有 `from`，因為我們需要從 CSS 檔拿東西出來：`styles` 是一個物件，**它的屬性就是你在 CSS 裡寫的 class 名稱**，值是換好之後的名字。所以：

- `styles.card` 是 `.card` 換好的名字。
- `styles.price` 是 `.price` 換好的名字。

用開發者工具檢查畫面上的元素，會發現它的 `class` 變成類似這樣：

```text
_card_w5e07_1
```

前面的 `_card_` 是你原本的名字，後面是一串由檔案計算出來的亂碼。另一個元件就算也有 `.card`，它的亂碼不同，所以不會撞名。

### 套用多個 class

在 CSS Modules 裡要套用兩個 class，要自己把兩個值接在一起，用樣板字面值，中間隔一個空格：

```jsx,ignore
className={`${styles.card} ${styles.soldOut}`}
```

上面的 `ProductCard` 就是這樣用的。

### 為什麼 class 名稱用 camelCase

`styles.soldOut` 可以直接用點取值。但如果 CSS 裡寫 `.sold-out`，名稱裡有連字號，JavaScript 不能寫成 `styles.sold-out`（會被當成減法），只能寫成 `styles["sold-out"]`，很麻煩。所以用 CSS Modules 時，class 名稱習慣用 camelCase。

### 寫錯名字不會報錯

如果你拼錯，例如 `styles.pricee`，不會有任何錯誤，只是那個 class 沒有套上，畫面上少了樣式。遇到「樣式沒出來」，先檢查 class 的名字有沒有拼對。

### 全域樣式還是放在一般的 CSS

整個網站共用的樣式，像 `body` 的字型，仍然寫在一般的 `index.css`，那是全域的。CSS Modules 負責的是元件自己的樣式。

### 該用哪一種

這本書接下來的元件，**一律用 CSS Modules**：不用煩惱撞名，而且樣式跟著元件走，刪掉元件時把檔案一起刪就乾淨了。如果你以後接手的專案用的是一般的 CSS 檔，你也已經知道它怎麼運作了。

## 重點整理

- 檔名以 `.module.css` 結尾，Vite 就會把 class 名稱換成不重複的名字。
- `import styles from "./X.module.css"`，用 `styles.class名稱` 套用。
- 套用兩個 class 要用樣板字面值接起來。
- class 名稱用 camelCase，才能用點取值。
- 全域樣式放一般 CSS，元件樣式放 CSS Modules。
