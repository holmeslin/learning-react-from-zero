# React DevTools

## 本集目標

安裝 React DevTools，用它看見元件樹，並且檢查每個元件收到的 props。

## 正文

寫 React 一定會遇到「為什麼這個畫面是這樣」的疑問。瀏覽器內建的開發者工具只看得到最後產生的 HTML，看不到元件。**React DevTools** 是 React 官方做的瀏覽器擴充功能，讓你直接看到元件，是除錯的好幫手。

### 安裝

React 官方提供 Chrome、Firefox、Edge 三種瀏覽器的擴充功能。到你的瀏覽器的擴充功能商店搜尋「React Developer Tools」安裝。官方的連結整理在 <https://react.dev/learn/react-developer-tools>。

如果你用的是 Safari 或其他瀏覽器，官方有另一種獨立程式的安裝方式，同一個網頁裡有說明。

### 打開它

先確定開發伺服器還在跑（`npm run dev`），用瀏覽器打開你的專案。然後打開瀏覽器的開發者工具（按 F12，Mac 是 Option + Command + I）。裝好之後，工具列會多出 **Components** 和 **Profiler** 兩個分頁。如果沒看到，重新整理頁面，或看看分頁列右邊有沒有被收進「>>」選單。

這一集只用 **Components**。Profiler 是用來找效能問題的，這本書暫時用不到。

### 看元件樹

點進 Components 分頁，左邊會是一棵樹，列出畫面上所有的元件，包含你自己寫的 `App`、`ProductCard`，和嵌在裡面的結構。這和你寫的程式碼的結構是一樣的：`App` 在最外面，它裡面有好幾個 `ProductCard`。

用上一集的畫面試試看：把 `src/App.jsx` 換成下面的內容，讓畫面有幾個元件可以看：

```jsx
import ProductCard from "./ProductCard.jsx";

const products = [
  { id: 1, name: "機械鍵盤", price: 1200, inStock: true },
  { id: 2, name: "無線滑鼠", price: 600, inStock: false },
  { id: 3, name: "螢幕", price: 5000, inStock: true },
];

function App() {
  return (
    <div>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          name={product.name}
          price={product.price}
          inStock={product.inStock}
        />
      ))}
    </div>
  );
}

export default App;
```

### 檢查 props

在元件樹裡點一個 `ProductCard`，右邊的面板會顯示這個元件收到的所有 props，例如：

```text
name: "機械鍵盤"
price: 1200
inStock: true
```

這是除錯時最常做的事：畫面不對勁的時候，先點進那個元件，看它收到的 props 是不是你以為的值。很多「畫面怎麼是錯的」的原因，只是資料傳錯了，一看 props 就知道。

### 直接修改 props 看畫面變化

在右邊面板裡，你可以直接修改某個 props 的值，例如把 `price` 改成 `999`，**畫面會立刻跟著變**。這個修改只存在目前開著的頁面裡，不會動到你的程式碼，重新整理頁面就恢復原狀了。

這個功能可以讓你快速測試「如果收到這個值，畫面會長怎樣」，不用回頭改程式碼。

### 其他常用的功能

- 元件樹上方有搜尋框，可以用名稱快速找到元件。
- 游標移到元件樹的元件上，網頁上對應的區塊會被標示出來。反過來，也能用面板左上角的選取按鈕，點畫面上的某個地方，直接跳到對應的元件。
- 下一章學到 state 之後，這個面板還會顯示元件的 state，而且也能修改。

## 重點整理

- React DevTools 是官方的瀏覽器擴充功能，讓你看到元件而不只是 HTML。
- 裝好之後，開發者工具會多出 Components 和 Profiler 分頁。
- Components 分頁可以看元件樹，點選元件能檢查它收到的 props。
- 在面板裡可以暫時修改 props 試試畫面，重新整理後就恢復。
- 畫面不對勁時，先檢查元件收到的 props 是不是你預期的值。
