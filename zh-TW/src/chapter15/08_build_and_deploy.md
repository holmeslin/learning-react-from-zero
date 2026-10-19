# `next build`、`next start` 與部署

## 本集目標

知道建置和啟動正式環境的流程，以及做好的網站可以放在哪裡。

## 正文

### 三個指令

打開 `package.json`，`scripts` 裡有三個你一直在用的指令：

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  }
}
```

| 指令 | 用途 |
| --- | --- |
| `npm run dev` | 開發用。改了程式碼畫面馬上更新，出錯時有詳細的畫面提示。 |
| `npm run build` | 建置。把整個網站編譯好，預先產生所有能預先產生的頁面。 |
| `npm run start` | 啟動**正式環境**的伺服器，使用 `build` 做好的結果。 |

要把網站放上網路，流程永遠是：**先 `build`，再 `start`**。

### `npm run build` 做了什麼

這一章你已經看過它的輸出很多次。它會：

1. 檢查 TypeScript 型別有沒有錯。
2. 編譯程式碼，打包要送給瀏覽器的 JavaScript。
3. 逐一頁面檢查：能不能預先渲染？哪些地方是動態的？有沒有碰到第 1 集那種需要你明確選擇的情況？
4. 印出路由表，告訴你每個頁面是靜態、部分預先渲染還是動態，以及快取的時間。

只要有一個地方出錯，整個建置就失敗，不會產生半成品。**所以每次要上線之前，先在自己電腦上跑一次 `npm run build`。** 開發模式（`npm run dev`）只會在你打開某個頁面的時候，才檢查那個頁面，建置才是完整的檢查。

### `npm run start` 和連接埠

`npm run start` 預設使用 3000 這個連接埠，和 `npm run dev` 一樣。要換一個，在指令後面加上 `-p`：

```bash
npm run start -- -p 3101
```

`--` 的意思是「後面的東西不是給 `npm` 的，是要傳給 `next start` 的」。

啟動之後，網站就是真正的運作狀態了：有快取、有預先渲染、沒有開發模式的提示畫面。這一章你看到的快取、`Cache-Control` 標頭，都只有這個模式才看得到。

### 放在哪裡

Next.js 官方列出幾種部署方式：

| 方式 | 做法 | 功能支援 |
| --- | --- | --- |
| Node.js 伺服器 | 在任何能執行 Node.js 的主機上，執行 `npm run build` 和 `npm run start` | 全部 |
| Docker 容器 | 把網站包成容器，放到任何支援 Docker 的服務 | 全部 |
| 靜態輸出（static export） | 輸出成純 HTML、CSS、JavaScript 檔案，放在任何能放靜態檔案的地方 | 有限 |
| 各平台的轉接器（adapter） | 平台針對 Next.js 做的整合，Vercel 是官方驗證過的平台之一 | 依平台而定 |

**靜態輸出不支援需要伺服器的功能。** 我們的留言板有 Server Function、Route Handler 和 `proxy.ts`，全都需要伺服器，所以不能用靜態輸出。選 Node.js 伺服器、Docker，或是支援 Next.js 的平台。

### Vercel 簡介

**Vercel** 是開發 Next.js 的公司推出的雲端平台。它的優點是跟 Next.js 整合得最好：把程式碼放在 GitHub，在 Vercel 匯入那個專案，它會替你執行 `build`、部署，之後每次推送新的程式碼，就會自動重新部署。實際的操作畫面和流程會改版，請以 [Vercel 的官方文件](https://vercel.com/docs/frameworks/full-stack/nextjs)為準。

其他平台也都有各自的 Next.js 支援，官方文件的部署頁面有完整列表，你可以挑自己習慣的。

### 你的留言板還不能直接上線

部署之前，要先想清楚一件事：**我們把留言存在 `data/messages.json` 這個檔案裡。**

許多雲端平台（尤其是無伺服器的平台）的檔案系統是唯讀的，或是只有暫時性，重新部署或機器換掉，檔案就沒了。官方文件也提醒：在無伺服器的環境，`"use cache"` 記在記憶體裡的快取，可能撐不過兩次請求。

所以要認真上線，你至少需要：

1. 把 JSON 檔換成真正的資料庫。我們第 14 集特別把所有讀寫都集中在 `app/lib/guestbook.ts`，現在只需要改這個檔案。
2. 設定好環境變數（`ADMIN_TOKEN` 之類的），平台都有地方可以填，不要上傳 `.env.local`。
3. 想一想快取：資料庫是共用的，需要讓不同機器之間的快取都能失效，官方文件有相關的設定說明。

這些已經超出這本書的範圍，但你已經知道該往哪個方向找資料了。

### 回頭看

這一章走完，Next.js 的主要概念你都碰過了：

- 檔案路由、`layout` 和 `page`（第 12 章）
- Server Component 和 Client Component（第 13 章）
- Server Function 與表單（第 14 章）
- 渲染、快取與部署（這一章）

## 重點整理

- 上線的流程是先 `npm run build`，再 `npm run start`。
- `npm run build` 是完整的檢查，任何錯誤都會讓它失敗，上線前一定要先跑。
- `npm run start -- -p 連接埠` 可以改連接埠。
- 部署方式有 Node.js 伺服器、Docker、靜態輸出和各平台的轉接器（例如 Vercel）。有 Server Function 的網站不能用靜態輸出。
- JSON 檔不適合部署，正式上線要換成資料庫，並且在平台上設定環境變數。
