// ========== Initialize Data ==========
const quotes = [
  { text: "The only way to do great work is to love what you do.", category: "Inspiration" },
  { text: "The harder you work for something, the greater youll feel when you achieve it.", category: "Motivation" },
  { text: "Don't let yesterday take up too much of today.", category: "Life" },
  { text: "Success is not final, failure is not fatal: It is the courage to continue that counts.", category: "Motivation" },
  { text: "Life is really simple, but we insist on making it complicated.", category: "Wisdom" },
  { text: "In the middle of every difficulty lies opportunity.", category: "Inspiration" },
  { text: "You miss 100% of the shots you don't take.", category: "Motivation" },
  { text: "The purpose of our lives is to be happy.", category: "Life" },
  { text: "Be yourself; everyone else is already taken.", category: "Humor" },
  { text: "Happiness is not something ready-made. It comes from your own actions.", category: "Wisdom" }
];

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
  // Get unique categories
  const uniqueCategories = [...new Set(quotes.map(q => q.category))];
  
  // Clear and repopulate select element
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
  
  // Filter quotes based on category
  const filteredQuotes =
    selectedCategory === "all"
      ? quotes
      : quotes.filter(q => q.category === selectedCategory);

  // Handle empty category
  if (filteredQuotes.length === 0) {
    quoteText.textContent = "No quotes available for this category.";
    quoteCategory.textContent = "";
    return;
  }

  // Pick a random quote
  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const randomQuote = filteredQuotes[randomIndex];

  // Update DOM content
  quoteText.textContent = `"${randomQuote.text}"`;
  quoteCategory.textContent = `Category: ${randomQuote.category}`;
}

// ========== Create Add-Quote Form ==========
function createAddQuoteForm() {
  addQuoteSection.innerHTML = `
    <h3>Add a New Quote</h3>
    <input id="newQuoteText" type="text" placeholder="Enter quote text" />
    <input id="newQuoteCategory" type="text" placeholder="Enter category" />
    <button id="addQuoteBtn">Add Quote</button>
  `;

  // Add event listener for new quote button
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

  // Push to array
  quotes.push({ text: newQuoteText, category: newQuoteCategory });

  // Update dropdown and reset form
  populateCategories();
  document.getElementById("newQuoteText").value = "";
  document.getElementById("newQuoteCategory").value = "";

  alert("New quote added successfully!");
}

// ========== Add Event listeners ==========
newQuoteBtn.addEventListener("click", showRandomQuote);
categorySelect.addEventListener("change", showRandomQuote);

// Initialize everything
populateCategories();
createAddQuoteForm();
showRandomQuote();