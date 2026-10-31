(() => {
  "use strict";
  const preference = matchMedia("(prefers-reduced-motion: reduce)");
  const active = new Set();
  function reveal(element, delay = 0, distance = 14) {
    if (!element || preference.matches || !element.animate) return;
    const animation = element.animate([{ opacity: .35, transform: `translateY(${distance}px)` }, { opacity: 1, transform: "translateY(0)" }], { duration: 480, delay, easing: "cubic-bezier(.22,1,.36,1)" });
    active.add(animation);
    animation.finished.catch(() => {}).finally(() => active.delete(animation));
  }
  window.EasyMotion = Object.freeze({ reveal });
  preference.addEventListener?.("change", () => { if (preference.matches) for (const animation of active) animation.cancel(); });
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(entries => {
      let order = 0;
      for (const entry of entries) if (entry.isIntersecting) {
        reveal(entry.target, Math.min(order++ * 45, 135)); observer.unobserve(entry.target);
      }
    }, { threshold: .08 });
    document.querySelectorAll(".section-heading,.app-card,.mode-card,.feature-grid article,.scenario-grid article,.audience-grid article,.suite,.steps article,.comparison-scroll").forEach(element => observer.observe(element));
  }
  const header = document.querySelector(".header");
  const progress = document.createElement("div"); progress.className = "reading-progress"; progress.setAttribute("aria-hidden", "true");
  const bar = document.createElement("span"); progress.append(bar); document.body.append(progress);
  const top = document.createElement("button"); top.type = "button"; top.className = "back-to-top"; top.textContent = "↑"; top.setAttribute("aria-label", "返回顶部"); top.title = "返回顶部"; top.hidden = true; document.body.append(top);
  top.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: preference.matches ? "instant" : "smooth" });
    document.querySelector(".brand")?.focus({ preventScroll: true });
  });
  let pending = false;
  function update() {
    pending = false;
    const height = Math.max(0, document.documentElement.scrollHeight - innerHeight);
    bar.style.transform = `scaleX(${height ? Math.min(1, Math.max(0, scrollY / height)) : 0})`;
    header?.classList.toggle("is-scrolled", scrollY > 20);
    top.hidden = scrollY < 800;
  }
  addEventListener("scroll", () => { if (!pending) { pending = true; requestAnimationFrame(update); } }, { passive: true });
  addEventListener("resize", update);
  if ("ResizeObserver" in window) new ResizeObserver(update).observe(document.body);
  document.querySelectorAll(".faq details").forEach(details => details.addEventListener("toggle", () => { if (details.open) reveal(details.querySelector("p"), 0, 6); }));
  update();
})();
