# 物件 state

## 本集目標

正確地更新儲存在 state 裡的物件，知道為什麼不能直接修改它。

## 正文

### state 裡放物件

state 可以是一個物件，用來把相關的資料放在一起。例如一位使用者，把 `src/App.jsx` 換成：

```jsx
import { useState } from "react";

function App() {
  const [user, setUser] = useState({ name: "小明", age: 20 });

  return (
    <div>
      <p>
        {user.name}，{user.age} 歲
      </p>
    </div>
  );
}

export default App;
```

現在要做一個「過生日」按鈕，讓年齡加一。

### 直接修改，畫面不會變

最直覺的寫法，是直接改物件的屬性，把 `src/App.jsx` 換成：

```jsx
import { useState } from "react";

function App() {
  const [user, setUser] = useState({ name: "小明", age: 20 });

  function handleBirthday() {
    user.age = user.age + 1;
    setUser(user);
  }

  return (
    <div>
      <p>
        {user.name}，{user.age} 歲
      </p>
      <button onClick={handleBirthday}>過生日</button>
    </div>
  );
}

export default App;
```

這樣寫，點按鈕**畫面沒有任何反應**，明明 `age` 已經改了，也呼叫了 `setUser`。

原因是 React 判斷 state 有沒有改變的方式，是比較「新傳進去的值」和「目前的值」是不是**同一個東西**。物件在 JavaScript 裡是用「位置」來辨認的：`user` 改了裡面的屬性，但它還是同一個物件。你呼叫 `setUser(user)`，等於告訴 React：「新的 state 就是原來那個物件」。React 比對之後發現是同一個，結論是「沒有變化」，所以不重新渲染。

### 正確的寫法：做一個新物件

要讓 React 看見改變，你要給它一個**全新的物件**。第 2 章學過的展開語法剛好派上用場，把 `src/App.jsx` 換成：

```jsx
import { useState } from "react";

function App() {
  const [user, setUser] = useState({ name: "小明", age: 20 });

  function handleBirthday() {
    setUser({ ...user, age: user.age + 1 });
  }

  return (
    <div>
      <p>
        {user.name}，{user.age} 歲
      </p>
      <button onClick={handleBirthday}>過生日</button>
    </div>
  );
}

export default App;
```

`{ ...user, age: user.age + 1 }` 的意思是：建立一個新物件，先把 `user` 的所有屬性複製進來，再用 `age` 蓋掉其中一個。結果是一個全新的物件，`name` 沒變，`age` 加了 1。React 發現新物件不是舊的那個，就會重新渲染。

**不要直接修改 state，而是做一份新的取代它。** 把 state 當成唯讀的，這是 React 最重要的規則之一。

如果新的值依賴舊值，就像上一集說的，可以搭配更新函式：

```jsx,ignore
setUser((current) => ({ ...current, age: current.age + 1 }));
```

注意：箭頭函式直接回傳物件的時候，物件要用小括號包起來，否則大括號會被當成函式的內容。

### 巢狀物件：每一層都要複製

如果物件裡還有物件，要改裡面那一層，**從外到內，每一層都要複製**，把 `src/App.jsx` 換成：

```jsx
import { useState } from "react";

function App() {
  const [user, setUser] = useState({
    name: "小明",
    address: { city: "台北", zip: "100" },
  });

  function handleMove() {
    setUser({
      ...user,
      address: { ...user.address, city: "高雄" },
    });
  }

  return (
    <div>
      <p>
        {user.name} 住在 {user.address.city}
      </p>
      <button onClick={handleMove}>搬家</button>
    </div>
  );
}

export default App;
```

外層用 `...user` 複製，裡面的 `address` 也要用 `...user.address` 複製，再改 `city`。如果只複製外層，內層的 `address` 還是同一個物件，等於又回到直接修改。

層數很多的時候這種寫法很囉嗦，這也是為什麼 state 盡量不要設計得太深，第 11 集會再談。

### 一個常見的誤會

有人會想：「那我先改，再 `setUser({ ...user })` 複製一份不就好了？」這樣畫面看起來會更新，但你已經在渲染之外偷偷修改了原本的物件。這會讓之後的行為越來越難預測，所以請一律用「先複製、再修改複製品」的寫法。

## 重點整理

- 物件 state 不能直接修改，修改屬性並不會觸發重新渲染。
- 要用 `{ ...舊物件, 屬性: 新值 }` 做一個新物件，再傳給 `setState`。
- 巢狀物件要從外到內每一層都複製。
- 新值依賴舊值時，搭配更新函式；箭頭函式回傳物件要加小括號。
- 把 state 當成唯讀。
