# DOM 是什麼以及為什麼需要 React

## 本集目標

理解 DOM 是什麼，並且親眼看到「只用 JavaScript 做網頁」會遇到什麼麻煩，這就是 React 存在的理由。

## 正文

### DOM：瀏覽器腦中的那棵樹

瀏覽器讀到 HTML 之後，不會一直拿著那份文字，而是在記憶體裡建立一個**樹狀結構**，每個元素是樹上的一個節點。這棵樹叫做 **DOM**（Document Object Model，文件物件模型）。

這份 HTML：

```html
<body>
  <h1>標題</h1>
  <ul>
    <li>蘋果</li>
    <li>香蕉</li>
  </ul>
</body>
```

在瀏覽器裡會變成這樣一棵樹：

```text
body
├── h1
│   └── "標題"
└── ul
    ├── li
    │   └── "蘋果"
    └── li
        └── "香蕉"
```

重點是：**畫面是由 DOM 畫出來的。** 只要 DOM 這棵樹有變化，畫面就會跟著變。而 JavaScript 可以隨時修改 DOM，這就是網頁能互動的原因。

### 用 JavaScript 修改 DOM

做一個最簡單的計數器：按一下按鈕，數字加一。在 `chapter3` 資料夾建立兩個檔案。

`index.html`：

```html
<!DOCTYPE html>
<html lang="zh-TW">
  <head>
    <meta charset="UTF-8" />
    <title>計數器</title>
  </head>
  <body>
    <p>你按了 <span id="count">0</span> 次</p>
    <button id="add">按我</button>
    <script src="app.js"></script>
  </body>
</html>
```

`app.js`：

```js
// 檔案：app.js
const countText = document.querySelector("#count");
const button = document.querySelector("#add");

let count = 0;

button.addEventListener("click", () => {
  count += 1;
  countText.textContent = count;
});
```

開啟 `index.html`，按按鈕，數字會增加。逐行看：

- `<script src="app.js"></script>`：在網頁裡載入 JavaScript 檔案。放在 `<body>` 最後面，確保執行時畫面上的元素都已經存在。
- `document.querySelector("#count")`：用 CSS 選擇器（`#count` 是 id 選擇器）在 DOM 裡找到那個元素。
- `button.addEventListener("click", callback)`：註冊一個**事件監聽**，意思是「這個按鈕被按下時，呼叫這個 callback」。你在第 2 章學過 callback，這就是它的實際應用。
- `countText.textContent = count`：直接修改那個元素的文字，畫面立刻更新。

這個程式很簡單，運作得很好。問題是：**當程式變大，會怎麼樣？**

### 資料一多，就開始亂了

想像一個待辦清單。畫面上有：清單本身、一行「共 N 項」的統計、沒有任何事項時的「目前沒有待辦事項」提示。HTML 是：

```html
<p id="empty">目前沒有待辦事項</p>
<ul id="list"></ul>
<p id="summary">共 0 項</p>
```

只用 JavaScript，要新增和刪除一項，你得這樣寫：

```js
// 檔案：todo.js
const list = document.querySelector("#list");
const summary = document.querySelector("#summary");
const emptyMessage = document.querySelector("#empty");
const todos = [];

function addTodo(text) {
  todos.push(text);

  const li = document.createElement("li");
  li.textContent = text;
  list.appendChild(li);

  summary.textContent = `共 ${todos.length} 項`;
  emptyMessage.hidden = true;
}

function removeTodo(index) {
  todos.splice(index, 1);

  list.children[index].remove();

  summary.textContent = `共 ${todos.length} 項`;
  if (todos.length === 0) {
    emptyMessage.hidden = false;
  }
}
```

每一次資料變動，你都得**手動**去同步畫面上每一個相關的地方：改清單、改統計文字、顯示或隱藏提示。

這帶來幾個很實際的麻煩：

- **容易漏**：新增了「全部完成」的功能，但忘了更新統計文字，畫面就和資料對不起來。
- **牽一髮動全身**：畫面上每多一個顯示資料的地方，所有改資料的函式都要多加一行更新它。
- **資料和畫面是兩份**：`todos` 陣列是一份，DOM 上的 `<li>` 是另一份。兩邊稍有不一致，就出現「資料明明刪了，畫面還在」這種怪 bug。

程式越大，需要同步的地方呈指數成長，最後沒有人敢改。

### React 的想法：描述畫面，而不是操作畫面

React 換了一個思考方式。你不再說「**怎麼**一步一步改 DOM」，而是只說「資料長這樣的時候，**畫面應該長怎樣**」。

上面那個計數器，在 React 裡長得像這樣（現在看不懂沒關係，只要感受一下形狀）：

```jsx,ignore
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      你按了 {count} 次
    </button>
  );
}
```

沒有 `querySelector`，沒有 `textContent`。你只有兩件事：

1. 資料：`count`。
2. 畫面長怎樣：一個按鈕，上面寫「你按了 `count` 次」。

當 `count` 變了，你只要告訴 React（呼叫 `setCount`），**React 會自己算出畫面哪些地方需要改，並且去改 DOM**。你不用再管同步這件事。

公式很簡單：

```text
畫面 = 函式(資料)
```

資料是唯一的真相，畫面永遠是由資料「算」出來的。資料變了，畫面就重新算一次，兩邊不可能不一致。

這個想法，加上讓這個想法可以大規模落實的一整套工具，就是 React。它不是讓你寫出更短的程式，而是讓你在程式很大的時候，依然管得住。

### 接下來

下一章你會正式建立第一個 React 專案，寫出你的第一個元件。你已經有了需要的所有基礎：

- JavaScript 的函式、陣列方法、解構、展開、`import` / `export`（第 1、2 章）。
- HTML 的標籤和屬性、CSS 的選擇器和版面（這一章）。

準備好了。

## 重點整理

- DOM 是瀏覽器在記憶體裡建立的樹狀結構，畫面是由它畫出來的；JavaScript 可以修改 DOM 來改變畫面。
- 只用 JavaScript 操作 DOM，資料一變就要手動同步所有相關的畫面，容易漏、難維護。
- React 讓你描述「資料長這樣時畫面該長怎樣」，由 React 負責改 DOM。
- 可以把 React 的核心想成：畫面 = 函式(資料)。
