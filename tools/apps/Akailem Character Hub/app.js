const API_URL = "https://akailem.aquafia1247.workers.dev/api/characters";

const state = {
  characters: [],
  query: "",
  filters: {},
  view: localStorage.getItem("akailem-view") || "cards"
};

const FILTERS = [
  ["Gender", "Gender"], ["Pronouns", "Pronouns"], ["Race", "Race"],
  ["Residence", "Residence"], ["Birth Place", "Birth Place"], ["MBTI", "MBTI"],
  ["Moral Alignment", "Moral Alignment"], ["Hogwarts House", "Hogwarts House"],
  ["Season", "Season"], ["Nature", "Nature"], ["Domain", "Domain"],
  ["Group/Organization", "Groups"]
];


const PROFILE_SECTIONS = [
  {
    key: "identity",
    icon: "🪪",
    title: "Identity / Core Information",
    subtitle: "Who is this character within the world?",
    fields: [
      ["Name", "Name"],
      ["Gender", "Gender"],
      ["Pronouns", "Pronouns"],
      ["Birthdate", "Birthdate"],
      ["Race", "Race", "relation"],
      ["Birth Place", "Birth Place", "relation"],
      ["Residence", "Residence", "relation"],
      ["Aura Colour", "Aura Colour"],
      ["Handedness", "Handedness"],
      ["Nature", "Nature", "relation"],
      ["Domain", "Domain", "relation"]
    ]
  },
  {
    key: "personality",
    icon: "🧠",
    title: "Personality / Symbolism",
    subtitle: "What are they like, and what symbolic motifs represent them?",
    fields: [
      ["MBTI", "MBTI"],
      ["Moral Alignment", "Moral Alignment"],
      ["Temperament", "Temperament"],
      ["Zodiac Sign", "Zodiac Sign"],
      ["Hogwarts House", "Hogwarts House"],
      ["Animal", "Animal"],
      ["Plant", "Plant"],
      ["Season", "Season"],
      ["Scent", "Scent"]
    ]
  },
  {
    key: "connections",
    icon: "🔗",
    title: "Story Connections",
    subtitle: "Where do they fit into the story and who are they connected to?",
    fields: [
      [["Groups", "Group/Organization"], "Groups", "relation"],
      ["Relationship Map", "Relationship Map", "relation"],
      ["Chapter Appearances", "Chapter Appearances", "relation"],
      ["Chapter Mentions", "Chapter Mentions", "relation"],
      ["Events", "Events", "relation"]
    ]
  },
  {
    key: "profile",
    icon: "📖",
    title: "Profile",
    subtitle: "Additional material that expands on the character.",
    fields: [
      ["Summary", "Summary", "long"],
      ["Spells & Items", "Spells & Items", "relation"],
      ["Gallery", "Gallery", "relation"]
    ]
  }
];

function propertyAny(character, names) {
  const list = Array.isArray(names) ? names : [names];
  for (const name of list) {
    const value = property(character, name);
    if (value !== null && value !== undefined && value !== "" && (!Array.isArray(value) || value.length)) return value;
  }
  return null;
}

function hasDisplayValue(value) {
  if (value === null || value === undefined || value === "") return false;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

function formatProfileValue(value, type) {
  if (!hasDisplayValue(value)) return "";
  if (type === "relation") {
    const items = Array.isArray(value) ? value : [value];
    return `<div class="profile-tags">${items.map(item => {
      const label = typeof item === "object" ? item.name || item.title || item.id : item;
      return `<span class="profile-tag">${escapeHtml(label)}</span>`;
    }).join("")}</div>`;
  }
  if (type === "long") return `<div class="profile-longtext">${escapeHtml(relationLabels(value) || plain(value)).replace(/\n/g, "<br>")}</div>`;
  if (typeof value === "object" && value?.start) return escapeHtml(formatDate(value, { year: "numeric", month: "long", day: "numeric" }));
  return escapeHtml(relationLabels(value) || plain(value));
}

function renderProfileSection(character, section) {
  const rows = section.fields.map(([source, label, type]) => {
    const value = source === "Name" ? character.name : propertyAny(character, source);
    if (!hasDisplayValue(value)) return "";
    const wide = type === "long" ? " profile-field-wide" : "";
    return `<div class="profile-field${wide}"><small>${escapeHtml(label)}</small><div>${formatProfileValue(value, type)}</div></div>`;
  }).filter(Boolean).join("");
  if (!rows) return "";
  return `<section class="profile-section profile-section-${section.key}">
    <div class="profile-section-head"><div class="profile-section-icon" aria-hidden="true">${section.icon}</div><div><h3>${escapeHtml(section.title)}</h3><p>${escapeHtml(section.subtitle)}</p></div></div>
    <div class="profile-section-grid">${rows}</div>
  </section>`;
}

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const escapeHtml = value => String(value ?? "").replace(/[&<>'"]/g, char => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"})[char]);
const plain = value => Array.isArray(value) ? value.join(", ") : value && typeof value === "object" ? value.start || JSON.stringify(value) : value ?? "";
const initials = name => String(name || "?").split(/\s+/).map(word => word[0]).slice(0,2).join("").toUpperCase();
const property = (character, name) => character.properties?.[name] ?? null;

function portraitUrl(character) {
  const candidates = ["Portrait", "Image", "Profile Image", "Gallery"];
  for (const name of candidates) {
    const value = property(character, name);
    if (Array.isArray(value) && value[0]?.url) return value[0].url;
    if (typeof value === "string" && /^https?:\/\//.test(value)) return value;
  }
  return "";
}

function relationLabels(value) {
  if (!Array.isArray(value)) return plain(value);
  return value.map(item => typeof item === "object" ? item.name || item.title || item.id : item).filter(Boolean).join(", ");
}

function normalizeResponse(payload) {
  const rows = Array.isArray(payload) ? payload : payload.characters || [];
  return rows.map(row => ({
    ...row,
    name: row.name || property(row, "Name") || "Unnamed Character",
    lastEditedTime: row.lastEditedTime || row.last_edited_time || null
  }));
}

async function loadCharacters(force = false) {
  setStatus("Loading characters from Notion…");
  const url = force ? `${API_URL}?refresh=1` : API_URL;
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.details || payload.error || `Worker returned ${response.status}`);
  state.characters = normalizeResponse(payload);
  setStatus("");
  renderAll();
}

function setStatus(message, error = false) {
  const box = $("#status");
  box.hidden = !message;
  box.className = error ? "status error" : "status";
  box.textContent = message;
}

function uniquePropertyCount(name) {
  const values = state.characters.flatMap(character => {
    const value = property(character, name);
    return Array.isArray(value) ? value.map(relationLabels) : [plain(value)];
  }).filter(Boolean);
  return new Set(values).size;
}

function upcomingBirthday(character) {
  const raw = property(character, "Birthdate");
  const dateText = typeof raw === "object" ? raw?.start : raw;
  if (!dateText) return Infinity;
  const birth = new Date(`${dateText}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return Infinity;
  const now = new Date();
  let next = new Date(now.getFullYear(), birth.getUTCMonth(), birth.getUTCDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (next < today) next.setFullYear(next.getFullYear() + 1);
  return Math.ceil((next - today) / 86400000);
}

function renderStats() {
  const stats = [
    ["👤", "Characters", state.characters.length],
    ["👥", "Groups", uniquePropertyCount("Group/Organization")],
    ["🧬", "Races", uniquePropertyCount("Race")],
    ["✨", "Domains", uniquePropertyCount("Domain")],
    ["🎂", "Upcoming Birthdays", state.characters.filter(character => upcomingBirthday(character) <= 60).length]
  ];
  $("#stats").innerHTML = stats.map(([icon,label,value]) => `<div class="card stat"><div class="stat-icon" aria-hidden="true">${icon}</div><span>${escapeHtml(label)}</span><strong>${value}</strong></div>`).join("");
}

function renderSpotlight() {
  const root = $("#spotlight");
  if (!state.characters.length) { root.innerHTML = '<div class="empty">No characters found.</div>'; return; }
  const character = state.characters[Math.floor(Math.random() * state.characters.length)];
  const image = portraitUrl(character);
  const chips = [property(character,"Pronouns"),property(character,"MBTI"),property(character,"Season"),relationLabels(property(character,"Domain"))].map(plain).filter(Boolean);
  root.innerHTML = `
    <div class="spotlight-portrait">${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(character.name)}">` : `<strong style="font-size:52px">${initials(character.name)}</strong>`}</div>
    <div class="spotlight-body">
      <h3>${escapeHtml(character.name)}</h3>
      <p>${escapeHtml(relationLabels(property(character,"Race")) || "Character profile")}</p>
      <div class="chips">${chips.map(value => `<span class="chip">${escapeHtml(value)}</span>`).join("")}</div>
      <button class="primary" type="button" data-profile="${escapeHtml(character.id)}">👁️ Open Profile</button>
    </div>`;
}

function formatDate(value, options = {month:"short",day:"numeric"}) {
  if (!value) return "—";
  const dateText = typeof value === "object" ? value.start : value;
  const date = new Date(dateText);
  return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat("en-CA", options).format(date);
}

function renderLists() {
  const recent = [...state.characters].filter(c => c.lastEditedTime).sort((a,b) => new Date(b.lastEditedTime)-new Date(a.lastEditedTime)).slice(0,5);
  $("#recent").innerHTML = recent.length ? recent.map(character => `<div class="list-row"><span><span class="row-icon" aria-hidden="true">✏️</span>${escapeHtml(character.name)}</span><small>${formatDate(character.lastEditedTime)}</small></div>`).join("") : '<div class="empty">No edit dates available.</div>';
  const birthdays = [...state.characters].filter(c => upcomingBirthday(c) !== Infinity).sort((a,b) => upcomingBirthday(a)-upcomingBirthday(b)).slice(0,5);
  $("#birthdays").innerHTML = birthdays.length ? birthdays.map(character => `<div class="list-row"><span><span class="row-icon" aria-hidden="true">🎁</span>${escapeHtml(character.name)}</span><small>${formatDate(property(character,"Birthdate"))}</small></div>`).join("") : '<div class="empty">No birthdates available.</div>';
}

function filterValue(character, name) {
  const value = property(character, name);
  return Array.isArray(value) ? value.map(relationLabels).filter(Boolean) : [plain(value)].filter(Boolean);
}

function renderFilters() {
  $("#filters").innerHTML = FILTERS.map(([name,label]) => {
    const values = [...new Set(state.characters.flatMap(character => filterValue(character,name)))].sort((a,b) => String(a).localeCompare(String(b)));
    if (!values.length) return "";
    return `<div class="filter-group"><label><span aria-hidden="true">🔹</span> ${escapeHtml(label)}</label><select data-filter="${escapeHtml(name)}"><option value="">All</option>${values.map(value => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join("")}</select></div>`;
  }).join("");
}

function visibleCharacters() {
  const query = state.query.trim().toLowerCase();
  return state.characters.filter(character => {
    const searchable = [character.name, ...Object.values(character.properties || {}).flatMap(value => Array.isArray(value) ? value.map(relationLabels) : [plain(value)])].join(" ").toLowerCase();
    if (query && !searchable.includes(query)) return false;
    return Object.entries(state.filters).every(([name,wanted]) => !wanted || filterValue(character,name).includes(wanted));
  });
}

function characterChips(character) {
  return [plain(property(character,"MBTI")), plain(property(character,"Season")), relationLabels(property(character,"Group/Organization"))].filter(Boolean).slice(0,3);
}

function renderExplorer() {
  const characters = visibleCharacters();
  $("#resultCount").textContent = `${characters.length} character${characters.length === 1 ? "" : "s"}`;
  const root = $("#characterResults");
  if (!characters.length) { root.innerHTML = '<div class="card empty">No characters match the current search and filters.</div>'; return; }

  if (state.view === "compact") {
    root.innerHTML = `<div class="compact-list">${characters.map(character => `<div class="card compact-row" data-profile="${escapeHtml(character.id)}"><strong>${escapeHtml(character.name)}</strong><span>${escapeHtml(plain(property(character,"Gender")))}</span><span>${escapeHtml(relationLabels(property(character,"Race")))}</span><span>${escapeHtml(relationLabels(property(character,"Domain")))}</span></div>`).join("")}</div>`;
    return;
  }

  if (state.view === "table") {
    root.innerHTML = `<div class="card table-wrap"><table class="character-table"><thead><tr><th>Name</th><th>Race</th><th>Group</th><th>Domain</th><th>MBTI</th></tr></thead><tbody>${characters.map(character => `<tr data-profile="${escapeHtml(character.id)}"><td>${escapeHtml(character.name)}</td><td>${escapeHtml(relationLabels(property(character,"Race")))}</td><td>${escapeHtml(relationLabels(property(character,"Group/Organization")))}</td><td>${escapeHtml(relationLabels(property(character,"Domain")))}</td><td>${escapeHtml(plain(property(character,"MBTI")))}</td></tr>`).join("")}</tbody></table></div>`;
    return;
  }

  root.innerHTML = `<div class="character-grid">${characters.map(character => {
    const image = portraitUrl(character);
    return `<article class="card character-card" data-profile="${escapeHtml(character.id)}"><div class="portrait">${image ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(character.name)}">` : `<strong>${initials(character.name)}</strong>`}</div><div class="character-info"><h3>${escapeHtml(character.name)}</h3><small>${escapeHtml(plain(property(character,"Pronouns")) || relationLabels(property(character,"Race")))}</small><div class="chips">${characterChips(character).map(value => `<span class="chip">${escapeHtml(value)}</span>`).join("")}</div></div></article>`;
  }).join("")}</div>`;
}

function openProfile(id) {
  const character = state.characters.find(item => item.id === id);
  if (!character) return;
  const sections = PROFILE_SECTIONS.map(section => renderProfileSection(character, section)).filter(Boolean).join("");
  $("#profileContent").innerHTML = `<div class="profile-hero">
    <div><span class="kicker">Character Profile</span><h2 class="profile-title">${escapeHtml(character.name)}</h2><p class="profile-subtitle">Akailem character database</p></div>
    ${character.url ? `<a class="primary" href="${escapeHtml(character.url)}" target="_blank" rel="noopener">↗️ Open in Notion</a>` : ""}
  </div>
  <div class="profile-sections">${sections || '<div class="empty">No profile information is available for this character yet.</div>'}</div>`;
  $("#profileDialog").showModal();
}

function renderAll() {
  renderStats(); renderSpotlight(); renderLists(); renderFilters(); renderExplorer();
  $("#updatedDate").textContent = new Intl.DateTimeFormat("en-CA", {dateStyle:"long"}).format(new Date());
  $("#apiMode").textContent = "Notion live";
}

$("#globalSearch").addEventListener("input", event => { state.query = event.target.value; renderExplorer(); });
$("#filters").addEventListener("change", event => { if (event.target.matches("select[data-filter]")) { state.filters[event.target.dataset.filter] = event.target.value; renderExplorer(); } });
$("#randomize").addEventListener("click", renderSpotlight);
$("#refresh").addEventListener("click", () => loadCharacters(true).catch(error => setStatus(error.message, true)));
$("#theme").addEventListener("click", () => { document.body.classList.toggle("light"); const light = document.body.classList.contains("light"); $("#theme").textContent = light ? "☀️" : "🌙"; localStorage.setItem("akailem-theme", light ? "light" : "dark"); });
$("#closeDialog").addEventListener("click", () => $("#profileDialog").close());
$("#profileDialog").addEventListener("click", event => { if (event.target === $("#profileDialog")) $("#profileDialog").close(); });
document.addEventListener("click", event => { const target = event.target.closest("[data-profile]"); if (target) openProfile(target.dataset.profile); });
$$('.view-btn').forEach(button => button.addEventListener("click", () => { state.view = button.dataset.view; localStorage.setItem("akailem-view", state.view); $$('.view-btn').forEach(item => item.classList.toggle("active", item === button)); renderExplorer(); }));

if (localStorage.getItem("akailem-theme") === "light") { document.body.classList.add("light"); $("#theme").textContent = "☀️"; }
$$('.view-btn').forEach(button => button.classList.toggle("active", button.dataset.view === state.view));
loadCharacters().catch(error => { setStatus(`Could not load characters: ${error.message}`, true); $("#apiMode").textContent = "Connection error"; });
