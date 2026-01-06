// Integration helper - call this after map is fully loaded
// This connects the new UX features with the existing code

(function () {
    // Wait for the map and config to be ready
    const checkReady = setInterval(function () {
        if (typeof map !== 'undefined' && typeof config !== 'undefined' && typeof markerObjects !== 'undefined') {
            clearInterval(checkReady);
            initializeUXEnhancements();
        }
    }, 100);
})();

function initializeUXEnhancements() {
    // 1. Initialize recenter button
    if (typeof initRecenterButton !== 'undefined') {
        initRecenterButton(map);
    }

    // 2. Initialize category chips
    if (typeof initCategoryChips !== 'undefined') {
        initCategoryChips(config, markerObjects);
    }

    // 3. Add recent searches to search input
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('focus', function () {
            if (!this.value && typeof showRecentSearches !== 'undefined') {
                showRecentSearches();
            }
        });

        // Save searches when user selects a result
        const originalAddEventListener = searchInput.addEventListener;
        document.getElementById('search-results').addEventListener('click', function (e) {
            const item = e.target.closest('.search-item');
            if (item && typeof saveRecentSearch !== 'undefined') {
                const title = item.querySelector('.search-item-title');
                if (title) {
                    saveRecentSearch(title.textContent);
                }
            }
        });
    }

    // 4. Hook into the openPanel function to set current location
    if (typeof openPanel !== 'undefined') {
        const originalOpenPanel = window.openPanel;
        window.openPanel = function (record, color, markerEl) {
            if (typeof setCurrentLocation !== 'undefined') {
                setCurrentLocation(record.location.center);
            }
            originalOpenPanel(record, color, markerEl);
        };
    }

    console.log('✨ UX Enhancements initialized');
}
