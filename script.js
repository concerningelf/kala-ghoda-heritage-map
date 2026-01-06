window.addEventListener('load', function() {
    initMap();
    initMobileGestures(); 
});

// Top Tier: Haptic Feedback Helper
function triggerHaptic() {
    if (navigator.vibrate) {
        navigator.vibrate(15); // Light tap
    }
}

// Show Toast
function showToast(message, duration = 3000, isHtml = false, className = '') {
    var toast = document.getElementById('toast');
    var msg = document.getElementById('toast-msg');
    toast.className = ''; 
    if (isHtml) msg.innerHTML = message;
    else msg.innerText = message;
    if (className) toast.classList.add(className);
    toast.classList.add('show');
    clearTimeout(window.toastTimeout);
    window.toastTimeout = setTimeout(function() { toast.classList.remove('show'); }, duration);
}

// Mobile Gestures
function initMobileGestures() {
    // 1. Setup Side Panel
    const sidePanel = document.getElementById('side-panel');
    const sidePanelScroll = document.getElementById('panel-scroll-area');
    const sidePanelHandle = document.getElementById('panel-handle');
    attachDragGesture(sidePanel, sidePanelScroll, sidePanelHandle, function() {
        closePanel(false);
    });

    // 2. Setup Console Panel
    const consolePanel = document.getElementById('console');
    const consoleScroll = document.getElementById('console'); // Console itself is the scroll area
    const consoleHandle = document.getElementById('console-handle');
    attachDragGesture(consolePanel, consoleScroll, consoleHandle, function() {
        if(window.closeMobileConsole) window.closeMobileConsole();
    });
}

function attachDragGesture(panel, scrollArea, handle, closeCallback) {
    if (!panel) return;
    
    let startY = 0;
    let isDragging = false;

    panel.addEventListener('touchstart', function(e) {
        const touchTarget = e.target;
        // Don't drag if touching a close button
        if (touchTarget.closest('.mobile-close-btn')) return;
        
        // Check if we are at the top of the scrollable area
        // For console, scrollArea might be the panel itself
        const isAtTop = scrollArea ? (scrollArea.scrollTop <= 0) : true;
        
        // Determine if touch is on the handle or generally in the header area if at top
        const isHandle = (handle && handle.contains(touchTarget)) || touchTarget === panel || touchTarget.closest('#console-handle');
        
        if (isHandle || isAtTop) { 
            startY = e.touches[0].clientY; 
            isDragging = true; 
        } else { 
            isDragging = false; 
        }
    }, {passive: true});

    panel.addEventListener('touchmove', function(e) {
        if (!isDragging) return;
        const currentY = e.touches[0].clientY;
        const diff = currentY - startY;
        
        // Only allow dragging DOWN
        if (diff > 0) {
            if (e.cancelable && diff > 5) e.preventDefault(); 
            panel.style.transform = `translateY(${diff}px)`;
            panel.style.transition = 'none'; 
        }
    }, {passive: false});

    panel.addEventListener('touchend', function(e) {
        if (!isDragging) return;
        isDragging = false;
        const endY = e.changedTouches[0].clientY;
        const diff = endY - startY;
        
        panel.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.25, 1)';
        panel.style.transform = ''; 
        
        // Threshold to close
        if (diff > 100) { 
            closeCallback(); 
        } else { 
            // Reset position if not dragged far enough
            if(panel.classList.contains('open')) { 
                panel.style.transform = ''; 
            }
        }
    }, {passive: true});
}

function initMap() {
    var initialZoom = window.innerWidth < 768 ? 15.0 : 16.5;
    var startCenter = [72.8322, 18.9270]; 

    var config = {
        style: 'https://api.maptiler.com/maps/019b6fe6-78c4-7dcb-b6eb-fed1b18171df/style.json?key=f0f0aibL2C05fTzSrqHq', 
        colors: { 
            'Art Deco': '#2a9d8f', 'Victorian': '#e76f51', 'Modern': '#264653', 
            'Indo-Saracenic': '#b33939', 'Neoclassical': '#8e44ad', 'Public Space': '#27ae60',
            'Lettering': '#7b2cbf', 'Ghost Site': '#95a5a6', 'Street Furniture': '#4a69bd', 
            'Living Heritage': '#f39c12' 
        },
        icons: { 
            'Art Deco': 'fa-building', 'Victorian': 'fa-landmark', 'Modern': 'fa-square', 
            'Indo-Saracenic': 'fa-gopuram', 'Neoclassical': 'fa-columns', 'Public Space': 'fa-tree',
            'Lettering': 'fa-font', 'Ghost Site': 'fa-ghost', 'Street Furniture': 'fa-road', 
            'Living Heritage': 'fa-users' 
        },
        chapters: [
            // --- SP MUKHERJEE CHOWK (REGAL CIRCLE) ---
            // 1. Wellington Fountain
            { id: 'wellington', category: 'Neoclassical', title: 'Wellington Fountain', image: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Wellington_fountain_with_the_MH_Police_HQ_in_background%2C_Mumbai.jpg', description: 'Built to commemorate the Duke of Wellington’s visits to Bombay. It is the only fountain in the city built in the Neoclassical style.', year: '1865', architect: 'Gen. Barr / Sir George Gilbert Scott', builder: 'Public Subscription', location: { center: [72.832344, 18.925439] } },
            // 21. Regal Cinema (FIXED: Moved South to Circle)
            { id: 'regal', category: 'Art Deco', title: 'Regal Cinema', image: './images/regal.jpg', description: 'One of the earliest Art Deco cinemas in India.', year: '1933', architect: 'Charles Stevens', builder: 'Framji Sidhwa', location: { center: [72.83245, 18.92455] } }, // Moved down
            // 20. Police Headquarters (FIXED: Across the street)
            { id: 'police-hq', category: 'Victorian', title: 'Police Headquarters', image: 'https://upload.wikimedia.org/wikipedia/commons/0/0e/Maharashtra_Police_Headquarters.jpg', description: 'Formerly the Royal Alfred Sailors’ Home. A masterpiece of Gothic architecture.', year: '1876', architect: 'F.W. Stevens', builder: 'Govt. of Bombay', location: { center: [72.83334037487425, 18.92524244911638] } },
            // 22. Majestic (FIXED: North of Regal)
            { id: 'majestic', category: 'Indo-Saracenic', title: 'Majestic Aamdar Niwas', image: 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Majestic_MLA_Hostel_Mumbai_by_Dr._Raju_Kasambe_DSCN0428_(28).jpg', description: 'Formerly the Majestic Hotel. An Indo-Saracenic gem now used as a hostel for legislators.', year: '1909', architect: 'W.A. Chambers', builder: 'Private', location: { center: [72.8318474719337, 18.9246768777787] } },
            // 23. Indian Mercantile (Waterloo) (FIXED: Distinct from Majestic)
            { id: 'mercantile', category: 'Indo-Saracenic', title: 'Indian Mercantile Mansion', image: 'https://upload.wikimedia.org/wikipedia/commons/4/48/Indian_Mercantile_Mansion%2C_Colaba%2C_Mumbai_as_seen_from_Madame_Cama_Road.jpg', description: 'Also known as Waterloo Mansions. A grand residential building with Gothic arches.', year: '1900', architect: 'Unknown', builder: 'Private', location: { center: [72.83188959451451, 18.924916574206417] } }, // Moved slightly west

            // --- MUSEUM PRECINCT ---
            // 3. Institute of Science
            { id: 'science', category: 'Indo-Saracenic', title: 'Institute of Science', image: 'https://upload.wikimedia.org/wikipedia/commons/b/bb/Entrance_of_the_Institute_of_Science%2C_Fort%2C_Mumbai.jpg', description: 'A majestic Indo-Saracenic building built using yellow Kharodi basalt.', year: '1920', architect: 'George Wittet', builder: 'Govt. of Bombay', location: { center: [72.83025908124948, 18.926175121968605] } },
            // 2. NGMA (Offset slightly East from Institute)
            { id: 'ngma', category: 'Indo-Saracenic', title: 'NGMA (Cowasji Jehangir Hall)', image: 'https://upload.wikimedia.org/wikipedia/commons/6/6c/Sir_Cowasji_Jehangir_Hall_Front.jpg', description: 'Originally the Cowasji Jehangir Public Hall, now the National Gallery of Modern Art.', year: '1911', architect: 'George Wittet', builder: 'Sir Cowasji Jehangir', location: { center: [72.83156173339212, 18.925786832066194] } },
            // 4. CSMVS Museum (Centered in grounds to avoid overlap)
            { id: 'museum', category: 'Indo-Saracenic', title: 'CSMVS Museum', image: './images/csmvs.jpg', description: 'Indo Saracenic landmark constructed using grey Kurla basalt. Formerly the Prince of Wales Museum.', year: '1914', architect: 'George Wittet', builder: 'Govt. of Bombay', location: { center: [72.83222, 18.92666] } },
            // 16. Cama Oriental (Nudged North East)
            { id: 'cama', category: 'Indo-Saracenic', title: 'Cama Oriental Institute', image: 'https://upload.wikimedia.org/wikipedia/commons/b/b8/The_K.R._Cama_Oriental_Institute_in_Fort%2C_Mumbai.jpg', description: 'A premier institute for Indology and Persian studies, inaugurated in 1916.', year: '1916', architect: 'Unknown', builder: 'Sukhadwala Family', location: { center: [72.83370883446398, 18.927298478217665] } },
            // 16. Cama Oriental (Nudged North East)
            { id: 'camal', category: 'Lettering', title: 'Cama Oriental Lettering', image: './images/camal.jpg', description: 'A premier institute for Indology and Persian studies, inaugurated in 1916.', year: '1916', architect: 'Unknown', builder: 'Sukhadwala Family', location: { center: [72.83372155899576, 18.927352307697504] } },
            // 19. Lion's Gate
            { id: 'lions-gate', category: 'Victorian', title: 'Lion’s Gate', image: 'https://upload.wikimedia.org/wikipedia/commons/5/5d/Naval_Dockyard_Mumbai.jpg', description: 'The main entrance to the Naval Dockyard, guarded by two stone lions.', year: '1890', architect: 'Royal Navy', builder: 'Bombay Dockyard', location: { center: [72.83421608761844, 18.926268371527307] } },
            // 28. BNHS (Nudged South of Lion Gate)
            { id: 'bnhs', category: 'Lettering', title: 'BNHS (Hornbill House)', image: 'https://upload.wikimedia.org/wikipedia/commons/7/73/BNHS_Office_by_Raju_KasambeDSCN7078_(7)_05.jpg', description: 'Headquarters of the Bombay Natural History Society.', year: '1965', architect: 'Unknown', builder: 'BNHS', location: { center: [72.8332718521053, 18.92623514458551] } },
            // 18. St Andrews (Distinct location)
            { id: 'standrews', category: 'Neoclassical', title: 'St. Andrew’s Cathedral', image: 'https://upload.wikimedia.org/wikipedia/commons/8/81/A_heritage_structure_of_early_19th_century.jpg', description: 'A Scottish Presbyterian church with a classic steeple.', year: '1819', architect: 'Thomas Dadford', builder: 'Scottish Community', location: { center: [72.83370123061556, 18.92693820553702] } },

            // --- KALA GHODA CRESCENT (The dense area) ---
            // 6. Elphinstone College
            { id: 'elphinstone', category: 'Victorian', title: 'Elphinstone College', image: './images/elphinstone.jpg', description: 'Victorian Gothic Revival building with pointed arches.', year: '1871', architect: 'James Trubshawe', builder: 'Sir Cowasji Jehangir', location: { center: [72.83083411935105, 18.92497448499293] } },
            // 10. Rhythm House (Nudged West/Left side of street)
            { id: 'rhythm', category: 'Ghost Site', title: 'Rhythm House', image: './images/rhythm-house.jpg', description: 'Formerly the city\'s premier music store.', year: '1940s', architect: 'Unknown', builder: 'Mehmood Curmally', location: { center: [72.83160, 18.92715] } },
            // 12. Jehangir Art Gallery (Nudged East/Right side of street)
            { id: 'jehangir', category: 'Modern', title: 'Jehangir Art Gallery', image: './images/jehangir.jpg', description: 'Modernist concrete structure with a distinctive cantilevered entrance.', year: '1952', architect: 'G. M. Bhuta', builder: 'Sir Cowasji Jehangir', location: { center: [72.83185, 18.92745] } },
            // 17. Ador House (Nudged North of Rhythm House)
            { id: 'ador', category: 'Art Deco', title: 'Ador House', image: './images/placeholder.jpg', description: 'A mid-20th century structure blending commercial utility with Art Deco.', year: '1940', architect: 'Unknown', builder: 'JB Advani Group', location: { center: [72.83230, 18.92720] } }, 
            // 29. Max Mueller (Nudged East of Ador)
            { id: 'mmb', category: 'Modern', title: 'Max Mueller Bhavan', image: './images/placeholder.jpg', description: 'The Goethe-Institut hub for Indo-German cultural exchange.', year: '1970', architect: 'N/A', builder: 'Goethe Institut', location: { center: [72.83250, 18.92725] } },
            // 32. Pavement Gallery (Specific spot on pavement)
            { id: 'pavement', category: 'Living Heritage', title: 'The Pavement Gallery', image: './images/pavement.jpg', description: 'An informal exhibition space where aspiring artists display their work.', year: '2025', architect: 'The People', builder: 'Informal Usage', location: { center: [72.83170, 18.92735] } },
            
            // --- KUBER DUBASH MARG / RAMPART ROW ---
            // 7. David Sassoon (West End)
            { id: 'sassoon', category: 'Victorian', title: 'David Sassoon Library', image: './images/sassoon.jpg', description: 'Victorian Gothic architecture defined by pointed arches and a tranquil garden.', year: '1870', architect: 'Campbell & Gosling', builder: 'Scott McClelland', location: { center: [72.83116, 18.92772] } },
            // 13. Bhogilal (Corner building)
            { id: 'bhogilal', category: 'Victorian', title: 'Bhogilal Hargovindas', image: 'https://upload.wikimedia.org/wikipedia/commons/e/e4/Kala_Ghoda_pavement.jpg', description: 'A heritage commercial building on K. Dubash Marg featuring colonial stonework.', year: '1890', architect: 'Unknown', builder: 'Merchant Family', location: { center: [72.83190, 18.92760] } },
            // 31. KG Statue (Center of Parking Lot)
            { id: 'statue', category: 'Street Furniture', title: 'Kala Ghoda Statue', image: './images/placeholder.jpg', description: 'Bronze statue installed to mark the historic site.', year: '2017', architect: 'Commissioned artwork', builder: 'Kala Ghoda Association', location: { center: [72.83180, 18.92780] } }, 
            // Ropewalk Lane (Nudged East into the lane to avoid overlap with Statue)
            { id: 'ropewalk', category: 'Street Furniture', title: 'Rope Walk Lane', image: './images/ropewalk.jpg', description: 'Historic lane characterised by enamel street signage.', year: '1890', architect: 'Incremental', builder: 'Multiple', location: { center: [72.83225, 18.92775] } },
            // 11. Synagogue (Further East)
            { id: 'synagogue', category: 'Victorian', title: 'Keneseth Eliyahoo', image: './images/synagogue.jpg', description: 'Victorian era synagogue with a distinctive blue facade.', year: '1884', architect: 'Gostling & Morris', builder: 'Jacob Elias Sassoon', location: { center: [72.83257, 18.92811] } },
            // 14. Oricon (North side of street)
            { id: 'oricon', category: 'Modern', title: 'Oricon House', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c8/Mumbai_Skyline_at_Night.jpg/800px-Mumbai_Skyline_at_Night.jpg', description: 'A mid-century modern commercial high-rise.', year: '1960', architect: 'Unknown', builder: 'Oricon Enterprises', location: { center: [72.83220, 18.92790] } },

            // --- UNIVERSITY & OVAL ---
            // 5. City Civil Court (South end of Oval strip)
            { id: 'civil-court', category: 'Victorian', title: 'Old Secretariat (City Court)', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Old_Secretariat_Bombay_1878.jpg/800px-Old_Secretariat_Bombay_1878.jpg', description: 'One of the earliest Venetian Gothic buildings in the city.', year: '1874', architect: 'Col. H. St. Clair Wilkins', builder: 'Public Works Dept', location: { center: [72.83020, 18.92750] } },
            // 25. University (Nudged North to Library/Convocation Hall)
            { id: 'university', category: 'Victorian', title: 'University of Mumbai', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/University_of_Mumbai_Fort_Campus.jpg/800px-University_of_Mumbai_Fort_Campus.jpg', description: 'The Fort campus features Venetian Gothic architecture including the Convocation Hall.', year: '1874', architect: 'Sir Gilbert Scott', builder: 'Cowasji Jehangir', location: { center: [72.83050, 18.92840] } }, 
            // 26. Rajabai Tower (Nudged South to the actual Tower base)
            { id: 'rajabai', category: 'Victorian', title: 'Rajabai Clock Tower', image: './images/rajabai.jpg', description: 'Modeled on Big Ben, this 85m tower dominates the skyline.', year: '1878', architect: 'Sir Gilbert Scott', builder: 'Premchand Roychand', location: { center: [72.83020, 18.92880] } }, 
            // 24. Oval Maidan (Far West)
            { id: 'oval', category: 'Public Space', title: 'Oval Maidan', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Oval_Maidan_Mumbai.jpg/800px-Oval_Maidan_Mumbai.jpg', description: 'A Grade I heritage open precinct.', year: '1860', architect: 'N/A', builder: 'City Planner', location: { center: [72.82950, 18.92800] } },

            // --- MG ROAD NORTH / FLORA FOUNTAIN ---
            // 8. Army and Navy (West side)
            { id: 'army', category: 'Victorian', title: 'Army and Navy Building', image: './images/army-navy.jpg', description: 'Late nineteenth century Neo-Classical/Victorian commercial building.', year: '1890', architect: 'Frederick William Stevens', builder: 'British Military', location: { center: [72.83130, 18.92820] } },
            // Army Lettering (Micro-location on the Army Navy facade)
            { id: 'army-lettering', category: 'Lettering', title: 'Army and Navy Signage', image: './images/army-lettering.jpg', description: 'Original carved and painted serif lettering.', year: '1890', architect: 'Unknown', builder: 'British Military', location: { center: [72.83135, 18.92825] } },
            // 9. Esplanade (Opposite Army Navy)
            { id: 'esplanade', category: 'Victorian', title: 'Esplanade Mansion', image: './images/esplanade.jpg', description: 'Formerly Watson\'s Hotel. Cast iron framed building.', year: '1865', architect: 'Rowland Mason Ordish', builder: 'British Engineers', location: { center: [72.83160, 18.92830] } },
            // Lumiere Screening (Ghost Site - Next to Esplanade)
            { id: 'lumiere', category: 'Ghost Site', title: 'Lumière Film Screening', image: 'https://upload.wikimedia.org/wikipedia/commons/2/25/Watson%27s_Hotel_1880s.jpg', description: 'On July 7, 1896, the Lumière Brothers showcased the first-ever motion pictures in India here at the former Watson’s Hotel.', year: '1896', architect: 'N/A', builder: 'Marius Sestier', location: { center: [72.83165, 18.92835] } },
            // Wayside Inn (Next to Esplanade)
            { id: 'wayside', category: 'Ghost Site', title: 'Wayside Inn', image: './images/wayside.jpg', description: 'Now the Khyber restaurant. Famous quaint tea room.', year: '1920', architect: 'N/A', builder: 'Historic Site', location: { center: [72.83170, 18.92860] } },
            // 15. Great Western (Further North, East Side)
            { id: 'great-western', category: 'Neoclassical', title: 'Great Western Building', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Great_Western_Building%2C_Mumbai.jpg/640px-Great_Western_Building%2C_Mumbai.jpg', description: 'Originally the Admiralty House (1770s).', year: '1770', architect: 'Unknown', builder: 'British Admiralty', location: { center: [72.83290, 18.92850] } },
            // 27. BSE (Far East)
            { id: 'bse', category: 'Modern', title: 'Bombay Stock Exchange', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Bombay_Stock_Exchange_2010.jpg/600px-Bombay_Stock_Exchange_2010.jpg', description: 'The Phiroze Jeejeebhoy Towers.', year: '1980', architect: 'Chandrakant Patel', builder: 'BSE', location: { center: [72.83360, 18.92970] } },
            
            // --- FLORA FOUNTAIN CLUSTER (De-cluttered) ---
            // 30. Flora Fountain (Dead Center of Chowk)
            { id: 'flora', category: 'Street Furniture', title: 'Flora Fountain', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/Flora_Fountain_Mumbai.jpg/800px-Flora_Fountain_Mumbai.jpg', description: 'An ornamental fountain at Hutatma Chowk.', year: '1864', architect: 'R. Norman Shaw', builder: 'Agri-Horticultural Soc', location: { center: [72.83170, 18.93230] } },
            // Booksellers (Nudged North West along the curve)
            { id: 'booksellers', category: 'Living Heritage', title: 'Secondhand Book Sellers', image: './images/books.jpg', description: 'The lineage of street book vendors near Flora Fountain.', year: '1950', architect: 'N/A', builder: 'Vendor Collective', location: { center: [72.83150, 18.93250] } },

            // Small extras
            { id: 'hydrant', category: 'Street Furniture', title: 'British Fire Hydrant', image: './images/hydrant.jpg', description: 'A cast-iron fire hydrant.', year: '1895', architect: 'BMC', builder: 'Foundry Cast', location: { center: [72.83250, 18.92760] } },
            { id: 'kerbstones', category: 'Street Furniture', title: 'Kurla Basalt Kerbstones', image: './images/kerb.jpg', description: 'Original massive blocks of grey Kurla basalt lining the pavement.', year: '1880', architect: 'City Engineers', builder: 'Public Works', location: { center: [72.83200, 18.92750] } }
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
    
    var allBtn = document.createElement('div');
    allBtn.className = 'filter-btn all-layers-btn active';
    allBtn.innerHTML = 'Reset Visibility';
    allBtn.onclick = function() { resetFilters(); };
    layersContent.appendChild(allBtn);

    categories.forEach(function(cat) {
        var btn = document.createElement('div'); 
        btn.className = 'filter-btn'; 
        btn.setAttribute('data-cat', cat);
        var color = config.colors[cat] || '#333';
        btn.innerHTML = `<div class="layer-label-group"><span class="dot-indicator" style="color:${color}"></span><span>${cat}</span></div><div class="layer-actions"><span class="layer-solo-btn" title="Show Only This Layer">ONLY</span><div class="layer-eye-btn" title="Toggle Visibility">HIDE</div></div>`;
        btn.querySelector('.layer-eye-btn').addEventListener('click', function(e) { e.stopPropagation(); toggleCategory(cat, btn); });
        btn.querySelector('.layer-solo-btn').addEventListener('click', function(e) { e.stopPropagation(); soloCategory(cat, btn.querySelector('.layer-solo-btn')); });
        layersContent.appendChild(btn);
    });

    var mobileFilterBtn = document.getElementById('mobile-filter-toggle');
    if (!mobileFilterBtn) {
        mobileFilterBtn = document.createElement('div');
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
                this.style.background = '#333'; this.style.color = '#fff';
                if(window.innerWidth <= 768) window.closeTimeWidget();
            }
        };
    }
    
    window.closeMobileConsole = function() {
        var consolePanel = document.getElementById('console');
        var btn = document.getElementById('mobile-filter-toggle');
        if (consolePanel) consolePanel.classList.remove('open');
        if (btn) { btn.innerHTML = '<i class="fa-solid fa-layer-group"></i>'; btn.style.background = '#fff'; btn.style.color = '#333'; }
    }

    var consoleCloseBtn = document.getElementById('console-close-btn');
    if(consoleCloseBtn) { consoleCloseBtn.addEventListener('click', function() { closeMobileConsole(); }); }

    function toggleCategory(cat, btn) {
        if (document.body.classList.contains('mode-1883')) return;
        var textBtn = btn.querySelector('.layer-eye-btn');
        if (disabledCategories.includes(cat)) {
            disabledCategories = disabledCategories.filter(c => c !== cat);
            btn.classList.remove('layer-hidden'); textBtn.innerText = 'HIDE';
        } else {
            disabledCategories.push(cat);
            btn.classList.add('layer-hidden'); textBtn.innerText = 'SHOW';
        }
        document.querySelectorAll('.layer-solo-btn').forEach(b => b.classList.remove('active-solo'));
        updateMapState();
        // Removed closeMobileConsole() to keep panel open for multiple toggles
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
            if (cat === targetCat) { b.classList.remove('layer-hidden'); textBtn.innerText = 'HIDE'; currentSoloBtn.classList.add('active-solo'); } 
            else { b.classList.add('layer-hidden'); textBtn.innerText = 'SHOW'; currentSoloBtn.classList.remove('active-solo'); }
        });
        updateMapState();
        // Removed closeMobileConsole() to allow user to see selection state
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
        // Removed closeMobileConsole()
    }

    function updateMapState() {
        markerObjects.forEach(function(m) {
            var categoryVisible = !disabledCategories.includes(m.category);
            var timeVisible = m.year <= currentSliderYear;
            if (categoryVisible && timeVisible) { m.element.style.display = 'flex'; m.element.style.opacity = '1'; } 
            else { m.element.style.display = 'none'; }
        });
        if (selectedMarker && selectedMarker.style.display === 'none') { closePanel(false); }
    }

    var separator = document.createElement('div');
    separator.className = 'console-separator';
    layersContent.appendChild(separator);

    var wallBtn = document.createElement('div');
    wallBtn.id = 'wall-btn'; wallBtn.className = 'filter-btn';
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
        if (layersContent.classList.contains('collapsed')) { layersContent.classList.remove('collapsed'); layersArrow.classList.add('rotated'); } 
        else { layersContent.classList.add('collapsed'); layersArrow.classList.remove('rotated'); }
    });

    var defaultBottomPadding = window.innerWidth < 768 ? 0 : 300;
    var mapPadding = { top: 0, bottom: defaultBottomPadding, left: 0, right: 0 };

    var map = new maplibregl.Map({
        container: 'map',
        style: config.style,
        center: startCenter, zoom: initialZoom, minZoom: 14.5, 
        maxBounds: [[72.8100, 18.9100], [72.8500, 18.9450]],
        pitch: 45, bearing: -15, antialias: true, attributionControl: false, padding: mapPadding
    });
    
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
    map.addControl(new maplibregl.ScaleControl({ maxWidth: 100, unit: 'metric' }), 'bottom-left');

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

    var timeTravelBtn = document.getElementById('time-travel-btn');
    var timeWidgetEl = document.getElementById('time-widget');
    
    if (window.innerWidth >= 768) { timeWidgetEl.classList.add('active'); timeTravelBtn.classList.add('active-control'); }

    timeTravelBtn.addEventListener('click', function() {
        var btn = this;
        if (document.body.classList.contains('mode-1883')) { if(window.innerWidth <= 768) showToast("Time Travel unavailable in 1883 Mode"); return; }
        if (timeWidgetEl.classList.contains('active')) { timeWidgetEl.classList.remove('active'); btn.classList.remove('active-control'); } 
        else { timeWidgetEl.classList.add('active'); btn.classList.add('active-control'); if (window.innerWidth <= 768) closeMobileConsole(); }
    });

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
    
    setupControl('reset-view-btn', () => { map.flyTo({ center: startCenter, zoom: initialZoom, pitch: 45, bearing: -15, duration: 2000 }); closePanel(true); });

    setupControl('map-1883-btn', function() { toggle1883Map(document.getElementById('map-1883-btn')); });

    var geolocate = new maplibregl.GeolocateControl({ 
        positionOptions: { enableHighAccuracy: true }, 
        trackUserLocation: true,
        fitBoundsOptions: { maxZoom: 18 } 
    });
    map.addControl(geolocate); 
    setupControl('locate-btn', () => geolocate.trigger());

    var tooltip = document.getElementById('tooltip');
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');

    searchInput.addEventListener('input', function(e) {
        const val = e.target.value.toLowerCase();
        if (val.length < 1) { searchResults.style.display = 'none'; return; }
        const matches = config.chapters.filter(item => item.title.toLowerCase().includes(val) || item.category.toLowerCase().includes(val));
        searchResults.innerHTML = ''; searchResults.style.display = 'block';
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
            // AUTO-FIX: Handle Google Maps Format (Lat, Lng) -> (Lng, Lat)
            // In Mumbai, Lng (72.8) is always > Lat (18.9). 
            // If [0] < [1], it's inverted.
            if (record.location.center[0] < record.location.center[1]) {
                record.location.center = [record.location.center[1], record.location.center[0]];
                console.log('Auto-corrected coordinates for: ' + record.title);
            }

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

    window.closePanel = function(preventCameraMove) {
        document.getElementById('side-panel').classList.remove('open');
        if (selectedMarker) { selectedMarker.classList.remove('selected'); selectedMarker = null; }
        if (!preventCameraMove && window.innerWidth >= 768) { map.flyTo({ zoom: initialZoom, speed: 0.6 }); }
    }

    function openPanel(record, color, markerEl) {
        triggerHaptic(); // Feedback
        
        if (window.innerWidth <= 768) { window.closeTimeWidget(); }
        if (selectedMarker) selectedMarker.classList.remove('selected');
        markerEl.classList.add('selected'); selectedMarker = markerEl;
        var infoHTML = `<div class="panel-info"><div class="panel-info-row"><span class="panel-info-label">Year</span><span class="panel-info-val">${record.year}</span></div><div class="panel-info-row"><span class="panel-info-label">Architect</span><span class="panel-info-val">${record.architect}</span></div><div class="panel-info-row"><span class="panel-info-label">Builder</span><span class="panel-info-val">${record.builder}</span></div></div>`;
        var destLat = record.location.center[1]; var destLng = record.location.center[0];
        var navUrl = `https://www.google.com/maps/dir/?api=1&destination=${destLat},${destLng}&travelmode=walking`;
        var navButton = `<a href="${navUrl}" target="_blank" class="panel-action-btn"><i class="fa-solid fa-diamond-turn-right"></i> Navigate Here</a>`;
        
        // SKELETON LOADING LOGIC
        var imageContainer = document.createElement('div');
        imageContainer.className = 'panel-img-container skeleton'; // Start with skeleton
        var img = document.createElement('img');
        img.className = 'panel-img loading'; // Start hidden
        img.src = record.image;
        
        img.onload = function() {
            imageContainer.classList.remove('skeleton'); // Remove shimmer
            img.classList.remove('loading'); // Fade in
        };
        imageContainer.appendChild(img);
        
        // Combine content
        var panelInner = document.getElementById('panel-inner');
        panelInner.innerHTML = '';
        panelInner.appendChild(imageContainer);
        
        var textContent = document.createElement('div');
        textContent.className = 'panel-content';
        textContent.innerHTML = `<span class="panel-cat" style="color:${color}">${record.category}</span><div class="panel-title">${record.title}</div><p class="panel-desc">${record.description}</p>${infoHTML}${navButton}`;
        panelInner.appendChild(textContent);

        document.getElementById('side-panel').classList.add('open');
        closeMobileConsole();
        
        var flyOptions = {
            center: record.location.center,
            zoom: 17.5,
            pitch: map.getPitch(),
            bearing: map.getBearing(),
            speed: 0.8,
            curve: 1
        };

        if (window.innerWidth < 768) {
            // On mobile, offset the center so the marker appears above the bottom sheet
            flyOptions.padding = { top: 20, bottom: window.innerHeight * 0.5, left: 0, right: 0 };
            flyOptions.zoom = 17; // Slightly less zoom on mobile to show context
        }

        map.flyTo(flyOptions);
    }

    document.getElementById('panel-close-btn').addEventListener('click', function() { closePanel(false); });

    window.toggleLayer = function(layerId, btn) {
        if (document.body.classList.contains('mode-1883')) return;
        triggerHaptic();
        var visibility = map.getLayoutProperty(layerId, 'visibility');
        var infoBox = document.getElementById('wall-info');
        if (visibility === 'visible') { 
            map.setLayoutProperty(layerId, 'visibility', 'none'); 
            btn.classList.remove('active-control'); infoBox.style.display = 'none';
        } else { 
            map.setLayoutProperty(layerId, 'visibility', 'visible'); 
            btn.classList.add('active-control'); infoBox.style.display = 'block';
            if (window.innerWidth <= 768) {
                closeMobileConsole();
                var wallContent = infoBox.innerHTML; 
                showToast(wallContent, 6000, true, 'wall-mode');
            } else { setTimeout(function() { infoBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, 50); }
        }
    };

    window.toggle1883Map = function(btn) {
        triggerHaptic();
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