
// MEDDIT - MAIN APPLICATION SCRIPT
// SIDEBAR FUNCTIONALITY


document.addEventListener('DOMContentLoaded', function () {

    // Initialize sidebar
    const menuBtn = document.querySelector('.menu-btn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const closeBtn = document.querySelector('.close-btn');

    // Check if sidebar elements exist
    if (menuBtn && sidebar && overlay && closeBtn) {

        // Open sidebar when hamburger clicked
        menuBtn.addEventListener('click', function () {
            sidebar.classList.add('open');
            overlay.classList.add('active');
        });

        // Close sidebar when X clicked
        closeBtn.addEventListener('click', function () {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
        });

        // Close sidebar when overlay clicked
        overlay.addEventListener('click', function () {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
        });

        // Close sidebar when Escape key pressed
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
                overlay.classList.remove('active');
            }
        });
    }

    // Initialize main app
    initializeApp();
});

// ========================================
// MAIN APP STATE & ELEMENTS
// ========================================

// Track current state
let currentCategory = 'general';
let currentSort = 'publishedAt';
let isSearchMode = false;

// Get DOM elements
const articlesContainer = document.getElementById('articles-container');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error-message'); // FIXED: was 'error'
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const sortSelect = document.getElementById('sort-options'); // FIXED: was 'sort-select'
const categoryBtns = document.querySelectorAll('.category-btn');

// ========================================
// INITIALIZE APP
// ========================================

function initializeApp() {
    console.log(' Meddit - African News Hub Started!');

    // Load default category
    loadArticles(currentCategory);

    // Attach event listeners
    attachEventListeners();
}

// ========================================
// EVENT LISTENERS
// ========================================

function attachEventListeners() {

    // Category button clicks
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const category = this.dataset.category;
            switchCategory(category);
        });
    });

    // Search button click
    searchBtn.addEventListener('click', performSearch);

    // Search on Enter key
    searchInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // Sort dropdown change
    sortSelect.addEventListener('change', function () {
        currentSort = this.value;

        // Reload with new sort
        if (isSearchMode) {
            performSearch();
        } else {
            loadArticles(currentCategory);
        }
    });
}

// ========================================
// CATEGORY SWITCHING
// ========================================

function switchCategory(category) {
    currentCategory = category;
    isSearchMode = false;
    searchInput.value = ''; // Clear search

    // Update active button styling
    categoryBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === category) {
            btn.classList.add('active');
        }
    });

    loadArticles(category);
}

// ========================================
// LOAD ARTICLES BY CATEGORY
// ========================================

async function loadArticles(category) {
    showLoading();
    hideError();

    try {
        // Fetch African news for this category
        const articles = await NewsAPI.fetchByCategory(category, currentSort);

        if (articles.length === 0) {
            showError('No African news found for this category. Try another one!');
        } else {
            displayArticles(articles);
        }

    } catch (error) {
        showError('Failed to load articles. Please check your connection and try again.');
        console.error('❌ Load error:', error);
    } finally {
        hideLoading();
    }
}

// ========================================
// SEARCH FUNCTIONALITY
// ========================================

async function performSearch() {
    const query = searchInput.value.trim();

    // Validate search input
    if (!query) {
        showError('Please enter something to search for!');
        setTimeout(hideError, 3000); // Hide after 3 seconds
        return;
    }

    isSearchMode = true;

    // Deactivate all category buttons
    categoryBtns.forEach(btn => btn.classList.remove('active'));

    showLoading();
    hideError();

    try {
        // Search African news
        const articles = await NewsAPI.searchArticles(query, currentSort);

        if (articles.length === 0) {
            showError(`No African news found for "${query}". Try different keywords!`);
        } else {
            displayArticles(articles);
        }

    } catch (error) {
        showError('Search failed. Please try again.');
        console.error('❌ Search error:', error);
    } finally {
        hideLoading();
    }
}

// ========================================
// DISPLAY ARTICLES
// ========================================

function displayArticles(articles) {
    // Clear existing articles
    articlesContainer.innerHTML = '';

    // Check if we have articles
    if (!articles || articles.length === 0) {
        articlesContainer.innerHTML = `
            <div style="text-align:center; padding:40px; grid-column: 1/-1;">
                <p style="font-size:18px; color:#7c7c7c;">No articles available.</p>
                <p style="font-size:14px; color:#7c7c7c; margin-top:10px;">Try a different category or search term.</p>
            </div>
        `;
        return;
    }

    // Create and append article cards
    articles.forEach(article => {
        const card = createArticleCard(article);
        articlesContainer.appendChild(card);
    });

    console.log(`✅ Displayed ${articles.length} articles`);
}

// ========================================
// CREATE ARTICLE CARD
// ========================================

function createArticleCard(article) {
    const card = document.createElement('div');
    card.className = 'article-card';

    // Format published date
    const date = new Date(article.publishedAt);
    const formattedDate = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    // Get article data with fallbacks
    const title = article.title || 'Untitled';
    const description = article.description || 'No description available.';
    const source = article.source?.name || 'Unknown Source';
    const imageUrl = article.urlToImage || 'https://via.placeholder.com/400x200?text=No+Image';

    // Truncate long descriptions
    const truncatedDesc = description.length > 150
        ? description.substring(0, 150) + '...'
        : description;

    // Build card HTML
    card.innerHTML = `
        ${imageUrl ? `<img src="${imageUrl}" alt="${escapeHtml(title)}" onerror="this.src='https://via.placeholder.com/400x200?text=Image+Not+Available'">` : ''}
        <div class="article-meta">
            <span class="article-source">${escapeHtml(source)}</span>
            <span class="article-date">${formattedDate}</span>
        </div>
        <h3>${escapeHtml(title)}</h3>
        <p>${escapeHtml(truncatedDesc)}</p>
    `;

    // Make card clickable to open article
    card.addEventListener('click', function () {
        window.open(article.url, '_blank', 'noopener,noreferrer');
    });

    return card;
}

// ========================================
// UTILITY FUNCTIONS
// ========================================

// Show loading spinner
function showLoading() {
    loadingEl.classList.remove('hidden');
    articlesContainer.innerHTML = '';
}

// Hide loading spinner
function hideLoading() {
    loadingEl.classList.add('hidden');
}

// Show error message
function showError(message) {
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
}

// Hide error message
function hideError() {
    errorEl.classList.add('hidden');
}

// Prevent XSS attacks - escape HTML characters
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}