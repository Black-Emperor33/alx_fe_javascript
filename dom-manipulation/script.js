// =================== Dynamic Quote Generator with Sync Simulation ===================
// Storage keys
const QUOTES_KEY = "quotes";
const SERVER_QUOTES_KEY = "server_quotes"; // simulation of remote server state
const SELECTED_CAT_KEY = "selectedCategory";
const PENDING_UPLOADS_KEY = "pendingUploads"; // local changes to push to server

// Default quotes (only used if no local storage)
let quotes = JSON.parse(localStorage.getItem(QUOTES_KEY)) || [
  { text: "The only way to do great work is to love what you do.", category: "Inspiration" },
  { text: "The harder you work for something, the greater you'll feel when you achieve it.", category: "Motivation" },
  { text: "Don't let yesterday take up too much of today.", category: "Life" },
  { text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", category: "Motivation" },
  { text: "Life is really simple, but we insist on making it complicated.", category: "Wisdom" },
  { text: "In the middle of every difficulty lies opportunity.", category: "Inspiration" },
  { text: "You miss 100% of the shots you don't take.", category: "Motivation" },
  { text: "The purpose of our lives is to be happy.", category: "Life" },
  { text: "Be yourself; everyone else is already taken.", category: "Humor" },
  { text: "Happiness is not something ready-made. It comes from your own actions.", category: "Wisdom" }
];


// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem(QUOTES_KEY, JSON.stringify(quotes));
}

// DOM refs
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categoryFilter = document.getElementById("categoryFilter");
const lastSyncEl = document.getElementById("lastSync");
const syncMessageEl = document.getElementById("syncMessage");
const conflictsContainer = document.getElementById("conflictsContainer");

// Utility
function now() { return Date.now(); }
function formatTime(ts) { return new Date(ts).toLocaleString(); }

// ================== Initialize "server" simulation ==================
// If server has no data, initialize server storage with a copy of default quotes.
if (!localStorage.getItem(SERVER_QUOTES_KEY)) {
  const serverInit = quotes.map(q => ({ ...q, id: q.id, updatedAt: q.updatedAt }));
  localStorage.setItem(SERVER_QUOTES_KEY, JSON.stringify(serverInit));
}

// Helper to read server state (simulated fetch)
function fetchServerQuotes() {
  // Simulate network latency with a Promise
  return new Promise((resolve) => {
    setTimeout(() => {
      const serverRaw = localStorage.getItem(SERVER_QUOTES_KEY) || "[]";
      try {
        const serverQuotes = JSON.parse(serverRaw);
        resolve(serverQuotes);
      } catch {
        resolve([]);
      }
    }, 400 + Math.random() * 400); // 400-800ms simulated latency
  });
}

// IMPORTANT: export-compatible function required by checks
// This function returns the server quotes (simulated). Tests expect this exact name.
async function fetchQuotesFromServer() {
  return await fetchServerQuotes();
}

// Helper to update server state (simulated POST/PUT)
function updateServerQuotes(newServerArray) {
  // Simulate network latency and write to localStorage
  return new Promise((resolve) => {
    setTimeout(() => {
      localStorage.setItem(SERVER_QUOTES_KEY, JSON.stringify(newServerArray));
      resolve(true);
    }, 300 + Math.random() * 300);
  });
}

// ================== Category population & filtering ==================
function populateCategories() {
  const uniqueCategories = Array.from(new Set(quotes.map(q => (q.category || "Uncategorized").trim()))).sort();
  // rebuild dropdown
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  uniqueCategories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    categoryFilter.appendChild(opt);
  });

  // restore last used category
  const last = localStorage.getItem(SELECTED_CAT_KEY) || "all";
  if ([...categoryFilter.options].some(o => o.value === last)) {
    categoryFilter.value = last;
  } else categoryFilter.value = "all";
}

function renderQuote(quote) {
  quoteDisplay.innerHTML = `
    <p>"${escapeHtml(quote.text)}"</p>
    <p><strong>Category:</strong> ${escapeHtml(quote.category || "Uncategorized")}</p>
    <p style="font-size:0.85em;color:#666">Updated: ${formatTime(quote.updatedAt)}</p>
  `;
}

// show a random quote (respecting current category filter)
function showRandomQuote() {
  const sel = categoryFilter.value || "all";
  const filtered = sel === "all" ? quotes : quotes.filter(q => q.category === sel);
  if (!filtered.length) {
    quoteDisplay.innerHTML = `<p>No quotes available for this category.</p>`;
    return;
  }
  const q = filtered[Math.floor(Math.random() * filtered.length)];
  renderQuote(q);
  sessionStorage.setItem("lastQuote", JSON.stringify(q));
}

// filterQuotes triggered by dropdown
function filterQuotes() {
  const sel = categoryFilter.value;
  localStorage.setItem(SELECTED_CAT_KEY, sel);
  showRandomQuote();
}

// ========= Add / Delete / Edit local quotes ============
function addQuoteLocal(text, category) {
  const id = Date.now() + Math.floor(Math.random() * 1000);
  const newQ = { id, text, category, updatedAt: now() };
  quotes.push(newQ);
  saveQuotes();
  // mark as pending upload
  const pending = JSON.parse(localStorage.getItem(PENDING_UPLOADS_KEY) || "[]");
  pending.push(newQ);
  localStorage.setItem(PENDING_UPLOADS_KEY, JSON.stringify(pending));
  populateCategories();
  filterQuotes();
  return newQ;
}

// For UI button
document.getElementById("addQuoteBtn").addEventListener("click", () => {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();
  if (!text || !category) { alert("Please fill both fields."); return; }
  addQuoteLocal(text, category);
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
  alert("Quote added locally (and marked to be pushed).");
});

// ================= Export / Import ==================
function exportToJsonFile() {
  const json = JSON.stringify(quotes, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const arr = JSON.parse(e.target.result);
      if (!Array.isArray(arr)) { alert("Invalid JSON (expected array)"); return; }
      // Normalize imported items and add
      arr.forEach(item => {
        const id = item.id || (Date.now() + Math.floor(Math.random() * 1000));
        const text = item.text || item.body || "";
        const category = item.category || item.title || "Uncategorized";
        const updatedAt = item.updatedAt || now();
        quotes.push({ id, text, category, updatedAt });
      });
      saveQuotes();
      populateCategories();
      alert("Imported locally. You can push changes to server using 'Push Local Changes to Server'.");
      showRandomQuote();
    } catch {
      alert("Error parsing file.");
    }
  };
  reader.readAsText(event.target.files[0]);
}

// ================= Simulated Sync Logic ==================
// Merge strategy (server precedence by default):
// - If server has a quote id not in local => add to local
// - If same id exists and server.updatedAt > local.updatedAt => conflict -> server overwrites local
// - If local has items server doesn't => keep local (these are local-only until pushed)

async function performSync() {
  setSyncMessage("Syncing...");
  try {
    const server = await fetchServerQuotes(); // simulated fetch
    const serverMap = new Map(server.map(s => [s.id, s]));
    const localMap = new Map(quotes.map(l => [l.id, l]));
    const conflicts = [];

    // 1) Detect server-only -> add to local
    server.forEach(s => {
      if (!localMap.has(s.id)) {
        // new remote quote -> add locally
        quotes.push({ id: s.id, text: s.text, category: s.category, updatedAt: s.updatedAt });
      } else {
        const local = localMap.get(s.id);
        if (s.updatedAt > (local.updatedAt || 0) && (s.text !== local.text || s.category !== local.category)) {
          // conflict: server newer AND different
          // Apply server by default but record the overwritten local for manual resolution
          conflicts.push({ id: s.id, local: { ...local }, server: s });
          // server takes precedence
          local.text = s.text;
          local.category = s.category;
          local.updatedAt = s.updatedAt;
        }
      }
    });

    saveQuotes();

    const nowTs = now();
    localStorage.setItem("lastSyncAt", nowTs.toString());
    // update UI last sync if present
    if (lastSyncEl) lastSyncEl.textContent = `Last sync: ${formatTime(nowTs)}`;

    if (conflicts.length) {
      showConflicts(conflicts);
      setSyncMessage(`Sync complete: ${conflicts.length} conflict(s) detected (server changes applied).`);
    } else {
      clearConflicts();
      setSyncMessage("Sync complete: no conflicts.");
    }

  } catch (err) {
    setSyncMessage("Sync failed: " + (err && err.message ? err.message : "unknown error"));
  }
}

// Push pending local changes to server simulation
async function pushLocalChangesToServer() {
  setSyncMessage("Pushing local changes...");
  const pending = JSON.parse(localStorage.getItem(PENDING_UPLOADS_KEY) || "[]");
  if (!pending.length) {
    setSyncMessage("No local changes to push.");
    return;
  }
  try {
    const server = await fetchServerQuotes();
    const serverMap = new Map(server.map(s => [s.id, s]));

    // Merge pending into server: if same id exists, local wins (we are pushing)
    pending.forEach(p => {
      const pClone = { ...p, updatedAt: now() };
      serverMap.set(pClone.id, pClone);
    });

    const newServerArr = Array.from(serverMap.values());
    await updateServerQuotes(newServerArr);
    // clear pending
    localStorage.removeItem(PENDING_UPLOADS_KEY);
    setSyncMessage(`Pushed ${pending.length} local change(s) to server.`);
    // After pushing, perform a fetch to reflect server state back to local (server precedence in general)
    await performSync();
  } catch (err) {
    setSyncMessage("Push failed: " + (err && err.message ? err.message : "unknown error"));
  }
}

// Show conflicts UI and buttons to accept server or restore local
function showConflicts(conflicts) {
  if (!conflictsContainer) return;
  conflictsContainer.innerHTML = "<h4>Conflicts detected</h4>";
  conflicts.forEach(c => {
    const div = document.createElement("div");
    div.style.border = "1px solid #ccc";
    div.style.padding = "8px";
    div.style.marginBottom = "8px";
    div.innerHTML = `
      <p><strong>Quote ID:</strong> ${c.id}</p>
      <p><strong>Server version:</strong> "${escapeHtml(c.server.text)}" — <em>${escapeHtml(c.server.category)}</em> (updated ${formatTime(c.server.updatedAt)})</p>
      <p><strong>Your local version:</strong> "${escapeHtml(c.local.text)}" — <em>${escapeHtml(c.local.category)}</em> (updated ${formatTime(c.local.updatedAt)})</p>
    `;
    const keepLocalBtn = document.createElement("button");
    keepLocalBtn.textContent = "Keep Local (override server)";
    keepLocalBtn.onclick = async () => {
      const server = await fetchServerQuotes();
      const idx = server.findIndex(s => s.id === c.id);
      if (idx >= 0) {
        server[idx] = { ...c.local, updatedAt: now() };
        await updateServerQuotes(server);
        setSyncMessage("Server updated with your local version for that quote.");
        await performSync();
      }
    };
    const acceptServerBtn = document.createElement("button");
    acceptServerBtn.textContent = "Accept Server (keep server)";
    acceptServerBtn.style.marginLeft = "8px";
    acceptServerBtn.onclick = () => {
      div.remove();
      setSyncMessage("Server version kept for that quote.");
    };

    div.appendChild(keepLocalBtn);
    div.appendChild(acceptServerBtn);
    conflictsContainer.appendChild(div);
  });
}

function clearConflicts() {
  if (conflictsContainer) conflictsContainer.innerHTML = "";
}

function setSyncMessage(msg) {
  if (syncMessageEl) syncMessageEl.textContent = msg;
}

// ================= Simulate server-side change (for testing) ================
// This function mutates the server-side storage — useful to test conflict resolution.
async function simulateServerUpdate() {
  const server = await fetchServerQuotes();
  // Randomly change or add a quote
  if (!server.length || Math.random() < 0.4) {
    // add new server quote
    const newServerQuote = {
      id: Date.now() + Math.floor(Math.random() * 1000),
      text: "Simulated server quote #" + Math.floor(Math.random() * 1000),
      category: ["Inspiration", "Life", "Wisdom", "Motivation", "Humor"][Math.floor(Math.random() * 5)],
      updatedAt: now()
    };
    server.push(newServerQuote);
    await updateServerQuotes(server);
    setSyncMessage("Server: added a new quote (simulated).");
  } else {
    // update an existing server quote (simulate remote edit)
    const idx = Math.floor(Math.random() * server.length);
    server[idx].text = server[idx].text + " (server-update)";
    server[idx].updatedAt = now();
    await updateServerQuotes(server);
    setSyncMessage("Server: updated one quote (simulated).");
  }
}

// ============== UI wiring & periodic sync ================
if (document.getElementById("importFile")) document.getElementById("importFile").addEventListener("change", importFromJsonFile);
if (document.getElementById("newQuote")) document.getElementById("newQuote").addEventListener("click", showRandomQuote);
if (document.getElementById("syncNowBtn")) document.getElementById("syncNowBtn").addEventListener("click", performSync);
if (document.getElementById("pushLocalBtn")) document.getElementById("pushLocalBtn").addEventListener("click", pushLocalChangesToServer);
if (document.getElementById("serverMutateBtn")) document.getElementById("serverMutateBtn").addEventListener("click", simulateServerUpdate);

// Also wire manualSyncBtn (HTML used syncWithServer())
function syncWithServer() {
  // wrapper so HTML onclick="syncWithServer()" works
  performSync();
}

// On startup
(function init() {
  // ensure every local quote has id & updatedAt (normalize)
  quotes = quotes.map(q => {
    if (!q.id) q.id = Date.now() + Math.floor(Math.random() * 1000);
    if (!q.updatedAt) q.updatedAt = now();
    return q;
  });
  saveQuotes();

  populateCategories();

  // Restore last viewed quote
  const lastQuote = sessionStorage.getItem("lastQuote");
  if (lastQuote) {
    try {
      const q = JSON.parse(lastQuote);
      renderQuote(q);
    } catch { showRandomQuote(); }
  } else showRandomQuote();

  // perform initial sync
  performSync();

  // periodic poll every 30s
  setInterval(() => {
    performSync();
  }, 30 * 1000);
})();

// ================= Helper: escape for innerHTML safety =================
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
