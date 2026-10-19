# 泛型入門

## 本集目標

看懂 `useState<Todo[]>` 裡那個角括號是什麼意思，並能寫出最簡單的泛型函式。

## 正文

### 你已經用過泛型了

前面幾集出現了這些寫法：

```ts
const names: Array<string> = ["小明", "小華"];
console.log(names);
```

`Array<string>` 和 `string[]` 是同一件事，都是「字串陣列」。還有上一集的 `useState<Todo[]>([])`。這種角括號 `<>` 的語法叫**泛型**（generics）。

### 泛型是「型別的參數」

函式有參數：呼叫時傳不同的值進去，函式就做不同的事。泛型是**型別的參數**：使用時傳不同的型別進去，得到不同的結果。

`Array<T>` 的 `T` 就是那個參數。`Array<string>` 是「裡面放字串的陣列」，`Array<number>` 是「裡面放數字的陣列」，同一套陣列的功能，適用於各種型別的東西。`useState<T>` 同理：`useState<number>` 的狀態是數字，`useState<Todo[]>` 的狀態是 `Todo` 陣列。

### 寫一個泛型函式

假設要寫一個「取出陣列第一個東西」的函式。如果寫死型別，只能服務一種陣列：

```ts
function firstNumber(items: number[]): number | undefined {
  return items[0];
}

console.log(firstNumber([1, 2, 3]));
```

要支援字串陣列，又得再寫一個。有了泛型，一個函式就夠：

```ts
function first<T>(items: T[]): T | undefined {
  return items[0];
}

const firstName = first(["小明", "小華"]);
const firstScore = first([90, 80]);
console.log(firstName, firstScore);
```

- `function first<T>`：宣告這個函式有一個型別參數，叫 `T`。名字隨便取，習慣用大寫字母 `T`。
- `items: T[]`：參數是「`T` 的陣列」。
- `: T | undefined`：回傳的東西是 `T`，空陣列時是 `undefined`。

呼叫的時候不用特別寫 `<>`，TypeScript 從你傳進去的陣列自己推論 `T`：傳字串陣列，`T` 就是 `string`，`firstName` 的型別就是 `string | undefined`；傳數字陣列，`firstScore` 就是 `number | undefined`。

因為型別是對的，後續的檢查也就是對的。建立 `practice/first.ts`：

```ts,ignore
function first<T>(items: T[]): T | undefined {
  return items[0];
}

const firstName = first(["小明"]);
console.log(firstName.length);
```

```text
practice/first.ts:6:13 - error TS18048: 'firstName' is possibly 'undefined'.

6 console.log(firstName.length);
              ~~~~~~~~~


Found 1 error in practice/first.ts:6
```

TypeScript 知道 `first` 可能回傳 `undefined`（空陣列的時候），所以不讓你直接用 `.length`。

### 自己定義的泛型型別

型別也可以有型別參數。常見的例子是「資料抓取的結果」：

```ts
type ApiResult<T> = {
  data: T | null;
  error: string | null;
};

const result: ApiResult<string[]> = {
  data: ["小明", "小華"],
  error: null,
};

console.log(result);
```

`ApiResult<string[]>` 把 `T` 換成 `string[]`，所以 `data` 的型別是 `string[] | null`。換成 `ApiResult<User>`，`data` 就是 `User | null`。外層的結構只寫一次，裡面裝什麼，由使用的人決定。

### 這一集就夠了

泛型是 TypeScript 最深的部分之一，可以寫得很複雜。但作為 React 的使用者，你需要的程度只有三件事：

1. 看到 `<T>` 知道它是「型別的參數」。
2. 會用 `useState<Todo[]>([])` 這種寫法。
3. 需要時能照著上面的 `first` 寫一個簡單的泛型函式。

遇到更複雜的，查文件就好。

## 重點整理

- 角括號 `<>` 的語法叫泛型，是「型別的參數」。
- `Array<string>` 就是 `string[]`，`useState<Todo[]>` 就是指定 state 的型別。
- 自己寫泛型函式：`function first<T>(items: T[]): T | undefined`，呼叫時 TypeScript 會從引數推論 `T`。
- 型別也可以有型別參數，例如 `ApiResult<T>`。
