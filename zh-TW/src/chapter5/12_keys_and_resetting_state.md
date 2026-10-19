# `key` 與重設 state

## 本集目標

理解 React 怎麼記住每個元件的 state，並用 `key` 在需要時重設它。

## 正文

### React 怎麼知道哪個 state 是誰的

state 不是存在你的元件函式裡，而是 React 替你保管。那 React 怎麼知道，這份 state 屬於畫面上的哪個元件？答案是：**靠元件在畫面結構裡的位置，還有它的 `key`**。

只要某個位置上、同一種元件、同一個 `key`，React 就認定它是「同一個」，會保留它的 state。這帶來一個意料之外的效果。

### 同一個位置，state 不會重設

做一個和不同聯絡人聊天的畫面。把 `src/App.jsx` 換成：

```jsx
import { useState } from "react";

function Chat({ contact }) {
  const [draft, setDraft] = useState("");

  return (
    <div>
      <h2>和 {contact} 聊天</h2>
      <input value={draft} onChange={(event) => setDraft(event.target.value)} />
    </div>
  );
}

function App() {
  const [contact, setContact] = useState("小明");

  return (
    <div>
      <button onClick={() => setContact("小明")}>小明</button>
      <button onClick={() => setContact("小華")}>小華</button>
      <Chat contact={contact} />
    </div>
  );
}

export default App;
```

在輸入框打幾個字，例如「晚上吃什麼」，然後切到「小華」。標題變成「和 小華 聊天」，但輸入框裡**還留著剛才打的字**。

這其實不是 bug，而是 React 的預期行為：在畫面上同一個位置，一直都是 `<Chat />`，只是 `contact` 這個 props 變了，React 認為是同一個元件的更新，所以 `draft` 保留下來。但從使用者的角度，寫給小明的草稿跑到小華那裡，顯然不對。

### 用 `key` 重設

解法是給 `<Chat>` 一個 `key`，讓每個聯絡人對應一個不同的 `key`，把 `src/App.jsx` 換成：

```jsx
import { useState } from "react";

function Chat({ contact }) {
  const [draft, setDraft] = useState("");

  return (
    <div>
      <h2>和 {contact} 聊天</h2>
      <input value={draft} onChange={(event) => setDraft(event.target.value)} />
    </div>
  );
}

function App() {
  const [contact, setContact] = useState("小明");

  return (
    <div>
      <button onClick={() => setContact("小明")}>小明</button>
      <button onClick={() => setContact("小華")}>小華</button>
      <Chat key={contact} contact={contact} />
    </div>
  );
}

export default App;
```

唯一的差別是 `<Chat key={contact} ... />`。現在切換聯絡人時，`key` 變了，React 就認為這是一個**全新的** `Chat`：把舊的連同它的 state 丟掉，建一個新的。輸入框自然就是空的了。

這是 `key` 的第二個用途：不只用在列表上，**任何時候想讓 React 把某個元件當成全新的、重設它的 state，都可以換一個 `key`**。

### 在元件裡定義元件，state 會被重設

第 4 章第 6 集說過「不要在元件裡面再定義另一個元件」，現在可以解釋原因了。把 `src/App.jsx` 換成：

```jsx
import { useState } from "react";

function App() {
  const [n, setN] = useState(0);

  function InnerCounter() {
    const [c, setC] = useState(0);
    return <button onClick={() => setC(c + 1)}>內層：{c}</button>;
  }

  return (
    <div>
      <InnerCounter />
      <button onClick={() => setN(n + 1)}>外層：{n}</button>
    </div>
  );
}

export default App;
```

點「內層」兩下，變成「內層：2」。然後點「外層」，**內層的數字被重設成 0**。

因為 `InnerCounter` 是定義在 `App` 的函式裡面，每次 `App` 渲染，就會建立一個全新的 `InnerCounter` 函式。React 比對後發現這一次的 `InnerCounter` 和上一次的是不同的東西，於是把舊的丟掉重建，state 也就跟著消失了。

所以，元件一律定義在檔案的最外層。

### 用索引當 `key` 的後果

第 4 章第 10 集說過不要用陣列索引當 `key`，現在看看真的出問題的樣子。把 `src/App.jsx` 換成：

```jsx
import { useState } from "react";

function Row({ label }) {
  const [draft, setDraft] = useState("");

  return (
    <li>
      {label}：
      <input value={draft} onChange={(event) => setDraft(event.target.value)} />
    </li>
  );
}

function App() {
  const [names, setNames] = useState(["小明", "小華", "小美"]);

  return (
    <div>
      <button onClick={() => setNames(names.slice(1))}>刪除第一個</button>
      <ul>
        {names.map((name, index) => (
          <Row key={index} label={name} />
        ))}
      </ul>
    </div>
  );
}

export default App;
```

每一列有自己的輸入框。在「小明」那一列打一個「A」，然後按「刪除第一個」。

小明被刪掉了，但那個「A」卻跑到了「小華」那一列。因為刪除之後，「小華」變成陣列的第 0 個，`key` 是 0，React 認為「key 為 0 的那一列」還是原來那一列，所以保留了原本屬於小明的 state。

換成用資料本身當 `key`，問題就消失了（這裡姓名不重複，所以暫時用姓名；實務上是用資料的 `id`），把 `src/App.jsx` 換成：

```jsx
import { useState } from "react";

function Row({ label }) {
  const [draft, setDraft] = useState("");

  return (
    <li>
      {label}：
      <input value={draft} onChange={(event) => setDraft(event.target.value)} />
    </li>
  );
}

function App() {
  const [names, setNames] = useState(["小明", "小華", "小美"]);

  return (
    <div>
      <button onClick={() => setNames(names.slice(1))}>刪除第一個</button>
      <ul>
        {names.map((name) => (
          <Row key={name} label={name} />
        ))}
      </ul>
    </div>
  );
}

export default App;
```

這次刪除小明時，`key` 為「小明」的那一列消失，「小華」的那一列帶著自己的 state 留下來，一切正常。

### 整理一下

React 認為兩個元件是「同一個」，要三個條件都符合：**位置相同、元件的類型相同、`key` 相同**。三者之中有一個不同，就當成新的，舊的 state 丟掉。

## 重點整理

- React 靠位置、元件類型和 `key` 判斷元件是不是同一個，是同一個才保留 state。
- 想重設元件的 state，就換它的 `key`，不限於列表。
- 在元件裡面定義另一個元件，每次渲染都是新的，state 會被重設，所以元件要定義在最外層。
- 用陣列索引當 `key`，在刪除或換順序時 state 會跑到別的項目上，用資料本身的 id。
