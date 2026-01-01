window.addEventListener('load', function() {
    initMap();
    initMobileGestures(); // New swipe logic
});

function showToast(message, duration = 2000) {
    var toast = document.getElementById('toast');
    var msg = document.getElementById('toast-msg');
    msg.innerText = message;
    toast.classList.add('show');
    clearTimeout(window.toastTimeout);
    window.toastTimeout = setTimeout(function() { toast.classList.remove('show'); }, duration);
}

// NEW: Swipe to close logic
function initMobileGestures() {
    const panel = document.getElementById('side-panel');
    let startY = 0;
    
    panel.addEventListener('touchstart', function(e) {
        // Only trigger if we are at the top of the scroll area (prevents conflicting with text scroll)
        var scrollArea = document.getElementById('panel-scroll-area');
        if (scrollArea.scrollTop === 0) {
            startY = e.touches[0].clientY;
        } else {
            startY = -1; // invalid
        }
    }, {passive: true});

    panel.addEventListener('touchmove', function(e) {
        if (startY < 0) return;
        const currentY = e.touches[0].clientY;
        const diff = currentY - startY;
        
        // If pulling down (positive diff)
        if (diff > 0) {
            // Visual feedback: drag the panel down slightly
            panel.style.transform = `translateY(${diff}px)`;
        }
    }, {passive: true});

    panel.addEventListener('touchend', function(e) {
        if (startY < 0) return;
        const endY = e.changedTouches[0].clientY;
        const diff = endY - startY;
        
        // Clear manual transform
        panel.style.transform = '';
        
        // Threshold: if dragged more than 80px down, close it
        if (diff > 80) {
            closePanel(false);
        } else {
            // Snap back to open if not dragged enough
            if(panel.classList.contains('open')) {
                panel.classList.add('open'); // Re-applies CSS transform
            }
        }
    }, {passive: true});
}

function initMap() {
    var initialZoom = window.innerWidth < 768 ? 15.0 : 16.5;
    var startCenter = [72.8320, 18.9263]; 

    var config = {
        style: 'https://api.maptiler.com/maps/019b6fe6-78c4-7dcb-b6eb-fed1b18171df/style.json?key=f0f0aibL2C05fTzSrqHq', 
        colors: { 'Art Deco': '#2a9d8f', 'Victorian': '#e76f51', 'Modern': '#264653', 'Lettering': '#7b2cbf', 'Ghost Site': '#95a5a6', 'Street Furniture': '#4a69bd', 'Living Heritage': '#27ae60' },
        icons: { 'Art Deco': 'fa-building', 'Victorian': 'fa-landmark', 'Modern': 'fa-square', 'Lettering': 'fa-font', 'Ghost Site': 'fa-ghost', 'Street Furniture': 'fa-road', 'Living Heritage': 'fa-users' },
        chapters: [
            { id: 'regal', category: 'Art Deco', title: 'Regal Cinema', image: './images/regal.jpg', description: 'One of the earliest Art Deco cinemas in India.', year: '1933', architect: 'Charles Stevens', builder: 'Framji Sidhwa', location: { center: [72.8325, 18.9246] } },
            { id: 'museum', category: 'Victorian', title: 'CSMVS Museum', image: './images/csmvs.jpg', description: 'Indo Saracenic landmark constructed using grey Kurla basalt.', year: '1914', architect: 'George Wittet', builder: 'Govt. of Bombay', location: { center: [72.8322, 18.9269] } },
            { id: 'elphinstone', category: 'Victorian', title: 'Elphinstone College', image: './images/elphinstone.jpg', description: 'Victorian Gothic Revival building with pointed arches.', year: '1871', architect: 'James Trubshawe', builder: 'Unknown', location: { center: [72.8309, 18.9271] } },
            { id: 'sassoon', category: 'Victorian', title: 'David Sassoon Library', image: './images/sassoon.jpg', description: 'Victorian Gothic architecture defined by pointed arches.', year: '1870', architect: 'Campbell & Gosling', builder: 'Scott McClelland', location: { center: [72.8311, 18.9277] } },
            { id: 'army', category: 'Victorian', title: 'Army and Navy Building', image: './images/army-navy.jpg', description: 'Late nineteenth century Neo Classical commercial building.', year: 'Late 19th C.', architect: 'Unknown', builder: 'British Military', location: { center: [72.8313, 18.9282] } },
            { id: 'esplanade', category: 'Victorian', title: 'Esplanade Mansion', image: './images/esplanade.jpg', description: 'Formerly Watson\'s Hotel. One of the earliest cast iron framed buildings.', year: '1865', architect: 'Rowland Mason Ordish', builder: 'British Engineers', location: { center: [72.8311, 18.9283] } },
            { id: 'jehangir', category: 'Modern', title: 'Jehangir Art Gallery', image: './images/jehangir.jpg', description: 'Modernist concrete structure with a distinctive cantilevered entrance.', year: '1952', architect: 'G. M. Bhuta', builder: 'Sir Cowasji Jehangir', location: { center: [72.8317, 18.9275] } },
            { id: 'statue', category: 'Street Furniture', title: 'Kala Ghoda Statue', image: './images/placeholder.jpg', description: 'Bronze statue installed to mark the historic site.', year: '2017', architect: 'Commissioned artwork', builder: 'Kala Ghoda Association', location: { center: [72.8318, 18.9279] } },
            { id: 'synagogue', category: 'Victorian', title: 'Keneseth Eliyahoo', image: './images/synagogue.jpg', description: 'Victorian era synagogue built for the Baghdadi Jewish community.', year: '1884', architect: 'Unknown', builder: 'Jewish Community', location: { center: [72.8326, 18.9281] } },
            { id: 'ropewalk', category: 'Street Furniture', title: 'Rope Walk Lane', image: './images/ropewalk.jpg', description: 'Historic lane characterised by enamel street signage.', year: '19th century', architect: 'Incremental', builder: 'Multiple', location: { center: [72.8323, 18.9278] } },
            { id: 'army-lettering', category: 'Lettering', title: 'Army and Navy Signage', image: './images/army-lettering.jpg', description: 'Original carved and painted serif lettering.', year: 'Late 19th C.', architect: 'Unknown', builder: 'British Military', location: { center: [72.83135, 18.9282] } },
            { id: 'ropewalk-signs', category: 'Lettering', title: 'Rope Walk Signs', image: './images/ropewalk-lettering.jpg', description: 'Blue enamel street signage with bilingual lettering.', year: '20th century', architect: 'Municipal signage', builder: 'BMC', location: { center: [72.83235, 18.9278] } },
            { id: 'lumiere', category: 'Ghost Site', title: 'Lumière Screening Site', image: './images/lumiere-placeholder.jpg', description: 'On July 7, 1896, the Lumière Brothers screened the first motion pictures.', year: '1896', architect: 'N/A', builder: 'Historic Event', location: { center: [72.83125, 18.92835] } },
            { id: 'hydrant', category: 'Street Furniture', title: 'British Fire Hydrant', image: './images/hydrant.jpg', description: 'A cast-iron fire hydrant from the Bombay Municipal Corporation era.', year: 'Late 19th C.', architect: 'BMC', builder: 'Foundry Cast', location: { center: [72.8325, 18.9276] } },
            { id: 'pavement', category: 'Living Heritage', title: 'The Pavement Gallery', image: './images/pavement.jpg', description: 'An informal exhibition space where aspiring artists display their work.', year: 'Ongoing', architect: 'The People', builder: 'Informal Usage', location: { center: [72.83165, 18.92745] } },
            { id: 'booksellers', category: 'Living Heritage', title: 'Secondhand Book Sellers', image: './images/books.jpg', description: 'The lineage of street book vendors near Flora Fountain.', year: 'Mid 20th C.', architect: 'N/A', builder: 'Vendor Collective', location: { center: [72.8305, 18.9290] } },
            { id: 'kerbstones', category: 'Street Furniture', title: 'Kurla Basalt Kerbstones', image: './images/kerb.jpg', description: 'Original massive blocks of grey Kurla basalt lining the pavement.', year: '19th Century', architect: 'City Engineers', builder: 'Public Works', location: { center: [72.8320, 18.9275] } },
            { id: 'rhythm', category: 'Ghost Site', title: 'Rhythm House', image: './images/rhythm-house.jpg', description: 'Formerly the city\'s premier music store.', year: '1940s', architect: 'Unknown', builder: 'Mehmood Curmally', location: { center: [72.8318, 18.9272] } },
            { id: 'wayside', category: 'Ghost Site', title: 'Wayside Inn', image: './images/wayside.jpg', description: 'Now the Khyber restaurant. Famous quaint tea room.', year: 'Early 20th C.', architect: 'N/A', builder: 'Historic Site', location: { center: [72.8317, 18.9286] } }
        ]
    };

    function parseYear(yearStr) {
        if (!yearStr) return 2025; 
        yearStr = yearStr.toString().toLowerCase();
        var match = yearStr.match(/(\d{4})/);
        if (match) return parseInt(match[0]);
        if (yearStr.includes('late 19th')) return 1890;
        if (yearStr.includes('mid 19th')) return 1850;
        if (yearStr.includes('early 19th')) return 1810;
        if (yearStr.includes('19th century')) return 1850;
        if (yearStr.includes('early 20th')) return 1910;
        if (yearStr.includes('mid 20th')) return 1950;
        if (yearStr.includes('late 20th')) return 1990;
        if (yearStr.includes('20th century')) return 1950;
        return 2025; 
    }

    var disabledCategories = [];
    var currentSliderYear = 2025;
    var markerObjects = [];
    var selectedMarker = null;

    var layersContent = document.getElementById('layers-content');
    var categories = [...new Set(config.chapters.map(function(item) { return item.category; }))];
    
    // Reset Button
    var allBtn = document.createElement('div');
    allBtn.className = 'filter-btn all-layers-btn active';
    allBtn.innerHTML = 'Reset Visibility';
    allBtn.onclick = function() { resetFilters(); };
    layersContent.appendChild(allBtn);

    // Layer Buttons
    categories.forEach(function(cat) {
        var btn = document.createElement('div'); 
        btn.className = 'filter-btn'; 
        btn.setAttribute('data-cat', cat);
        var color = config.colors[cat] || '#333';
        
        btn.innerHTML = `
            <div class="layer-label-group">
                <span class="dot-indicator" style="color:${color}"></span>
                <span>${cat}</span>
            </div>
            <div class="layer-actions">
                <span class="layer-solo-btn" title="Show Only This Layer">ONLY</span>
                <div class="layer-eye-btn" title="Toggle Visibility">HIDE</div>
            </div>
        `;
        
        btn.querySelector('.layer-eye-btn').addEventListener('click', function(e) { e.stopPropagation(); toggleCategory(cat, btn); });
        btn.querySelector('.layer-solo-btn').addEventListener('click', function(e) { 
            e.stopPropagation(); soloCategory(cat, btn.querySelector('.layer-solo-btn')); 
            if(window.innerWidth <= 768) closeMobileConsole();
        });
        layersContent.appendChild(btn);
    });

    // Mobile Filter Toggle Button Logic
    var mobileFilterBtn = document.createElement('div');
    mobileFilterBtn.id = 'mobile-filter-toggle';
    mobileFilterBtn.innerHTML = '<i class="fa-solid fa-layer-group"></i>';
    mobileFilterBtn.style.display = 'none';
    document.getElementById('search-container').appendChild(mobileFilterBtn);

    mobileFilterBtn.onclick = function() {
        var consolePanel = document.getElementById('console');
        if (consolePanel.classList.contains('open')) { closeMobileConsole(); } 
        else {
            consolePanel.classList.add('open');
            this.innerHTML = '<i class="fa-solid fa-xmark"></i>';
            this.style.background = '#333';
            this.style.color = '#fff';
            closePanel(true);
        }
    };
    
    // EXPOSE for global use
    window.closeMobileConsole = function() {
        var consolePanel = document.getElementById('console');
        var btn = document.getElementById('mobile-filter-toggle');
        if (consolePanel) consolePanel.classList.remove('open');
        if (btn) {
            btn.innerHTML = '<i class="fa-solid fa-layer-group"></i>';
            btn.style.background = '#fff';
            btn.style.color = '#333';
        }
    }

    function toggleCategory(cat, btn) {
        if (document.body.classList.contains('mode-1883')) return;
        var textBtn = btn.querySelector('.layer-eye-btn');
        if (disabledCategories.includes(cat)) {
            disabledCategories = disabledCategories.filter(c => c !== cat);
            btn.classList.remove('layer-hidden');
            textBtn.innerText = 'HIDE';
        } else {
            disabledCategories.push(cat);
            btn.classList.add('layer-hidden');
            textBtn.innerText = 'SHOW';
        }
        document.querySelectorAll('.layer-solo-btn').forEach(b => b.classList.remove('active-solo'));
        updateMapState();
        if(window.innerWidth <= 768) closeMobileConsole();
    }

    function soloCategory(targetCat, soloBtnElement) {
        if (document.body.classList.contains('mode-1883')) return;
        if (soloBtnElement.classList.contains('active-solo')) { resetFilters(); return; }
        disabledCategories = categories.filter(c => c !== targetCat);
        var allBtns = document.querySelectorAll('.filter-btn[data-cat]');
        allBtns.forEach(b => {
            var cat = b.getAttribute('data-cat');
            var textBtn = b.querySelector('.layer-eye-btn');
            var currentSoloBtn = b.querySelector('.layer-solo-btn');
            if (cat === targetCat) {
                b.classList.remove('layer-hidden'); textBtn.innerText = 'HIDE'; currentSoloBtn.classList.add('active-solo');
            } else {
                b.classList.add('layer-hidden'); textBtn.innerText = 'SHOW'; currentSoloBtn.classList.remove('active-solo');
            }
        });
        updateMapState();
    }

    function resetFilters() {
        if (document.body.classList.contains('mode-1883')) return;
        disabledCategories = [];
        var btns = document.querySelectorAll('.filter-btn[data-cat]');
        btns.forEach(b => {
            b.classList.remove('layer-hidden');
            b.querySelector('.layer-eye-btn').innerText = 'HIDE';
            b.querySelector('.layer-solo-btn').classList.remove('active-solo');
        });
        updateMapState();
        if(window.innerWidth <= 768) closeMobileConsole();
    }

    function updateMapState() {
        markerObjects.forEach(function(m) {
            var categoryVisible = !disabledCategories.includes(m.category);
            var timeVisible = m.year <= currentSliderYear;
            if (categoryVisible && timeVisible) {
                m.element.style.display = 'flex';
                m.element.style.opacity = '1';
            } else {
                m.element.style.display = 'none';
            }
        });
        if (selectedMarker && selectedMarker.style.display === 'none') { closePanel(false); }
    }

    // Separator & Wall Button
    var separator = document.createElement('div');
    separator.className = 'console-separator';
    layersContent.appendChild(separator);

    var wallBtn = document.createElement('div');
    wallBtn.id = 'wall-btn';
    wallBtn.className = 'filter-btn';
    wallBtn.innerHTML = '<div class="layer-label-group"><i class="fa-solid fa-archway"></i> Toggle 1860 Fort Wall</div>';
    wallBtn.onclick = function() { toggleLayer('fort-wall-layer', this); };
    layersContent.appendChild(wallBtn);
    
    var wallInfo = document.createElement('div');
    wallInfo.id = 'wall-info';
    wallInfo.innerHTML = '<strong>The Invisible Ramparts</strong>This dashed line traces the demolished fortifications of the Bombay Fort (removed 1862).';
    layersContent.appendChild(wallInfo);

    var layersHeader = document.getElementById('layers-header');
    var layersArrow = document.getElementById('layers-arrow');
    layersHeader.addEventListener('click', function() {
        if (layersContent.classList.contains('collapsed')) {
            layersContent.classList.remove('collapsed');
            layersArrow.classList.add('rotated'); 
        } else {
            layersContent.classList.add('collapsed');
            layersArrow.classList.remove('rotated'); 
        }
    });

    // MAP INITIALIZATION
    var defaultBottomPadding = window.innerWidth < 768 ? 0 : 300;
    var mapPadding = { top: 0, bottom: defaultBottomPadding, left: 0, right: 0 };

    var map = new maplibregl.Map({
        container: 'map',
        style: config.style,
        center: startCenter, 
        zoom: initialZoom,
        minZoom: 14.5, 
        maxBounds: [[72.8100, 18.9100], [72.8500, 18.9450]],
        pitch: 45, bearing: -15, antialias: true, attributionControl: false,
        padding: mapPadding
    });
    
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
    map.addControl(new maplibregl.ScaleControl({ maxWidth: 100, unit: 'metric' }), 'bottom-left');

    // Time Slider Logic
    var parsedYears = config.chapters.map(c => parseYear(c.year)).filter(y => !isNaN(y) && y !== 2025);
    var minYear = parsedYears.length > 0 ? Math.min(...parsedYears) : 1850;
    var maxYear = 2025;
    
    document.getElementById('label-min').innerText = minYear;

    var timeWidget = document.getElementById('time-widget');
    var sliderInput = document.createElement('input');
    sliderInput.type = 'range'; sliderInput.min = minYear; sliderInput.max = maxYear; sliderInput.value = maxYear; sliderInput.id = 'year-slider';
    timeWidget.insertBefore(sliderInput, timeWidget.querySelector('.range-labels'));

    sliderInput.addEventListener('input', function(e) {
        var year = parseInt(e.target.value);
        document.getElementById('year-display').innerText = (year === parseInt(e.target.max)) ? "Present Day" : "Year: " + year;
        currentSliderYear = year;
        updateMapState();
    });

    window.closeTimeWidget = function() {
        document.getElementById('time-widget').classList.remove('active');
        document.getElementById('time-travel-btn').classList.remove('active-control');
    };

    // TIME WIDGET INITIALIZATION
    var timeTravelBtn = document.getElementById('time-travel-btn');
    var timeWidgetEl = document.getElementById('time-widget');
    
    if (window.innerWidth >= 768) {
        timeWidgetEl.classList.add('active');
        timeTravelBtn.classList.add('active-control');
    }

    timeTravelBtn.addEventListener('click', function() {
        var btn = this;
        if (document.body.classList.contains('mode-1883')) {
            if(window.innerWidth <= 768) showToast("Time Travel unavailable in 1883 Mode");
            return;
        }
        if (timeWidgetEl.classList.contains('active')) {
            timeWidgetEl.classList.remove('active');
            btn.classList.remove('active-control');
        } else {
            timeWidgetEl.classList.add('active');
            btn.classList.add('active-control');
        }
    });

    // Control Buttons
    function setupControl(id, action) {
        var btn = document.getElementById(id);
        btn.addEventListener('click', function() {
            if(document.body.classList.contains('mode-1883') && id !== 'map-1883-btn' && id !== 'zoom-in-btn' && id !== 'zoom-out-btn' && id !== 'compass-btn') { return; }
            action();
            if (window.innerWidth <= 768) { var msg = btn.getAttribute('data-msg'); if(msg) showToast(msg); }
        });
    }

    setupControl('zoom-in-btn', () => map.zoomIn());
    setupControl('zoom-out-btn', () => map.zoomOut());
    
    var view3dBtn = document.getElementById('view-3d-btn');
    map.on('pitch', function() { if (map.getPitch() > 5) view3dBtn.classList.add('active-control'); else view3dBtn.classList.remove('active-control'); });
    map.on('load', function() { if (map.getPitch() > 5) view3dBtn.classList.add('active-control'); });

    map.on('rotate', function() {
        var compassIcon = document.querySelector('#compass-btn i');
        compassIcon.style.transform = `rotate(${-map.getBearing()}deg)`;
    });

    setupControl('compass-btn', () => { map.flyTo({ bearing: 0, pitch: 0 }); });
    setupControl('view-3d-btn', () => { var currentPitch = map.getPitch(); if (currentPitch > 5) { map.easeTo({ pitch: 0, bearing: 0 }); } else { map.easeTo({ pitch: 45, bearing: -15 }); } });
    
    setupControl('reset-view-btn', () => { 
        map.flyTo({ center: startCenter, zoom: initialZoom, pitch: 45, bearing: -15, duration: 2000 }); 
        closePanel(true); 
    });

    setupControl('map-1883-btn', function() { toggle1883Map(document.getElementById('map-1883-btn')); });

    var geolocate = new maplibregl.GeolocateControl({ positionOptions: { enableHighAccuracy: true }, trackUserLocation: true });
    map.addControl(geolocate); 
    setupControl('locate-btn', () => geolocate.trigger());

    var tooltip = document.getElementById('tooltip');
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');

    searchInput.addEventListener('input', function(e) {
        const val = e.target.value.toLowerCase();
        if (val.length < 1) { searchResults.style.display = 'none'; return; }
        const matches = config.chapters.filter(item => item.title.toLowerCase().includes(val) || item.category.toLowerCase().includes(val));
        searchResults.innerHTML = ''; 
        searchResults.style.display = 'block';
        if (matches.length > 0) {
            matches.forEach(item => {
                const div = document.createElement('div'); div.className = 'search-item';
                div.innerHTML = `<span class="search-item-title">${item.title}</span><span class="search-item-cat">${item.category}</span>`;
                div.addEventListener('click', () => { 
                    const targetObj = markerObjects.find(obj => obj.id === item.id); 
                    if (targetObj) { targetObj.element.click(); searchInput.value = ''; searchResults.style.display = 'none'; if(window.innerWidth <= 768) { document.getElementById('search-input').blur(); } } 
                });
                searchResults.appendChild(div);
            });
        } else { searchResults.innerHTML = '<div class="search-empty">No results found</div>'; }
    });
    document.addEventListener('click', function(e) { if (!document.getElementById('search-container').contains(e.target)) { searchResults.style.display = 'none'; } });

    document.addEventListener('keydown', function(event) {
        if (event.key === "Escape") {
            if (document.body.classList.contains('mode-1883')) { toggle1883Map(document.getElementById('map-1883-btn')); } 
            else { closePanel(false); }
        }
    });

    map.on("load", function () {
        map.setSky({ 'sky-color': '#87CEEB', 'sky-horizon-blend': 0.5, 'horizon-color': '#ffffff', 'fog-color': '#888888', 'fog-ground-blend': 0.5 });
        var layers = map.getStyle().layers;
        layers.forEach(function(layer) { if (layer.type === 'symbol' && layer.layout && layer.layout['text-field']) { map.setLayoutProperty(layer.id, 'text-font', ['Noto Serif Regular', 'Open Sans Regular', 'Arial Unicode MS Regular']); } });

        map.addSource('source-1883', { 'type': 'image', 'url': './images/fort-1883.jpg', 'coordinates': [[72.8228, 18.9435], [72.8492, 18.9435], [72.8492, 18.9235], [72.8228, 18.9235]] });
        map.addLayer({ 'id': 'layer-1883', 'type': 'raster', 'source': 'source-1883', 'paint': { 'raster-fade-duration': 0 }, 'layout': { 'visibility': 'none' } });
        map.addLayer({ 'id': '3d-buildings', 'source': 'openmaptiles', 'source-layer': 'building', 'type': 'fill-extrusion', 'minzoom': 15, 'paint': { 'fill-extrusion-color': '#f0f0f0', 'fill-extrusion-height': ['get', 'render_height'], 'fill-extrusion-base': ['get', 'render_min_height'], 'fill-extrusion-opacity': 0.9 } });

        var fortWallGeoJSON = { "type": "Feature", "geometry": { "type": "LineString", "coordinates": [[72.8312, 18.9278], [72.8318, 18.9276], [72.8325, 18.9273], [72.8335, 18.9268], [72.8342, 18.9265]] } };
        map.addSource('fort-wall', { 'type': 'geojson', 'data': fortWallGeoJSON });
        map.addLayer({ 'id': 'fort-wall-layer', 'type': 'line', 'source': 'fort-wall', 'layout': { 'line-join': 'round', 'line-cap': 'round', 'visibility': 'none' }, 'paint': { 'line-color': '#c0392b', 'line-width': 4, 'line-dasharray': [2, 4] } });

        config.chapters.forEach(function(record) {
            var color = config.colors[record.category] || '#333';
            var iconClass = config.icons[record.category] || 'fa-map-marker-alt';
            var el = document.createElement('div'); el.className = 'marker'; el.style.backgroundColor = color; el.innerHTML = '<i class="fa-solid ' + iconClass + '"></i>';
            record.parsedYear = parseYear(record.year);
            el.onclick = function(e) { e.stopPropagation(); openPanel(record, color, el); };
            if (window.matchMedia('(hover: hover)').matches) {
                el.addEventListener('mouseenter', function(e) { tooltip.innerText = record.title; var rect = el.getBoundingClientRect(); tooltip.style.left = rect.left + (rect.width / 2) + 'px'; tooltip.style.top = rect.top + 'px'; tooltip.style.opacity = '1'; });
                el.addEventListener('mouseleave', function() { tooltip.style.opacity = '0'; });
            }
            var marker = new maplibregl.Marker({ element: el, anchor: 'bottom' }).setLngLat(record.location.center).addTo(map);
            markerObjects.push({ element: el, category: record.category, marker: marker, id: record.id, title: record.title, year: record.parsedYear });
        });
    });

    map.on('click', function() { closePanel(false); closeMobileConsole(); });

    // GLOBAL: Close Panel Function
    window.closePanel = function(preventCameraMove) {
        document.getElementById('side-panel').classList.remove('open');
        if (selectedMarker) { selectedMarker.classList.remove('selected'); selectedMarker = null; }
        if (!preventCameraMove && window.innerWidth >= 768) { map.flyTo({ zoom: initialZoom, speed: 0.6 }); }
    }

    function openPanel(record, color, markerEl) {
        if (selectedMarker) selectedMarker.classList.remove('selected');
        markerEl.classList.add('selected'); selectedMarker = markerEl;
        var infoHTML = `<div class="panel-info"><div class="panel-info-row"><span class="panel-info-label">Year</span><span class="panel-info-val">${record.year}</span></div><div class="panel-info-row"><span class="panel-info-label">Architect</span><span class="panel-info-val">${record.architect}</span></div><div class="panel-info-row"><span class="panel-info-label">Builder</span><span class="panel-info-val">${record.builder}</span></div></div>`;
        var destLat = record.location.center[1]; var destLng = record.location.center[0];
        var navUrl = `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}&travelmode=walking`;
        var navButton = `<a href="${navUrl}" target="_blank" class="panel-action-btn"><i class="fa-solid fa-diamond-turn-right"></i> Navigate Here</a>`;
        var imageHTML = `<div class="panel-img-container"><img src="${record.image}" class="panel-img"></div>`;
        var panelContent = imageHTML + `<div class="panel-content"><span class="panel-cat" style="color:${color}">${record.category}</span><div class="panel-title">${record.title}</div><p class="panel-desc">${record.description}</p>${infoHTML}${navButton}</div>`;
        document.getElementById('panel-inner').innerHTML = panelContent; 
        document.getElementById('side-panel').classList.add('open');
        closeMobileConsole();
        if (window.innerWidth >= 768) { map.flyTo({ center: record.location.center, zoom: 17.5, pitch: map.getPitch(), bearing: map.getBearing(), speed: 0.8, curve: 1 }); }
    }

    document.getElementById('close-btn').addEventListener('click', function() { closePanel(false); });

    window.toggleLayer = function(layerId, btn) {
        if (document.body.classList.contains('mode-1883')) return;
        var visibility = map.getLayoutProperty(layerId, 'visibility');
        var infoBox = document.getElementById('wall-info');
        
        if (visibility === 'visible') { 
            // Turning OFF
            map.setLayoutProperty(layerId, 'visibility', 'none'); 
            btn.classList.remove('active-control'); 
            infoBox.style.display = 'none';
        } else { 
            // Turning ON
            map.setLayoutProperty(layerId, 'visibility', 'visible'); 
            btn.classList.add('active-control'); 
            infoBox.style.display = 'block';
            setTimeout(function() { infoBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 50);
            
            // ** MOBILE SPECIFIC: Close panel & Show Toast **
            if (window.innerWidth <= 768) {
                closeMobileConsole();
                showToast("1860 Fort Wall Visible");
            }
        }
    };

    window.toggle1883Map = function(btn) {
        var layerId = 'layer-1883';
        var visibility = map.getLayoutProperty(layerId, 'visibility');
        var body = document.body;
        if (visibility === 'visible') {
            map.setLayoutProperty(layerId, 'visibility', 'none');
            btn.classList.remove('active-control'); body.classList.remove('mode-1883');
            updateMapState();
        } else {
            closeTimeWidget();
            document.getElementById('search-input').value = '';
            document.getElementById('search-results').style.display = 'none';
            map.fitBounds([[72.8228, 18.9235], [72.8492, 18.9435]], { padding: {top: 100, bottom: 100, left: 50, right: 50}, pitch: 0, bearing: 0 });
            map.setLayoutProperty(layerId, 'visibility', 'visible');
            btn.classList.add('active-control'); body.classList.add('mode-1883');
            markerObjects.forEach(function(m) { m.element.style.display = 'none'; });
            closePanel(true);
            if (window.innerWidth <= 768) showToast("1883 Mode Active: Other tools disabled");
        }
    };
}