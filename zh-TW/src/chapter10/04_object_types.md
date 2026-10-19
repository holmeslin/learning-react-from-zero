# 物件型別

## 本集目標

用 `type` 描述物件的形狀，包括選填的屬性和物件陣列。

## 正文

### 描述一個物件長什麼樣子

第 1 章的使用者物件是 `{ name: "小明", age: 20 }`。在 TypeScript 裡，可以用 `type` 先把它的「形狀」定義下來，取一個名字：

```ts
type User = {
  name: string;
  age: number;
};

const user: User = { name: "小明", age: 20 };
console.log(user.name);
```

`type User = { ... }` 定義了一個叫 `User` 的型別，裡面每個屬性寫「名稱: 型別」，用分號隔開（逗號也可以，這本書用分號）。型別的名字習慣用大寫開頭。

有了 `User` 之後，它可以用在任何需要型別的地方：變數、函式參數、陣列。

```ts
type User = {
  name: string;
  age: number;
};

function describe(user: User): string {
  return `${user.name}，${user.age} 歲`;
}

console.log(describe({ name: "小明", age: 20 }));
```

### 少一個、多一個都會被擋

建立 `practice/user.ts`：

```ts,ignore
type User = { name: string; age: number; email?: string };
const a: User = { name: "小明" };
const b: User = { name: "小華", age: 20, city: "台北" };
console.log(a, b);
```

```text
practice/user.ts:2:7 - error TS2741: Property 'age' is missing in type '{ name: string; }' but required in type 'User'.

2 const a: User = { name: "小明" };
        ~

  practice/user.ts:1:29 - 'age' is declared here.
    1 type User = { name: string; age: number; email?: string };
                                  ~~~

practice/user.ts:3:40 - error TS2353: Object literal may only specify known properties, and 'city' does not exist in type 'User'.

3 const b: User = { name: "小華", age: 20, city: "台北" };
                                         ~~~~


Found 2 errors in the same file, starting at: practice/user.ts:2
```

- 第一個錯誤：`a` 少了必要的 `age`。
- 第二個錯誤：`b` 多了 `User` 沒有的 `city`。

多餘屬性被擋下來，是因為它十之八九是打錯字。

### 選填屬性

注意上面的 `User` 有一個 `email?: string`，屬性名稱後面的 `?` 表示**選填**：可以有，也可以沒有。兩個物件都沒有 `email`，但那不是錯誤的原因，錯誤出在別的地方。

`age` 是 `number`，但 `email` 是 `string | undefined`：有可能沒有值。用的時候要先處理沒有值的情況，這件事下一集會教。

### 物件陣列

在型別後面加 `[]`，就是物件陣列。這是 React 裡最常見的資料形狀：

```ts
type Product = {
  id: number;
  name: string;
  price: number;
};

const products: Product[] = [
  { id: 1, name: "鍵盤", price: 1200 },
  { id: 2, name: "滑鼠", price: 600 },
];

const names = products.map((product) => product.name);
console.log(names);
```

注意 `map` 裡的 `product` 沒有標型別，因為 TypeScript 知道 `products` 是 `Product[]`，所以每個 `product` 一定是 `Product`。輸入 `product.` 的時候，編輯器還會把 `id`、`name`、`price` 列出來讓你選。這是 TypeScript 在日常寫程式最大的好處之一：**自動完成**。

### 巢狀物件

屬性的型別也可以是另一個物件型別：

```ts
type Address = {
  city: string;
  zip: string;
};

type Customer = {
  name: string;
  address: Address;
  hobbies: string[];
};

const customer: Customer = {
  name: "小明",
  address: { city: "台北", zip: "100" },
  hobbies: ["爬山", "看電影"],
};

console.log(customer.address.city);
```

### `readonly`

屬性前面加 `readonly`，表示只能在建立時給值，之後不能改：

```ts
type Point = {
  readonly x: number;
  readonly y: number;
};

const origin: Point = { x: 0, y: 0 };
console.log(origin.x);
```

之後改 `origin.x = 1` 就會報錯。React 的 props 和 state 都有「不要直接改」的原則，`readonly` 剛好能表達這個意思，不過一般專案不太常寫，看得懂就好。

### `type` 還是 `interface`

TypeScript 還有另一個定義物件型別的關鍵字 `interface`。在這本書的範圍內，兩個幾乎沒有差別。這本書一律用 `type`，看到別人寫 `interface` 時，知道它大概是同一件事就行。

## 重點整理

- `type 名稱 = { 屬性: 型別 }` 定義物件的形狀，名稱用大寫開頭。
- 少了必要屬性、多了未定義的屬性，都會被擋下。
- 屬性名稱後面加 `?` 是選填。
- `Product[]` 是物件陣列，`map` 裡的參數不用標，TypeScript 會自己推。
- 這本書一律用 `type`，不用 `interface`。
