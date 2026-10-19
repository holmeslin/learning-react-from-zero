// mdBook 內建的 highlight.js 沒有 tsx，book.js 跑完後把這些區塊改用 typescript 重新上色
document.querySelectorAll("code.language-tsx").forEach((block) => {
  block.classList.replace("language-tsx", "language-typescript");
  hljs.highlightBlock(block);
});
