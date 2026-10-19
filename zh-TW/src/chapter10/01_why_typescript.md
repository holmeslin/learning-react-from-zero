# 為什麼要用 TypeScript

## 本集目標

看懂 TypeScript 解決了什麼問題，並建立一個練習用的 TypeScript 專案。

## 正文

### 一個沉默的錯誤

先看一段 JavaScript：

```js
const user = { name: "小明", age: 20 };
console.log(user.nmae);
```

你一眼就看出來了：`name` 被打成 `nmae`。但電腦不覺得這是錯，它只會印出：

```text
undefined
```

沒有錯誤訊息，程式繼續往下跑。這個 `undefined` 可能流到畫面上，顯示成空白；也可能被拿去做別的事，在三個函式之後才當場出錯。等你發現的時候，已經很難找出源頭了。

在小程式裡，你還能一眼看出來。但專案有幾百個檔案、幾十個人一起寫的時候，這種錯字、型別搞混、漏傳參數的錯誤，是出錯的大宗。

### TypeScript 怎麼處理

同樣的程式碼，改成 TypeScript（把檔名從 `.js` 換成 `.ts`），**內容完全不用改**，編輯器就會在 `nmae` 底下畫紅線，錯誤訊息是：

```text
Property 'nmae' does not exist on type '{ name: string; age: number; }'.
```

意思是「`{ name: string; age: number }` 這種物件裡，沒有叫 `nmae` 的屬性」。程式還沒執行，錯字就被抓到了。

注意一件事：你沒有寫任何型別，TypeScript 是自己從 `{ name: "小明", age: 20 }` 看出 `user` 有 `name` 是字串、`age` 是數字。這叫**型別推論**（type inference），第 3 集會詳細講。

### TypeScript 是什麼

- TypeScript = JavaScript + 型別。所有 JavaScript 都是合法的 TypeScript。
- 檔案副檔名是 `.ts`；有 JSX 的檔案是 `.tsx`（對應 JavaScript 的 `.jsx`）。
- 瀏覽器**看不懂** TypeScript。建置專案時，型別會被整個拿掉，變成普通的 JavaScript 才送給瀏覽器。所以型別只在你寫程式的時候有用，不會讓網頁變慢、也不會多佔空間。
- 型別不會在執行時保護你。它是「寫程式時的檢查」，如果資料是從網路來的，TypeScript 也沒辦法保證那份資料真的長得像你說的樣子。這一點要記著。

### 在 `hello-react` 裡準備練習環境

這一章繼續用第 4 章開始的 `hello-react` 專案。前 9 集先在專案裡另外開一個 `practice` 資料夾練習 TypeScript，不動到原本的程式；第 10 集再把整個專案改成 TypeScript。

**1. 安裝 TypeScript。** 在 `hello-react` 的終端機執行：

```bash
npm install -D typescript
```

裝完用 `npx tsc -v` 確認，會看到 `Version 7.0.2` 這樣的版本號。`tsc` 是 TypeScript 的編譯器，負責檢查型別。React 的型別定義 `@types/react` 在 Vite 的 JavaScript 範本裡已經裝好了，不用另外裝。

**2. 建立設定檔。** 在專案根目錄（和 `package.json` 同一層）建立 `tsconfig.json`：

```json
{
  "compilerOptions": {
    "target": "es2023",
    "lib": ["ES2023", "DOM"],
    "module": "esnext",
    "moduleResolution": "bundler",
    "moduleDetection": "force",
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "skipLibCheck": true
  },
  "include": ["practice"]
}
```

設定很多，現在不用每一項都懂，知道這幾個就好：

- `"strict": true`：打開嚴格檢查。這本書所有的範例都假設它是開著的。
- `"noEmit": true`：只檢查，不產生任何檔案。真正把程式碼轉成 JavaScript 的工作交給 Vite。
- `"jsx": "react-jsx"`：看得懂 JSX，第 6 集開始會用到。
- `"include": ["practice"]`：只檢查 `practice` 資料夾。原本 `src` 裡的 JavaScript 先不碰，第 10 集才會改這一行。

**3. 建立練習資料夾。** 在專案根目錄建立 `practice` 資料夾（注意不是在 `src` 裡面），再建立 `practice/typo.ts`，貼上前面那兩行：

```ts,ignore
const user = { name: "小明", age: 20 };
console.log(user.nmae);
```

VS Code 會立刻把 `nmae` 畫上紅線，把游標移上去就看得到錯誤訊息。編輯器以外，也可以用指令一次檢查整個 `practice` 資料夾：

```bash
npx tsc
```

```text
practice/typo.ts:2:18 - error TS2339: Property 'nmae' does not exist on type '{ name: string; age: number; }'.

2 console.log(user.nmae);
                   ~~~~


Found 1 error in practice/typo.ts:2
```

輸出的第一行是「哪個檔案、第幾行第幾個字：錯誤編號與說明」，接著把出錯的那一行印出來，用 `~~~~` 標出位置，最後是錯誤的總數。沒有錯誤的時候，`npx tsc` 什麼都不會印。

### 這一章的做法

第 2～5 集用 `.ts` 檔練習語言本身，第 6～9 集進入 React 元件，改用 `.tsx`。所有練習檔都放在 `practice` 資料夾，寫完用 `npx tsc` 或編輯器的紅線檢查，不需要執行。

有些範例是故意寫錯、用來看錯誤訊息的。看完之後，把那個檔案改對或刪掉，不然之後每次執行 `npx tsc`，都會一直看到它的錯誤。

## 重點整理

- JavaScript 的錯字和型別錯誤，常常不報錯，要到執行時才出問題。
- TypeScript 在 JavaScript 上加了型別，編輯器在你寫的時候就會標出錯誤。
- `.ts` 和 `.tsx` 最後會被轉成 JavaScript，型別在執行時不存在。
- 在 `hello-react` 裡安裝 `typescript`、建立 `tsconfig.json` 和 `practice` 資料夾，用 `npx tsc` 檢查。
