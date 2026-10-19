# 清除函式

## 本集目標

用 Effect 的清除函式，在元件消失或 Effect 重新執行之前，把前一次的設定收拾乾淨。

## 正文

### 開了就要關

很多 Effect 會「開啟」某個東西：計時器、事件監聽、伺服器連線。如果只開不關，這些東西會一直留著，越積越多。

Effect 可以回傳一個函式，叫做**清除函式**（cleanup function），React 會在適當的時機呼叫它：

```jsx
import { useEffect, useState } from "react";

function Clock() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => {
      console.log("清除計時器");
      clearInterval(id);
    };
  }, []);

  return <p>現在是 {now.toLocaleTimeString("zh-TW")}</p>;
}

export default function App() {
  const [show, setShow] = useState(true);

  return (
    <>
      <button onClick={() => setShow(!show)}>
        {show ? "隱藏" : "顯示"}時鐘
      </button>
      {show && <Clock />}
    </>
  );
}
```

畫面上的時鐘每秒更新一次。按「隱藏時鐘」，`Clock` 從畫面上消失，Console 會印出：

```text
清除計時器
```

（頁面剛載入時，Console 其實就已經先印過一次「清除計時器」了，那是 `<StrictMode>` 刻意做的檢查，第 6 集會說明。）

沒有這個清除函式的話，`Clock` 都不在畫面上了，計時器還會繼續每秒呼叫 `setNow`，白白浪費資源。

### 清除函式什麼時候執行

有兩個時機：

1. **元件從畫面上消失的時候**。
2. **Effect 因為依賴改變而要重新執行之前**：React 會先呼叫上一次的清除函式，再執行新的 Effect。

所以 Effect 的完整生命週期是「設定 → 清除 → 設定 → 清除 → ……」，每一次設定都有對應的清除。你可以把清除函式想成：「這個 Effect 做的事，要怎麼完整地撤銷」。

### 另一個例子：事件監聽

監聽瀏覽器視窗大小的變化，也是同樣的模式：

```jsx
import { useEffect, useState } from "react";

export default function App() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return <p>視窗寬度：{width} px</p>;
}
```

拖動瀏覽器視窗的邊緣，數字會跟著變。`addEventListener` 和 `removeEventListener` 成對出現，這是最容易記的寫法：**設定的那行，下面對應一行清除**。

### 不是每個 Effect 都需要清除

像第 3 集的 `document.title = ...`，改完就改完了，沒有什麼需要收拾的，就不用寫清除函式。判斷方法：問自己「這個 Effect 有沒有開啟什麼，需要在之後關掉？」

## 重點整理

- Effect 可以回傳一個清除函式，用來撤銷 Effect 做過的事。
- 清除函式在元件消失時，以及 Effect 重新執行之前被呼叫。
- 計時器、事件監聽、連線這類「開啟」的東西，一定要有對應的清除。
- 設定和清除成對寫：`addEventListener` 配 `removeEventListener`，`setInterval` 配 `clearInterval`。
