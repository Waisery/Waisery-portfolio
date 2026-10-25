// One wheel gesture advances one scene, including trackpad momentum tails.
export function createWheelIntent({ threshold = 70, quietPeriod = 220 } = {}) {
  let lastTime = -Infinity;
  let total = 0;
  let consumed = false;
  return (delta, time, locked = false) => {
    if (time - lastTime > quietPeriod) { total = 0; consumed = false; }
    lastTime = time;
    if (locked) { consumed = true; total = 0; return 0; }
    if (consumed) return 0;
    if (Math.sign(total) !== Math.sign(delta)) total = 0;
    total += delta;
    if (Math.abs(total) < threshold) return 0;
    consumed = true;
    return Math.sign(total);
  };
}

export function canScrollWithin(target, boundary, direction) {
  for (let element = target; element && boundary.contains(element); element = element.parentElement) {
    const overflow = getComputedStyle(element).overflowY;
    if (/(auto|scroll)/.test(overflow) && element.scrollHeight > element.clientHeight + 2) {
      if (direction > 0 && element.scrollTop + element.clientHeight < element.scrollHeight - 2) return true;
      if (direction < 0 && element.scrollTop > 2) return true;
    }
    if (element === boundary) break;
  }
  return false;
}
