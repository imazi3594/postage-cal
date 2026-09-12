export function flyAmountToStamp(from: DOMRect, toEl: HTMLElement, label: string): void {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const to = toEl.getBoundingClientRect();
  if (to.width < 2 || to.height < 2) return;

  toEl.classList.add("stamp-awaiting");

  const ghost = document.createElement("div");
  ghost.className = "fly-amount";
  ghost.setAttribute("aria-hidden", "true");
  ghost.textContent = label;
  const x0 = from.left + from.width / 2;
  const y0 = from.top + from.height / 2;
  const x1 = to.left + to.width / 2;
  const y1 = to.top + to.height / 2;
  ghost.style.left = `${x0}px`;
  ghost.style.top = `${y0}px`;
  ghost.style.width = `${from.width}px`;
  ghost.style.height = `${from.height}px`;
  document.body.appendChild(ghost);

  const dx = x1 - x0;
  const dy = y1 - y0;
  const sx = to.width / Math.max(from.width, 1);
  const sy = to.height / Math.max(from.height, 1);
  const lift = Math.min(24, Math.abs(dy) * 0.1);

  ghost
    .animate(
      [
        { transform: "translate(-50%, -50%) scale(1)", opacity: 1, offset: 0 },
        {
          transform: `translate(-50%, -50%) translate(${dx * 0.42}px, ${dy * 0.32 - lift}px) scale(1.06)`,
          opacity: 1,
          offset: 0.42,
        },
        {
          transform: `translate(-50%, -50%) translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`,
          opacity: 0.35,
          offset: 1,
        },
      ],
      { duration: 540, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "forwards" },
    )
    .finished.then(() => {
      ghost.remove();
      toEl.classList.remove("stamp-awaiting");
      toEl.classList.remove("stamp-pop");
      void toEl.offsetWidth;
      toEl.classList.add("stamp-pop");
      toEl.addEventListener("animationend", () => toEl.classList.remove("stamp-pop"), { once: true });
    })
    .catch(() => {
      ghost.remove();
      toEl.classList.remove("stamp-awaiting");
    });
}
