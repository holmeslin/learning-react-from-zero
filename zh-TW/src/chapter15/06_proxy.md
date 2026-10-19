# `proxy.ts`

## 本集目標

在請求抵達頁面之前，先攔下來檢查、改寫或導向。

## 正文

### 它是什麼

有時候你想在**所有（或某幾類）請求**進到頁面之前，先做一件事：把舊網址導向新網址、替回應加上標頭、記錄每一次請求。一個一個頁面去寫太麻煩，這時候就用 **`proxy.ts`**。

> 如果你看過比較舊的 Next.js 教學，會看到一個叫 `middleware.ts` 的檔案。Next.js 16 把它改名成 `proxy.ts`，函式名稱也從 `middleware` 變成 `proxy`，功能是一樣的。新專案請用 `proxy.ts`。

### 第一個 `proxy.ts`

在專案的根目錄（跟 `app` 資料夾同一層）新增 `proxy.ts`：

```ts
// proxy.ts
import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/book") {
    return NextResponse.redirect(new URL("/guestbook", request.url));
  }

  const response = NextResponse.next();
  response.headers.set("x-guestbook", "hello");
  return response;
}

export const config = {
  matcher: ["/book", "/guestbook/:path*"],
};
```

四個部分：

- **函式 `proxy`**：每個符合條件的請求都會先經過它，它接收請求（`NextRequest`），要回傳一個回應。
- **`NextResponse.redirect(...)`**：直接導向別的網址，請求就不會繼續往下走。
- **`NextResponse.next()`**：放行，讓請求繼續去找它本來要去的頁面。我們在放行的回應上加一個標頭 `x-guestbook`。
- **`config.matcher`**：只對這些網址生效。`"/guestbook/:path*"` 的意思是 `/guestbook` 以及它底下的所有路徑。

### 用 `curl` 試試看

重新 `npm run build`，路由表的最後多了一行：

```text
ƒ Proxy (Middleware)
```

再 `npm run start`。我實際測的結果如下：

```bash
curl -s -D - -o /dev/null localhost:3000/book
```

```text
HTTP/1.1 307 Temporary Redirect
location: /guestbook
```

`/book` 被導向 `/guestbook`。

```bash
curl -s -D - -o /dev/null localhost:3000/guestbook
```

```text
HTTP/1.1 200 OK
x-guestbook: hello
```

`/guestbook` 的回應多了我們加的標頭。再測 `/guestbook/new` 也有。而首頁 `/` 和 `/api/messages` 不在 `matcher` 裡，它們的回應沒有這個標頭。

### `matcher` 很重要

如果沒有寫 `matcher`，`proxy` 會對**所有**請求執行，包括圖片、CSS 和 JavaScript 檔案，那會拖慢整個網站，而且可能不小心擋住它們。永遠要寫 `matcher`，指定你真正需要的網址。

### 把它當作最後手段

`proxy` 在每個請求前執行，所以它應該又快又簡單：導向、改標頭、簡單的判斷。官方文件也建議把它當作最後手段：能用頁面、Server Function 或設定檔解決的事，就不要放進 `proxy`。

### 重要：不要只靠 `proxy` 做權限

你可能會想：既然 `proxy` 可以擋人，那我只要在這裡檢查登入，其他地方就不用檢查了吧？

不行。官方文件特別提醒：Server Function 是用 `POST` 請求送到「使用它的那個頁面的網址」，所以如果你的 `matcher` 排除了某個網址，那個網址上的 Server Function 也會跟著略過 `proxy`；或是日後有人把 Server Function 搬到別的頁面，保護就悄悄消失了。

所以，這和第 14 章的結論一樣：**每個 Server Function 自己要檢查權限。** `proxy` 可以當作第一道防線，但不能是唯一一道。

## 重點整理

- `proxy.ts` 放在專案根目錄，匯出一個叫 `proxy` 的函式，在請求抵達頁面之前執行。
- 用 `NextResponse.redirect()` 導向，用 `NextResponse.next()` 放行並可以修改回應。
- 一定要寫 `config.matcher`，只對需要的網址生效。
- Next.js 16 之前它叫 `middleware.ts`。
- 官方建議把它當最後手段，只做輕量的處理，而且不能取代 Server Function 裡的權限檢查。
