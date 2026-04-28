import { loadData } from "./dataLoader.js";
import { loadSrsState } from "./srs.js";
import { filteredEntries, getState, setState, subscribe } from "./store.js";
import { byId, virtualizeList } from "./utils.js";
import { renderFlashcard } from "./ui/flashcard.js";
import { renderTimeline } from "./ui/timeline.js";
import { renderMatching } from "./ui/matching.js";
import { renderMapRecall } from "./ui/mapRecall.js";
import { renderOpenRecall } from "./ui/openRecall.js";
import { renderChallenge } from "./ui/challenge.js";

const views = {
  home: byId("homeView"),
  flashcard: byId("flashcardView"),
  timeline: byId("timelineView"),
  matching: byId("matchingView"),
  mapRecall: byId("mapRecallView"),
  openRecall: byId("openRecallView"),
  challenge: byId("challengeView"),
  pdf: byId("pdfView"),
  about: byId("aboutView"),
};

const HOME_HERO_IMAGE = "./assets/images/home-hero.png";

const PERIOD_BANNER = [
  "Period 1: 1450-1648",
  "Period 2: 1648-1815",
  "Period 3: 1815-1914",
  "Period 4: 1914-Present",
];

/** Flashcard backdrops only: author-uploaded art in `assets/images/`. Excludes `home-hero.png` and `assets/icons/citru-study.png` (branding). */
const FLASHCARD_IMAGE_POOL = [
  "./assets/images/flash-1.png",
  "./assets/images/flash-2.png",
  "./assets/images/flash-3.png",
  "./assets/images/flash-4.png",
  "./assets/images/flash-5.png",
  "./assets/images/flash-6.png",
  "./assets/images/flash-7.png",
];

function inferPeriod(year) {
  if (year >= 1450 && year <= 1648) return PERIOD_BANNER[0];
  if (year > 1648 && year <= 1815) return PERIOD_BANNER[1];
  if (year > 1815 && year <= 1914) return PERIOD_BANNER[2];
  return PERIOD_BANNER[3];
}

function hashNumber(seed) {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h;
}

function uniqueTags(tags = []) {
  const seen = new Set();
  return tags
    .map((tag) => String(tag || "").trim())
    .filter((tag) => {
      const lower = tag.toLowerCase();
      return tag
        && !/^period\b/i.test(tag)
        && lower !== "development focus"
        && lower !== "cause focus"
        && lower !== "consequence focus";
    })
    .filter((tag) => {
      const key = tag.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

function stripFocusTerms(text = "") {
  return String(text)
    .replace(/\s*[-|:]\s*(cause focus|development focus|consequence focus)\s*$/gi, "")
    .replace(/\s*\((cause focus|development focus|consequence focus)\)\s*$/gi, "")
    .trim();
}

function inferTopicTags(entry) {
  const text = `${entry?.title?.short || ""} ${entry?.title?.full || ""} ${entry?.content?.summary || ""}`.toLowerCase();
  const tags = [];
  if (/war|battle|wwi|wwii|military|treaty/.test(text)) tags.push("war");
  if (/reform|revolution|rights|constitution|state|monarchy|parliament/.test(text)) tags.push("politics");
  if (/church|religion|reformation|catholic|protestant/.test(text)) tags.push("religion");
  if (/trade|industry|economic|market|factory|labor/.test(text)) tags.push("economy");
  if (/society|women|class|urban|peasant|education/.test(text)) tags.push("society");
  if (/science|intellectual|enlightenment|humanism|printing/.test(text)) tags.push("ideas");
  if (!tags.length) tags.push("general");
  return tags;
}

function dedupeUrls(urls) {
  const seen = new Set();
  return urls.filter((u) => {
    if (!u || seen.has(u)) return false;
    seen.add(u);
    return true;
  });
}

function normalizeEntries(entries) {
  return entries.map((e) => {
    const timePeriod = e.timePeriod || inferPeriod(e.date?.year || 1900);
    const topicTags = inferTopicTags(e);
    const pool = [...FLASHCARD_IMAGE_POOL];
    const seed = hashNumber(String(e.id || e.title?.short || "seed"));
    const primary = pool[seed % pool.length];
    const imageCandidates = dedupeUrls([
      primary,
      ...pool.filter((url) => url !== primary),
    ]);
    return {
      ...e,
      title: {
        ...(e.title || {}),
        short: stripFocusTerms(e.title?.short || ""),
        full: stripFocusTerms(e.title?.full || e.title?.short || ""),
      },
      timePeriod,
      tags: uniqueTags(topicTags),
      content: {
        ...(e.content || {}),
        openQuestion: stripFocusTerms(e.content?.openQuestion || ""),
      },
      media: {
        ...(e.media || {}),
        image: primary,
        imageCandidates,
      },
    };
  });
}

function renderHome() {
  const entries = filteredEntries(getState());
  const uniq = [];
  const seen = new Set();
  entries.forEach((e) => {
    const key = `${e.title.short}|${e.date?.year || "n.d."}`;
    if (seen.has(key)) return;
    seen.add(key);
    uniq.push(e);
  });
  const ticker = uniq.slice(0, 8).map((e) => `${e.title.short} (${e.date?.year || "n.d."})`).join("  •  ");
  const hero = HOME_HERO_IMAGE;
  views.home.innerHTML = `
    <div class="panel">
      <h2>AP Euro Practice Hub</h2>
      <p class="meta-label">Role prompt: think like an AP historian - build claims with concrete evidence.</p>
      <img src="${hero}" alt="AP Euro visual" style="width:100%;max-height:260px;object-fit:cover;object-position:50% 50%;border:1px solid #111" />
      <div class="ticker"><div class="ticker-track">${ticker || `0 entries for current filters. Adjust tag/time period.`}</div></div>
      <p>Current filtered entries: <strong>${entries.length}</strong></p>
      <p class="dropcap">Select a practice mode from the sidebar and use timed retrieval drills for faster memory consolidation.</p>
      <p>Use Source PDF view to read the original document (with its embedded images/pages).</p>
    </div>`;
}

function renderPdfView() {
  views.pdf.innerHTML = `
    <div class="panel">
      <h3>AP Euro Source PDF Viewer</h3>
      <iframe src="./assets/images/ap-euro-guide.pdf" title="AP Euro PDF" style="width:100%;height:75vh;border:1px solid #111"></iframe>
    </div>`;
}

function renderAbout() {
  views.about.innerHTML = `
    <div class="panel about-layout">
      <h2>AP European History Active Recall</h2>
      <p>Built for active recall, chronological reasoning, causation analysis, and AP-style argument practice.</p>
      <p><strong>Created by Cathy Li as part of the Citru-study Project</strong></p>
      <p>Feel free to reach out to <a href="mailto:cathyzimingli19@gmail.com">cathyzimingli19@gmail.com</a> if you have any suggestions for improvement.</p>
    </div>`;
}

function setView(view) {
  setState({ view });
  Object.entries(views).forEach(([k, el]) => el.classList.toggle("active", k === view));
  document.querySelectorAll(".nav-btn").forEach((b) => b.classList.toggle("active", b.dataset.view === view));
  if (view === "flashcard") renderFlashcard(views.flashcard);
  if (view === "timeline") renderTimeline(views.timeline);
  if (view === "matching") renderMatching(views.matching);
  if (view === "mapRecall") renderMapRecall(views.mapRecall);
  if (view === "openRecall") renderOpenRecall(views.openRecall);
  if (view === "challenge") renderChallenge(views.challenge, filteredEntries(getState()));
  if (view === "pdf") renderPdfView();
  if (view === "about") renderAbout();
  if (view === "home") renderHome();
}

function renderTagFilter() {
  const st = getState();
  const tagCount = new Map();
  st.entries.forEach((e) => (e.tags || []).forEach((tag) => tagCount.set(tag, (tagCount.get(tag) || 0) + 1)));
  const tags = [...tagCount.entries()]
    .filter(([tag, count]) => !/^period\b/i.test(tag) && count < st.entries.length)
    .map(([tag]) => tag)
    .sort();
  const periods = [...new Set(st.entries.map((e) => e.timePeriod).filter(Boolean))];

  virtualizeList(byId("tagFilter"), tags, (tag) => {
    const row = document.createElement("label");
    row.className = "tag-item";
    row.innerHTML = `<input type="checkbox" ${st.selectedTags.includes(tag) ? "checked" : ""} /> <span>${tag}</span>`;
    row.querySelector("input").onchange = (e) => {
      const selected = e.target.checked ? [...st.selectedTags, tag] : st.selectedTags.filter((t) => t !== tag);
      setState({ selectedTags: selected });
      renderTagFilter();
      setView(getState().view);
    };
    return row;
  }, 32);

  virtualizeList(byId("periodFilter"), periods, (period) => {
    const row = document.createElement("label");
    row.className = "tag-item";
    row.innerHTML = `<input type="checkbox" ${st.selectedPeriods.includes(period) ? "checked" : ""} /> <span>${period}</span>`;
    row.querySelector("input").onchange = (e) => {
      const selected = e.target.checked ? [...st.selectedPeriods, period] : st.selectedPeriods.filter((p) => p !== period);
      setState({ selectedPeriods: selected });
      renderTagFilter();
      setView(getState().view);
    };
    return row;
  }, 32);
}

function setupGlobalUi() {
  byId("sidebarToggle").onclick = () => {
    byId("sidebar").classList.toggle("collapsed");
    byId("app").classList.toggle("sidebar-hidden");
  };
  document.querySelectorAll(".nav-btn").forEach((btn) => (btn.onclick = () => setView(btn.dataset.view)));
  byId("themeToggle").onclick = () => {
    const next = getState().theme === "light" ? "dark" : "light";
    document.body.dataset.theme = next;
    setState({ theme: next });
  };
  document.addEventListener("keydown", (e) => {
    if (e.key === "?") byId("helpOverlay").classList.toggle("hidden");
    if (e.key === "Escape") {
      byId("helpOverlay").classList.add("hidden");
      setView("home");
    }
  });
  const form = byId("emailSignupForm");
  const feedback = byId("emailFeedback");
  if (sessionStorage.getItem("har-email-signed") === "1") form.classList.add("hidden");
  form.onsubmit = (e) => {
    e.preventDefault();
    const email = byId("emailInput").value.trim();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    feedback.textContent = ok ? "Thanks! We'll be in touch." : "Please enter a valid email.";
    if (ok) {
      sessionStorage.setItem("har-email-signed", "1");
      setTimeout(() => form.classList.add("hidden"), 500);
    }
  };
}

async function bootstrap() {
  setupGlobalUi();
  const [entriesRaw, srs] = await Promise.all([loadData("./data/data.json"), loadSrsState()]);
  setState({ entries: normalizeEntries(entriesRaw), srs, theme: "light" });
  document.body.dataset.theme = "light";
  subscribe(() => { if (getState().view === "home") renderHome(); });
  renderTagFilter();
  setView("home");
}

bootstrap().catch((err) => {
  views.home.innerHTML = `<div class="panel">Failed to load data. ${err.message}</div>`;
});
