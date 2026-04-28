export const byId = (id) => document.getElementById(id);

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function formatDate(date) {
  if (!date || typeof date.year !== "number") return "Unknown date";
  const era = date.bce ? " BCE" : " CE";
  if (date.month && date.day) return `${date.year}${era} (${date.month}/${date.day})`;
  return `${date.year}${era} (Year only)`;
}

export function normalizeText(s) {
  return (s || "").toLowerCase().replace(/\s+/g, " ").trim();
}

export function distanceKm(lat1, lng1, lat2, lng2) {
  const toRad = (d) => (d * Math.PI) / 180;
  const r = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * r * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function virtualizeList(container, items, renderItem, itemHeight = 34) {
  if (items.length <= 50) {
    container.innerHTML = "";
    items.forEach((item, idx) => container.append(renderItem(item, idx)));
    return;
  }
  container.innerHTML = "";
  container.style.height = "380px";
  container.style.overflow = "auto";
  const spacer = document.createElement("div");
  spacer.style.height = `${items.length * itemHeight}px`;
  spacer.style.position = "relative";
  container.append(spacer);
  const draw = () => {
    [...spacer.children].forEach((c) => c.remove());
    const start = Math.max(0, Math.floor(container.scrollTop / itemHeight) - 4);
    const end = Math.min(items.length, start + Math.ceil(container.clientHeight / itemHeight) + 10);
    for (let i = start; i < end; i += 1) {
      const el = renderItem(items[i], i);
      el.style.position = "absolute";
      el.style.top = `${i * itemHeight}px`;
      el.style.left = "0";
      el.style.right = "0";
      spacer.append(el);
    }
  };
  container.addEventListener("scroll", draw);
  draw();
}
