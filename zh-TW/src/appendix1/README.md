# 附錄一

這個附錄收的是「不屬於 React 主線，但你遲早會碰到」的東西：

- Tailwind CSS：另一種寫樣式的方式，很多現成的專案都在用。
- ESLint 與 Prettier：自動檢查和整理程式碼的工具。
- 其他 Hook：`useId`、`useLayoutEffect`、`useSyncExternalStore`、`useImperativeHandle`。
- `createPortal`：把元件渲染到畫面的別的地方。
- 舊式的類別元件：你會在舊專案和教學文章裡看到。
- `forwardRef` 等舊寫法：React 19 之前的做法，現在有更簡單的替代。
- 生態系簡介：TanStack Query 和 Zustand。

這些內容和主線互相獨立，想到再來查就好，不需要照順序讀。範例用的是 JavaScript（`.jsx`），在一個 Vite 專案裡執行。`hello-react` 在第 10 章已經改成 TypeScript，所以建議照第 4 章第 1 集的方法另外建一個新的 Vite 專案來試，大多數範例是直接把 `src/App.jsx` 整個換掉。
