// ========================================
// NEWS API HANDLER - AFRICAN NEWS ONLY
// ========================================

const NewsAPI = {

    // List of African countries for filtering
    AFRICAN_COUNTRIES: [
        'Nigeria', 'Kenya', 'South Africa', 'Ghana', 'Ethiopia',
        'Egypt', 'Tanzania', 'Uganda', 'Morocco', 'Algeria',
        'Sudan', 'Angola', 'Mozambique', 'Madagascar', 'Cameroon',
        'Ivory Coast', 'Niger', 'Burkina Faso', 'Mali', 'Malawi',
        'Zambia', 'Somalia', 'Senegal', 'Chad', 'Zimbabwe',
        'Rwanda', 'Benin', 'Burundi', 'Tunisia', 'Togo',
        'Sierra Leone', 'Libya', 'Liberia', 'Mauritania', 'Botswana',
        'Namibia', 'Gambia', 'Gabon', 'Lesotho', 'Guinea'
    ],

    // Build search query that includes African keywords
    buildAfricanQuery: function (category = '') {
        // Create OR query with African countries
        const countryQuery = this.AFRICAN_COUNTRIES.slice(0, 15).join(' OR ');

        // Add category to the search if provided
        if (category && category !== 'general') {
            return `(${countryQuery}) AND ${category}`;
        }

        // For general news, just use countries + "Africa"
        return `Africa OR ${countryQuery}`;
    },

    // Check if article is actually about Africa
    isAfricanNews: function (article) {
        const searchText = `${article.title} ${article.description} ${article.content || ''}`.toLowerCase();

        // Check if any African country is mentioned
        const hasAfricanCountry = this.AFRICAN_COUNTRIES.some(country =>
            searchText.includes(country.toLowerCase())
        );

        // Check for general African keywords
        const africanKeywords = ['africa', 'african', 'lagos', 'nairobi', 'johannesburg', 'cairo', 'accra'];
        const hasAfricanKeyword = africanKeywords.some(keyword =>
            searchText.includes(keyword)
        );

        return hasAfricanCountry || hasAfricanKeyword;
    },

    // Fetch articles by category - AFRICAN NEWS ONLY
    fetchByCategory: async function (category, sortBy = 'publishedAt') {
        const cacheKey = `african_category_${category}_${sortBy}`;

        // Check cache first to reduce API calls
        const cached = Cache.get(cacheKey);
        if (cached) {
            console.log('📦 Using cached African news for', category);
            return cached;
        }

        console.log('🌍 Fetching African news for category:', category);

        // Build African-focused search query
        const query = this.buildAfricanQuery(category);

        // Use 'everything' endpoint with African filtering
        const url = `${CONFIG.BASE_URL}/everything?` +
            `q=${encodeURIComponent(query)}&` +
            `pageSize=${CONFIG.PAGE_SIZE}&` +
            `sortBy=${sortBy}&` +
            `language=${CONFIG.LANGUAGE}&` +
            `apiKey=${CONFIG.API_KEY}`;

        try {
            const response = await fetch(url);

            // Check if request was successful
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Check API response status
            if (data.status !== 'ok') {
                throw new Error(data.message || 'API error occurred');
            }

            console.log(`📰 Received ${data.articles.length} articles from API`);

            // STRICT FILTERING: Only keep articles that are actually about Africa
            let africanArticles = data.articles.filter(article => {
                // Must have an image
                const hasImage = article.urlToImage && article.urlToImage !== null;

                // Must be about Africa (double-check)
                const isAfrican = this.isAfricanNews(article);

                return hasImage && isAfrican;
            });

            console.log(`✅ Filtered to ${africanArticles.length} African-only articles`);

            // If we have very few results, try a backup search
            if (africanArticles.length < 5) {
                console.log('⚠️ Few results, trying backup search...');
                const backupArticles = await this.fetchBackupAfrican(category, sortBy);
                africanArticles = [...africanArticles, ...backupArticles].slice(0, CONFIG.PAGE_SIZE);
            }

            // Cache the results for 5 minutes
            Cache.set(cacheKey, africanArticles);

            return africanArticles;

        } catch (error) {
            console.error('❌ API Error:', error);
            throw error;
        }
    },

    // Backup method: Try different search strategy if main search fails
    fetchBackupAfrican: async function (category, sortBy) {
        console.log('🔄 Trying backup African news search...');

        // Use simpler, broader search
        const simpleQuery = category === 'general' ? 'Africa news' : `Africa ${category}`;

        const url = `${CONFIG.BASE_URL}/everything?` +
            `q=${encodeURIComponent(simpleQuery)}&` +
            `pageSize=10&` +
            `sortBy=${sortBy}&` +
            `language=${CONFIG.LANGUAGE}&` +
            `apiKey=${CONFIG.API_KEY}`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data.status === 'ok') {
                return data.articles.filter(article =>
                    article.urlToImage && this.isAfricanNews(article)
                );
            }

            return [];

        } catch (error) {
            console.error('❌ Backup search failed:', error);
            return [];
        }
    },

    // Search articles - AFRICAN NEWS ONLY
    searchArticles: async function (query, sortBy = 'publishedAt') {
        // Don't search if query is empty
        if (!query || !query.trim()) {
            return [];
        }

        const cacheKey = `african_search_${query}_${sortBy}`;

        // Check cache first
        const cached = Cache.get(cacheKey);
        if (cached) {
            console.log('📦 Using cached search for', query);
            return cached;
        }

        console.log('🔍 Searching African news for:', query);

        // Combine user query with African context
        // This ensures results are about Africa even when searching general terms
        const africanQuery = `(Africa OR Nigeria OR Kenya OR "South Africa" OR Ghana OR Egypt) AND ${query}`;

        // Build search URL
        const url = `${CONFIG.BASE_URL}/everything?` +
            `q=${encodeURIComponent(africanQuery)}&` +
            `pageSize=${CONFIG.PAGE_SIZE}&` +
            `sortBy=${sortBy}&` +
            `language=${CONFIG.LANGUAGE}&` +
            `apiKey=${CONFIG.API_KEY}`;

        try {
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.status !== 'ok') {
                throw new Error(data.message || 'Search failed');
            }

            console.log(`📰 Found ${data.articles.length} search results`);

            // Filter to only African articles with images
            const africanResults = data.articles.filter(article =>
                article.urlToImage && this.isAfricanNews(article)
            );

            console.log(`✅ Filtered to ${africanResults.length} African search results`);

            // Cache the search results
            Cache.set(cacheKey, africanResults);

            return africanResults;

        } catch (error) {
            console.error('❌ Search Error:', error);
            throw error;
        }
    }
};