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

// ========== DOM ELEMENTS ==========
const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const categoryFilter = document.getElementById("categoryFilter");

// ========== POPULATE CATEGORY DROPDOWN ==========
function populateCategories() {
  const uniqueCategories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = `<option value="all">All Categories</option>`;
  uniqueCategories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });

  const savedCategory = localStorage.getItem("selectedCategory");
  if (savedCategory) categoryFilter.value = savedCategory;
}

// ========== DISPLAY RANDOM QUOTE ==========
function showRandomQuote() {
  const selectedCategory = categoryFilter.value;
  const filteredQuotes = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category === selectedCategory);

  if (filteredQuotes.length === 0) {
    quoteDisplay.textContent = "No quotes available for this category.";
    return;
  }

  const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
  const randomQuote = filteredQuotes[randomIndex];
  quoteDisplay.textContent = `"${randomQuote.text}" — ${randomQuote.category}`;
}

// ========== FILTER FUNCTION ==========
function filterQuotes() {
  const selectedCategory = categoryFilter.value;
  localStorage.setItem("selectedCategory", selectedCategory);
  showRandomQuote();
}

// ========== EXPORT & IMPORT ==========
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

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (event) {
    try {
      const importedQuotes = JSON.parse(event.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        populateCategories();
        showRandomQuote();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON format! Must be an array of quotes.");
      }
    } catch (error) {
      alert("Error parsing JSON file!");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// ========== SERVER SYNC (MOCK API) ==========

// --- Fetch Quotes from Mock Server ---
async function fetchQuotesFromServer() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts");
    const serverData = await response.json();

    // Simulate server quotes using mock post data
    const serverQuotes = serverData.slice(0, 5).map(post => ({
      text: post.title,
      category: "Server"
    }));

    // Merge with local quotes (server takes precedence)
    const allQuotes = [...quotes, ...serverQuotes];
    const unique = Array.from(new Map(allQuotes.map(q => [q.text, q])).values());
    quotes = unique;

    saveQuotes();
    populateCategories();
    console.log("Quotes synced from server.");
  } catch (error) {
    console.error("Error fetching from server:", error);
  }
}

// --- Post New Quotes to Server (Simulated) ---
async function postQuoteToServer(quote) {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(quote),
    });

    const result = await response.json();
    console.log("Posted to server:", result);
  } catch (error) {
    console.error("Error posting to server:", error);
  }
}

// ========== ADD NEW QUOTE ==========
function addQuote() {
  const text = prompt("Enter the quote text:");
  const category = prompt("Enter a category:");

  if (!text || !category) {
    alert("Both fields are required!");
    return;
  }

  const newQuote = { text, category };
  quotes.push(newQuote);
  saveQuotes();
  populateCategories();
  alert("Quote added successfully!");

  // Post to server simulation
  postQuoteToServer(newQuote);
}

// ========== INIT ==========
newQuoteBtn.addEventListener("click", showRandomQuote);
categoryFilter.addEventListener("change", filterQuotes);

window.onload = () => {
  populateCategories();
  showRandomQuote();
  fetchQuotesFromServer(); // initial sync
  setInterval(fetchQuotesFromServer, 60000); // auto sync every 60 seconds
};
