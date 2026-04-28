const listeners = new Set();

const state = Object.freeze({
  entries: [],
  selectedTags: [],
  selectedPeriods: [],
  view: "home",
  theme: "light",
  srs: {},
});

let current = state;

export function getState() {
  return current;
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function freezeNext(next) {
  return Object.freeze({
    ...next,
    entries: Object.freeze([...(next.entries || [])]),
    selectedTags: Object.freeze([...(next.selectedTags || [])]),
    selectedPeriods: Object.freeze([...(next.selectedPeriods || [])]),
    srs: Object.freeze({ ...(next.srs || {}) }),
  });
}

export function setState(patch) {
  const next = typeof patch === "function" ? patch(current) : { ...current, ...patch };
  current = freezeNext(next);
  listeners.forEach((fn) => fn(current));
}

export function filteredEntries(st = current) {
  const { entries, selectedTags } = st;
  return entries.filter((e) => {
    const tagsOk = !selectedTags.length || selectedTags.some((t) => (e.tags || []).includes(t));
    const periodsOk = !st.selectedPeriods.length || st.selectedPeriods.includes(e.timePeriod);
    return tagsOk && periodsOk;
  });
}
