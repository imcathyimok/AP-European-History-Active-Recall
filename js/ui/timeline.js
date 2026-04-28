import { filteredEntries, getState } from "../store.js";
import { formatDate, shuffle } from "../utils.js";

function sortableValue(date) {
  if (!date) return Number.MAX_SAFE_INTEGER;
  return (date.year || 0) * 10000 + (date.month || 0) * 100 + (date.day || 0);
}

function cleanTitle(text = "") {
  return text
    .replace(/\s*[-|:]\s*(cause focus|development focus|consequence focus)\s*$/i, "")
    .replace(/\s*\((cause focus|development focus|consequence focus)\)\s*$/i, "")
    .trim();
}

export function renderTimeline(root) {
  const pool = filteredEntries(getState()).filter((e) => e.date);
  if (pool.length < 5) {
    root.innerHTML = `<div class="panel">Need at least 5 dated entries for timeline. Current filter has ${pool.length}.</div>`;
    return;
  }
  const setSize = 5;
  const totalSets = 10;
  let activeSet = 0;
  let sample = [];
  const zones = [];
  let checked = false;

  function buildSets(entries) {
    const normalized = entries.map((entry) => ({ ...entry, _clean: cleanTitle(entry.title.short).toLowerCase() }));
    const unique = [];
    const seen = new Set();
    normalized.forEach((item) => {
      const key = item._clean;
      if (!key || seen.has(key)) return;
      seen.add(key);
      unique.push(item);
    });
    const result = [];
    for (let i = 0; i < totalSets; i += 1) {
      result.push(shuffle(unique).slice(0, setSize));
    }
    return result;
  }
  const allSets = buildSets(pool);

  root.innerHTML = `
    <div class="panel">
      <h3>Timeline Construction</h3>
      <p>10 different sets, each with 5 events.</p>
      <label>Set:
        <select id="timelineSet">
          <option value="0">Set 1</option>
          <option value="1">Set 2</option>
          <option value="2">Set 3</option>
          <option value="3">Set 4</option>
          <option value="4">Set 5</option>
          <option value="5">Set 6</option>
          <option value="6">Set 7</option>
          <option value="7">Set 8</option>
          <option value="8">Set 9</option>
          <option value="9">Set 10</option>
        </select>
      </label>
      <div id="bank" class="timeline-dropzone"></div>
      <div class="timeline-axis">
        <div id="axis" class="timeline-dropzone"></div>
      </div>
      <div class="controls"><button id="checkTimeline">Check</button><button id="resetTimeline">Reset</button></div>
    </div>`;

  const bank = root.querySelector("#bank");
  const axis = root.querySelector("#axis");

  function loadSet(idx) {
    activeSet = idx;
    sample = [...(allSets[idx] || [])];
    checked = false;
    bank.innerHTML = "";
    axis.innerHTML = "";
    sample.forEach((s) => bank.append(makeCard(s)));
  }

  function makeCard(entry) {
    const el = document.createElement("div");
    el.className = "timeline-card";
    el.draggable = true;
    el.dataset.id = entry.id;
    el.textContent = cleanTitle(entry.title.short);
    el.ondragstart = (e) => e.dataTransfer.setData("text/plain", entry.id);
    return el;
  }

  function insertAtPointer(zone, moving, x) {
    const siblings = [...zone.querySelectorAll(".timeline-card")].filter((n) => n !== moving);
    const next = siblings.find((node) => x < node.getBoundingClientRect().left + node.offsetWidth / 2);
    if (next) zone.insertBefore(moving, next);
    else zone.append(moving);
  }

  loadSet(activeSet);
  root.querySelector("#timelineSet").onchange = (e) => {
    loadSet(Number(e.target.value));
  };
  [axis, bank].forEach((zone) => {
    zone.ondragover = (e) => e.preventDefault();
    zone.ondrop = (e) => {
      e.preventDefault();
      const id = e.dataTransfer.getData("text/plain");
      const el = root.querySelector(`[data-id="${id}"]`);
      if (el) insertAtPointer(zone, el, e.clientX);
      if (zone === axis && !zones.includes(id)) zones.push(id);
    };
  });

  root.querySelector("#checkTimeline").onclick = () => {
    checked = true;
    const placedIds = [...axis.querySelectorAll(".timeline-card")].map((n) => n.dataset.id);
    const placedEntries = placedIds.map((id) => sample.find((e) => e.id === id));
    const sorted = [...placedEntries].sort((a, b) => sortableValue(a.date) - sortableValue(b.date));
    const allCorrect = JSON.stringify(placedEntries.map((e) => e?.id)) === JSON.stringify(sorted.map((e) => e?.id));
    placedEntries.forEach((entry, i) => {
      const node = axis.querySelector(`[data-id="${entry.id}"]`);
      const ok = sorted[i]?.id === entry.id;
      node.classList.remove("correct", "shake", "wrong");
      if (ok) {
        node.classList.add("correct");
        node.textContent = allCorrect
          ? `${cleanTitle(entry.title.short)} (${formatDate(entry.date)})`
          : cleanTitle(entry.title.short);
      } else {
        node.classList.add("shake", "wrong");
      }
    });
  };

  root.querySelector("#resetTimeline").onclick = () => {
    checked = false;
    axis.innerHTML = "";
    bank.innerHTML = "";
    shuffle([...sample]).forEach((s) => bank.append(makeCard(s)));
  };

  document.addEventListener("keydown", (e) => {
    if (getState().view !== "timeline") return;
    if (e.code === "ArrowRight" || e.code === "ArrowLeft") {
      const cards = [...bank.querySelectorAll(".timeline-card"), ...axis.querySelectorAll(".timeline-card")];
      if (cards.length && !checked) cards[0].focus?.();
    }
  });
}
