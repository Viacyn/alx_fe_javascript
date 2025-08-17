// ===== Data =====
const quotes = [
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
  activeCategory: "All",
};

// ===== DOM refs =====
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");

// Accessibility for live updates
quoteDisplay.setAttribute("role", "status");
quoteDisplay.setAttribute("aria-live", "polite");

// We'll create the category UI dynamically (advanced DOM)
let categorySelect;

// ===== Helpers =====
function pickRandom(arr) {
  return arr.length ? arr[Math.floor(Math.random() * arr.length)] : null;
}

function renderCategoryControl() {
  // If already created, refresh options only
  if (!categorySelect) {
    const wrap = document.createElement("div");
    wrap.style.display = "inline-flex";
    wrap.style.gap = "0.5rem";
    wrap.style.margin = "0.75rem 0";
    wrap.style.alignItems = "center";

    const label = document.createElement("label");
    label.textContent = "Category:";
    label.setAttribute("for", "categorySelect");

    categorySelect = document.createElement("select");
    categorySelect.id = "categorySelect";

    // Insert control before the "Show New Quote" button
    newQuoteBtn.parentNode.insertBefore(wrap, newQuoteBtn);
    wrap.append(label, categorySelect);

    categorySelect.addEventListener("change", (e) => {
      state.activeCategory = e.target.value;
      showRandomQuote();
    });
  }

  const prev = categorySelect.value || "All";
  categorySelect.innerHTML = "";

  // "All" option
  categorySelect.appendChild(new Option("All", "All"));

  // Sorted categories
  [...state.categories]
    .sort((a, b) => a.localeCompare(b))
    .forEach((cat) => categorySelect.appendChild(new Option(cat, cat)));

  // restore previous if still valid
  categorySelect.value =
    prev === "All" || state.categories.has(prev) ? prev : "All";
  state.activeCategory = categorySelect.value;
}

// ===== Step 2: showRandomQuote =====
function showRandomQuote() {
  const pool =
    state.activeCategory === "All"
      ? quotes
      : quotes.filter((q) => q.category === state.activeCategory);

  quoteDisplay.innerHTML = "";

  const chosen = pickRandom(pool);
  if (!chosen) {
    const p = document.createElement("p");
    p.textContent = "No quotes yet for this category.";
    quoteDisplay.appendChild(p);
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
}

// ===== Step 3: addQuote (matches your snippet) =====
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const catInput = document.getElementById("newQuoteCategory");

  const text = (textInput.value || "").trim();
  const category = (catInput.value || "").trim();

  if (!text || !category) {
    alert("Please enter both a quote and a category.");
    return;
  }

  quotes.push({ text, category });
  state.categories.add(category);

  // Refresh UI: categories + quote display
  renderCategoryControl();
  categorySelect.value = category;
  state.activeCategory = category;
  showRandomQuote();

  // Clear fields
  textInput.value = "";
  catInput.value = "";
}

// Expose addQuote to the global scope because the HTML uses onclick="addQuote()"
window.addQuote = addQuote;

// ===== Init =====
document.addEventListener("DOMContentLoaded", () => {
  renderCategoryControl();
  showRandomQuote();
  newQuoteBtn.addEventListener("click", showRandomQuote);
});
