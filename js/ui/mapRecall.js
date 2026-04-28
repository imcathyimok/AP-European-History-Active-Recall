import { filteredEntries, getState } from "../store.js";
import { distanceKm, normalizeText, shuffle } from "../utils.js";

export async function renderMapRecall(root) {
  const entries = shuffle(filteredEntries(getState()).filter((e) => e.location?.lat && e.location?.lng));
  if (!entries.length) {
    root.innerHTML = `<div class="panel">No location-enabled entries for current filters.</div>`;
    return;
  }
  let currentIdx = 0;
  let current = entries[currentIdx];
  let mode = "click";

  root.innerHTML = `
    <div class="panel">
      <h3>Map Recall</h3>
      <p>Tip: use mouse wheel / trackpad to zoom in and out.</p>
      <div class="controls">
        <button id="modeA">Mode A: Click location</button>
        <button id="modeB">Mode B: Name region</button>
        <select id="mapQuestionSelect"></select>
      </div>
      <p id="mapPrompt"></p>
      <div id="mapStage" class="map-stage"></div>
      <div class="controls">
        <input id="regionAnswer" class="hidden" placeholder="Type event/place name" />
        <button id="submitRegion" class="hidden">Submit</button>
        <button id="reviewMapAnswer">Review Answer</button>
      </div>
      <p id="mapFeedback"></p>
    </div>`;

  const map = window.L.map("mapStage", { zoomControl: true, attributionControl: false }).setView([20, 15], 2);
  window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {}).addTo(map);
  const feedback = root.querySelector("#mapFeedback");
  const prompt = root.querySelector("#mapPrompt");

  const sel = root.querySelector("#mapQuestionSelect");
  entries.slice(0, 40).forEach((e, i) => {
    const opt = document.createElement("option");
    opt.value = String(i);
    opt.textContent = `${i + 1}. ${e.title.short}`;
    sel.append(opt);
  });
  sel.onchange = () => {
    currentIdx = Number(sel.value);
    current = entries[currentIdx];
    renderMode();
  };

  function renderMode() {
    feedback.textContent = "";
    root.querySelector("#regionAnswer").classList.toggle("hidden", mode !== "name");
    root.querySelector("#submitRegion").classList.toggle("hidden", mode !== "name");
    prompt.textContent = mode === "click"
      ? `Where was "${current.title.full}"? Click map with tolerance radius.`
      : `Name the event/place near highlighted region: ${current.location.name}.`;
    map.eachLayer((layer) => {
      if (layer instanceof window.L.Marker || layer instanceof window.L.Circle) map.removeLayer(layer);
    });
    if (mode === "name") {
      window.L.circle([current.location.lat, current.location.lng], { radius: 90000, color: "#d7a756" }).addTo(map);
    }
  }
  renderMode();

  map.on("click", (evt) => {
    if (mode !== "click") return;
    const d = distanceKm(evt.latlng.lat, evt.latlng.lng, current.location.lat, current.location.lng);
    const ok = d <= 250;
    window.L.marker(evt.latlng).addTo(map);
    if (ok) {
      window.L.circleMarker([current.location.lat, current.location.lng], {
        radius: 9,
        color: "#0f7a21",
        fillColor: "#0f7a21",
        fillOpacity: 0.8,
      }).addTo(map);
    }
    feedback.textContent = ok
      ? `Correct (${Math.round(d)}km). ${current.title.short}`
      : `Incorrect (${Math.round(d)}km away). Try again.`;
  });

  root.querySelector("#submitRegion").onclick = () => {
    const val = normalizeText(root.querySelector("#regionAnswer").value);
    const ok = val.includes(normalizeText(current.title.short)) || val.includes(normalizeText(current.location.name));
    if (ok) {
      window.L.circleMarker([current.location.lat, current.location.lng], {
        radius: 9,
        color: "#0f7a21",
        fillColor: "#0f7a21",
        fillOpacity: 0.8,
      }).addTo(map);
    }
    feedback.textContent = ok ? "Correct region/name association." : `Not quite. Expected relation: ${current.title.short}`;
  };
  root.querySelector("#reviewMapAnswer").onclick = () => {
    window.L.circleMarker([current.location.lat, current.location.lng], {
      radius: 9,
      color: "#0f7a21",
      fillColor: "#0f7a21",
      fillOpacity: 0.8,
    }).addTo(map);
    const region = current.location.country || current.location.region || current.timePeriod || "Unknown region";
    feedback.textContent = `Answer review: ${current.title.full} at ${current.location.name}, ${region} (${current.location.lat.toFixed(2)}, ${current.location.lng.toFixed(2)}).`;
  };
  root.querySelector("#modeA").onclick = () => { mode = "click"; renderMode(); };
  root.querySelector("#modeB").onclick = () => { mode = "name"; renderMode(); };
}
