# 用 Vite 建立專案

## 本集目標

用 Vite 建立一個 React 專案，在瀏覽器裡看到它跑起來。

## 正文

### 為什麼需要「專案」

第 3 章你寫過一個 HTML 檔，用瀏覽器直接打開就能看。但 React 的程式碼有兩件事瀏覽器看不懂：

- 瀏覽器看不懂 JSX，那是 React 特有的寫法，下一集之後會學。
- 一個 React 程式通常會拆成幾十個檔案，而且會用到別人寫好的套件，需要有工具把它們整理在一起。

這些整理工作交給 **Vite**（唸作「vit」，法文的「快」）。它是一個開發工具，做兩件事：

1. 開發的時候，幫你架一個本機的小伺服器，你存檔後瀏覽器會馬上更新。
2. 要發布的時候，把所有檔案打包成瀏覽器看得懂、而且體積小的版本。

你不需要懂它的內部運作，只要會用幾個指令就好。

### 建立專案

打開 VS Code 的終端機（第 1 章教過），確認它站在你的 `learning-react` 資料夾裡，然後輸入：

```bash
npm create vite@latest hello-react -- --template react
```

指令的意思是：「用 Vite 的官方範本產生器，建立一個叫 `hello-react` 的專案，範本選 `react`」。中間的 `--` 是 npm 的規定，用來告訴它後面的參數要交給 Vite，不是給 npm 自己。

如果 npm 問你要不要安裝 `create-vite`，輸入 `y` 再按 Enter。

接著 Vite 會問兩個問題：

```text
Which linter to use?
● Oxlint
○ ESLint
```

這是在問要用哪一種程式碼檢查工具。直接按 Enter 選預設的 Oxlint 就好，它會在你寫出可疑的程式碼時提醒你。

```text
Install with npm and start now?
● Yes / ○ No
```

問你要不要馬上安裝並啟動。直接按 Enter 選 Yes。

Vite 會把專案檔案放進 `hello-react` 資料夾、下載需要的套件，最後啟動開發伺服器，終端機會印出類似這樣的訊息：

```text
  VITE v8.3.4  ready in 383 ms

  ➜  Local:   http://localhost:5173/
```

版本號碼和毫秒數可能和你的不同，沒關係。

### 在瀏覽器看看

用瀏覽器打開 <http://localhost:5173/>，你會看到 Vite 範本的歡迎頁，有 React 和 Vite 的標誌，還有一個寫著「Count is 0」的按鈕。點它幾下，數字會跟著增加。

恭喜，你的第一個 React 程式已經在跑了。這個網址只有你自己的電腦連得到，所以不用擔心別人看到。

### 用 VS Code 打開專案

現在把專案資料夾打開：選單「檔案」→「開啟資料夾」，選 `learning-react` 裡面的 `hello-react`。這樣 VS Code 左邊會直接列出專案的檔案，之後開的終端機也會自動站在專案資料夾裡。

在歡迎頁看到的那行字，是寫在 `src/App.jsx` 這個檔案裡的。打開它，找到 `Get started` 這幾個字，改成別的，例如 `開始吧`，存檔。瀏覽器的畫面會馬上變，不用重新整理。

### 停止與重新啟動

開發伺服器會一直跑著。要停止的話，在終端機按 Ctrl+C。

之後要再開始練習時，在專案資料夾的終端機輸入：

```bash
npm run dev
```

就會重新啟動，網址一樣是 <http://localhost:5173/>。

如果你剛才在第二個問題選了 No，專案只會建好，不會安裝套件也不會啟動。這時候在終端機依序輸入：

```bash
cd hello-react
npm install
npm run dev
```

`npm install` 的工作是把專案需要的套件下載到 `node_modules` 資料夾。這個資料夾會很大、檔案很多，不用管它，也不要去改裡面的東西。

## 重點整理

- Vite 是開發工具，負責架開發伺服器、打包專案。
- 用 `npm create vite@latest hello-react -- --template react` 建立專案。
- `npm run dev` 啟動開發伺服器，在 <http://localhost:5173/> 看結果，按 Ctrl+C 停止。
- 存檔後瀏覽器會自動更新，不用重新整理。
- 從這一章到第 11 章，都在這個 `hello-react` 專案裡練習。
