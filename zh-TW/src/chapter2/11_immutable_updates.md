# 不可變更新

## 本集目標

學會「不直接改原本的資料，而是做一份新的」，這是 React 管理資料的基本習慣。

## 正文

### 先搞懂一件事：參考

先看這個現象：

```js
const a = { count: 1 };
const b = a;

b.count = 2;

console.log(a.count);
```

```text
2
```

`b = a` 沒有複製物件，只是讓兩個變數指向同一個物件。這個「指向」叫**參考**（reference）。你改 `b`，`a` 也跟著變，因為它們根本是同一個東西。

物件、陣列都是這樣。數字、字串、布林值不會，它們是直接複製值：

```js
let x = 1;
let y = x;

y = 2;

console.log(x);
```

```text
1
```

### 兩種更新的方式

假設有一個使用者，想把年齡改成 21。有兩種做法：

**直接改**（mutation，變動）：

```js
const user = { name: "小明", age: 20 };

user.age = 21;

console.log(user);
```

```text
{ name: '小明', age: 21 }
```

**做一份新的**：

```js
const user = { name: "小明", age: 20 };

const updatedUser = { ...user, age: 21 };

console.log(user);
console.log(updatedUser);
```

```text
{ name: '小明', age: 20 }
{ name: '小明', age: 21 }
```

後者不會動到原本的 `user`，這種做法叫**不可變更新**（immutable update）：資料一旦建好就不改它，要改就造一份新的。

### 為什麼 React 要你這樣做

React 要知道「資料變了沒有」，才能決定要不要重新畫畫面。它判斷的方式很簡單：**比較新舊兩個東西是不是同一個**（同一個參考）。

- 你造了一個新物件：新舊不是同一個，React 知道變了，重畫。
- 你直接改了原本的物件：新舊還是同一個，React 以為沒變，**畫面不會更新**。

這是 React 新手最常犯的錯。第 5 章會實際看到。現在先養成習慣：**更新資料時，造一份新的。**

### 陣列的不可變更新

陣列的操作要分清楚「會改原陣列」和「會造新陣列」兩類：

| 想做的事 | 會改原陣列（不要用） | 造新陣列（用這個） |
| --- | --- | --- |
| 加到最後 | `push` | `[...arr, item]` |
| 加到最前面 | `unshift` | `[item, ...arr]` |
| 刪除 | `splice` | `filter` |
| 替換或修改某一個 | `arr[i] = x` | `map` |
| 排序 | `sort` | `toSorted` |

逐一看範例：

```js
const todos = ["洗衣服", "寫程式"];

const added = [...todos, "買晚餐"];

console.log(todos);
console.log(added);
```

```text
[ '洗衣服', '寫程式' ]
[ '洗衣服', '寫程式', '買晚餐' ]
```

刪除，用 `filter`（第 6 集學過）：

```js
const numbers = [1, 2, 3, 4];

const withoutThree = numbers.filter((n) => n !== 3);

console.log(withoutThree);
```

```text
[ 1, 2, 4 ]
```

修改其中一個，用 `map`：把要改的那個換成新的，其他的原封不動回傳：

```js
const todos = [
  { id: 1, text: "洗衣服", done: false },
  { id: 2, text: "寫程式", done: false },
];

const updated = todos.map((todo) =>
  todo.id === 2 ? { ...todo, done: true } : todo
);

console.log(updated);
```

```text
[
  { id: 1, text: '洗衣服', done: false },
  { id: 2, text: '寫程式', done: true }
]
```

`todo.id === 2` 的那一項，換成「複製 `todo`、把 `done` 改成 `true`」的新物件；其他項原樣回傳。這個「`map` 加三元運算子加展開」的組合非常常用，請多看幾遍。

排序用 `toSorted`，它會回傳排好序的新陣列：

```js
const numbers = [3, 1, 2];

const sorted = numbers.toSorted((a, b) => a - b);

console.log(numbers);
console.log(sorted);
```

```text
[ 3, 1, 2 ]
[ 1, 2, 3 ]
```

`(a, b) => a - b` 是「由小到大」的比較方式：回傳負數表示 `a` 排前面，正數表示 `b` 排前面。想由大到小，改成 `b - a`。

`toSorted` 是比較新的方法，Node.js 20 以上都有。舊的 `sort` 會直接改動原陣列，所以不要用。

### 內層的東西也要複製

上一集說過，展開只複製最外層。更新巢狀資料時，**從你要改的那一層一路往外，每一層都要複製**：

```js
const user = {
  name: "小明",
  address: { city: "台北", zip: "100" },
};

const moved = {
  ...user,
  address: { ...user.address, city: "高雄" },
};

console.log(user.address.city);
console.log(moved.address.city);
```

```text
台北
高雄
```

`address` 這一層也展開再改 `city`。如果只寫 `{ ...user }` 然後 `moved.address.city = "高雄"`，那就會連原本的 `user` 一起改到。

資料層數太深時，這種寫法會很煩。React 的世界裡一般會盡量把資料結構弄平，不要嵌太深。

## 重點整理

- 物件和陣列是用「參考」傳遞的，`b = a` 之後改 `b` 會連 `a` 一起改到。
- 不可變更新：不改原本的資料，造一份新的。React 靠新舊是否同一個來判斷要不要重畫。
- 陣列：新增用 `[...arr, item]`，刪除用 `filter`，修改用 `map`，排序用 `toSorted`。
- 物件：用 `{ ...obj, 屬性: 新值 }`，巢狀的話每一層都要複製。
