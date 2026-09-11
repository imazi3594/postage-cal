const SLOP_PX = 12;
const CLICK_GUARD_MS = 400;

type Origin = { x: number; y: number; id: number; target: EventTarget | null };

type PointerLike = {
  pointerType: string;
  button: number;
  clientX: number;
  clientY: number;
  pointerId: number;
  currentTarget: EventTarget;
};

function mark(el: EventTarget | null, cls: string, on: boolean) {
  if (!(el instanceof HTMLElement)) return;
  el.classList.toggle(cls, on);
}

export function setPressDown(el: EventTarget | null, on: boolean) {
  mark(el, "is-down", on);
}

export function pulsePress(el: EventTarget | null) {
  if (!(el instanceof HTMLElement)) return;
  el.classList.remove("is-press");
  void el.offsetWidth;
  el.classList.add("is-press");
}

export function createTapTracker() {
  let origin: Origin | null = null;
  let last = 0;

  function onPointerDown(event: PointerLike) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    origin = { x: event.clientX, y: event.clientY, id: event.pointerId, target: event.currentTarget };
  }

  function onPointerUp(event: PointerLike, action: () => void) {
    const start = origin;
    origin = null;
    if (!start || start.id !== event.pointerId) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (event.currentTarget !== start.target) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (dx * dx + dy * dy > SLOP_PX * SLOP_PX) return;
    last = Date.now();
    action();
  }

  function onPointerCancel() {
    origin = null;
  }

  function onClick(action: () => void) {
    if (Date.now() - last < CLICK_GUARD_MS) return;
    last = Date.now();
    action();
  }

  return { onPointerDown, onPointerUp, onPointerCancel, onClick };
}
