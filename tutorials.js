(() => {
  "use strict";
  const tabs = [...document.querySelectorAll(".guide-tab")];
  const guides = [...document.querySelectorAll(".guide")];
  if (!tabs.length) return;
  tabs.forEach(tab => tab.setAttribute("aria-pressed", "false"));
  function selectGuide(id) {
    for (const tab of tabs) tab.setAttribute("aria-pressed", String(tab.dataset.guide === id));
    for (const guide of guides) {
      const selected = guide.id === `guide-${id}`;
      const wasHidden = guide.hidden;
      guide.hidden = !selected;
      if (selected && wasHidden) window.EasyMotion?.reveal(guide, 0, 8);
    }
  }
  for (const tab of tabs) tab.addEventListener("click", () => selectGuide(tab.dataset.guide));
  for (const guide of guides) {
    const buttons = [...guide.querySelectorAll("[data-step]")];
    const panels = [...guide.querySelectorAll(".guide-step")];
    const controls = guide.querySelector(".guide-controls");
    const previous = controls.querySelector("[data-previous]");
    const next = controls.querySelector("[data-next]");
    let current = 0;
    function showStep(index) {
      current = Math.max(0, Math.min(panels.length - 1, index));
      panels.forEach((panel, i) => { panel.hidden = i !== current; });
      buttons.forEach((button, i) => { button.setAttribute("aria-pressed", String(i === current)); });
      previous.disabled = current === 0;
      next.disabled = current === panels.length - 1;
      controls.querySelector("span").textContent = `${current + 1} / ${panels.length}`;
      window.EasyMotion?.reveal(panels[current], 0, 8);
    }
    controls.hidden = false;
    for (const button of buttons) button.addEventListener("click", () => showStep(Number(button.dataset.step)));
    previous.addEventListener("click", () => showStep(current - 1));
    next.addEventListener("click", () => showStep(current + 1));
    showStep(0);
    const copy = guide.querySelector("[data-copy-example]");
    copy.addEventListener("click", async () => {
      const text = guide.querySelector(".guide-example p").textContent;
      const result = guide.querySelector(".copy-result");
      let timeout;
      try {
        if (!navigator.clipboard?.writeText) throw new Error("Clipboard unavailable");
        await Promise.race([navigator.clipboard.writeText(text), new Promise((_, reject) => { timeout = setTimeout(() => reject(new Error("Clipboard permission pending")), 2000); })]);
        result.textContent = "已复制，粘贴到桌面应用即可。";
      } catch {
        const selection = window.getSelection();
        const range = document.createRange(); range.selectNodeContents(guide.querySelector(".guide-example p"));
        selection.removeAllRanges(); selection.addRange(range);
        result.textContent = "浏览器未允许直接复制，已选中文字，请按 Ctrl+C 或长按复制。";
      } finally { clearTimeout(timeout); }
    });
  }
  selectGuide("api");
})();
