import { filteredEntries, getState } from "../store.js";
import { normalizeText, shuffle } from "../utils.js";

/** Unsplash cache-bust URLs in data sometimes used `&v=` without `?`, which breaks the path. */
function normalizeMediaUrl(url) {
  if (!url || typeof url !== "string") return url;
  return url.replace(/\/(photo-[a-zA-Z0-9-]+)&(v=\d+)/g, "/$1?$2");
}

// Build card prompts from current filtered entries and selected mode.
function entryById(entries, id) {
  return entries.find((e) => e.id === id);
}

function buildCards(entries, reverseEnabled = false, mode = "whoWhat") {
  const cards = [];
  entries.forEach((e) => {
    const front = e.content?.flashcard?.front || e.title?.full || e.title?.short;
    const back = e.content?.flashcard?.back || e.content?.summary || "No answer provided.";
    if (mode === "whoWhat") cards.push({ id: `${e.id}:ww`, entryId: e.id, front, back, type: "qa" });
    if (mode === "concept") cards.push({ id: `${e.id}:concept`, entryId: e.id, front: e.title.short, back, type: "qa" });
    (e.causes || []).forEach((cid) => {
      const cause = entryById(entries, cid);
      if (cause && mode === "causeEffect") {
        cards.push({
          id: `${cause.id}->${e.id}:ce`,
          entryId: e.id,
          front: `Cause: ${cause.title.full}`,
          back: `Effect: ${e.title.full}`,
          type: "qa",
        });
      }
    });
    if (e.content?.cloze) cards.push({ id: `${e.id}:cloze`, entryId: e.id, cloze: e.content.cloze, type: "cloze" });
  });
  const withReverse = reverseEnabled
    ? cards.flatMap((c) => (c.type === "qa" ? [c, { ...c, id: `${c.id}:rev`, front: c.back, back: c.front }] : [c]))
    : cards;
  return shuffle(withReverse);
}

function clozePrompt(clozeText) {
  const answers = [...clozeText.matchAll(/\{\{(.*?)\}\}/g)].map((m) => m[1]);
  const prompt = clozeText.replace(/\{\{(.*?)\}\}/g, "_____");
  return { prompt, answers };
}

export function renderFlashcard(root) {
  const st = getState();
  const entries = filteredEntries(st);
  const today = new Date().toISOString().slice(0, 10);
  let idx = 0;
  let revealed = false;
  let mode = "whoWhat";
  let reviewType = "standard";
  let reverseEnabled = false;
  let cards = buildCards(entries, reverseEnabled, mode).filter((c) => {
    const rec = st.srs[c.id];
    const due = !rec || rec.nextDue <= today;
    const typeOk = reviewType === "cloze" ? c.type === "cloze" : c.type === "qa";
    return due && typeOk;
  });

  function recomputeCards(preserveCardId) {
    const nextCards = buildCards(entries, reverseEnabled, mode).filter((x) => {
      const rec = getState().srs[x.id];
      const due = !rec || rec.nextDue <= today;
      const typeOk = reviewType === "cloze" ? x.type === "cloze" : x.type === "qa";
      return due && typeOk;
    });
    cards = nextCards;
    if (!cards.length) {
      idx = 0;
      revealed = false;
      return;
    }
    if (!preserveCardId) {
      idx = 0;
      revealed = false;
      return;
    }
    const exact = cards.findIndex((c) => c.id === preserveCardId);
    if (exact >= 0) {
      idx = exact;
      return;
    }
    // If reverse toggle removed/added a paired card, try preserving the same entry.
    const prevEntryId = preserveCardId.split(":")[0]?.split("->").slice(-1)[0];
    const byEntry = cards.findIndex((c) => c.entryId === prevEntryId);
    if (byEntry >= 0) idx = byEntry;
    else idx = 0;
    revealed = false;
  }

  const rerender = () => {
    if (!cards.length) {
      root.innerHTML = `<div class="panel">No cards in this filter.</div>`;
      return;
    }
    const c = cards[idx];
    const entry = entries.find((e) => e.id === c.entryId);
    const candidates = [entry?.media?.image, ...(entry?.media?.imageCandidates || [])]
      .filter(Boolean)
      .map(normalizeMediaUrl);
    const backdrop = `style="position:absolute;inset:0;background-size:cover;background-position:center;opacity:${revealed ? 0.35 : 0.16};z-index:0;pointer-events:none"`;
    if (c.type === "cloze") {
      const { prompt, answers } = clozePrompt(c.cloze);
      root.innerHTML = `
        <div class="panel" style="position:relative;overflow:hidden">
          <div id="cardBackdrop" ${backdrop}></div>
          <h3>Flashcards - Cloze</h3>
          <div class="controls">
            <select id="reviewType"><option value="standard">Standard Flashcard</option><option value="cloze">Cloze Fill-in</option></select>
            <select id="fcMode"><option value="whoWhat">Who/What</option><option value="causeEffect">Cause/Effect</option><option value="concept">Concept</option></select>
            <label><input id="reverseToggle" type="checkbox" ${reverseEnabled ? "checked" : ""}/> Reverse review</label>
          </div>
          <p>${prompt}</p>
          <input id="clozeInput" placeholder="Type missing text" />
          <button id="showCloze">Submit (Enter) / Show Answer</button>
          <p id="clozeFeedback"></p>
          <small>Expected: ${revealed ? answers.join(", ") : "hidden until reveal"}</small>
          <div class="controls"><button id="prevCard">&larr;</button><button id="nextCard">&rarr;</button></div>
        </div>`;
      const backdropEl = root.querySelector("#cardBackdrop");
      let idxCandidate = 0;
      const testImage = new Image();
      const fallback = candidates[candidates.length - 1];
      if (fallback) backdropEl.style.backgroundImage = `url('${fallback}')`;
      const tryLoad = () => {
        const target = candidates[idxCandidate];
        if (!target) {
          if (fallback) backdropEl.style.backgroundImage = `url('${fallback}')`;
          return;
        }
        testImage.src = target;
      };
      testImage.onload = () => {
        backdropEl.style.backgroundImage = `url('${testImage.src}')`;
      };
      testImage.onerror = () => {
        idxCandidate += 1;
        tryLoad();
      };
      tryLoad();
      root.querySelector("#showCloze").onclick = () => {
        revealed = true;
        const got = normalizeText(root.querySelector("#clozeInput").value);
        const expected = normalizeText(answers.join(" "));
        root.querySelector("#clozeFeedback").textContent = got && got === expected ? "Match (normalized)." : "Self-assess and compare.";
        rerender();
      };
      root.querySelector("#clozeInput").addEventListener("keydown", (e) => {
        if (e.key === "Enter") root.querySelector("#showCloze").click();
      });
    } else {
      root.innerHTML = `
        <div class="panel" style="position:relative;overflow:hidden">
          <div id="cardBackdrop" ${backdrop}></div>
          <h3 style="position:relative;z-index:1">Flashcards (${mode})</h3>
          <div class="controls">
            <select id="reviewType"><option value="standard">Standard Flashcard</option><option value="cloze">Cloze Fill-in</option></select>
            <select id="fcMode"><option value="whoWhat">Who/What</option><option value="causeEffect">Cause/Effect</option><option value="concept">Concept</option></select>
            <label><input id="reverseToggle" type="checkbox" ${reverseEnabled ? "checked" : ""}/> Reverse review</label>
          </div>
          <div class="flashcard-wrap" style="position:relative;z-index:1">
            <div class="flashcard ${revealed ? "flipped" : ""}" id="flashcard">
              <div class="face front"><div><small>FRONT</small><h3>${c.front}</h3></div></div>
              <div class="face back ${revealed ? "revealed" : "obscured"}"><div><small>BACK</small><h3>${c.back}</h3></div></div>
            </div>
          </div>
          <div class="controls" style="position:relative;z-index:1">
            <button id="prevCard">&larr;</button>
            <button id="nextCard">&rarr;</button>
          </div>
        </div>`;
      const backdropEl = root.querySelector("#cardBackdrop");
      let idxCandidate = 0;
      const testImage = new Image();
      const fallback = candidates[candidates.length - 1];
      if (fallback) backdropEl.style.backgroundImage = `url('${fallback}')`;
      const tryLoad = () => {
        const target = candidates[idxCandidate];
        if (!target) {
          if (fallback) backdropEl.style.backgroundImage = `url('${fallback}')`;
          return;
        }
        testImage.src = target;
      };
      testImage.onload = () => {
        backdropEl.style.backgroundImage = `url('${testImage.src}')`;
      };
      testImage.onerror = () => {
        idxCandidate += 1;
        tryLoad();
      };
      tryLoad();
      root.querySelector("#flashcard").onclick = () => { revealed = !revealed; rerender(); };
    }

    const modeSel = root.querySelector("#fcMode");
    const reviewSel = root.querySelector("#reviewType");
    modeSel.value = mode;
    reviewSel.value = reviewType;
    reviewSel.onchange = () => {
      reviewType = reviewSel.value;
      recomputeCards();
      rerender();
    };
    modeSel.onchange = () => {
      mode = modeSel.value;
      recomputeCards();
      rerender();
    };
    root.querySelector("#reverseToggle").onchange = (e) => {
      const currentId = cards[idx]?.id;
      reverseEnabled = e.target.checked;
      // Preserve the current card when toggling reverse review.
      recomputeCards(currentId);
      rerender();
    };
    root.querySelector("#prevCard").onclick = () => { idx = (idx - 1 + cards.length) % cards.length; revealed = false; rerender(); };
    root.querySelector("#nextCard").onclick = () => { idx = (idx + 1) % cards.length; revealed = false; rerender(); };
  };

  const onKey = (e) => {
    if (getState().view !== "flashcard") return;
    const current = cards[idx];
    if (e.code === "Space" && current?.type === "qa") {
      e.preventDefault();
      revealed = !revealed;
      rerender();
    }
    if (e.code === "ArrowLeft") root.querySelector("#prevCard")?.click();
    if (e.code === "ArrowRight") root.querySelector("#nextCard")?.click();
  };
  document.addEventListener("keydown", onKey);
  rerender();
}
