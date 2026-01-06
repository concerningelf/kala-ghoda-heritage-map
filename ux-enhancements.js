// UX Enhancements - Append to end of script.js or include separately

// ============================================
// 3. RECENTER BUTTON
// ============================================
let currentSelectedLocation = null;
let recenterBtn = null;

function initRecenterButton(map) {
    recenterBtn = document.getElementById('recenter-btn');
    if (!recenterBtn) return;

    recenterBtn.addEventListener('click', function () {
        if (currentSelectedLocation) {
            map.flyTo({
                center: currentSelectedLocation,
                zoom: window.innerWidth < 768 ? 17 : 17.5,
                speed: 1,
                curve: 1
            });
            hideRecenterButton();
        }
    });

    // Show/hide based on map movement
    map.on('move', function () {
        if (currentSelectedLocation && recenterBtn) {
            const center = map.getCenter();
            const distance = getDistance(
                center.lat, center.lng,
                currentSelectedLocation[1], currentSelectedLocation[0]
            );

            // Show button if moved more than 500m away
            if (distance > 0.5) {
                showRecenterButton();
            } else {
                hideRecenterButton();
            }
        }
    });
}

function showRecenterButton() {
    if (recenterBtn) {
        recenterBtn.style.display = 'flex';
        setTimeout(() => recenterBtn.classList.add('show'), 10);
    }
}

function hideRecenterButton() {
    if (recenterBtn) {
        recenterBtn.classList.remove('show');
        setTimeout(() => recenterBtn.style.display = 'none', 400);
    }
}

// Simple distance calculator
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// ============================================
// 5. RECENT SEARCHES
// ============================================
const MAX_RECENT_SEARCHES = 5;

function saveRecentSearch(query) {
    if (!query || query.length < 2) return;

    let recent = JSON.parse(localStorage.getItem('recentSearches') || '[]');
    recent = recent.filter(item => item.toLowerCase() !== query.toLowerCase());
    recent.unshift(query);
    recent = recent.slice(0, MAX_RECENT_SEARCHES);

    localStorage.setItem('recentSearches', JSON.stringify(recent));
}

function getRecentSearches() {
    return JSON.parse(localStorage.getItem('recentSearches') || '[]');
}

function showRecentSearches() {
    const recent = getRecentSearches();
    const resultsDiv = document.getElementById('search-results');
    if (!resultsDiv || recent.length === 0) return;

    const html = `
        <div class="recent-searches">
            <div class="recent-searches-title">Recent Searches</div>
            ${recent.map(search => `
                <div class="recent-search-item" data-query="${search}">
                    <i class="fa-solid fa-clock-rotate-left"></i>
                    ${search}
                </div>
            `).join('')}
        </div>
    `;

    resultsDiv.innerHTML = html;
    resultsDiv.style.display = 'block';

    // Add click handlers
    document.querySelectorAll('.recent-search-item').forEach(item => {
        item.addEventListener('click', function () {
            const query = this.getAttribute('data-query');
            document.getElementById('search-input').value = query;
            document.getElementById('search-input').dispatchEvent(new Event('input'));
        });
    });
}

// ============================================
// 6. CATEGORY FILTER CHIPS
// ============================================
function initCategoryChips(config, markerObjects) {
    const container = document.getElementById('category-chips');
    if (!container) return;

    const categories = Object.keys(config.colors);

    categories.forEach(category => {
        const chip = document.createElement('div');
        chip.className = 'category-chip';
        chip.style.borderColor = config.colors[category];
        chip.style.color = config.colors[category];
        chip.setAttribute('data-category', category);

        const icon = config.icons[category] || 'fa-circle';
        chip.innerHTML = `<i class="fa-solid ${icon}"></i><span>${category}</span>`;

        chip.addEventListener('click', function () {
            const isActive = this.classList.contains('active');

            if (isActive) {
                // Deactivate - show all
                this.classList.remove('active');
                this.style.background = '#fff';
                this.style.color = config.colors[category];
                markerObjects.forEach(m => m.element.style.display = '');
            } else {
                // Activate - filter to this category
                document.querySelectorAll('.category-chip').forEach(c => {
                    c.classList.remove('active');
                    const cat = c.getAttribute('data-category');
                    c.style.background = '#fff';
                    c.style.color = config.colors[cat];
                });

                this.classList.add('active');
                this.style.background = config.colors[category];
                this.style.color = '#fff';

                markerObjects.forEach(m => {
                    m.element.style.display = m.category === category ? '' : 'none';
                });
            }
        });

        container.appendChild(chip);
    });
}

// Export functions to global scope
window.initRecenterButton = initRecenterButton;
window.saveRecentSearch = saveRecentSearch;
window.getRecentSearches = getRecentSearches;
window.showRecentSearches = showRecentSearches;
window.initCategoryChips = initCategoryChips;
window.currentSelectedLocation = null;
window.setCurrentLocation = function (location) {
    window.currentSelectedLocation = location;
    currentSelectedLocation = location;
};
