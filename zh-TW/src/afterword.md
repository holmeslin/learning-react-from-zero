# 後記

如果你一路讀到這裡，你已經從「第一次在終端機印出一行字」，走到了能用 Next.js 做出一個有資料、有驗證、有快取的網站。這中間你碰過的東西不少：JavaScript、HTML 和 CSS、React 的元件和 state、Effect、Hook、React Router、TypeScript、測試，最後是 Next.js 的 Server Component 和 Server Function。

這本書沒有教完所有東西，也不可能。React 和它周圍的生態系一直在變，這本書用的是 2026 年 10 月的版本，幾年之後，有些細節一定會不一樣。但你學到的底層觀念不會過期：

- **畫面是資料的函式。** state 變了，畫面跟著變，這是 React 最核心的想法。
- **每一個來自外面的資料都不能信。** 不管是表單、網址還是 API 請求，都要在伺服器上檢查。
- **快和新要取捨。** 什麼東西該現算、什麼東西該記起來，沒有標準答案，要看你的使用者在乎什麼。

## 接下來可以往哪裡走

**第一個建議：做一個自己的專案。** 這比再讀十本書都有用。選一件你真正想解決的小事，例如記帳、讀書清單、社團報名，把它做出來。你一定會卡關，而每一次卡關後的查資料，都是在學到書裡沒有的東西。

**需要查資料的時候，去看官方文件。** 這本書裡的每個工具，都有官方文件，而且比任何教學都更新得快：

- React：[react.dev](https://react.dev/)
- Next.js：[nextjs.org/docs](https://nextjs.org/docs)
- React Router：[reactrouter.com](https://reactrouter.com/)
- TypeScript：[typescriptlang.org](https://www.typescriptlang.org/)

**有想深入的方向，可以往這幾個地方走：**

- **資料庫**：留言板用 JSON 檔，終究要換成真正的資料庫。學一點 SQL 和一個資料庫的使用方式。
- **登入與身分驗證**：第 14 章的管理者 cookie 只是示範原理，真實的網站需要正式的登入機制。
- **更多的 React 生態系**：附錄一提到的 TanStack Query、Zustand 等工具，等你遇到它們要解決的問題時，再來學最有感覺。
- **效能與無障礙**：讓網站更快、讓更多人用得了，是 React 之外，但是同樣重要的一門學問。

## 最後

這本書是為了「零基礎」的讀者而寫的。如果有哪一集你覺得講得不清楚、有錯字、有程式碼跑不起來，歡迎到 [GitHub](https://github.com/holmeslin/learning-react-from-zero) 開 issue 告訴我。你卡住的地方，就是這本書下一次修改的地方。

謝謝你讀完。現在，去做點東西吧。
