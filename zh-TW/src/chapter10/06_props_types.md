# Props 的型別

## 本集目標

替元件的 props 標上型別，讓傳錯東西的時候馬上看到紅線。

## 正文

### 從元件開始

進到 React 了。從這一集開始，檔案副檔名是 `.tsx`。建立 `practice/Greeting.tsx`：

```tsx
type GreetingProps = {
  name: string;
  age?: number;
};

function Greeting({ name, age }: GreetingProps) {
  return (
    <p>
      你好，{name}
      {age !== undefined && `，${age} 歲`}
    </p>
  );
}

export default function App() {
  return (
    <>
      <Greeting name="小明" />
      <Greeting name="小華" age={20} />
    </>
  );
}
```

元件的 props 本來就是一個物件，所以第 4 集學的物件型別直接就能用：先定義一個 `GreetingProps`，再用 `({ name, age }: GreetingProps)` 標在解構的參數後面。命名慣例是「元件名稱 + `Props`」。

`age?: number` 是選填，所以 `<Greeting name="小明" />` 沒傳 `age` 也沒問題。用的時候 `age` 的型別是 `number | undefined`，所以要先檢查再用。

### 傳錯就有紅線

建立 `practice/Wrong.tsx`：

```tsx,ignore
type GreetingProps = { name: string; age?: number };

function Greeting({ name, age }: GreetingProps) {
  return <p>{name}{age}</p>;
}

export default function App() {
  return (
    <>
      <Greeting />
      <Greeting name="小華" age="二十" />
      <Greeting name="小明" color="red" />
    </>
  );
}
```

```text
practice/Wrong.tsx:10:8 - error TS2741: Property 'name' is missing in type '{}' but required in type 'GreetingProps'.

10       <Greeting />
          ~~~~~~~~

  practice/Wrong.tsx:1:24 - 'name' is declared here.
    1 type GreetingProps = { name: string; age?: number };
                             ~~~~

practice/Wrong.tsx:11:27 - error TS2322: Type 'string' is not assignable to type 'number'.

11       <Greeting name="小華" age="二十" />
                             ~~~

  practice/Wrong.tsx:1:38 - The expected type comes from property 'age' which is declared here on type 'IntrinsicAttributes & GreetingProps'
    1 type GreetingProps = { name: string; age?: number };
                                           ~~~

practice/Wrong.tsx:12:27 - error TS2322: Type '{ name: string; color: string; }' is not assignable to type 'IntrinsicAttributes & GreetingProps'.
  Property 'color' does not exist on type 'IntrinsicAttributes & GreetingProps'.

12       <Greeting name="小明" color="red" />
                             ~~~~~


Found 3 errors in the same file, starting at: practice/Wrong.tsx:10
```

三個常見的錯：漏傳必要的 props、型別傳錯、傳了元件沒定義的 props。以前這種錯要在瀏覽器裡看到奇怪的畫面才發現，現在寫的當下就知道。

### `children`

第 4 章學過 `children`：元件標籤中間包的內容。它的型別是 `ReactNode`，意思是「任何 React 能渲染的東西」，包括字串、數字、元素、陣列、`null`。建立 `practice/Card.tsx`：

```tsx
import type { ReactNode } from "react";

type CardProps = {
  title: string;
  children: ReactNode;
};

export function Card({ title, children }: CardProps) {
  return (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  );
}
```

注意 import 那一行是 `import type`。`ReactNode` 只是型別，不是真的程式碼，所以要用 `import type` 告訴工具：「這個只在型別檢查時有用，建置時整行刪掉」。第 1 集的 `tsconfig.json` 裡的 `verbatimModuleSyntax` 就是這個規定，如果你寫成一般的 `import { ReactNode } from "react"`，會看到：

```text
practice/Card.tsx:1:10 - error TS1484: 'ReactNode' is a type and must be imported using a type-only import when 'verbatimModuleSyntax' is enabled.

1 import { ReactNode } from "react";
           ~~~~~~~~~


Found 1 error in practice/Card.tsx:1
```

看到這個錯誤，加上 `type` 就好。

### 函式型的 props

第 5 章學過，要讓子元件通知父元件，會傳一個函式當 props。它的型別寫成函式的樣子。建立 `practice/ProductList.tsx`：

```tsx
type ProductListProps = {
  products: { id: number; name: string }[];
  onSelect: (id: number) => void;
};

export function ProductList({ products, onSelect }: ProductListProps) {
  return (
    <ul>
      {products.map((product) => (
        <li key={product.id}>
          <button onClick={() => onSelect(product.id)}>{product.name}</button>
        </li>
      ))}
    </ul>
  );
}
```

`(id: number) => void` 讀作：「一個函式，收一個數字 `id`，沒有回傳值」。用的時候（建立 `practice/ProductApp.tsx`）：

```tsx
import { ProductList } from "./ProductList.tsx";

export default function App() {
  return (
    <ProductList
      products={[{ id: 1, name: "鍵盤" }]}
      onSelect={(id) => console.log(id)}
    />
  );
}
```

`onSelect={(id) => ...}` 裡的 `id` 沒有標型別，TypeScript 從 `ProductListProps` 就知道它是 `number`。

## 重點整理

- 先定義 `XxxProps` 這個型別，再標在元件解構參數的後面：`({ a, b }: XxxProps)`。
- `?` 表示選填，選填 props 用的時候是 `T | undefined`。
- `children` 的型別是 `ReactNode`，要用 `import type` 匯入。
- 函式型的 props 寫成 `(參數: 型別) => 回傳型別`。
- 漏傳、傳錯型別、多傳 props，都會在寫的時候看到紅線。
