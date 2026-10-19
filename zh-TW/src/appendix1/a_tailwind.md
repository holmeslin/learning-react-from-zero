# Tailwind CSS

## 本集目標

知道 Tailwind CSS 是什麼，並且在 Vite 專案裡用它排出一個按鈕。

## 正文

### 它是什麼

你在第 3 章學的 CSS，是先在 `.css` 檔寫規則，再用選擇器套到元素上。**Tailwind CSS** 的想法相反：它事先準備好幾千個很小的 CSS 類別，每個類別只做一件事，你直接在 `className` 裡把需要的類別組合起來。

例如：

- `text-white` 是白色文字
- `bg-blue-600` 是藍色背景
- `px-4` 是左右各 `1rem` 的內距
- `rounded` 是圓角

寫起來像這樣：

```jsx
<button className="rounded bg-blue-600 px-4 py-2 text-white">加入購物車</button>
```

不用另外取類別名稱、不用在 `.css` 檔和元件之間來回切換。很多人覺得這樣寫比較快，也有人覺得 `className` 會變得很長。兩種看法都合理，是個人和團隊的選擇。

這本書的第二部用的是一般 CSS，不過 Next.js 的專案產生器預設會幫你裝好 Tailwind，所以你很可能會遇到它。

### 在 Vite 專案安裝

在 Vite 專案的資料夾裡執行：

```bash
npm install tailwindcss @tailwindcss/vite
```

然後修改 `vite.config.js`，加上 Tailwind 的外掛：

```js
// vite.config.js
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

最後，把 `src/index.css` 的內容全部換成這一行：

```css
@import "tailwindcss";
```

確認 `src/main.jsx` 有 `import "./index.css"`，Vite 範本預設就有。

### 用用看

把 `src/App.jsx` 換成：

```jsx
// src/App.jsx
export default function App() {
  return (
    <main className="mx-auto max-w-md p-4">
      <h1 className="text-2xl font-bold text-blue-700">小書店</h1>
      <button className="mt-4 rounded bg-blue-600 px-4 py-2 text-white">
        加入購物車
      </button>
    </main>
  );
}
```

執行 `npm run dev`，會看到藍色的標題和藍底白字的圓角按鈕。我們逐個看這些類別：

- `mx-auto`：左右外距自動，讓區塊置中。
- `max-w-md`：最大寬度「中等」。
- `p-4`：四個方向的內距。
- `text-2xl font-bold text-blue-700`：大字、粗體、深藍色。
- `mt-4`：上方外距。

數字不是像素，是 Tailwind 的間距單位，`4` 是 `1rem`。顏色後面的數字（`600`、`700`）代表深淺，越大越深。

### 狀態與響應式

Tailwind 最方便的地方，是只要在類別前面加一個標記，就能指定條件：

```jsx
<button className="bg-blue-600 hover:bg-blue-700 md:px-8">買書</button>
```

- `hover:bg-blue-700`：滑鼠移上去的時候，背景變成 `blue-700`。
- `md:px-8`：螢幕寬度達到「中等」以上的時候，才使用 `px-8`。

在一般 CSS 裡，這需要 `:hover` 和 `@media` 兩個寫法，Tailwind 把它們變成了類別前面的標記。

### 只會產生用到的類別

Tailwind 有幾千個類別，是不是全部都會放進網站？不會。建置的時候，它會掃描你的程式碼，**只產生你真的用到的類別**。用上面的範例建置之後，整份 CSS 只有幾 KB。

這也代表你不能用字串拼接的方式動態產生類別，例如 `` `bg-${color}-600` ``：Tailwind 掃不到完整的類別名稱，就不會產生對應的 CSS。需要依狀態切換樣式時，把完整的類別名稱寫出來：

```jsx
<button className={active ? "bg-blue-600" : "bg-gray-400"}>買書</button>
```

### 要不要用

一個簡單的判斷：

- 如果你的專案已經在用 Tailwind，或是團隊決定用它，就用。
- 如果你還在學 CSS，建議先把 CSS 學好。Tailwind 的類別幾乎都是 CSS 屬性的縮寫，懂 CSS 才看得懂它在做什麼。

## 重點整理

- Tailwind 提供大量單一用途的小類別，直接寫在 `className` 裡組合。
- Vite 專案安裝 `tailwindcss` 和 `@tailwindcss/vite`，在設定檔加外掛，`index.css` 寫 `@import "tailwindcss";`。
- 在類別前面加標記指定條件：`hover:` 管滑鼠移上去、`md:` 管螢幕寬度。
- 它只會產生程式碼裡完整出現過的類別，不能用字串拼接。
