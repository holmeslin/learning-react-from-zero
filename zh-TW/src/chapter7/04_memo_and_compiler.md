# `memo`、`useMemo`、`useCallback` 與 React Compiler

## 本集目標

了解 `memo`、`useMemo`、`useCallback` 在做什麼，以及 React Compiler 為什麼讓你大多數時候不必手動寫它們。

## 正文

### 預設行為：父元件渲染，子元件也跟著渲染

React 有一個預設行為：**一個元件重新渲染時，它底下的所有子元件也會跟著重新渲染**，就算傳給子元件的 props 完全沒有變。

大部分時候，這沒什麼問題，React 的渲染很快。但當某個元件特別慢、或是畫面真的卡頓時，你就需要想辦法讓不必要的渲染不要發生。

### 實驗：誰會重新渲染

```jsx
import { memo, useCallback, useState } from "react";

function Plain({ name }) {
  console.log("Plain 渲染");
  return <p>Plain：{name}</p>;
}

const Memoized = memo(function Memoized({ name }) {
  console.log("Memoized 渲染");
  return <p>Memoized：{name}</p>;
});

const SaveButton = memo(function SaveButton({ label, onSave }) {
  console.log(`${label} 渲染`);
  return <button onClick={onSave}>{label}</button>;
});

export default function App() {
  const [count, setCount] = useState(0);

  const saveInline = () => console.log("儲存");
  const saveStable = useCallback(() => console.log("儲存"), []);

  return (
    <>
      <button onClick={() => setCount(count + 1)}>點了 {count} 次</button>
      <Plain name="小明" />
      <Memoized name="小明" />
      <SaveButton label="每次新函式" onSave={saveInline} />
      <SaveButton label="useCallback" onSave={saveStable} />
    </>
  );
}
```

先重新整理頁面，Console 會印出四行，四個子元件都渲染了一次：

```text
Plain 渲染
Memoized 渲染
每次新函式 渲染
useCallback 渲染
```

清掉 Console，然後按一下「點了 0 次」的按鈕，這時 `App` 重新渲染，Console 只會印出：

```text
Plain 渲染
每次新函式 渲染
```

（開發模式下 `<StrictMode>` 會讓上面兩段輸出的每一行各印兩次，看哪些元件有印出來就好。）

`Memoized` 和 `useCallback` 那顆都沒有重新渲染，這是為什麼？

### `memo`：props 沒變就跳過

用 `memo` 包住元件，React 在重新渲染前，會先比較新舊 props。**每一項都和上次一樣的話，就直接跳過這個元件的渲染。**

`Memoized` 的 props 是 `name="小明"`，前後一樣，所以被跳過。`Plain` 沒有用 `memo` 包，所以老實地跟著渲染。

### `useCallback`：讓函式在渲染之間保持同一個

`SaveButton` 也用了 `memo`，但兩顆按鈕的結果卻不同，差別在 `onSave` 這個 prop：

- `saveInline` 是直接寫在元件函式裡的函式。每次 `App` 渲染，都會產生一個**新的**函式。對 `memo` 的比較來說，新函式和舊函式不是同一個，所以 props 算「變了」，`memo` 就失效了。
- `saveStable` 用 `useCallback` 包住。只要依賴陣列（這裡是空的）沒變，`useCallback` 就會一直回傳同一個函式，`memo` 的比較才會通過。

**`useMemo`** 的概念相同，只是記住的是「計算的結果」，不是函式：

```jsx,ignore
const visibleTasks = useMemo(
  () => tasks.filter((task) => task.text.includes(keyword)),
  [tasks, keyword],
);
```

只有 `tasks` 或 `keyword` 變了，才會重新計算；否則直接回傳上次的結果，可以避免昂貴的重複計算，也能讓傳給子元件的物件、陣列保持同一個。

這三個工具合稱為**記憶化**（memoization）。但你也看到了，手動管理很容易出錯：漏掉其中一個，整個最佳化就白做了。

### React Compiler：讓編譯器代勞

React 團隊的解法是 **React Compiler**。它是一個在**建置時**運作的工具，會自動分析你的元件，幫你加上等同於 `memo`、`useMemo`、`useCallback` 的最佳化，而且通常比手寫的更精準。React Compiler 在 2025 年 10 月發布 1.0 正式版。

在 Vite 8 專案裡啟用它，需要兩個套件：

```bash
npm install -D babel-plugin-react-compiler @rolldown/plugin-babel
```

接著修改 `vite.config.js`：

```js
import { defineConfig } from "vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";

export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
  ],
});
```

這個設定要搭配 `@vitejs/plugin-react` 6.0.0 以上的版本。

啟用之後，**同一份程式碼**、完全不改，再做一次剛剛的實驗：按下「點了 0 次」，Console **什麼都不會印出來**。

`Plain` 沒有用 `memo`，`saveInline` 也只是一個普通函式，但它們都沒有重新渲染。編譯器發現它們的內容沒有變，已經替你記住了。

要確認編譯器有沒有運作，可以安裝瀏覽器的 React Developer Tools 擴充功能，被最佳化的元件旁邊會出現一個 ✨ 標記。

### 那還要不要手寫 `useMemo`、`useCallback`？

用了 React Compiler 之後：

- **新寫的程式碼**：交給編譯器，不必預先加上 `memo`、`useMemo`、`useCallback`。
- **已經存在的舊程式碼**：官方建議先留著，不要急著刪。移除可能改變編譯的結果，要刪的話請仔細測試。
- **還是需要手寫的情況**：需要精準控制「什麼要被記住」的時候，例如記憶化的值要當作 Effect 的依賴時，你得確保它在沒有實質變化時不會改變，免得 Effect 一直重新執行。這是官方文件提到的主要使用情境。
- **沒有啟用編譯器的專案**：本集前半段教的手動寫法仍然有效，你會在很多既有專案裡看到它。

編譯器也有前提：你的元件必須遵守「React 的規則」（元件和 Hook 是純粹的、不直接修改 props 和 state）。編譯器遇到無法安全最佳化的元件，會直接跳過，不會硬幫你改。

### 先別最佳化

最後提醒：**不要一開始就最佳化。** 大部分的元件根本不慢。先把功能寫對，發現真的卡頓，再用瀏覽器開發者工具找出原因。使用編譯器的專案，更是大部分時候根本不用想這件事。

## 重點整理

- 父元件重新渲染時，預設所有子元件都會跟著渲染。
- `memo` 讓元件在 props 沒變時跳過渲染；`useCallback` 和 `useMemo` 讓函式與計算結果在渲染之間保持同一個，避免 `memo` 失效。
- React Compiler（1.0 正式版）在建置時自動加上這些最佳化，讓你大多數時候不必手寫。
- 舊程式碼裡的 `memo`、`useMemo`、`useCallback` 先留著；需要精準控制時（例如當 Effect 的依賴）才手動寫。
- 先寫對，真的卡頓才最佳化。
