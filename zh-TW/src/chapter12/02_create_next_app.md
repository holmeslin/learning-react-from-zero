# 建立 Next.js 專案

## 本集目標

用 `create-next-app` 建立專案，啟動開發伺服器，在瀏覽器看到第一個 Next.js 頁面。

## 正文

### 確認 Node.js

先在終端機確認 Node.js 的版本：

```bash
node -v
```

只要看到 `v20.9` 或更新的版本就可以，用第 1 章裝的 `v24` 當然沒問題。

### 建立專案

進到你放練習專案的資料夾，執行：

```bash
npx create-next-app@latest hello-next
```

`create-next-app` 是 Next.js 官方的專案產生器，`hello-next` 是專案名稱，也是它會建立的資料夾名稱。第一次執行時，npx 可能會問你要不要安裝 `create-next-app`，按 `y` 同意就好。

接著它會問你要不要使用建議的預設值：

```text
Would you like to use the recommended Next.js defaults?
    Yes, use recommended defaults - TypeScript, ESLint, No React Compiler, Tailwind CSS, No src/ directory, App Router, Cache Components, AGENTS.md
    No, reuse previous settings
    No, customize settings - Choose your own preferences
```

中間那個「No, reuse previous settings」只有在你之前建過 Next.js 專案時才會出現，第一次執行只會看到另外兩個選項。

選第一個：**Yes, use recommended defaults**。這個選擇會幫你開啟：

- **TypeScript**：第二部全部用它。
- **ESLint**：自動檢查程式碼的工具，附錄一有介紹。
- **App Router**：Next.js 現在主要的路由方式，用 `app` 資料夾決定網址。本書只教這一種。
- **Cache Components**：Next.js 的快取機制，第 15 章會講。現在只要知道它是開著的就好。
- **Tailwind CSS**：一種寫 CSS 的方式。本書不用它，下一集會說明怎麼處理。

沒有開的是 React Compiler 和 `src/` 資料夾。

如果你想跳過這個問答，可以在指令最後加上 `--yes`，它會直接採用預設值：

```bash
npx create-next-app@latest hello-next --yes
```

安裝大約需要一兩分鐘。看到 `Success! Created hello-next` 就表示完成了。

### 啟動開發伺服器

```bash
cd hello-next
npm run dev
```

終端機會印出類似這樣的訊息：

```text
▲ Next.js 16.4.2 (Turbopack)
- Local:         http://localhost:3000
- Network:       http://192.168.0.10:3000
✓ Ready in 167ms
```

`Local` 後面的網址就是你的網站。用瀏覽器打開 <http://localhost:3000>，會看到 Next.js 的範本首頁。

`localhost` 的意思是「這一台電腦自己」，所以只有你看得到。後面的 `3000` 是**連接埠**（port），可以想成同一台電腦上的不同門牌號碼。

開發伺服器開著的時候，你每次存檔，瀏覽器就會自動更新畫面。要關掉它，回到終端機按 Ctrl+C。

### 三個指令

打開專案裡的 `package.json`，找到 `scripts`：

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  }
}
```

- `npm run dev`：開發用。存檔就更新，方便寫程式，但比較慢。
- `npm run build`：把網站建置成可以上線的版本。這個指令也會幫你檢查型別和一些錯誤。
- `npm run start`：用 `build` 的結果啟動伺服器，也就是「正式上線的樣子」。要先 `build` 才能 `start`。

接下來的每一集，我們都在 `npm run dev` 開著的情況下寫程式。到了某幾集，我們會用 `npm run build` 確認結果。

### 範本裡的 `AGENTS.md`

你會在專案裡看到一個 `AGENTS.md`。它是給 AI 寫程式工具看的說明，提醒它們 Next.js 的寫法常有變動，要先看官方文件。它不影響你的網站，留著或刪掉都可以。

## 重點整理

- 用 `npx create-next-app@latest 專案名稱` 建立專案，問答時選建議的預設值。
- `npm run dev` 啟動開發伺服器，網址是 <http://localhost:3000>。
- `npm run build` 建置上線版本，`npm run start` 啟動上線版本。
- 預設值包含 TypeScript、ESLint、App Router、Cache Components 和 Tailwind CSS。
