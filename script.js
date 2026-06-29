document.addEventListener('DOMContentLoaded', () => {
    // --- Audio setup ---
    const tickSound = new Audio('tick.wav');
    tickSound.volume = 0.8;
    
    const homeSound = new Audio('home.mp3'); 
    homeSound.volume = 0.8;

    const selectSound = new Audio('Select.wav');
    selectSound.volume = 0.6;

    const popupRunTitleSound = new Audio('Popup + Run Title.wav');
    popupRunTitleSound.volume = 0.8;

    const thisOneSound = new Audio('This One.wav');
    thisOneSound.volume = 0.8;

    let isMuted = false;

    const muteBtn = document.getElementById('mute-toggle-btn');
    const iconVolumeOn = document.getElementById('icon-volume-on');
    const iconVolumeOff = document.getElementById('icon-volume-off');
    if (muteBtn) {
        muteBtn.addEventListener('click', () => {
            isMuted = !isMuted;
            if (isMuted) {
                iconVolumeOn.style.display = 'none';
                iconVolumeOff.style.display = 'block';
            } else {
                iconVolumeOn.style.display = 'block';
                iconVolumeOff.style.display = 'none';
                playTick();
            }
        });
    }

    function playTick() {
        if (isMuted) return;
        const clickClone = tickSound.cloneNode();
        clickClone.volume = tickSound.volume;
        clickClone.play().catch(e => console.log('Audio play blocked:', e));
    }

    function playHome() {
        if (isMuted) return;
        homeSound.play().catch(e => console.log('Audio play blocked:', e));
    }

    function playSelect() {
        if (isMuted) return;
        const selectClone = selectSound.cloneNode();
        selectClone.volume = selectSound.volume;
        selectClone.play().catch(e => console.log('Audio play blocked:', e));
    }

    function playPopupRunTitle() {
        if (isMuted) return;
        const clone = popupRunTitleSound.cloneNode();
        clone.volume = popupRunTitleSound.volume;
        clone.play().catch(e => console.log('Audio play blocked:', e));
    }

    function playThisOne() {
        if (isMuted) return;
        const clone = thisOneSound.cloneNode();
        clone.volume = thisOneSound.volume;
        clone.play().catch(e => console.log('Audio play blocked:', e));
    }

    // --- Clock ---
    const clockElement = document.getElementById('clock');
    setInterval(() => {
        const now = new Date();
        let hours = now.getHours();
        let minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; 
        minutes = minutes < 10 ? '0' + minutes : minutes;
        clockElement.textContent = `${hours}:${minutes} ${ampm}`;
    }, 1000);

    // --- Lock Screen Logic ---
    let pressCount = 0;
    let lastKey = null;
    const dots = document.querySelectorAll('.dot');
    const lockScreen = document.getElementById('lock-screen');
    const homeMenu = document.getElementById('home-menu');
    let unlocking = false;

    function handlePress(key) {
        if (unlocking) return; // Prevent input while transitioning

        // If they changed the button mid-way, reset
        if (lastKey !== null && lastKey !== key) {
            pressCount = 0;
            dots.forEach(dot => dot.classList.remove('filled'));
        }

        lastKey = key;
        pressCount++;
        
        playTick();

        // Fill dot
        if (pressCount <= 3) {
            dots[pressCount - 1].classList.add('filled');
        }

        // Unlock
        if (pressCount >= 3) {
            unlocking = true;
            playHome();
            
            // Prepare home menu underneath
            homeMenu.classList.add('active');
            homeMenu.classList.add('home-zoom-enter');
            homeMenu.style.opacity = '1';

            // Trigger reflow to apply the initial scale before transitioning
            void homeMenu.offsetWidth;

            setTimeout(() => {
                // Start dissolving the lock screen
                lockScreen.classList.add('fade-zoom-out');
                // Start home menu zoom-out to normal size
                homeMenu.classList.remove('home-zoom-enter');
                
                // Once transition is complete, remove lock screen from DOM
                setTimeout(() => {
                    lockScreen.classList.remove('active');
                    lockScreen.classList.remove('fade-zoom-out');
                }, 500);
            }, 50);
            document.removeEventListener('keydown', keydownHandler);
            document.removeEventListener('mousedown', mousedownHandler);
        }
    }

    const keydownHandler = (e) => {
        handlePress(e.key);
    };

    const mousedownHandler = (e) => {
        if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault(); 
        }
        handlePress('mouse' + e.button);
    };

    document.addEventListener('keydown', keydownHandler);
    document.addEventListener('mousedown', mousedownHandler, { passive: false });

    // --- Hover & Selection effects ---
    const dockIcons = document.querySelectorAll('.dock-icon');
    const dockLabel = document.querySelector('.dock-label');
    const gameCards = document.querySelectorAll('.game-card');

    dockIcons.forEach(icon => {
        icon.addEventListener('mouseenter', () => {
            playSelect();
            const img = icon.querySelector('img');
            if (img && img.alt) {
                dockLabel.textContent = img.alt;
            }
        });

        icon.addEventListener('mouseleave', () => {
            const activeImg = document.querySelector('.dock-icon.active-dock img');
            if (activeImg && activeImg.alt) {
                dockLabel.textContent = activeImg.alt;
            }
        });

        icon.addEventListener('click', () => {
            playSelect();
            dockIcons.forEach(i => i.classList.remove('active-dock'));
            icon.classList.add('active-dock');
            const img = icon.querySelector('img');
            if (img && img.alt) {
                dockLabel.textContent = img.alt;
            }
        });
    });

    // Dynamic carousel rendering handled below

    // --- RPG Maker Sprite Tile Rendering ---
    function renderSpriteTile(container, tileId) {
        if (typeof RPG_GRID === 'undefined' || !RPG_GRID.length) return;
        const tile = RPG_GRID.find(t => t.id === Number(tileId)) || RPG_GRID[0];
        if (!tile) return;
        
        let spriteDiv = container.querySelector('.rpg-sprite');
        if (!spriteDiv) {
            container.innerHTML = '';
            spriteDiv = document.createElement('div');
            spriteDiv.className = 'rpg-sprite';
            container.appendChild(spriteDiv);
        }
        
        let containerWidth = container.clientWidth;
        if (!containerWidth || containerWidth < 10) {
            if (container.classList.contains('profile-icon')) containerWidth = 50;
            else if (container.classList.contains('profile-avatar')) containerWidth = 84;
            else if (container.classList.contains('launch-card-avatar')) containerWidth = 140;
            else if (container.classList.contains('option-preview-char')) containerWidth = 40;
            else if (container.classList.contains('char-swatch')) containerWidth = 70;
            else if (container.classList.contains('icon-large-preview')) containerWidth = 230;
            else containerWidth = 60;
        }
        
        const ratio = containerWidth / tile.size;
        
        spriteDiv.style.width = '100%';
        spriteDiv.style.height = '100%';
        spriteDiv.style.backgroundImage = "url('profile icons/Nintendo Switch - HOME Menu - UI - Profile Icons.png')";
        spriteDiv.style.backgroundSize = `${1543 * ratio}px ${7465 * ratio}px`;
        spriteDiv.style.backgroundPosition = `-${(tile.cx - tile.size/2) * ratio}px -${(tile.cy - tile.size/2) * ratio}px`;
        spriteDiv.style.backgroundRepeat = 'no-repeat';
    }

    // --- Dynamic Profiles & Presentations Management ---
    let profiles = [
        { id: 'p1', name: 'Professor(a)', tileId: 1, bgColor: '#e60012', active: true },
        { id: 'p2', name: 'Convidado', tileId: 8, bgColor: '#008060', active: false }
    ];

    let presentations = [
        {
            id: 'pres_1',
            title: 'Slide 1',
            subtitle: 'Apresentação Principal',
            coverUrl: '',
            bgColor: 'linear-gradient(135deg, #ff4e50, #f9d423)',
            fileUrl: '',
            slides: [
                { title: 'Capa da Apresentação', content: 'Bem-vindos à Apresentação Principal!\nUse as setas para avançar.' },
                { title: 'Tópico 1: Objetivos', content: 'Apresentar os conceitos fundamentais e discutir os resultados obtidos.' },
                { title: 'Conclusão', content: 'Agradecemos a presença de todos! Espaço aberto para perguntas.' }
            ]
        },
        {
            id: 'pres_2',
            title: 'Slide 2',
            subtitle: 'Material Complementar',
            coverUrl: '',
            bgColor: 'linear-gradient(135deg, #1fa2ff, #12d8fa, #a6ffcb)',
            fileUrl: '',
            slides: [
                { title: 'Capa do Material', content: 'Material Complementar de Apoio.' },
                { title: 'Gráficos e Lâminas', content: 'Indicadores demonstrados na última avaliação.' }
            ]
        }
    ];

    if (window.INITIAL_CONFIG) {
        if (window.INITIAL_CONFIG.profiles) profiles = window.INITIAL_CONFIG.profiles;
        if (window.INITIAL_CONFIG.presentations) presentations = window.INITIAL_CONFIG.presentations;
    }

    const savedProfiles = localStorage.getItem('switch_profiles_data');
    if (savedProfiles && window.location.protocol === 'file:') {
        try { profiles = JSON.parse(savedProfiles); } catch (e) { console.error('Error loading profiles', e); }
    }

    const savedPres = localStorage.getItem('switch_presentations_data');
    if (savedPres && window.location.protocol === 'file:') {
        try { presentations = JSON.parse(savedPres); } catch (e) { console.error('Error loading presentations', e); }
    }

    function saveProfiles() {
        if (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            localStorage.setItem('switch_profiles_data', JSON.stringify(profiles));
            try {
                fetch('http://localhost:3000/api/save-config', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ profiles, presentations })
                }).catch(e => console.log('Node server offline'));
            } catch(e) {}
        }
    }

    function savePresentations() {
        if (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            localStorage.setItem('switch_presentations_data', JSON.stringify(presentations));
            try {
                fetch('http://localhost:3000/api/save-config', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ profiles, presentations })
                }).catch(e => console.log('Node server offline'));
            } catch(e) {}
        }
    }

    const topBarProfiles = document.querySelector('.profiles');
    const profileModal = document.getElementById('profile-modal');
    const closeModalBtn = profileModal.querySelector('.close-btn');
    const profilesList = profileModal.querySelector('.profiles-list');

    function renderProfiles() {
        // 1. Render Top Bar
        topBarProfiles.innerHTML = '';
        const displayCount = Math.min(profiles.length, 3);
        
        for (let i = 0; i < displayCount; i++) {
            const p = profiles[i];
            const iconDiv = document.createElement('div');
            iconDiv.className = `profile-icon ${p.active ? 'active-profile' : ''}`;
            iconDiv.title = p.name;
            iconDiv.style.backgroundColor = p.bgColor;
            renderSpriteTile(iconDiv, p.tileId);
            
            iconDiv.addEventListener('mouseenter', playSelect);
            iconDiv.addEventListener('click', () => {
                playSelect();
                profileModal.classList.add('active');
            });
            topBarProfiles.appendChild(iconDiv);
        }

        if (profiles.length > 3) {
            const moreDiv = document.createElement('div');
            moreDiv.className = 'more-profiles-circle';
            moreDiv.title = 'Mais Perfis';
            moreDiv.textContent = '+';
            moreDiv.addEventListener('mouseenter', playSelect);
            moreDiv.addEventListener('click', () => {
                playSelect();
                profileModal.classList.add('active');
            });
            topBarProfiles.appendChild(moreDiv);
        }

        // 2. Render Modal List
        profilesList.innerHTML = '';
        profiles.forEach(p => {
            const card = document.createElement('div');
            card.className = `profile-card ${p.active ? 'active' : ''}`;
            card.setAttribute('data-id', p.id);

            const avatar = document.createElement('div');
            avatar.className = 'profile-avatar';
            avatar.style.backgroundColor = p.bgColor;
            renderSpriteTile(avatar, p.tileId);

            const nameSpan = document.createElement('span');
            nameSpan.className = 'profile-name';
            nameSpan.textContent = p.name;

            card.appendChild(avatar);
            card.appendChild(nameSpan);

            if (p.active) {
                const badge = document.createElement('span');
                badge.className = 'profile-badge';
                badge.textContent = 'Ativo';
                card.appendChild(badge);
            }

            const editBtn = document.createElement('button');
            editBtn.className = 'edit-profile-btn';
            editBtn.title = 'Editar Ícone';
            editBtn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>`;
            
            editBtn.addEventListener('mouseenter', playSelect);
            editBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                playSelect();
                openEditModal(p.id);
            });

            const delBtn = document.createElement('button');
            delBtn.className = 'delete-profile-btn';
            delBtn.title = 'Excluir Perfil';
            delBtn.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12l1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z"/></svg>`;
            
            delBtn.addEventListener('mouseenter', playSelect);
            delBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (profiles.length <= 1) {
                    alert('Você não pode excluir o único perfil existente!');
                    return;
                }
                if (confirm(`Deseja realmente excluir o perfil "${p.name}"?`)) {
                    playSelect();
                    profiles = profiles.filter(item => item.id !== p.id);
                    if (p.active && profiles.length > 0) profiles[0].active = true;
                    saveProfiles();
                    renderProfiles();
                }
            });

            card.appendChild(editBtn);
            card.appendChild(delBtn);

            card.addEventListener('mouseenter', playSelect);
            card.addEventListener('click', () => {
                playSelect();
                profiles.forEach(item => item.active = (item.id === p.id));
                saveProfiles();
                renderProfiles();
                setTimeout(() => profileModal.classList.remove('active'), 250);
            });

            profilesList.appendChild(card);
        });

        // Add "Novo Perfil" card
        const addCard = document.createElement('div');
        addCard.className = 'profile-card add-profile';
        addCard.innerHTML = `
            <div class="profile-avatar add-icon">+</div>
            <span class="profile-name">Novo Perfil</span>
        `;
        addCard.addEventListener('mouseenter', playSelect);
        addCard.addEventListener('click', () => {
            playSelect();
            const newId = 'p_' + Date.now();
            const palette = ['#e60012', '#ff6b00', '#ffc800', '#00a651', '#008060', '#00c3e3', '#0066cc', '#1f3a93', '#4b0082', '#800080', '#ff007f', '#e84393', '#d63031', '#00b894', '#0984e3', '#6c5ce7'];
            const randomColor = palette[Math.floor(Math.random() * palette.length)];
            const randomTile = Math.floor(Math.random() * Math.min(60, typeof RPG_GRID !== 'undefined' ? RPG_GRID.length : 40)) + 1;
            profiles.push({
                id: newId,
                name: `Usuário ${profiles.length + 1}`,
                tileId: randomTile,
                bgColor: randomColor,
                active: false
            });
            saveProfiles();
            renderProfiles();
        });
        profilesList.appendChild(addCard);
    }

    closeModalBtn.addEventListener('mouseenter', playSelect);
    closeModalBtn.addEventListener('click', () => {
        playSelect();
        profileModal.classList.remove('active');
    });

    profileModal.addEventListener('click', (e) => {
        if (e.target === profileModal) {
            playSelect();
            profileModal.classList.remove('active');
        }
    });

    // --- Edit Icon Modal (Nintendo Switch Style) ---
    const editModal = document.getElementById('edit-icon-modal');
    const closeEditBtn = editModal.querySelector('.close-edit-btn');
    const btnSelectChar = document.getElementById('btn-select-character');
    const btnSelectBg = document.getElementById('btn-select-bg');
    const charSelector = document.getElementById('character-selector');
    const bgSelector = document.getElementById('bg-selector');
    const closeCharSubgrid = document.getElementById('close-char-subgrid');
    const closeBgSubgrid = document.getElementById('close-bg-subgrid');
    const previewCharThumb = document.getElementById('preview-char-thumb');
    const previewBgThumb = document.getElementById('preview-bg-thumb');
    const largeIconPreview = document.getElementById('large-icon-preview');
    const saveIconBtn = document.getElementById('save-icon-btn');
    const editNameInput = document.getElementById('edit-profile-name');

    let currentEditingId = null;
    let currentEditingTileId = 1;
    let currentEditingBgColor = '#e60012';

    // Populate Character Grid
    const charactersGrid = document.getElementById('characters-grid');
    if (typeof RPG_GRID !== 'undefined') {
        RPG_GRID.slice(0, 120).forEach(t => {
            const swatch = document.createElement('div');
            swatch.className = 'char-swatch';
            renderSpriteTile(swatch, t.id);
            swatch.addEventListener('mouseenter', playSelect);
            swatch.addEventListener('click', () => {
                playSelect();
                currentEditingTileId = t.id;
                renderSpriteTile(previewCharThumb, currentEditingTileId);
                renderSpriteTile(largeIconPreview, currentEditingTileId);
                charSelector.style.display = 'none';
            });
            charactersGrid.appendChild(swatch);
        });
    }

    function openEditModal(profileId) {
        const p = profiles.find(item => item.id === profileId);
        if (!p) return;
        currentEditingId = p.id;
        currentEditingTileId = p.tileId;
        currentEditingBgColor = p.bgColor;
        editNameInput.value = p.name;

        previewBgThumb.style.backgroundColor = currentEditingBgColor;
        largeIconPreview.style.backgroundColor = currentEditingBgColor;
        renderSpriteTile(previewCharThumb, currentEditingTileId);
        renderSpriteTile(largeIconPreview, currentEditingTileId);

        editModal.classList.add('active');
    }

    closeEditBtn.addEventListener('mouseenter', playSelect);
    closeEditBtn.addEventListener('click', () => {
        playSelect();
        editModal.classList.remove('active');
        charSelector.style.display = 'none';
        bgSelector.style.display = 'none';
    });

    btnSelectChar.addEventListener('mouseenter', playSelect);
    btnSelectChar.addEventListener('click', () => {
        playSelect();
        charSelector.style.display = 'flex';
    });

    btnSelectBg.addEventListener('mouseenter', playSelect);
    btnSelectBg.addEventListener('click', () => {
        playSelect();
        bgSelector.style.display = 'flex';
    });

    closeCharSubgrid.addEventListener('mouseenter', playSelect);
    closeCharSubgrid.addEventListener('click', () => {
        playSelect();
        charSelector.style.display = 'none';
    });

    closeBgSubgrid.addEventListener('mouseenter', playSelect);
    closeBgSubgrid.addEventListener('click', () => {
        playSelect();
        bgSelector.style.display = 'none';
    });

    document.querySelectorAll('.colors-grid .color-swatch').forEach(swatch => {
        swatch.addEventListener('mouseenter', playSelect);
        swatch.addEventListener('click', () => {
            playSelect();
            currentEditingBgColor = swatch.getAttribute('data-color');
            previewBgThumb.style.backgroundColor = currentEditingBgColor;
            largeIconPreview.style.backgroundColor = currentEditingBgColor;
            bgSelector.style.display = 'none';
        });
    });

    saveIconBtn.addEventListener('mouseenter', playSelect);
    saveIconBtn.addEventListener('click', () => {
        playSelect();
        const p = profiles.find(item => item.id === currentEditingId);
        if (p) {
            p.name = editNameInput.value.trim() || p.name;
            p.tileId = currentEditingTileId;
            p.bgColor = currentEditingBgColor;
            saveProfiles();
            renderProfiles();
        }
        editModal.classList.remove('active');
    });

    // --- Game Launch / Select a User Banner ---
    const launchModal = document.getElementById('game-launch-modal');
    const launchProfilesList = document.getElementById('launch-profiles-list');
    const launchBackBtn = document.getElementById('launch-back-btn');
    const launchOkBtn = document.getElementById('launch-ok-btn');
    var selectedLaunchProfileId = null;

    window.openLaunchBanner = function() {
        if (!launchModal || !launchProfilesList) return;
        launchProfilesList.innerHTML = '';
        selectedLaunchProfileId = profiles.find(p => p.active)?.id || profiles[0]?.id;
        
        profiles.forEach(p => {
            const card = document.createElement('div');
            const isSelected = (p.id === selectedLaunchProfileId);
            card.className = `launch-card ${isSelected ? 'selected' : ''}`;
            
            const avatar = document.createElement('div');
            avatar.className = 'launch-card-avatar';
            avatar.style.backgroundColor = p.bgColor;
            renderSpriteTile(avatar, p.tileId);
            
            const name = document.createElement('div');
            name.className = 'launch-card-name';
            name.textContent = p.name;
            
            card.appendChild(avatar);
            card.appendChild(name);
            
            card.addEventListener('mouseenter', () => {
                playSelect();
            });
            
            card.addEventListener('click', () => {
                playSelect();
                selectedLaunchProfileId = p.id;
                launchProfilesList.querySelectorAll('.launch-card').forEach(c => c.classList.remove('selected'));
                card.classList.add('selected');
            });
            
            card.addEventListener('dblclick', () => {
                confirmLaunchUser(p.id);
            });
            
            launchProfilesList.appendChild(card);
        });
        
        // Add "+" button
        const addBtn = document.createElement('div');
        addBtn.className = 'launch-add-btn';
        addBtn.title = 'Criar novo usuário';
        addBtn.textContent = '+';
        addBtn.addEventListener('mouseenter', playSelect);
        addBtn.addEventListener('click', () => {
            playSelect();
            launchModal.classList.remove('active');
            profileModal.classList.add('active');
        });
        launchProfilesList.appendChild(addBtn);

        launchModal.classList.add('active');
    };

    function confirmLaunchUser(profileId) {
        playThisOne();
        profiles.forEach(item => item.active = (item.id === profileId));
        saveProfiles();
        renderProfiles();
        if (launchModal) launchModal.classList.remove('active');
        
        const loadingScreen = document.getElementById('game-loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'flex';
            // Slight delay to allow display: flex to apply before opacity transition
            setTimeout(() => {
                loadingScreen.classList.add('visible');
                
                // Wait for the loading screen (e.g., 2.5 seconds)
                setTimeout(() => {
                    loadingScreen.classList.remove('visible');
                    setTimeout(() => {
                        loadingScreen.style.display = 'none';
                        if (typeof openPresentationViewer === 'function' && selectedPresentationId) {
                            openPresentationViewer(selectedPresentationId);
                        }
                    }, 300); // wait for fade out
                }, 2500);
            }, 10);
        } else {
            if (typeof openPresentationViewer === 'function' && selectedPresentationId) {
                openPresentationViewer(selectedPresentationId);
            }
        }
    }

    if (launchBackBtn) {
        launchBackBtn.addEventListener('mouseenter', playSelect);
        launchBackBtn.addEventListener('click', () => {
            playSelect();
            if (launchModal) launchModal.classList.remove('active');
        });
    }

    if (launchOkBtn) {
        launchOkBtn.addEventListener('mouseenter', playSelect);
        launchOkBtn.addEventListener('click', () => {
            confirmLaunchUser(selectedLaunchProfileId);
        });
    }

    if (launchModal) {
        launchModal.addEventListener('click', (e) => {
            if (e.target === launchModal) {
                playSelect();
                launchModal.classList.remove('active');
            }
        });
    }

    // --- Dynamic Carousel & Floating Title Popup ---
    let selectedPresentationId = null;
    const gamesCarousel = document.querySelector('.games-carousel');

    function renderPresentationsCarousel() {
        if (!gamesCarousel) return;
        gamesCarousel.innerHTML = '';

        presentations.forEach(pres => {
            const card = document.createElement('div');
            card.className = 'game-card';
            card.style.background = pres.bgColor || 'linear-gradient(135deg, #ff4e50, #f9d423)';

            if (pres.coverUrl) {
                card.style.backgroundImage = `url('${pres.coverUrl}')`;
                card.style.backgroundSize = 'cover';
                card.style.backgroundPosition = 'center';
            } else {
                const titleSpan = document.createElement('span');
                titleSpan.className = 'placeholder-title';
                titleSpan.textContent = pres.title;
                card.appendChild(titleSpan);
            }

            // Create a title popup scoped to this card
            const localTitlePopup = document.createElement('div');
            localTitlePopup.className = 'game-title-popup';
            localTitlePopup.textContent = pres.title + (pres.subtitle ? ` - ${pres.subtitle}` : '');
            card.appendChild(localTitlePopup);

            card.addEventListener('mouseenter', () => {
                playSelect();
                localTitlePopup.classList.add('visible');
            });

            card.addEventListener('mouseleave', () => {
                localTitlePopup.classList.remove('visible');
            });

            card.addEventListener('click', () => {
                selectedPresentationId = pres.id;
                playPopupRunTitle();
                if (typeof window.openLaunchBanner === 'function') {
                    window.openLaunchBanner();
                }
            });

            gamesCarousel.appendChild(card);
        });

        const emptySlots = Math.max(4, 6 - presentations.length);
        for (let i = 0; i < emptySlots; i++) {
            const emptyCard = document.createElement('div');
            emptyCard.className = 'game-card empty';
            emptyCard.addEventListener('mouseenter', playSelect);
            emptyCard.addEventListener('click', () => {
                playSelect();
            });
            gamesCarousel.appendChild(emptyCard);
        }
    }

    // --- Presentation Viewer Modal ---
    const viewerModal = document.getElementById('presentation-viewer-modal');
    const viewerTitle = document.getElementById('viewer-title');
    const viewerContentArea = document.getElementById('viewer-content-area');
    const closeViewerBtn = document.getElementById('close-viewer-btn');
    const viewerPrevBtn = document.getElementById('viewer-prev-btn');
    const viewerNextBtn = document.getElementById('viewer-next-btn');
    const viewerSlideCounter = document.getElementById('viewer-slide-counter');

    let currentSlideIndex = 0;
    let activePresentation = null;
    let pdfDoc = null;
    let isPdf = false;

    async function openPresentationViewer(presId) {
        activePresentation = presentations.find(p => p.id === presId) || presentations[0];
        if (!activePresentation || !viewerModal) return;

        viewerTitle.textContent = activePresentation.title + (activePresentation.subtitle ? ` - ${activePresentation.subtitle}` : '');
        currentSlideIndex = 0;
        pdfDoc = null;
        isPdf = false;

        if (activePresentation.fileUrl && activePresentation.fileUrl.toLowerCase().endsWith('.pdf')) {
            isPdf = true;
            viewerContentArea.innerHTML = '<div class="slide-display"><p style="color:white; font-size: 1.5rem;">Carregando PDF...</p></div>';
            viewerModal.classList.add('active');
            try {
                if (typeof pdfjsLib !== 'undefined') {
                    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
                    pdfDoc = await pdfjsLib.getDocument(activePresentation.fileUrl).promise;
                    renderSlideContent();
                } else {
                    viewerContentArea.innerHTML = '<div class="slide-display"><p style="color:white;">Erro: PDF.js não carregado.</p></div>';
                }
            } catch(e) {
                console.error(e);
                viewerContentArea.innerHTML = '<div class="slide-display"><p style="color:white;">Erro ao carregar PDF.</p></div>';
            }
        } else {
            renderSlideContent();
            viewerModal.classList.add('active');
        }
    }

    async function renderSlideContent() {
        if (!activePresentation) return;

        if (isPdf && pdfDoc) {
            if (viewerPrevBtn) viewerPrevBtn.style.display = 'inline-block';
            if (viewerNextBtn) viewerNextBtn.style.display = 'inline-block';
            
            const pageNum = currentSlideIndex + 1;
            try {
                const page = await pdfDoc.getPage(pageNum);
                const containerWidth = viewerContentArea.clientWidth || window.innerWidth;
                const containerHeight = viewerContentArea.clientHeight || window.innerHeight;
                
                const unscaledViewport = page.getViewport({ scale: 1.0 });
                const scale = Math.min(
                    containerWidth / unscaledViewport.width,
                    containerHeight / unscaledViewport.height
                ) * 0.95;
                
                const viewport = page.getViewport({ scale });
                
                const wrapper = document.createElement('div');
                wrapper.style.position = 'relative';
                wrapper.style.display = 'inline-block';
                wrapper.style.lineHeight = '0';
                
                const canvas = document.createElement('canvas');
                canvas.style.boxShadow = '0 10px 40px rgba(0,0,0,0.8)';
                const ctx = canvas.getContext('2d');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                
                const overlayCanvas = document.createElement('canvas');
                overlayCanvas.width = viewport.width;
                overlayCanvas.height = viewport.height;
                overlayCanvas.style.position = 'absolute';
                overlayCanvas.style.top = '0';
                overlayCanvas.style.left = '0';
                overlayCanvas.style.pointerEvents = 'auto'; // allow mouse events
                
                wrapper.appendChild(canvas);
                wrapper.appendChild(overlayCanvas);
                
                viewerContentArea.innerHTML = '';
                viewerContentArea.appendChild(wrapper);
                
                setupLaserCanvas(overlayCanvas);
                
                await page.render({ canvasContext: ctx, viewport: viewport }).promise;
                
                if (viewerSlideCounter) viewerSlideCounter.textContent = `Página ${pageNum} / ${pdfDoc.numPages}`;
                
                if (viewerPrevBtn) {
                    viewerPrevBtn.disabled = (currentSlideIndex === 0);
                    viewerPrevBtn.style.opacity = viewerPrevBtn.disabled ? '0.4' : '1';
                }
                if (viewerNextBtn) {
                    viewerNextBtn.disabled = (pageNum === pdfDoc.numPages);
                    viewerNextBtn.style.opacity = viewerNextBtn.disabled ? '0.4' : '1';
                }
                
            } catch(e) {
                console.error(e);
            }
            return;
        }

        if (activePresentation.fileUrl && !isPdf) {
            let srcUrl = activePresentation.fileUrl;
            if (srcUrl.toLowerCase().endsWith('.pptx') || srcUrl.toLowerCase().endsWith('.ppt')) {
                const absoluteUrl = new URL(srcUrl, window.location.href).href;
                if (absoluteUrl.includes('localhost') || absoluteUrl.includes('127.0.0.1') || absoluteUrl.startsWith('file://')) {
                    viewerContentArea.innerHTML = `<div class="slide-display"><p style="color:white; text-align:center;">Para ver apresentações em PPTX diretamente, o projeto precisa estar online (ex: GitHub Pages).<br><br>No computador local (localhost), o visualizador do Office não consegue baixar o arquivo.<br><br><a href="${srcUrl}" style="color:#00c3e3; text-decoration:underline;">Clique aqui para baixar o PPTX</a></p></div>`;
                    if (viewerPrevBtn) viewerPrevBtn.style.display = 'none';
                    if (viewerNextBtn) viewerNextBtn.style.display = 'none';
                    if (viewerSlideCounter) viewerSlideCounter.textContent = 'Arquivo Local PPTX';
                    return;
                }
                srcUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(absoluteUrl)}`;
            }
            viewerContentArea.innerHTML = `<iframe src="${srcUrl}" width="100%" height="100%" style="border:none;"></iframe>`;
            if (viewerPrevBtn) viewerPrevBtn.style.display = 'none';
            if (viewerNextBtn) viewerNextBtn.style.display = 'none';
            if (viewerSlideCounter) viewerSlideCounter.textContent = 'Apresentação PPTX / Externo';
            return;
        }

        if (viewerPrevBtn) viewerPrevBtn.style.display = 'inline-block';
        if (viewerNextBtn) viewerNextBtn.style.display = 'inline-block';

        const slides = activePresentation.slides || [];
        if (slides.length === 0) {
            viewerContentArea.innerHTML = `<div class="slide-display"><h1 style="color:white;">${activePresentation.title}</h1><p style="color:white;">Nenhum slide adicionado.</p></div>`;
            if (viewerSlideCounter) viewerSlideCounter.textContent = '0 / 0';
            return;
        }

        const slide = slides[currentSlideIndex] || slides[0];
        viewerContentArea.innerHTML = `
            <div class="slide-display" style="background:#fff; padding: 40px; border-radius: 8px; width: 80%; height: 80%; box-shadow: 0 10px 40px rgba(0,0,0,0.5);">
                <h1>${slide.title || `Slide ${currentSlideIndex + 1}`}</h1>
                <p style="font-size: 1.5rem;">${slide.content || ''}</p>
            </div>
        `;

        if (viewerSlideCounter) viewerSlideCounter.textContent = `Slide ${currentSlideIndex + 1} / ${slides.length}`;
        if (viewerPrevBtn) {
            viewerPrevBtn.disabled = (currentSlideIndex === 0);
            viewerPrevBtn.style.opacity = viewerPrevBtn.disabled ? '0.4' : '1';
        }
        if (viewerNextBtn) {
            viewerNextBtn.disabled = (currentSlideIndex === slides.length - 1);
            viewerNextBtn.style.opacity = viewerNextBtn.disabled ? '0.4' : '1';
        }
    }

    if (viewerPrevBtn) {
        viewerPrevBtn.addEventListener('mouseenter', playSelect);
        viewerPrevBtn.addEventListener('click', () => {
            if (currentSlideIndex > 0) {
                playTick();
                currentSlideIndex--;
                renderSlideContent();
            }
        });
    }

    if (viewerNextBtn) {
        viewerNextBtn.addEventListener('mouseenter', playSelect);
        viewerNextBtn.addEventListener('click', () => {
            if (isPdf && pdfDoc) {
                if (currentSlideIndex < pdfDoc.numPages - 1) {
                    playTick();
                    currentSlideIndex++;
                    renderSlideContent();
                }
            } else if (activePresentation && activePresentation.slides && currentSlideIndex < activePresentation.slides.length - 1) {
                playTick();
                currentSlideIndex++;
                renderSlideContent();
            }
        });
    }

    let isLaserActive = false;
    let laserOverlayCanvas = null;

    const laserBtn = document.getElementById('viewer-laser-btn');
    if (laserBtn) {
        laserBtn.addEventListener('mouseenter', playSelect);
        laserBtn.addEventListener('click', () => {
            playSelect();
            isLaserActive = !isLaserActive;
            if (isLaserActive) {
                laserBtn.classList.add('active');
                if (laserOverlayCanvas) laserOverlayCanvas.classList.add('laser-active-cursor');
            } else {
                laserBtn.classList.remove('active');
                if (laserOverlayCanvas) laserOverlayCanvas.classList.remove('laser-active-cursor');
            }
        });
    }

    function setupLaserCanvas(canvas) {
        laserOverlayCanvas = canvas;
        if (isLaserActive) {
            laserOverlayCanvas.classList.add('laser-active-cursor');
        }
        
        const ctx = canvas.getContext('2d');
        let isDrawing = false;
        let points = [];
        
        window.addLaserPoint = (x, y) => {
            if (!isLaserActive) return;
            points.push({ x, y, time: Date.now() });
        };

        canvas.addEventListener('mousedown', (e) => {
            if (!isLaserActive) return;
            isDrawing = true;
            window.addLaserPoint(e.offsetX, e.offsetY);
        });

        canvas.addEventListener('mousemove', (e) => {
            if (!isLaserActive || !isDrawing) return;
            points.push({ x: e.offsetX, y: e.offsetY, time: Date.now() });
        });

        canvas.addEventListener('mouseup', () => {
            isDrawing = false;
        });

        canvas.addEventListener('mouseout', () => {
            isDrawing = false;
        });

        function animateLaser() {
            if (!laserOverlayCanvas) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const now = Date.now();
            
            // Keep points from the last 600ms
            points = points.filter(p => now - p.time < 600);
            
            if (points.length > 0) {
                ctx.beginPath();
                for (let i = 0; i < points.length; i++) {
                    const p = points[i];
                    const age = now - p.time;
                    const opacity = Math.max(0, 1 - (age / 600));
                    
                    if (i === 0) ctx.moveTo(p.x, p.y);
                    else ctx.lineTo(p.x, p.y);
                    
                    if (i === points.length - 1) {
                        ctx.strokeStyle = `rgba(255, 59, 48, ${opacity})`;
                        ctx.lineWidth = 6;
                        ctx.lineCap = 'round';
                        ctx.lineJoin = 'round';
                        ctx.stroke();
                        
                        ctx.beginPath();
                        ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
                        ctx.fill();
                        ctx.strokeStyle = `rgba(255, 59, 48, ${opacity})`;
                        ctx.lineWidth = 3;
                        ctx.stroke();
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                    }
                }
            }
            requestAnimationFrame(animateLaser);
        }
        animateLaser();
    }

    if (closeViewerBtn) {
        closeViewerBtn.addEventListener('mouseenter', playSelect);
        closeViewerBtn.addEventListener('click', () => {
            playSelect();
            viewerModal.classList.remove('active');
        });
    }

    // --- Presentation Configurator Modal ---
    const configModal = document.getElementById('presentation-config-modal');
    const closeConfigBtn = document.getElementById('close-config-btn');
    const btnPresentationConfig = document.getElementById('btn-presentation-config');
    const configPresentationsList = document.getElementById('config-presentations-list');
    const btnAddPresentation = document.getElementById('btn-add-presentation');
    const configFormArea = document.getElementById('config-form-area');
    const configFormTitle = document.getElementById('config-form-title');



    // --- Fullscreen Toggle ---
    const fsBtn = document.getElementById('fullscreen-toggle-btn');
    if (fsBtn) {
        fsBtn.addEventListener('click', () => {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(err => {
                    console.log("Error attempting to enable fullscreen:", err);
                });
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
            }
        });
    }

    // Sound helpers
    const cfgTitle = document.getElementById('cfg-title');
    const cfgSubtitle = document.getElementById('cfg-subtitle');
    const cfgCover = document.getElementById('cfg-cover');
    const cfgFile = document.getElementById('cfg-file');
    const cfgCoverFile = document.getElementById('cfg-cover-file');
    const cfgFileInput = document.getElementById('cfg-file-input');
    const cfgCoverDisplay = document.getElementById('cfg-cover-display');
    const cfgFileDisplay = document.getElementById('cfg-file-display');
    const cfgSlides = document.getElementById('cfg-slides');
    const cfgCancelBtn = document.getElementById('cfg-cancel-btn');
    const cfgSaveBtn = document.getElementById('cfg-save-btn');
    const btnDownloadConfig = document.getElementById('btn-download-config');

    let editingPresId = null;

    if (cfgCoverFile) {
        cfgCoverFile.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                const file = e.target.files[0];
                cfgCover.value = file.name;
                cfgCoverDisplay.textContent = file.name;
            }
        });
    }

    if (cfgFileInput) {
        cfgFileInput.addEventListener('change', async (e) => {
            if (e.target.files.length > 0) {
                const file = e.target.files[0];
                cfgFile.value = file.name;
                cfgFileDisplay.textContent = file.name;

                if (file.type === 'application/pdf') {
                    cfgCoverDisplay.textContent = "Extraindo miniatura da Capa...";
                    const base64 = await extractPDFCover(file);
                    if (base64) {
                        cfgCoverDisplay.innerHTML = `<span style="color:#00a651;">✅ Capa Gerada (Pré-visualização Interna)</span>`;
                    } else {
                        cfgCoverDisplay.textContent = "Falha ao extrair capa";
                    }
                }
            }
        });
    }

    if (btnPresentationConfig) {
        btnPresentationConfig.addEventListener('mouseenter', playSelect);
        btnPresentationConfig.addEventListener('click', () => {
            playSelect();
            const isLocal = (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
            if (!isLocal) {
                alert('⚠️ O Configurador de Apresentações só pode ser acessado executando o projeto localmente no seu computador!');
                return;
            }
            renderConfigList();
            if (configFormArea) configFormArea.style.display = 'none';
            if (configModal) configModal.classList.add('active');
        });
    }

    if (closeConfigBtn) {
        closeConfigBtn.addEventListener('mouseenter', playSelect);
        closeConfigBtn.addEventListener('click', () => {
            playSelect();
            if (configModal) configModal.classList.remove('active');
        });
    }

    function renderConfigList() {
        if (!configPresentationsList) return;
        configPresentationsList.innerHTML = '';
        presentations.forEach((pres, index) => {
            const item = document.createElement('div');
            item.className = 'config-item';
            item.innerHTML = `
                <div class="config-item-info">
                    <strong>${pres.title}</strong>
                    <span>${pres.subtitle || 'Sem subtítulo'} ${pres.fileUrl ? '📄 (Arquivo Web/PDF)' : `🎞️ (${pres.slides ? pres.slides.length : 0} slides)`}</span>
                </div>
                <div class="config-item-actions">
                    <button class="btn-move-up" title="Mover para Cima">⬆</button>
                    <button class="btn-move-down" title="Mover para Baixo">⬇</button>
                    <button class="btn-edit-pres">Editar</button>
                    <button class="btn-del-pres">Excluir</button>
                </div>
            `;
            const editBtn = item.querySelector('.btn-edit-pres');
            const delBtn = item.querySelector('.btn-del-pres');
            const upBtn = item.querySelector('.btn-move-up');
            const downBtn = item.querySelector('.btn-move-down');

            if (index === 0) upBtn.style.opacity = '0.3';
            if (index === presentations.length - 1) downBtn.style.opacity = '0.3';

            if (upBtn && index > 0) {
                upBtn.addEventListener('click', () => {
                    playSelect();
                    const temp = presentations[index - 1];
                    presentations[index - 1] = presentations[index];
                    presentations[index] = temp;
                    savePresentations();
                    renderConfigList();
                    renderCarousel();
                });
            }

            if (downBtn && index < presentations.length - 1) {
                downBtn.addEventListener('click', () => {
                    playSelect();
                    const temp = presentations[index + 1];
                    presentations[index + 1] = presentations[index];
                    presentations[index] = temp;
                    savePresentations();
                    renderConfigList();
                    renderCarousel();
                });
            }

            if (editBtn) {
                editBtn.addEventListener('click', () => {
                    playSelect();
                    editingPresId = pres.id;
                    if (configFormTitle) configFormTitle.textContent = 'Editar Apresentação';
                    if (cfgTitle) cfgTitle.value = pres.title;
                    if (cfgSubtitle) cfgSubtitle.value = pres.subtitle || '';
                    if (cfgCover) { cfgCover.value = pres.coverUrl || ''; cfgCoverDisplay.textContent = pres.coverUrl || 'Nenhuma imagem'; }
                    if (cfgFile) { cfgFile.value = pres.fileUrl || ''; cfgFileDisplay.textContent = pres.fileUrl || 'Nenhum arquivo'; }
                    if (cfgSlides) cfgSlides.value = (pres.slides || []).map(s => `${s.title || 'Slide'} | ${s.content || ''}`).join('\n');
                    if (configFormArea) configFormArea.style.display = 'flex';
                });
            }

            if (delBtn) {
                delBtn.addEventListener('click', () => {
                    playSelect();
                    if (confirm(`Deseja excluir "${pres.title}"?`)) {
                        presentations = presentations.filter(p => p.id !== pres.id);
                        savePresentations();
                        renderConfigList();
                        renderPresentationsCarousel();
                    }
                });
            }

            configPresentationsList.appendChild(item);
        });
    }

    if (btnAddPresentation) {
        btnAddPresentation.addEventListener('click', () => {
            playSelect();
            editingPresId = null;
            if (configFormTitle) configFormTitle.textContent = 'Nova Apresentação';
            if (cfgTitle) cfgTitle.value = '';
            if (cfgSubtitle) cfgSubtitle.value = '';
            if (cfgCover) { cfgCover.value = ''; cfgCoverDisplay.textContent = 'Nenhuma imagem'; }
            if (cfgFile) { cfgFile.value = ''; cfgFileDisplay.textContent = 'Nenhum arquivo'; }
            if (cfgSlides) cfgSlides.value = 'Capa | Título da Capa\nSlide 1 | Conteúdo do primeiro slide';
            if (configFormArea) configFormArea.style.display = 'flex';
        });
    }

    if (cfgCancelBtn) {
        cfgCancelBtn.addEventListener('click', () => {
            playSelect();
            if (configFormArea) configFormArea.style.display = 'none';
        });
    }

    if (typeof pdfjsLib !== 'undefined') {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
    }

    async function extractPDFCover(file) {
        if (!file || file.type !== 'application/pdf') return null;
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            const page = await pdf.getPage(1);
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            await page.render({ canvasContext: ctx, viewport: viewport }).promise;
            return canvas.toDataURL('image/jpeg', 0.8);
        } catch (e) {
            console.error("Erro extraindo PDF:", e);
            return null;
        }
    }

    if (cfgSaveBtn) {
        cfgSaveBtn.addEventListener('click', async () => {
            playThisOne();
            
            const coverFileInput = document.getElementById('cfg-cover-input');
            const presFileInput = document.getElementById('cfg-file-input');
            let presFile = presFileInput && presFileInput.files.length > 0 ? presFileInput.files[0] : null;
            let coverFile = coverFileInput && coverFileInput.files.length > 0 ? coverFileInput.files[0] : null;

            let defaultTitle = 'Nova Apresentação';
            if (presFile) {
                defaultTitle = presFile.name.replace(/\.[^/.]+$/, "");
            } else if (editingPresId) {
                const p = presentations.find(p => p.id === editingPresId);
                if (p) defaultTitle = p.title;
            }

            const title = (cfgTitle && cfgTitle.value.trim()) || defaultTitle;
            const subtitle = (cfgSubtitle && cfgSubtitle.value.trim()) || '';
            const rawSlides = cfgSlides ? cfgSlides.value.split('\n').filter(line => line.trim() !== '') : [];
            const slides = rawSlides.map((line, idx) => {
                const parts = line.split('|');
                return {
                    title: (parts[0] || `Slide ${idx + 1}`).trim(),
                    content: (parts.slice(1).join('|') || '').trim()
                };
            });

            let finalCoverUrl = editingPresId ? (presentations.find(p => p.id === editingPresId)?.coverUrl || '') : '';
            let finalFileUrl = editingPresId ? (presentations.find(p => p.id === editingPresId)?.fileUrl || '') : '';

            cfgSaveBtn.textContent = 'Salvando...';
            cfgSaveBtn.disabled = true;

            try {
                let generatedBase64 = null;

                if (presFile && presFile.type === 'application/pdf' && !coverFile) {
                    generatedBase64 = await extractPDFCover(presFile);
                }

                if (presFile) {
                    const formData = new FormData();
                    formData.append('file', presFile);
                    const res = await fetch('http://localhost:3000/api/upload', { method: 'POST', body: formData });
                    if (res.ok) {
                        const data = await res.json();
                        finalFileUrl = data.filepath;
                    }
                }
                
                if (coverFile) {
                    const formData = new FormData();
                    formData.append('file', coverFile);
                    const res = await fetch('http://localhost:3000/api/upload', { method: 'POST', body: formData });
                    if (res.ok) {
                        const data = await res.json();
                        finalCoverUrl = data.filepath;
                    }
                } else if (generatedBase64) {
                    const res = await fetch('http://localhost:3000/api/upload-base64', { 
                        method: 'POST', 
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ imageBase64: generatedBase64, filename: presFile.name + '.jpg' })
                    });
                    if (res.ok) {
                        const data = await res.json();
                        finalCoverUrl = data.filepath;
                    }
                }

                const palettes = ['linear-gradient(135deg, #ff4e50, #f9d423)', 'linear-gradient(135deg, #1fa2ff, #12d8fa, #a6ffcb)', 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)', 'linear-gradient(135deg, #11998e, #38ef7d)'];

                if (editingPresId) {
                    const p = presentations.find(item => item.id === editingPresId);
                    if (p) {
                        p.title = title;
                        p.subtitle = subtitle;
                        if (finalCoverUrl) p.coverUrl = finalCoverUrl;
                        if (finalFileUrl) p.fileUrl = finalFileUrl;
                        p.slides = slides;
                    }
                } else {
                    const newPres = {
                        id: 'pres_' + Date.now(),
                        title,
                        subtitle,
                        coverUrl: finalCoverUrl,
                        bgColor: palettes[Math.floor(Math.random() * palettes.length)],
                        fileUrl: finalFileUrl,
                        slides
                    };
                    presentations.push(newPres);
                }

                // Automação: Enviar pro servidor salvar o config_data.js
                try {
                    await fetch('http://localhost:3000/api/save-config', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ profiles, presentations })
                    });
                } catch(e) {
                    console.warn("Servidor local não encontrado, salvando config em memória/localstorage");
                    savePresentations();
                }

                renderConfigList();
                renderPresentationsCarousel();
                if (configFormArea) configFormArea.style.display = 'none';
            } catch (e) {
                console.error("Erro no upload", e);
                alert("Ocorreu um erro no upload. O servidor Node.js está rodando?");
            } finally {
                cfgSaveBtn.textContent = 'Salvar';
                cfgSaveBtn.disabled = false;
            }
        });
    }

    if (btnDownloadConfig) {
        btnDownloadConfig.addEventListener('click', () => {
            playThisOne();
            const configObj = {
                profiles: profiles,
                presentations: presentations
            };
            const jsContent = `// Arquivo de Configuração Estática para o GitHub\n// Atualizado pelo Configurador de Apresentações\n\nwindow.INITIAL_CONFIG = ${JSON.stringify(configObj, null, 4)};\n`;
            const blob = new Blob([jsContent], { type: 'application/javascript;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'config_data.js';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            alert('✅ Arquivo config_data.js baixado com sucesso! Substitua-o na pasta do projeto e suba para o GitHub.');
        });
    }

    // --- Controle Remoto ---
    const viewerRemoteBtn = document.getElementById('viewer-remote-btn');
    const qrModal = document.getElementById('qr-modal');
    const closeQrBtn = document.getElementById('close-qr-btn');
    const qrImage = document.getElementById('qr-image');
    const qrLoadingText = document.getElementById('qr-loading-text');

    if (viewerRemoteBtn) {
        viewerRemoteBtn.addEventListener('click', async () => {
            playSelect();
            if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
                alert('⚠️ O Controle Remoto via celular só funciona quando você estiver rodando o Servidor Local (npm start). No GitHub Pages ele é desativado.');
                return;
            }

            qrModal.classList.add('active');
            qrLoadingText.style.display = 'block';
            qrImage.style.display = 'none';

            try {
                const res = await fetch('http://localhost:3000/api/local-ip');
                const data = await res.json();
                const remoteUrl = `http://${data.ip}:3000/remote.html`;
                qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(remoteUrl)}`;
                qrImage.onload = () => {
                    qrLoadingText.style.display = 'none';
                    qrImage.style.display = 'block';
                };
            } catch(e) {
                console.error(e);
                qrLoadingText.textContent = 'Erro ao conectar com o servidor local.';
            }
        });
    }

    if (closeQrBtn) {
        closeQrBtn.addEventListener('click', () => {
            playSelect();
            qrModal.classList.remove('active');
        });
    }

    // Connect to local Socket.IO server if running on localhost
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        const socketScript = document.createElement('script');
        socketScript.src = '/socket.io/socket.io.js';
        socketScript.onload = () => {
            if (typeof io !== 'undefined') {
                const socket = io();
                
                socket.on('laser_move', (data) => {
                    const viewerModal = document.getElementById('presentation-viewer-modal');
                    const isActive = viewerModal && viewerModal.classList.contains('active');
                    if (isActive && document.getElementById('viewer-laser-btn').classList.contains('active')) {
                        const canvas = document.getElementById('laser-overlay');
                        if (canvas && typeof window.addLaserPoint === 'function') {
                            const rect = canvas.getBoundingClientRect();
                            const x = data.x * rect.width;
                            const y = data.y * rect.height;
                            window.addLaserPoint(x, y);
                        }
                    }
                });

                socket.on('slide_control', (data) => {
                    const viewerModal = document.getElementById('presentation-viewer-modal');
                    const isActive = viewerModal && viewerModal.classList.contains('active');
                    if (isActive) {
                        const prevBtn = document.getElementById('viewer-prev-btn');
                        const nextBtn = document.getElementById('viewer-next-btn');
                        if (data.action === 'prev' && prevBtn) prevBtn.click();
                        if (data.action === 'next' && nextBtn) nextBtn.click();
                    }
                });
            }
        };
        document.body.appendChild(socketScript);
    }

    // Initial render
    renderProfiles();
    renderPresentationsCarousel();
});
