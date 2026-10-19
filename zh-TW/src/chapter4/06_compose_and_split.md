# 元件組合與拆檔

## 本集目標

把畫面拆成小元件，再組合起來，並且把每個元件放進自己的檔案。

## 正文

### 元件可以放在元件裡面

第 3 集你在 `App` 裡用了 `<Greeting />`。元件裡面可以放其他元件，所以一個完整的畫面，會是一棵由元件組成的樹：最外面是 `App`，它裡面有標題區、內容區、頁尾，每一塊又可以再拆成更小的元件。

先在同一個檔案裡試試看。把 `src/App.jsx` 換成：

```jsx
function Header() {
  return (
    <header>
      <h1>我的小商店</h1>
    </header>
  );
}

function Footer() {
  return (
    <footer>
      <p>© 2026 我的小商店</p>
    </footer>
  );
}

function App() {
  return (
    <div>
      <Header />
      <main>
        <p>歡迎光臨！</p>
      </main>
      <Footer />
    </div>
  );
}

export default App;
```

畫面上依序出現標題、歡迎光臨、頁尾。`App` 就像一份說明書：「先放一個 `Header`，中間放內容，最後放一個 `Footer`」。每一塊的細節，由各自的元件負責。

### 為什麼要拆

拆元件有三個好處：

- **好讀**：`App` 只剩下大結構，一眼就看出畫面由哪幾塊組成。
- **好重複用**：同一個元件可以在很多地方使用。
- **好修改**：要改頁尾，只要找 `Footer`，不用在一大堆程式碼裡翻找。

怎麼決定要不要拆？一個簡單的判斷方式：**如果你能幫這一塊畫面取一個名字，它就可以是一個元件**。「標題區」、「商品卡片」、「搜尋框」都是好名字。

### 一個元件一個檔案

元件越來越多時，全部擠在 `App.jsx` 會很難找。慣例是**一個元件一個檔案，檔名和元件同名**，開頭大寫。

建立 `src/Header.jsx`：

```jsx
function Header() {
  return (
    <header>
      <h1>我的小商店</h1>
    </header>
  );
}

export default Header;
```

建立 `src/Footer.jsx`：

```jsx
function Footer() {
  return (
    <footer>
      <p>© 2026 我的小商店</p>
    </footer>
  );
}

export default Footer;
```

然後把 `src/App.jsx` 改成：

```jsx
import Header from "./Header.jsx";
import Footer from "./Footer.jsx";

function App() {
  return (
    <div>
      <Header />
      <main>
        <p>歡迎光臨！</p>
      </main>
      <Footer />
    </div>
  );
}

export default App;
```

畫面和剛才完全一樣，只是程式碼被拆開了。

這裡用到的 `import` 和 `export`，在第 2 章教過，現在拿來匯入元件：

- 被匯入的檔案最後要寫 `export default 元件名稱`。
- `import Header from "./Header.jsx"` 的意思是「從同一個資料夾（`./`）的 `Header.jsx` 拿到那個預設匯出的東西，取名叫 `Header`」。
- 路徑要包含副檔名 `.jsx`。

### 常見的錯

- **忘了寫 `export default`**：匯入的那一行會出錯，畫面變成一片空白，主控台出現紅字。檢查被匯入的檔案最後有沒有那一行。
- **路徑寫錯**：`./Header.jsx` 如果寫成 `./header.jsx`，在某些系統上能跑，在另一些系統上找不到檔案。檔名的大小寫要和實際的一模一樣。
- **忘了 `import`**：直接用 `<Header />` 卻沒有匯入，會得到 `Header is not defined` 的錯誤。

另外有一個建議先記住：**不要在一個元件的函式裡面再定義另一個元件**。元件都寫在最外層。第 5 章第 12 集會說明原因。

## 重點整理

- 元件可以放進其他元件，整個畫面是一棵元件樹。
- 能幫一塊畫面取名字，就可以拆成元件。
- 一個元件一個檔案，檔名和元件名稱相同、開頭大寫。
- 用 `export default` 匯出，用 `import 名稱 from "./檔名.jsx"` 匯入。
- 元件都定義在最外層，不要寫在別的元件裡面。
