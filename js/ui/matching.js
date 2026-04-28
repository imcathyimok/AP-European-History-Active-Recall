import { getState } from "../store.js";
import { shuffle } from "../utils.js";

const MATCH_BANK = [
  { id: "p1-1", cause: "Italian city-state wealth supported arts patronage", effect: "Humanism spread through Renaissance education and art", timePeriod: "Period 1: 1450-1648", difficulty: "easy", tags: ["politics", "culture"] },
  { id: "p1-2", cause: "The printing press lowered the cost of books", effect: "Religious and political ideas circulated faster", timePeriod: "Period 1: 1450-1648", difficulty: "easy", tags: ["technology", "religion"] },
  { id: "p1-3", cause: "Clerical abuses and indulgence sales angered believers", effect: "The Protestant Reformation expanded across Europe", timePeriod: "Period 1: 1450-1648", difficulty: "easy", tags: ["religion", "society"] },
  { id: "p1-4", cause: "Oceanic exploration created global trade routes", effect: "Commercial capitalism gained strength in Europe", timePeriod: "Period 1: 1450-1648", difficulty: "medium", tags: ["economy", "exploration"] },
  { id: "p1-5", cause: "Religious conflict devastated central Europe", effect: "The Peace of Westphalia reinforced state sovereignty", timePeriod: "Period 1: 1450-1648", difficulty: "medium", tags: ["war", "politics"] },
  { id: "p2-1", cause: "Mercantilist rivalry strained diplomatic relations", effect: "Frequent dynastic and commercial wars erupted", timePeriod: "Period 2: 1648-1815", difficulty: "medium", tags: ["economy", "war"] },
  { id: "p2-2", cause: "Enlightenment thinkers criticized absolute rule", effect: "Constitutional and rights-based politics gained support", timePeriod: "Period 2: 1648-1815", difficulty: "easy", tags: ["ideas", "politics"] },
  { id: "p2-3", cause: "French fiscal crisis and social inequality worsened", effect: "The French Revolution began in 1789", timePeriod: "Period 2: 1648-1815", difficulty: "easy", tags: ["politics", "society"] },
  { id: "p2-4", cause: "Napoleonic warfare redrew European borders", effect: "The Congress of Vienna pursued conservative stability", timePeriod: "Period 2: 1648-1815", difficulty: "medium", tags: ["war", "diplomacy"] },
  { id: "p2-5", cause: "Expanding public sphere encouraged debate", effect: "Political clubs and newspapers influenced reform", timePeriod: "Period 2: 1648-1815", difficulty: "medium", tags: ["ideas", "society"] },
  { id: "p3-1", cause: "Steam power and mechanization transformed factories", effect: "Industrial output and urbanization accelerated", timePeriod: "Period 3: 1815-1914", difficulty: "easy", tags: ["technology", "economy"] },
  { id: "p3-2", cause: "Harsh factory conditions provoked labor unrest", effect: "Trade unions and social legislation expanded", timePeriod: "Period 3: 1815-1914", difficulty: "easy", tags: ["society", "economy"] },
  { id: "p3-3", cause: "Nationalist movements challenged old empires", effect: "German and Italian unification reshaped Europe", timePeriod: "Period 3: 1815-1914", difficulty: "easy", tags: ["nationalism", "politics"] },
  { id: "p3-4", cause: "Imperial competition sought resources and markets", effect: "European colonial expansion intensified overseas", timePeriod: "Period 3: 1815-1914", difficulty: "medium", tags: ["imperialism", "economy"] },
  { id: "p3-5", cause: "Realpolitik diplomacy relied on alliances", effect: "Bloc tensions increased before 1914", timePeriod: "Period 3: 1815-1914", difficulty: "medium", tags: ["diplomacy", "war"] },
  { id: "p4-1", cause: "Alliance systems and nationalism escalated crises", effect: "World War I broke out in 1914", timePeriod: "Period 4: 1914-Present", difficulty: "easy", tags: ["war", "nationalism"] },
  { id: "p4-2", cause: "The Treaty of Versailles left unresolved grievances", effect: "Revisionist and extremist politics gained momentum", timePeriod: "Period 4: 1914-Present", difficulty: "medium", tags: ["politics", "war"] },
  { id: "p4-3", cause: "The Great Depression destabilized societies", effect: "Authoritarian regimes gained support in parts of Europe", timePeriod: "Period 4: 1914-Present", difficulty: "easy", tags: ["economy", "society"] },
  { id: "p4-4", cause: "Appeasement failed to stop expansionist powers", effect: "World War II expanded across Europe", timePeriod: "Period 4: 1914-Present", difficulty: "easy", tags: ["war", "diplomacy"] },
  { id: "p4-5", cause: "Postwar devastation required reconstruction", effect: "European cooperation and integration deepened", timePeriod: "Period 4: 1914-Present", difficulty: "medium", tags: ["economy", "diplomacy"] },
];

export function renderMatching(root) {
  const st = getState();
  const activePeriods = st.selectedPeriods.length
    ? st.selectedPeriods
    : [...new Set(MATCH_BANK.map((item) => item.timePeriod))];
  const allPairs = MATCH_BANK.filter((item) => {
    const periodOk = activePeriods.includes(item.timePeriod);
    const tagsOk = !st.selectedTags.length || st.selectedTags.some((tag) => (item.tags || []).includes(tag));
    return periodOk && tagsOk;
  });
  if (!allPairs.length) {
    root.innerHTML = `<div class="panel">No matching questions in current time-period filters.</div>`;
    return;
  }
  let causeOrder = [];
  let currentSet = [];

  root.innerHTML = `
    <div class="panel">
      <h3>Causal Matching</h3>
      <p>Drag causes up/down to match the fixed effect order on the right.</p>
      <p id="matchScore">Score: --/5</p>
      <div id="matchWrap" class="match-grid match-grid-aligned">
        <div class="match-head cause"><h4>Causes</h4></div>
        <div class="match-head effect"><h4>Effects</h4></div>
        <div id="matchRows" class="match-rows" role="list"></div>
      </div>
      <div class="controls">
        <button id="checkMatch">Check Answer</button>
        <button id="resetMatch">Restart</button>
        <button id="nextSet">Next Set</button>
      </div>
    </div>`;

  const rowsEl = root.querySelector("#matchRows");
  const scoreLabel = root.querySelector("#matchScore");
  let checked = false;

  function pickSet() {
    currentSet = shuffle(allPairs).slice(0, 5);
    causeOrder = shuffle(currentSet.map((pair) => pair.id));
    checked = false;
    scoreLabel.textContent = "Score: --/5";
  }

  function scoreNow() {
    return causeOrder.reduce((acc, causeId, idx) => (causeId === currentSet[idx]?.id ? acc + 1 : acc), 0);
  }

  function renderColumns() {
    rowsEl.innerHTML = "";
    const causeById = new Map(currentSet.map((pair) => [pair.id, pair]));

    currentSet.forEach((pair, idx) => {
      const row = document.createElement("div");
      row.className = "match-row";
      row.dataset.row = String(idx);
      row.setAttribute("role", "listitem");

      const causeId = causeOrder[idx];
      const causePair = causeById.get(causeId);
      const causeCard = document.createElement("div");
      causeCard.className = "timeline-card match-cause";
      causeCard.draggable = true;
      causeCard.dataset.id = causeId;
      causeCard.textContent = causePair?.cause || "(missing cause)";
      if (checked) causeCard.classList.add(causeId === currentSet[idx]?.id ? "correct" : "wrong");
      causeCard.ondragstart = (e) => e.dataTransfer.setData("text/plain", causeId);

      const effectCard = document.createElement("div");
      effectCard.className = "match-item match-effect";
      effectCard.dataset.id = pair.id;
      effectCard.textContent = `${idx + 1}. ${pair.effect}`;
      if (checked) effectCard.classList.add(causeOrder[idx] === pair.id ? "correct" : "wrong");

      row.ondragover = (e) => e.preventDefault();
      row.ondrop = (e) => {
        e.preventDefault();
        const id = e.dataTransfer.getData("text/plain");
        const from = causeOrder.indexOf(id);
        const to = idx;
        if (from < 0 || from === to) return;
        const next = [...causeOrder];
        next.splice(from, 1);
        next.splice(to, 0, id);
        causeOrder = next;
        checked = false;
        renderColumns();
      };

      row.append(causeCard, effectCard);
      rowsEl.append(row);
    });
    if (checked) scoreLabel.textContent = `Score: ${scoreNow()}/5`;
    else scoreLabel.textContent = "Score: --/5";
  }

  // Drop handling is row-based to keep effects aligned one-per-row.

  root.querySelector("#checkMatch").onclick = () => {
    checked = true;
    renderColumns();
  };
  root.querySelector("#resetMatch").onclick = () => {
    causeOrder = shuffle(currentSet.map((pair) => pair.id));
    checked = false;
    renderColumns();
  };
  root.querySelector("#nextSet").onclick = () => {
    pickSet();
    renderColumns();
  };

  pickSet();
  renderColumns();
}
