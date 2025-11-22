// CACHE MODULE

const Cache = {
    // Storage object - holds cached data
    storage: {},

    // Cache lasts 5 minutes
    CACHE_DURATION: 5 * 60 * 1000,

    // Save data to cache
    set: function (key, data) {
        this.storage[key] = {
            data: data,
            timestamp: Date.now()
        };
        console.log(' Cached:', key);
    },

    // Get data from cache
    get: function (key) {
        const cached = this.storage[key];

        // Check if cache exists
        if (!cached) {
            console.log('Cache miss:', key);
            return null;
        }

        // Check if cache is expired (older than 5 minutes)
        const age = Date.now() - cached.timestamp;
        if (age > this.CACHE_DURATION) {
            console.log(' Cache expired:', key);
            delete this.storage[key];
            return null;
        }

        // Cache is valid
        console.log('Cache hit:', key);
        return cached.data;
    },

    // Clear all cache
    clear: function () {
        this.storage = {};
        console.log('yaay! Cache cleared');
    }
};