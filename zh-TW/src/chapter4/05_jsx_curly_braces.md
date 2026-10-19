# JSX 裡的 `{}`

## 本集目標

用大括號 `{}` 在 JSX 裡放進變數和運算結果，讓畫面內容由資料決定。

## 正文

到目前為止，JSX 裡的文字都是寫死的。但 React 的重點是「畫面由資料決定」，所以我們需要一種方法，把 JavaScript 的值放進 JSX。答案就是大括號 `{}`：**大括號裡面是 JavaScript**。

### 放進變數和運算

把 `src/App.jsx` 換成：

```jsx
function App() {
  const name = "小明";
  const price = 120;
  const quantity = 3;

  return (
    <div>
      <h1>{name} 的購物清單</h1>
      <p>單價 {price} 元，買 {quantity} 個</p>
      <p>總共 {price * quantity} 元</p>
    </div>
  );
}

export default App;
```

畫面會顯示：

```text
小明 的購物清單
單價 120 元，買 3 個
總共 360 元
```

大括號裡可以放任何「會算出一個值」的 JavaScript：變數、`price * quantity` 這種運算、呼叫函式、三元運算子都可以。這跟第 1 章的樣板字面值 `${}` 很像，只是用在 JSX 裡。

變數放在元件函式的 `return` 之前，每次畫面要更新的時候，這些程式碼都會重新跑一次。

### 呼叫函式

函式也可以拿來用：

```jsx
function formatPrice(price) {
  return `${price} 元`;
}

function App() {
  const items = ["鍵盤", "滑鼠"];

  return (
    <div>
      <p>共 {items.length} 項商品</p>
      <p>鍵盤：{formatPrice(1200)}</p>
    </div>
  );
}

export default App;
```

### 放進屬性

大括號不只能放在標籤中間，也能放在屬性的位置。這時候**不要再加引號**：

```jsx
function App() {
  const logoUrl = "/favicon.svg";
  const title = "我的網站";

  return <img src={logoUrl} alt={title} width={48} />;
}

export default App;
```

規則是：寫死的字串用引號（`alt="標誌"`），用 JavaScript 算出來的值用大括號（`alt={title}`），兩種擇一，不要同時用。`width={48}` 傳進去的是數字 48；如果寫 `width="48"`，傳進去的是字串 `"48"`。

### `style` 要用兩層大括號

在 JSX 裡寫行內樣式，會看到兩層大括號：

```jsx
function App() {
  return <p style={{ color: "crimson", fontSize: 24 }}>紅色的大字</p>;
}

export default App;
```

這不是什麼特殊語法，而是兩件事疊在一起：

- 外層的 `{}` 是 JSX 的「這裡面是 JavaScript」。
- 內層的 `{}` 是 JavaScript 的物件 `{ color: "crimson", fontSize: 24 }`。

`style` 要的是一個物件，屬性名稱用 camelCase（`fontSize`，不是 `font-size`）。數字會自動加上 `px`，所以 `fontSize: 24` 的結果是 `24px`。

如果你寫成字串，像 `style="color: red"`，React 會直接報錯：

```text
The `style` prop expects a mapping from style properties to values,
not a string.
```

### 大括號裡不能放物件

試著把一個物件直接放進去：

```jsx,ignore
function App() {
  const user = { name: "小明", age: 20 };
  return <p>{user}</p>;
}
```

畫面會整個壞掉，錯誤訊息是：

```text
Objects are not valid as a React child (found: object with keys {name, age}).
```

意思是「物件不能當作 React 的內容」。React 不知道該怎麼把一整個物件畫成文字。要顯示就挑出你要的屬性：

```jsx
function App() {
  const user = { name: "小明", age: 20 };
  return <p>{user.name}，{user.age} 歲</p>;
}

export default App;
```

字串、數字可以直接放。陣列也可以，第 10 集會用它畫出清單。`true`、`false`、`null`、`undefined` 放進去則什麼都不會畫，第 9 集就會用到這個特性。

### 在 JSX 裡寫註解

在 JSX 的標籤之間，不能用 `//` 當註解，要把註解包進大括號：

```jsx
function App() {
  return (
    <div>
      {/* 這是 JSX 裡的註解，不會顯示在畫面上 */}
      <h1>標題</h1>
    </div>
  );
}

export default App;
```

### 大括號只能放「值」

大括號裡只能放會算出值的東西，也就是「運算式」。`if`、`for` 這種「敘述」不能直接放進去：

```jsx,ignore
<p>{if (isOk) { "好" }}</p>
```

要根據條件決定畫什麼，第 9 集會學到做法。

## 重點整理

- JSX 裡的 `{}` 表示「這裡面是 JavaScript」，可以放變數、運算、函式呼叫。
- 屬性用 `{}` 的時候不要再加引號：`src={logoUrl}`。
- `style` 要傳物件，所以是兩層大括號，屬性用 camelCase。
- 物件不能直接放進 `{}`，要挑出屬性來顯示。
- JSX 裡的註解寫成 `{/* ... */}`。
