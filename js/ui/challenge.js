const LEQ_SET = [
  ["Sample LEQ #1", "Evaluate the extent to which European integration changed state sovereignty in 1945-2000."],
  ["Sample LEQ #2", "Evaluate the extent to which Cold War politics influenced domestic policy in Europe from 1945 to 1991."],
  ["Sample LEQ #3", "Evaluate the extent to which authoritarian regimes transformed social life in Europe in the interwar years."],
  ["Sample LEQ #4", "Evaluate the extent to which industrialization changed class relations in Europe in 1750-1900."],
  ["Sample LEQ #5", "Evaluate the most significant cause of the French Revolution in 1789."],
  ["Sample LEQ #6", "Evaluate the extent to which nationalism drove political transformation in Europe from 1815 to 1914."],
  ["Sample LEQ #7", "Evaluate the extent to which Enlightenment thought challenged absolutism in 1689-1815."],
  ["Sample LEQ #8", "Evaluate the most significant effects of the Protestant Reformation on state power."],
  ["Sample LEQ #9", "Evaluate the extent to which imperial rivalry contributed to the outbreak of World War I."],
  ["Sample LEQ #10", "Evaluate continuity and change in women’s rights in Europe from 1850 to 2000."],
  ["Sample LEQ #11", "Evaluate the extent to which scientific advances transformed intellectual life from 1540 to 1700."],
  ["Sample LEQ #12", "Evaluate the extent to which economic crises shaped politics in Europe from 1918 to 1939."],
  ["Sample LEQ #13", "Evaluate the extent to which the Congress of Vienna created lasting stability in Europe."],
  ["Sample LEQ #14", "Evaluate the most significant consequence of the Age of Exploration for Europe."],
  ["Sample LEQ #15", "Evaluate the extent to which decolonization reshaped Europe’s global role after 1945."],
];

const LEQ_RESPONSE_BANK = {
  "Sample LEQ #1": [
    "Thesis: Integration significantly pooled sovereignty in trade and law, but core security and fiscal powers remained largely national.",
    "Evidence: ECSC/EEC institutions and single market rules constrained unilateral policy choices.",
    "Evidence: Maastricht expanded supranational coordination, yet defense and taxation stayed mostly intergovernmental.",
    "Complexity: Compare Western integration momentum with uneven Eastern adoption after 1989.",
  ],
  "Sample LEQ #2": [
    "Thesis: Cold War politics deeply shaped domestic governance, especially security, welfare, and dissent control.",
    "Evidence: Eastern Bloc one-party states used censorship, secret police, and planned economies.",
    "Evidence: Western states expanded welfare and anti-communist consensus politics.",
    "Complexity: Impact changed over time, strongest in early Cold War and weaker after detente.",
  ],
  "Sample LEQ #3": [
    "Thesis: Authoritarian regimes transformed social life through propaganda and youth mobilization, but traditional hierarchies persisted.",
    "Evidence: Fascist and Nazi schooling, media, and rituals reshaped daily political culture.",
    "Evidence: Gender policy reinforced conservative family roles despite modern mass mobilization.",
    "Complexity: Compare coercion-based compliance with genuine ideological participation.",
  ],
  "Sample LEQ #4": [
    "Thesis: Industrialization substantially restructured class relations by expanding wage labor and bourgeois influence.",
    "Evidence: Factory systems concentrated workers and sharpened class conflict in urban centers.",
    "Evidence: Middle-class political influence grew through reform and administrative expansion.",
    "Complexity: State reforms softened but did not eliminate structural class inequality.",
  ],
  "Sample LEQ #5": [
    "Thesis: Fiscal crisis was the most decisive cause because it turned social tension into political collapse.",
    "Evidence: Debt from war and tax exemptions burdened the Third Estate disproportionately.",
    "Evidence: Bread shortages and Estates-General deadlock escalated mobilization in 1789.",
    "Complexity: Enlightenment ideas mattered, but they required fiscal breakdown to become revolutionary.",
  ],
  "Sample LEQ #6": [
    "Thesis: Nationalism was a major driver of transformation, especially in unification movements and mass politics.",
    "Evidence: German and Italian unifications relied on nationalist mobilization.",
    "Evidence: National identity reshaped legitimacy away from dynastic order.",
    "Complexity: Nationalism could stabilize states and simultaneously intensify interstate rivalry.",
  ],
  "Sample LEQ #7": [
    "Thesis: Enlightenment thought significantly challenged absolutism by redefining political authority as contractual.",
    "Evidence: Locke and Montesquieu provided arguments against unchecked sovereign power.",
    "Evidence: Reform monarchies selectively adopted Enlightenment language while preserving hierarchy.",
    "Complexity: Challenge was strongest ideologically; institutional change remained uneven.",
  ],
  "Sample LEQ #8": [
    "Thesis: The Reformation most significantly strengthened territorial rulers' control over religion and governance.",
    "Evidence: State churches and confiscated church lands increased royal administrative reach.",
    "Evidence: Confessionalization tied political obedience to controlled religious structures.",
    "Complexity: Religious fragmentation also produced long-term instability and conflict.",
  ],
  "Sample LEQ #9": [
    "Thesis: Imperial rivalry was a major contributor to WWI by deepening alliance tension and naval competition.",
    "Evidence: Colonial disputes and naval races amplified distrust among great powers.",
    "Evidence: Crisis escalation occurred within a preconditioned climate of imperial competition.",
    "Complexity: Imperialism interacted with nationalism and alliance systems rather than acting alone.",
  ],
  "Sample LEQ #10": [
    "Thesis: Women's rights showed substantial long-term expansion with periodic setbacks and uneven implementation.",
    "Evidence: Suffrage and legal reforms transformed formal citizenship in many states.",
    "Evidence: Second-wave gains expanded rights in education, work, and family law.",
    "Complexity: Progress varied by regime type, class, and religious-political context.",
  ],
  "Sample LEQ #11": [
    "Thesis: Scientific advances transformed intellectual life by privileging observation, method, and mathematical explanation.",
    "Evidence: Copernican and Galilean models challenged inherited cosmology.",
    "Evidence: Baconian empiricism and new academies changed standards of proof.",
    "Complexity: Religious institutions resisted selectively rather than rejecting all inquiry.",
  ],
  "Sample LEQ #12": [
    "Thesis: Economic crises strongly shaped interwar politics by eroding confidence in liberal institutions.",
    "Evidence: Unemployment and inflation empowered extremist movements and authoritarian solutions.",
    "Evidence: Crisis management strategies diverged across regimes with major political consequences.",
    "Complexity: Structural trauma from WWI amplified crisis effects but did not determine identical outcomes.",
  ],
  "Sample LEQ #13": [
    "Thesis: The Congress of Vienna produced durable macro-stability but not permanent suppression of nationalism.",
    "Evidence: Balance-of-power diplomacy prevented continent-wide war for decades.",
    "Evidence: Interventionist conservatism contained but could not eliminate liberal-national pressures.",
    "Complexity: Stability was real at interstate scale, unstable at social-ideological scale.",
  ],
  "Sample LEQ #14": [
    "Thesis: The most significant consequence was Europe's integration into global commercial-imperial systems.",
    "Evidence: Atlantic trade, bullion flows, and colonial circuits reshaped European economies.",
    "Evidence: State capacity and naval power expanded through overseas competition.",
    "Complexity: Gains for some regions coexisted with violence and dependency elsewhere.",
  ],
  "Sample LEQ #15": [
    "Thesis: Decolonization significantly reduced formal imperial power while forcing Europe to redefine global influence.",
    "Evidence: Imperial retrenchment redirected policy toward economic blocs and diplomacy.",
    "Evidence: Migration and postcolonial ties reshaped domestic politics and identity.",
    "Complexity: Influence persisted through finance, alliances, and institutions despite imperial decline.",
  ],
};

function responseFor(source, prompt) {
  const base = LEQ_RESPONSE_BANK[source] || [
    "Thesis: Make a precise argument about extent or significance and define your criteria.",
    "Evidence 1: Use a concrete policy/event and explain why it supports your claim.",
    "Evidence 2: Add a second specific case from a different context or sub-period.",
    "Complexity: Address a counterexample and explain why your argument still holds.",
  ];
  return `
    <h4>Scoring Guideline Reference Answer</h4>
    <p><strong>Prompt:</strong> ${prompt}</p>
    <p><strong>Hint + Sample response</strong></p>
    <ul>
      <li><strong>Thesis</strong>: Establish a defensible claim and specify the extent of change/continuity.</li>
      <li><strong>Body 1</strong>: Give historical context and one specific evidence point tied to the claim.</li>
      <li><strong>Body 2</strong>: Add a second evidence line and explain causal or comparative logic.</li>
      <li><strong>Body 3 / Rebuttal</strong>: Address a limitation or counterexample and evaluate its significance.</li>
      <li><strong>Conclusion</strong>: Reaffirm the argument and connect it to a broader AP Euro pattern.</li>
    </ul>
    <p><strong>Prompt-specific starter answer:</strong></p>
    <ul>
      ${base.map((idea) => `<li>${idea}</li>`).join("")}
    </ul>
  `;
}

export function renderChallenge(root) {
  const selected = { title: LEQ_SET[0][0], prompt: LEQ_SET[0][1] };
  const options = LEQ_SET.map((q, i) => `<option value="${i}" ${i === 0 ? "selected" : ""}>${q[0]}</option>`).join("");
  root.innerHTML = `
    <div class="panel">
      <h3>Daily Sample LEQ</h3>
      <label>Select LEQ</label>
      <select id="leqSelect">${options}</select>
      <p id="leqPrompt">${selected.prompt}</p>
      <label>Thesis</label><textarea id="thesis" class="open-area"></textarea>
      <label>Body 1</label><textarea id="body1" class="open-area"></textarea>
      <label>Body 2</label><textarea id="body2" class="open-area"></textarea>
      <label>Body 3 / Rebuttal / Conclusion</label><textarea id="body3" class="open-area"></textarea>
      <button id="submitLeq">Submit Outline + Show Guideline Answer</button>
      <div id="leqOutput"></div>
    </div>`;

  root.querySelector("#leqSelect").onchange = (e) => {
    const i = Number(e.target.value);
    root.querySelector("#leqPrompt").textContent = LEQ_SET[i][1];
    root.querySelector("#leqOutput").innerHTML = "";
  };

  root.querySelector("#submitLeq").onclick = () => {
    const i = Number(root.querySelector("#leqSelect").value);
    const source = LEQ_SET[i][0];
    const prompt = root.querySelector("#leqPrompt").textContent;
    const quality = [root.querySelector("#thesis").value, root.querySelector("#body1").value, root.querySelector("#body2").value, root.querySelector("#body3").value].join(" ").trim().length;
    root.querySelector("#leqOutput").innerHTML = `
      <p><strong>Draft depth:</strong> ${quality > 400 ? "Good outline density." : "Add more named evidence and analysis."}</p>
      ${responseFor(source, prompt)}
    `;
  };
}
