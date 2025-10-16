// ========== Initialize Data ==========
let quotes = JSON.parse(localStorage.getItem("quotes")) || [
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

// --- SAVE QUOTES TO LOCAL STORAGE ---
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// ========== Get References to DOM Elements ==========
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");

// ==========Create Elements Dynamically ==========
const categorySelect = document.createElement("select");
const addQuoteSection = document.createElement("div");
const quoteText = document.createElement("p");
const quoteCategory = document.createElement("p");

// Add to the DOM
document.body.insertBefore(categorySelect, quoteDisplay);
quoteDisplay.appendChild(quoteText);
quoteDisplay.appendChild(quoteCategory);
document.body.appendChild(addQuoteSection);

// ========== Populate Category Options ==========
function populateCategories() {
  const uniqueCategories = [...new Set(quotes.map(q => q.category))];
  categorySelect.innerHTML = `<option value="all">All Categories</option>`;
  uniqueCategories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categorySelect.appendChild(option);
  });
}

// ========== Display a Random Quote ==========
function showRandomQuote() {
  const selectedCategory = categorySelect.value;
  const filteredQuotes =
    selectedCategory === "all"
      ? quotes
      : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteText.textContent = "No quotes available for this category.";
    quoteCategory.textContent = "";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const randomQuote = filteredQuotes[randomIndex];

  quoteText.textContent = `"${randomQuote.text}"`;
  quoteCategory.textContent = `Category: ${randomQuote.category}`;

  // Save last viewed quote in session storage
  sessionStorage.setItem("lastQuote", JSON.stringify(randomQuote));
}

// --- RESTORE LAST VIEWED QUOTE (Session Storage) ---
window.onload = () => {
  const lastQuote = sessionStorage.getItem("lastQuote");
  if (lastQuote) {
    const quote = JSON.parse(lastQuote);
    quoteText.textContent = `"${quote.text}"`;
    quoteCategory.textContent = `Category: ${quote.category}`;
  }
};

// ========== Create Add-Quote Form ==========
function createAddQuoteForm() {
  addQuoteSection.innerHTML = `
    <h3>Add a New Quote</h3>
    <input id="newQuoteText" type="text" placeholder="Enter quote text" />
    <input id="newQuoteCategory" type="text" placeholder="Enter category" />
    <button id="addQuoteBtn">Add Quote</button>
  `;

  const addQuoteBtn = document.getElementById("addQuoteBtn");
  addQuoteBtn.addEventListener("click", addQuote);
}

// ========== Add New Quotes Dynamically ==========
function addQuote() {
  const newQuoteText = document.getElementById("newQuoteText").value.trim();
  const newQuoteCategory = document.getElementById("newQuoteCategory").value.trim();

  if (!newQuoteText || !newQuoteCategory) {
    alert("Please fill in both fields!");
    return;
  }

  quotes.push({ text: newQuoteText, category: newQuoteCategory });
  saveQuotes();
  populateCategories();

  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";
  alert("New quote added successfully!");
}

// --- EXPORT QUOTES TO JSON ---
function exportToJsonFile() {
  const jsonData = JSON.stringify(quotes, null, 2);
  const blob = new Blob([jsonData], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

// --- IMPORT FROM JSON FILE ---
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        alert("Quotes imported successfully!");
        showRandomQuote();
      } else {
        alert("Invalid JSON format! Must be an array of quotes.");
      }
    } catch (error) {
      alert("Error parsing JSON file!");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// ========== Add Event listeners ==========
newQuoteBtn.addEventListener("click", showRandomQuote);
categorySelect.addEventListener("change", showRandomQuote);

// Initialize everything
populateCategories();
createAddQuoteForm();
showRandomQuote();
