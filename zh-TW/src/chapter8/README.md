# React 19 的新功能

前面幾章學的 `useState`、`useEffect`、`useReducer`，在 React 18 就有了。這一章要介紹 React 19 帶來的新工具，它們主要解決兩類問題：

- **表單與非同步操作**：送出表單、顯示「送出中」、處理錯誤、讓畫面先樂觀地更新，這些事情以前要自己寫一堆 state 和 Effect。React 19 把它們內建成 Action（動作）與一組 Hook。
- **讓畫面保持順暢**：資料載入中怎麼辦、切換頁面時要不要先顯示舊的內容、輸入文字時怎麼不卡頓。

這一章依序是：

1. `<form action>`、`useActionState`、`useFormStatus`、`useOptimistic`：表單與動作。
2. `use`、Suspense、錯誤邊界：讀取非同步資料，以及載入中與出錯時該顯示什麼。
3. `useTransition`、`useDeferredValue`：控制更新的優先順序。
4. 幾個小而實用的新寫法：ref 直接當 prop、在元件裡寫 `<title>`。
5. `<Activity>`：隱藏元件時保留它的狀態。

這些功能在你現在安裝的 React 19.3 都已經是正式功能，可以放心使用。

範例一樣放在 `hello-react` 專案的 `src/App.jsx`。用到 `/users.json` 的範例，需要先建立第 6 章第 8 集的 `public/users.json`。
