import { filteredEntries, getState } from "../store.js";

export function renderOpenRecall(root) {
  const prompts = [
    {
      id: "hy-1",
      topic: "Renaissance Humanism",
      question: "A) Describe one characteristic of Renaissance humanism. B) Explain one way humanism affected education. C) Explain how humanism influenced art.",
      sample: [
        "A) Humanism emphasized human potential and classical learning over purely scholastic theology.",
        "B) Education shifted toward studia humanitatis (rhetoric, grammar, history, moral philosophy).",
        "C) Art adopted naturalism and perspective; e.g., Leonardo and High Renaissance composition.",
      ],
    },
    {
      id: "hy-2",
      topic: "Protestant Reformation",
      question: "A) Explain one cause of the Reformation. B) Explain one factor that helped the Reformation spread. C) Explain one political effect of the Reformation.",
      sample: [
        "A) Resentment of indulgence sales and clerical abuses triggered reform demands.",
        "B) The printing press rapidly spread Luther's arguments in vernacular form.",
        "C) Rulers consolidated authority by reducing papal influence (e.g., Act of Supremacy).",
      ],
    },
    {
      id: "hy-3",
      topic: "Scientific Revolution",
      question: "A) Describe one new theory about the universe. B) Explain one way the Church responded. C) Explain how this period changed methods of reasoning.",
      sample: [
        "A) Copernican heliocentrism challenged Ptolemaic geocentrism.",
        "B) Church institutions censored or prosecuted some supporters of heliocentrism (e.g., Galileo).",
        "C) Empiricism and mathematical reasoning became central to knowledge claims.",
      ],
    },
    {
      id: "hy-4",
      topic: "Enlightenment Ideas",
      question: "A) Explain one key political idea of an Enlightenment thinker. B) Explain how that idea challenged traditional authority. C) Explain one way Enlightenment ideas influenced the French Revolution.",
      sample: [
        "A) Locke argued natural rights and government by consent.",
        "B) This challenged divine-right monarchy and legitimized resistance to tyranny.",
        "C) Rights-language and sovereignty claims shaped the Declaration of the Rights of Man.",
      ],
    },
    {
      id: "hy-5",
      topic: "French Revolution",
      question: "A) Explain one cause of the French Revolution. B) Explain one change made during the Liberal Phase. C) Explain one consequence of the Reign of Terror.",
      sample: [
        "A) Fiscal crisis plus unequal taxation intensified social conflict.",
        "B) Reforms subordinated the Church and privileged citizenship over estate order.",
        "C) Terror produced backlash and opened the path toward Napoleon's consolidation.",
      ],
    },
    {
      id: "hy-6",
      topic: "Industrial Revolution",
      question: "A) Describe one reason the IR began in Britain. B) Explain one social effect of industrialization. C) Explain how governments responded to problems of industrialization.",
      sample: [
        "A) Britain had coal/iron resources and integrated transport-finance networks.",
        "B) Urban working-class growth brought overcrowding and labor conflict.",
        "C) States moved toward regulation (Factory Acts, labor-hour limits).",
      ],
    },
    {
      id: "hy-7",
      topic: "Nationalism",
      question: "A) Explain one factor that promoted 19th-century nationalism. B) Explain one way nationalism contributed to German unification. C) Explain one negative consequence of nationalism.",
      sample: [
        "A) Romantic culture and shared language/history fostered mass identity.",
        "B) Bismarck used nationalist diplomacy and war to unify German states.",
        "C) Nationalism also fueled exclusionary politics and ethnic hostility.",
      ],
    },
    {
      id: "hy-8",
      topic: "New Imperialism",
      question: "A) Explain one economic motive for New Imperialism. B) Explain one technological advantage Europeans had. C) Explain one way indigenous people resisted.",
      sample: [
        "A) Industrial economies sought raw materials and captive markets.",
        "B) Firearms/transport/communications created major military asymmetry.",
        "C) Resistance ranged from military victory (Adwa) to political coalition-building.",
      ],
    },
    {
      id: "hy-9",
      topic: "World War I",
      question: "A) Explain one long-term cause of WWI. B) Explain one effect of total war on the home front. C) Explain one consequence of the Treaty of Versailles.",
      sample: [
        "A) Alliance blocs and militarized nationalism made escalation likely.",
        "B) States expanded control over labor, industry, and food distribution.",
        "C) Settlement resentment destabilized interwar politics in Central Europe.",
      ],
    },
    {
      id: "hy-10",
      topic: "Cold War",
      question: "A) Explain one purpose of the Marshall Plan. B) Explain one way the Soviet Union controlled Eastern Europe. C) Explain one factor that led to the end of the Cold War.",
      sample: [
        "A) Economic recovery aid aimed to stabilize democracies and contain communism.",
        "B) Moscow used military blocs, party control, and intervention threats.",
        "C) Reform plus non-intervention under Gorbachev weakened bloc cohesion.",
      ],
    },
    {
      id: "hy-11",
      topic: "Women's Rights",
      question: "A) Describe one goal of first-wave feminism. B) Explain one achievement of second-wave feminism. C) Explain one obstacle faced by the women's movement.",
      sample: [
        "A) First-wave movements prioritized legal citizenship and suffrage.",
        "B) Second-wave activism expanded reproductive and workplace rights.",
        "C) Cultural conservatism and institutional barriers slowed implementation.",
      ],
    },
  ];

  const poolEntries = filteredEntries(getState()).filter((e) => e.content?.openQuestion);
  poolEntries.slice(0, 10).forEach((e, i) => {
    prompts.push({
      id: `data-${e.id}-${i}`,
      topic: e.title.short,
      question: e.content.openQuestion,
      sample: [
        "A) Start with one direct cause and include one specific historical detail.",
        "B) Explain one mechanism of change (institution, actor, policy, or technology).",
        "C) Conclude with one consequence and why it matters in period context.",
      ],
    });
  });
  if (!prompts.length) {
    root.innerHTML = `<div class="panel">No open-recall prompts in this filtered set.</div>`;
    return;
  }
  let idx = 0;

  function paint() {
    const entry = prompts[idx];
    root.innerHTML = `
      <div class="panel">
        <h3>SAQ Topic Review</h3>
        <p><strong>Topic:</strong> ${entry.topic}</p>
        <p>${entry.question}</p>
        <div class="controls"><button id="prevPrompt">Prev</button><button id="nextPrompt">Next</button></div>
        <textarea id="openInput" class="open-area" placeholder="Write what you recall..."></textarea>
        <div class="controls"><button id="submitOpen">Submit (Ctrl+Enter)</button></div>
        <div id="openChecklist" class="hidden"></div>
      </div>`;

    const submit = async () => {
      const checklistHtml = (entry.keyPoints || []).map((k, i) => `<label><input type="checkbox" data-k="${i}" /> ${k}</label>`).join("<br/>");
      root.querySelector("#openChecklist").classList.remove("hidden");
      root.querySelector("#openChecklist").innerHTML = `
        <h4>Self-correction checklist</h4>
        ${checklistHtml || "<label><input type='checkbox'/> A-part completed with specific evidence</label><br/><label><input type='checkbox'/> B-part explains mechanism of change</label><br/><label><input type='checkbox'/> C-part evaluates significance</label>"}
        <p><a href="#" id="sampleAnswer">Show sample answer</a></p>
        <p id="sampleBox"></p>
      `;
      root.querySelector("#sampleAnswer").onclick = (e) => {
        e.preventDefault();
        root.querySelector("#sampleBox").innerHTML = `
          <ul>
            ${(entry.sample || []).map((idea) => `<li>${idea}</li>`).join("")}
          </ul>`;
      };
    };

    root.querySelector("#submitOpen").onclick = submit;
    root.querySelector("#openInput").addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.key === "Enter") submit();
    });
    root.querySelector("#prevPrompt").onclick = () => { idx = (idx - 1 + prompts.length) % prompts.length; paint(); };
    root.querySelector("#nextPrompt").onclick = () => { idx = (idx + 1) % prompts.length; paint(); };
  }
  paint();
}
