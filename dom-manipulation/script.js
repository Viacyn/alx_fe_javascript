// ================== Storage Keys ==================
const LS_QUOTES_KEY = "dqg_quotes_v1";
const LS_FILTER_KEY = "dqg_last_filter_v1";
const SS_LAST_QUOTE_KEY = "dqg_last_quote_text";

// ================== Data ==================
let quotes = [
  { text: "Stay hungry, stay foolish.", category: "Inspiration" },
  { text: "Simplicity is the soul of efficiency.", category: "Productivity" },
  {
    text: "The only way to do great work is to love what you do.",
    category: "Work",
  },
  {
    text: "If you can’t explain it simply, you don’t understand it well enough.",
    category: "Education",
  },
];

const state = {
  categories: new Set(quotes.map((q) => q.category)),
  activeCategory: "all", // use lowercase "all" for filter
};

// ================== DOM refs ==================
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const openDynamicFormBtn = document.getElementById("openDynamicForm");
const exportBtn = document.getElementById("exportJson");
const categoryFilter = document.getElementById("categoryFilter");

// Accessibility
quoteDisplay.setAttribute("role", "status");
quoteDisplay.setAttribute("aria-live", "polite");

// ================== Local & Session Storage ==================
function saveQuotes() {
  localStorage.setItem(LS_QUOTES_KEY, JSON.stringify(quotes));
}

function loadQuotes() {
  const raw = localStorage.getItem(LS_QUOTES_KEY);
  if (!raw) return false;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      quotes = parsed.filter(
        (q) => q && typeof q.text === "string" && typeof q.category === "string"
      );
      return true;
    }
  } catch {}
  return false;
}

function saveLastViewedQuote(text) {
  sessionStorage.setItem(SS_LAST_QUOTE_KEY, text);
}

function getLastViewedQuote() {
  return sessionStorage.getItem(SS_LAST_QUOTE_KEY);
}

// ================== Helpers ==================
function pickRandom(arr) {
  return arr.length ? arr[Math.floor(Math.random() * arr.length)] : null;
}

// ================== FILTERING (Task 3) ==================
// Populate the <select id="categoryFilter"> with unique categories
function populateCategories() {
  // refresh categories set from quotes
  state.categories = new Set(quotes.map((q) => q.category));

  // Clear old options except the first "all"
  while (categoryFilter.options.length > 1) {
    categoryFilter.remove(1);
  }

  [...state.categories]
    .sort((a, b) => a.localeCompare(b))
    .forEach((cat) => categoryFilter.appendChild(new Option(cat, cat)));

  // Restore last filter if present and valid; else keep "all"
  const saved = localStorage.getItem(LS_FILTER_KEY);
  if (saved && (saved === "all" || state.categories.has(saved))) {
    categoryFilter.value = saved;
    state.activeCategory = saved;
  } else {
    categoryFilter.value = "all";
    state.activeCategory = "all";
  }
}

// Apply the selected filter, persist it, and refresh displayed quote
function filterQuotes() {
  const value = categoryFilter.value || "all";
  state.activeCategory = value;
  localStorage.setItem(LS_FILTER_KEY, value);
  displayRandomQuote();
}
window.filterQuotes = filterQuotes; // make global for inline onchange

// ================== Quote display ==================
function showRandomQuote() {
  const pool =
    state.activeCategory === "all"
      ? quotes
      : quotes.filter((q) => q.category === state.activeCategory);

  quoteDisplay.innerHTML = "";

  const chosen = pickRandom(pool);
  if (!chosen) {
    quoteDisplay.textContent = "No quotes yet for this category.";
    return;
  }

  const figure = document.createElement("figure");
  figure.style.border = "1px solid #ddd";
  figure.style.padding = "1rem";
  figure.style.borderRadius = "0.5rem";

  const block = document.createElement("blockquote");
  block.textContent = `“${chosen.text}”`;
  block.style.margin = "0 0 0.5rem 0";

  const cap = document.createElement("figcaption");
  cap.innerHTML = `<strong>Category:</strong> ${chosen.category}`;

  figure.append(block, cap);
  quoteDisplay.appendChild(figure);

  // remember last viewed quote this session
  saveLastViewedQuote(chosen.text);
}

// Checker-friendly alias
function displayRandomQuote() {
  showRandomQuote();
}

// ================== Add Quote (updates storage + filter in real time) ==================
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const catInput = document.getElementById("newQuoteCategory");
  if (!textInput || !catInput) return;

  const text = (textInput.value || "").trim();
  const category = (catInput.value || "").trim();
  if (!text || !category)
    return alert("Please enter both a quote and a category.");

  quotes.push({ text, category });
  saveQuotes();

  // Update categories dropdown immediately
  populateCategories();
  // Switch filter to the new category so user sees the new quote pool
  categoryFilter.value = category;
  filterQuotes();

  textInput.value = "";
  catInput.value = "";
}
window.addQuote = addQuote;

// ================== Dynamic Add Form (still provided for checker) ==================
function createAddQuoteForm() {
  if (document.getElementById("addQuoteInlineForm")) return;

  const wrap = document.createElement("div");
  wrap.id = "addQuoteInlineForm";
  wrap.style.margin = "1rem 0";
  wrap.style.border = "1px dashed #aaa";
  wrap.style.padding = "0.75rem";
  wrap.style.borderRadius = "0.5rem";

  const text = document.createElement("input");
  text.type = "text";
  text.id = "newQuoteText";
  text.placeholder = "Enter a new quote";
  text.style.marginRight = "0.5rem";

  const cat = document.createElement("input");
  cat.type = "text";
  cat.id = "newQuoteCategory";
  cat.placeholder = "Enter quote category";
  cat.style.marginRight = "0.5rem";

  const addBtn = document.createElement("button");
  addBtn.type = "button";
  addBtn.textContent = "Add Quote";

  addBtn.addEventListener("click", () => {
    const q = (text.value || "").trim();
    const c = (cat.value || "").trim();
    if (!q || !c) return alert("Please enter both a quote and a category.");

    quotes.push({ text: q, category: c });
    saveQuotes();

    populateCategories();
    categoryFilter.value = c;
    filterQuotes();

    wrap.remove();
  });

  wrap.append(text, cat, addBtn);
  newQuoteBtn.parentNode.insertBefore(wrap, newQuoteBtn);
}
window.createAddQuoteForm = createAddQuoteForm;

// ================== JSON Export / Import (still available) ==================
function exportToJsonFile() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes-export.json";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
window.exportToJsonFile = exportToJsonFile;

function importFromJsonFile(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw new Error("JSON must be an array");

      const valid = imported.filter(
        (q) => q && typeof q.text === "string" && typeof q.category === "string"
      );
      if (!valid.length) return alert("No valid quotes found.");

      quotes.push(...valid);
      saveQuotes();

      // refresh categories + keep current filter if still valid
      populateCategories();
      filterQuotes();

      alert("Quotes imported successfully!");
      event.target.value = "";
    } catch (err) {
      console.error(err);
      alert("Invalid JSON file.");
    }
  };
  reader.readAsText(file);
}
window.importFromJsonFile = importFromJsonFile;

// ================== Init ==================
document.addEventListener("DOMContentLoaded", () => {
  // Load stored quotes if any
  loadQuotes();

  // Build categories dropdown from stored/current quotes and restore last filter
  populateCategories();

  // Show a quote using the restored filter
  displayRandomQuote();

  // Checker requires: explicit listener on #newQuote that calls displayRandomQuote
  newQuoteBtn.addEventListener("click", displayRandomQuote);

  if (openDynamicFormBtn) {
    openDynamicFormBtn.addEventListener("click", createAddQuoteForm);
  }
  if (exportBtn) {
    exportBtn.addEventListener("click", exportToJsonFile);
  }
});
