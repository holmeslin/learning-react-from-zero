# 聯集型別

## 本集目標

用 `|` 表示「可能是這個，也可能是那個」，並學會縮小範圍。

## 正文

### 用 `|` 表示「或」

有時候一個值可能是好幾種型別之一。用 `|` 連接，叫**聯集型別**（union type）：

```ts
let id: string | number = 101;
id = "A-101";
console.log(id);
```

`string | number` 讀作「字串或數字」。兩種都可以放。

### 用之前要先確認是哪一種

麻煩來了：聯集型別的值，在不確定是哪一種之前，只能用「兩種型別都有」的功能。建立 `practice/show.ts`：

```ts,ignore
function show(value: string | number) {
  return value.toFixed(2);
}
console.log(show(3));
```

```text
practice/show.ts:2:16 - error TS2339: Property 'toFixed' does not exist on type 'string | number'.
  Property 'toFixed' does not exist on type 'string'.

2   return value.toFixed(2);
                 ~~~~~~~


Found 1 error in practice/show.ts:2
```

`toFixed` 是數字才有的方法，但 `value` 也可能是字串，所以被擋下。解法是先檢查，用第 1 章學過的 `typeof`：

```ts
function show(value: string | number) {
  if (typeof value === "number") {
    return value.toFixed(2);
  }
  return value.toUpperCase();
}

console.log(show(3));
console.log(show("abc"));
```

`if` 裡面，TypeScript 知道 `value` 一定是數字，所以可以用 `toFixed`；`if` 後面剩下的情況一定是字串，所以可以用 `toUpperCase`。這種「靠檢查把範圍縮小」的過程，叫**型別縮小**（narrowing）。

### 字面型別的聯集

第 3 集提過字面型別：某一個特定的值就是一個型別。把幾個字面型別用 `|` 串起來，就能表示「只能是這幾個值之一」：

```ts
type Status = "loading" | "success" | "error";

let status: Status = "loading";
status = "success";
console.log(status);
```

這很適合用在 React 裡的狀態，例如資料抓取的進度、按鈕的種類、主題。寫成 `string` 的話，打錯字也不會被發現；寫成這種聯集，打錯字馬上有紅線。建立 `practice/status.ts`：

```ts,ignore
type Status = "loading" | "success" | "error";
let status: Status = "loading";
status = "done";
console.log(status);
```

```text
practice/status.ts:3:1 - error TS2322: Type '"done"' is not assignable to type 'Status'.

3 status = "done";
  ~~~~~~


Found 1 error in practice/status.ts:3
```

而且輸入 `status = "` 的時候，編輯器會把三個選項列出來。

### `| null`：可能沒有值

第 1 章講過 `null` 和 `undefined`，以及那個最常見的錯誤 `Cannot read properties of undefined`。TypeScript 在這件事上幫了大忙。把「可能是 `null`」寫進型別裡。建立 `practice/greet.ts`：

```ts,ignore
type User = { name: string };

function greet(user: User | null) {
  return `你好，${user.name}`;
}
console.log(greet(null));
```

```text
practice/greet.ts:4:16 - error TS18047: 'user' is possibly 'null'.

4   return `你好，${user.name}`;
                 ~~~~


Found 1 error in practice/greet.ts:4
```

TypeScript 在程式還沒跑的時候，就指出「這裡可能會因為 `null` 而出錯」。處理方式是先檢查：

```ts
type User = { name: string };

function greet(user: User | null) {
  if (user === null) {
    return "請先登入";
  }
  return `你好，${user.name}`;
}

console.log(greet({ name: "小明" }));
console.log(greet(null));
```

或是用第 2 章學的 `?.` 和 `??`：

```ts
type User = { name: string };

function greet(user: User | null) {
  return `你好，${user?.name ?? "訪客"}`;
}

console.log(greet(null));
```

### 預告

在 React 裡，你會一直用到這種 `| null` 和 `| undefined`：還沒載入完的資料、選填的 props、可能找不到的商品。第 2 章 `find` 的結果也是這種型別：找得到是物件，找不到是 `undefined`，TypeScript 會逼你處理找不到的情況。

## 重點整理

- `A | B` 是聯集型別，表示值可能是 A 或 B。
- 聯集型別的值要先用 `typeof`、`=== null` 等檢查縮小範圍，才能用特定型別的功能。
- 字面型別的聯集，例如 `"loading" | "success" | "error"`，限定值只能是幾個特定選項之一。
- 在型別裡加上 `| null`，TypeScript 會逼你處理沒有值的情況，避免 `Cannot read properties of null`。
