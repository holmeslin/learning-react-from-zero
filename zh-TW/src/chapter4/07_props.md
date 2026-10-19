# props

## 本集目標

用 props 把資料傳給元件，讓同一個元件可以畫出不同的內容。

## 正文

### 元件需要接收資料

上一集的 `Header` 永遠顯示「我的小商店」。如果想做一個「商品卡片」元件，每張卡片要顯示不同的商品，名稱和價格就不能寫死在元件裡，要從外面傳進去。

這就是 **props**（properties 的縮寫，「屬性」）。你可以把它想成函式的參數：呼叫函式時傳參數，使用元件時傳 props。

### 傳進去，接起來

建立 `src/ProductCard.jsx`：

```jsx
function ProductCard(props) {
  return (
    <div>
      <h2>{props.name}</h2>
      <p>{props.price} 元</p>
    </div>
  );
}

export default ProductCard;
```

React 在呼叫元件函式時，會把使用者寫在標籤上的屬性，整理成**一個物件**傳進來，也就是 `props`。所以 `props.name` 就是 `name` 屬性的值。

接著在 `src/App.jsx` 使用它：

```jsx
import ProductCard from "./ProductCard.jsx";

function App() {
  return (
    <div>
      <ProductCard name="機械鍵盤" price={1200} />
      <ProductCard name="無線滑鼠" price={600} />
      <ProductCard name="螢幕" price={5000} />
    </div>
  );
}

export default App;
```

畫面上出現三張卡片，內容各不相同。

注意傳值的寫法：

- 字串可以直接用引號：`name="機械鍵盤"`。
- 其他型別，像數字、布林值、陣列、物件，要用大括號：`price={1200}`。如果寫成 `price="1200"`，傳進去的會是字串。

這就是第 5 集學的 JSX 大括號的用法，一模一樣。

### 用解構讓程式碼更乾淨

每次都寫 `props.name`、`props.price` 很累。第 2 章學過物件解構，直接在函式的參數位置解構，把 `src/ProductCard.jsx` 改成：

```jsx
function ProductCard({ name, price }) {
  return (
    <div>
      <h2>{name}</h2>
      <p>{price} 元</p>
    </div>
  );
}

export default ProductCard;
```

這和剛才的寫法完全等價，但一眼就看出這個元件需要哪些 props。**從現在開始，本書的元件都用這種寫法。**

### 預設值

有些 props 可以不傳，這時候可以在解構時給預設值，`src/ProductCard.jsx` 改成：

```jsx
function ProductCard({ name, price, isNew = false }) {
  return (
    <div>
      <h2>
        {name}
        {isNew ? "（新品）" : ""}
      </h2>
      <p>{price} 元</p>
    </div>
  );
}

export default ProductCard;
```

使用的時候，沒傳 `isNew` 就是 `false`，`src/App.jsx` 改成：

```jsx
import ProductCard from "./ProductCard.jsx";

function App() {
  return (
    <div>
      <ProductCard name="機械鍵盤" price={1200} />
      <ProductCard name="無線滑鼠" price={600} isNew={true} />
      <ProductCard name="螢幕" price={5000} isNew />
    </div>
  );
}

export default App;
```

最後一個 `isNew` 沒有寫 `={true}`，這是簡寫：布林值的 props 只寫名稱，就代表 `true`。

### 一次傳整個物件

如果資料本來就是一個物件，可以用展開語法（第 2 章學過）一次傳完，`src/App.jsx` 改成：

```jsx
import ProductCard from "./ProductCard.jsx";

function App() {
  const product = { name: "機械鍵盤", price: 1200, isNew: true };

  return <ProductCard {...product} />;
}

export default App;
```

`{...product}` 等於 `name="機械鍵盤" price={1200} isNew={true}`。

### props 是唯讀的

元件**不可以修改**收到的 props。試試看：

```jsx,ignore
function ProductCard(props) {
  props.price = 0;
  return <p>{props.price} 元</p>;
}
```

會得到錯誤：

```text
Cannot assign to read only property 'price' of object '#<Object>'
```

這很合理：props 是別人（使用你的元件的那一邊）給你的資料，你拿來顯示就好，不能偷偷改掉。如果元件需要自己會變動的資料，那是 state，第 5 章會學。

## 重點整理

- props 是元件的參數：使用元件時寫在標籤上，函式接到的是一個物件。
- 字串可以用引號，其他型別（數字、布林值、物件）要用 `{}`。
- 在參數位置用解構取出 props，並且可以給預設值。
- 布林值的 props 只寫名稱代表 `true`；整個物件可以用 `{...物件}` 一次傳入。
- props 是唯讀的，元件不能修改它。
