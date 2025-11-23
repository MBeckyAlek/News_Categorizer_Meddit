// Wait for page to load
document.addEventListener('DOMContentLoaded', function () {

    // Get sidebar elements
    const menuBtn = document.querySelector('.menu-btn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    const closeBtn = document.querySelector('.close-btn');

    // Open sidebar
    menuBtn.addEventListener('click', function () {
        sidebar.classList.add('open');
        overlay.classList.add('active');
    });

    // Close sidebar - X button
    closeBtn.addEventListener('click', closeSidebar);

    // Close sidebar - click outside
    overlay.addEventListener('click', closeSidebar);

    // Close sidebar - Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && sidebar.classList.contains('open')) {
            closeSidebar();
        }
    });

    function closeSidebar() {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
    }

    // Handle sidebar links
    document.querySelectorAll('.sidebar-link').forEach(link => {
        link.addEventListener('click', function (e) {
            const action = this.dataset.action;

            if (action) {
                e.preventDefault();
                closeSidebar();

                if (action === 'home') {
                    switchCategory('general');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                } else if (action === 'about') {
                    showAbout();
                } else if (action === 'sources') {
                    showSources();
                }
            }
        });
    });

    // Dark mode toggle
    const darkToggle = document.getElementById('dark-mode-toggle');
    const savedMode = localStorage.getItem('darkMode');

    // Apply saved dark mode preference
    if (savedMode === 'enabled') {
        document.body.classList.add('dark-mode');
        darkToggle.checked = true;
    }

    // Toggle dark mode
    darkToggle.addEventListener('change', function () {
        if (this.checked) {
            document.body.classList.add('dark-mode');
            localStorage.setItem('darkMode', 'enabled');
        } else {
            document.body.classList.remove('dark-mode');
            localStorage.setItem('darkMode', 'disabled');
        }
    });

    // Start the app
    initApp();
});

// Track app state
let currentCategory = 'general';
let currentSort = 'publishedAt';
let isSearchMode = false;

// Get page elements
const articlesContainer = document.getElementById('articles-container');
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error-message');
const searchInput = document.getElementById('search-input');
const searchBtn = document.getElementById('search-btn');
const sortSelect = document.getElementById('sort-options');
const categoryBtns = document.querySelectorAll('.category-btn');

// Initialize app
function initApp() {
    console.log('🚀 Meddit started!');
    loadArticles(currentCategory);
    setupListeners();
}

// Setup event listeners
function setupListeners() {
    // Category buttons
    categoryBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            switchCategory(this.dataset.category);
        });
    });

    // Search button
    searchBtn.addEventListener('click', performSearch);

    // Search on Enter
    searchInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') performSearch();
    });

    // Sort change
    sortSelect.addEventListener('change', function () {
        currentSort = this.value;
        isSearchMode ? performSearch() : loadArticles(currentCategory);
    });
}

// Switch category
function switchCategory(category) {
    currentCategory = category;
    isSearchMode = false;
    searchInput.value = '';

    // Update active button
    categoryBtns.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.category === category) {
            btn.classList.add('active');
        }
    });

    loadArticles(category);
}

// Load articles
async function loadArticles(category) {
    showLoading();
    hideError();

    try {
        const articles = await NewsAPI.fetchByCategory(category, currentSort);

        if (articles.length === 0) {
            showError('No articles found. Try another category!');
        } else {
            displayArticles(articles);
        }
    } catch (error) {
        showError('Failed to load articles. Check your connection.');
        console.error('❌ Load error:', error);
    } finally {
        hideLoading();
    }
}

// Search
async function performSearch() {
    const query = searchInput.value.trim();

    if (!query) {
        showError('Enter something to search!');
        setTimeout(hideError, 3000);
        return;
    }

    isSearchMode = true;
    categoryBtns.forEach(btn => btn.classList.remove('active'));

    showLoading();
    hideError();

    try {
        const articles = await NewsAPI.searchArticles(query, currentSort);

        if (articles.length === 0) {
            showError(`No results for "${query}"`);
        } else {
            displayArticles(articles);
        }
    } catch (error) {
        showError('Search failed. Try again.');
        console.error('❌ Search error:', error);
    } finally {
        hideLoading();
    }
}

// Display articles
function displayArticles(articles) {
    articlesContainer.innerHTML = '';

    if (!articles || articles.length === 0) {
        articlesContainer.innerHTML = `
            <div style="text-align:center; padding:40px; grid-column:1/-1;">
                <p style="font-size:18px; color:#7c7c7c;">No articles available.</p>
            </div>
        `;
        return;
    }

    articles.forEach(article => {
        articlesContainer.appendChild(createCard(article));
    });

    console.log(`✅ Showed ${articles.length} articles`);
}

// Create article card
function createCard(article) {
    const card = document.createElement('div');
    card.className = 'article-card';

    const date = new Date(article.publishedAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    const title = article.title || 'Untitled';
    const desc = article.description || 'No description.';
    const source = article.source?.name || 'Unknown';
    const img = article.urlToImage || 'https://via.placeholder.com/400x200?text=No+Image';

    // Shorten description if too long
    const shortDesc = desc.length > 150 ? desc.substring(0, 150) + '...' : desc;

    card.innerHTML = `
        <img src="${img}" alt="${clean(title)}" onerror="this.src='https://via.placeholder.com/400x200?text=No+Image'">
        <div class="article-meta">
            <span class="article-source">${clean(source)}</span>
            <span class="article-date">${date}</span>
        </div>
        <h3>${clean(title)}</h3>
        <p>${clean(shortDesc)}</p>
    `;

    // Open article when clicked
    card.addEventListener('click', function () {
        window.open(article.url, '_blank', 'noopener,noreferrer');
    });

    return card;
}

// Utility functions
function showLoading() {
    loadingEl.classList.remove('hidden');
    articlesContainer.innerHTML = '';
}

function hideLoading() {
    loadingEl.classList.add('hidden');
}

function showError(msg) {
    errorEl.textContent = msg;
    errorEl.classList.remove('hidden');
}

function hideError() {
    errorEl.classList.add('hidden');
}

// Prevent XSS attacks
function clean(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show about info
function showAbout() {
    alert('📰 Meddit - African News Hub\n\n' +
        'Version: 1.0\n' +
        'Focus: African news stories\n\n' +
        'Features:\n' +
        '✅ 7 news categories\n' +
        '✅ Search functionality\n' +
        '✅ Multiple sort options\n' +
        '✅ Dark mode support\n' +
        '✅ Smart caching\n\n' +
        'Powered by BecksMeddit & NewsAPI');
}

// Show sources info
function showSources() {
    alert('📡 News Sources\n\n' +
        'We get African news from:\n\n' +
        '• BBC News\n' +
        '• Al Jazeera\n' +
        '• Reuters\n' +
        '• CNN\n' +
        '• And more...\n\n' +
        'All filtered for African content only.');
}