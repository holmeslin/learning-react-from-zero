# Suspense

## 本集目標

用 `<Suspense>` 決定資料載入中的時候，畫面上要顯示什麼，以及不同區塊如何各自載入。

## 正文

### 一個 `<Suspense>` 做什麼

`<Suspense>` 是一個「載入中的邊界」：它包住的元件如果因為還在等資料而暫停（例如呼叫了上一集的 `use`），邊界裡就會改顯示 `fallback` 屬性指定的畫面，等資料好了再換成真正的內容。

```jsx,ignore
<Suspense fallback={<p>載入中……</p>}>
  <UserCard />
</Suspense>
```

### 多個邊界，各自載入

一個頁面常常有好幾個區塊，各自的資料速度不一樣。比如個人頁：「專輯」只要 0.5 秒，「朋友」要 2 秒。用**各自的** `<Suspense>` 包住：

```jsx
import { Suspense, use } from "react";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const cache = new Map();

function load(key, ms, value) {
  if (!cache.has(key)) cache.set(key, delay(ms).then(() => value));
  return cache.get(key);
}

function Albums() {
  const albums = use(load("albums", 500, ["第一張", "第二張"]));
  return <p>專輯：{albums.join("、")}</p>;
}

function Friends() {
  const friends = use(load("friends", 2000, ["小華", "小美"]));
  return <p>朋友：{friends.join("、")}</p>;
}

export default function App() {
  return (
    <>
      <h1>個人頁</h1>
      <Suspense fallback={<p>載入專輯……</p>}>
        <Albums />
      </Suspense>
      <Suspense fallback={<p>載入朋友……</p>}>
        <Friends />
      </Suspense>
    </>
  );
}
```

（範例裡的 `load` 是上一集 `cache` 做法的簡化版：用字串當 key，同樣的 key 永遠回傳同一個 Promise。）

重新整理頁面，依序會看到：

1. 一開始：標題下面是兩行「載入專輯……」、「載入朋友……」。
2. 約 0.5 秒後：專輯先出現了，朋友還在載入。
3. 約 2 秒後：朋友也出現了。

快的區塊不必等慢的，使用者可以先看到已經載入完成的內容。

### 一個邊界，等最慢的

如果把兩個元件放在**同一個** `<Suspense>` 裡呢？

```jsx
import { Suspense, use } from "react";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const cache = new Map();

function load(key, ms, value) {
  if (!cache.has(key)) cache.set(key, delay(ms).then(() => value));
  return cache.get(key);
}

function Albums() {
  const albums = use(load("albums", 500, ["第一張", "第二張"]));
  return <p>專輯：{albums.join("、")}</p>;
}

function Friends() {
  const friends = use(load("friends", 2000, ["小華", "小美"]));
  return <p>朋友：{friends.join("、")}</p>;
}

export default function App() {
  return (
    <>
      <h1>個人頁</h1>
      <Suspense fallback={<p>載入中……</p>}>
        <Albums />
        <Friends />
      </Suspense>
    </>
  );
}
```

這時整個邊界只要有**任何一個**元件還在等，就會顯示 `fallback`。於是畫面會先顯示兩秒的「載入中……」，然後專輯和朋友同時出現。專輯雖然 0.5 秒就準備好了，也得等朋友。

### 怎麼決定邊界要放在哪

- **邊界放得越細**：每個區塊各自載入，使用者可以更早看到內容，但畫面上會有很多區塊各自跳出來。
- **邊界放得越粗**：整塊一起出現，畫面比較穩定，但要等最慢的那個。

沒有標準答案，原則是：**一起出現比較合理的內容，放在同一個邊界裡；彼此獨立的內容，各放自己的邊界。**

### 巢狀的邊界

`<Suspense>` 可以一層包一層。元件暫停時，React 會找**最近**的上層邊界。所以你可以在整個頁面外面放一個粗的邊界當作保底，再在需要的區塊各放一個細的邊界。

### 不只是 `use`

`<Suspense>` 的作用不限於 `use`，任何支援 Suspense 的功能都能搭配，包含第二部 Next.js 裡的資料讀取。你現在學會的規則可以一直沿用。

## 重點整理

- `<Suspense fallback={...}>` 在它包住的內容還在載入時，顯示 `fallback`。
- 每個 `<Suspense>` 各自獨立：各放一個邊界，快的區塊先出現；放在同一個邊界，就等最慢的。
- 元件暫停時，React 找最近的上層 `<Suspense>`。
- 一起出現比較合理的內容放同一個邊界，彼此獨立的各放自己的邊界。
