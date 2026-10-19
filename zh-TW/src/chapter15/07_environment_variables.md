# 環境變數

## 本集目標

把密碼、金鑰、設定放在程式碼外面，並且分清楚哪些會被送到瀏覽器。

## 正文

### 為什麼不能寫在程式碼裡

第 14 集我們用了一個環境變數：`ADMIN_TOKEN`。為什麼不直接把暗號寫在程式碼裡？

- 程式碼會被放進版本控制，也許還會公開在網路上，寫在裡面的密碼就等於公開了。
- 開發的電腦、測試的伺服器、正式的伺服器，通常需要不同的設定，不應該為了這個去改程式碼。

**環境變數**（environment variable）就是放在程式碼外面、執行時才讀進來的設定。

### `.env.local`

Next.js 會自動讀取專案根目錄的 `.env` 檔案，把裡面的每一行 `名稱=值`，放進 `process.env`。第 14 集你建立的 `.env.local` 內容是這樣：

```text
ADMIN_TOKEN=demo-secret-token
```

在伺服器端的程式碼裡，用 `process.env.ADMIN_TOKEN` 讀取，你已經在 `deleteMessage` 裡用過了。

有好幾種檔案名稱，各有用途：

| 檔案 | 用途 | 要不要放進版本控制 |
| --- | --- | --- |
| `.env` | 所有環境共用的預設值 | 可以，但不要放祕密 |
| `.env.local` | 你這台電腦自己的設定與祕密 | **不要** |
| `.env.development`、`.env.production` | 只在開發或正式環境使用 | 看內容 |

`create-next-app` 建立的專案，`.gitignore` 裡已經有 `.env*`，所以預設都不會被提交。**絕對不要把含有祕密的 `.env` 檔案放進 Git。**

如果同一個名稱出現在好幾個地方，優先順序是：真正的系統環境變數 → `.env.development.local` 或 `.env.production.local` → `.env.local` → `.env.development` 或 `.env.production` → `.env`。

### 預設只有伺服器看得到

這是最重要的規則：**環境變數預設只存在於伺服器。** 瀏覽器裡的程式碼讀 `process.env.ADMIN_TOKEN` 是讀不到的，這是故意的，不然你的祕密就送到每個使用者的電腦上了。

我實際檢查過：執行 `npm run build` 之後，在 `.next/static`（會送給瀏覽器的檔案）裡搜尋 `demo-secret-token`，一個結果都沒有。

### 要給瀏覽器看：`NEXT_PUBLIC_`

如果有些設定需要在 Client Component 裡使用，例如網站名稱，名稱必須以 `NEXT_PUBLIC_` 開頭。在 `.env.local` 加兩行：

```text
NEXT_PUBLIC_SITE_NAME=我的留言板
GREETING=哈囉
```

做個頁面來觀察。新增 `app/env/site-name.tsx`：

```tsx
// app/env/site-name.tsx
"use client";

export function SiteName() {
  return <p>網站名稱：{process.env.NEXT_PUBLIC_SITE_NAME}</p>;
}
```

再新增 `app/env/page.tsx`：

```tsx
// app/env/page.tsx
import { connection } from "next/server";
import { Suspense } from "react";
import { SiteName } from "./site-name";

async function RuntimeGreeting() {
  await connection();
  return <p>執行時問候：{process.env.GREETING}</p>;
}

export default function EnvPage() {
  return (
    <main>
      <h1>環境變數</h1>
      <SiteName />
      <p>建置時問候：{process.env.GREETING}</p>
      <Suspense fallback={<p>讀取中……</p>}>
        <RuntimeGreeting />
      </Suspense>
    </main>
  );
}
```

這個頁面有三種讀取環境變數的方式，結果不太一樣。先 `npm run build`，再用「**換掉環境變數**」的方式啟動伺服器：

```bash
GREETING=換成別的 NEXT_PUBLIC_SITE_NAME=換成別的名字 npm run start
```

（Windows 的 PowerShell 寫法不同，可以改用 `$env:GREETING="換成別的"`，再執行 `npm run start`。）

打開 `/env`，我得到的結果是：

```text
網站名稱：我的留言板
建置時問候：哈囉
執行時問候：換成別的
```

三個答案各有原因：

1. **`NEXT_PUBLIC_SITE_NAME`：建置時就被寫死了。** 這種變數會在 `npm run build` 的時候，被直接替換成值，塞進送給瀏覽器的 JavaScript 裡。建置之後再改環境變數，沒有任何作用。所以這種變數要在建置時就設定好。我也確認過：「我的留言板」這幾個字真的出現在 `.next/static` 的檔案裡。
2. **「建置時問候」：這是靜態的部分，建置時就算好了。** 它不在 `RuntimeGreeting` 裡面，屬於靜態外殼，和第 1 集的規則相同，建置之後不會再變。
3. **「執行時問候」：每次請求時才讀。** 在 `await connection()` 之後讀取 `process.env`，讀的是伺服器**啟動時**的值，所以拿到「換成別的」。這代表同一份建置結果，可以放在不同環境，使用不同的設定。

### 該怎麼選

- **祕密、密碼、金鑰**：不加 `NEXT_PUBLIC_`，只在伺服器端使用，並且在動態的程式碼裡（Server Function、`connection()` 之後）讀取。
- **不是祕密的公開設定**（網站名稱、公開的分析 ID）：可以加 `NEXT_PUBLIC_`，但要記得它是建置時決定的。
- 絕對不要把祕密加上 `NEXT_PUBLIC_`，那等於把它印在每個人的網頁上。

## 重點整理

- 環境變數放在 `.env.local`，不放進版本控制，在伺服器用 `process.env.名稱` 讀取。
- 預設只有伺服器看得到；要給瀏覽器用，名稱必須以 `NEXT_PUBLIC_` 開頭。
- `NEXT_PUBLIC_` 開頭的變數在建置時就被寫死，建置之後再改不會生效。
- 沒有 `NEXT_PUBLIC_` 的變數，如果是在請求時才執行的程式碼裡讀取，會讀到伺服器啟動時的值。
- 祕密絕對不要加 `NEXT_PUBLIC_`。
