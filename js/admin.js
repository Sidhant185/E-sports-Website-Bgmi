// Admin Panel Handler
class AdminPanel {
    constructor() {
        this.currentUser = null;
        this.tournamentSettings = null;
        this.bgmiTeams = [];
        this.tekkenPlayers = [];
        this.bgmiBracket = null;
        this.tekkenBracket = null;
        this.draftBgmiBracket = null;
        this.draftTekkenBracket = null;
        this.isPreviewing = false;
        this.bgmiSeedBase = [];
        this.tekkenSeedBase = [];
        this.bgmiSeedCurrent = [];
        this.tekkenSeedCurrent = [];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkAuthState();
    }

    setupEventListeners() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.handleLogout();
            });
        }

        // Tab navigation
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchTab(btn.dataset.tab);
            });
        });

        // Tournament settings
        const registrationToggle = document.getElementById('registration-toggle');
        if (registrationToggle) {
            registrationToggle.addEventListener('change', () => {
                this.updateRegistrationStatus(registrationToggle.checked);
            });
        }

        const bracketsToggle = document.getElementById('brackets-toggle');
        if (bracketsToggle) {
            bracketsToggle.addEventListener('change', () => {
                this.updateBracketsVisibility(bracketsToggle.checked);
            });
        }

        // Action buttons
        const generateBracketsBtn = document.getElementById('generate-brackets-btn');
        if (generateBracketsBtn) {
            generateBracketsBtn.addEventListener('click', () => {
                this.openBracketPreview();
            });
        }

        const resetTournamentBtn = document.getElementById('reset-tournament-btn');
        if (resetTournamentBtn) {
            resetTournamentBtn.addEventListener('click', () => {
                this.resetTournament();
            });
        }
    }

    async checkAuthState() {
        // Check if user is logged in via localStorage
        const storedAuth = localStorage.getItem('admin_auth');
        if (storedAuth) {
            try {
                const authData = JSON.parse(storedAuth);
                // Verify it's a valid admin session
                if (authData.email === 'Admin@gmail.com' && authData.timestamp) {
                    // Check if session is not expired (optional: 24 hours)
                    const sessionAge = Date.now() - authData.timestamp;
                    const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
                    
                    if (sessionAge < maxAge) {
                        this.currentUser = { email: authData.email, uid: 'admin' };
                        this.showDashboard();
                        this.loadData();
                        return;
                    } else {
                        // Session expired, clear it
                        localStorage.removeItem('admin_auth');
                    }
                }
            } catch (error) {
                console.error('Error reading stored auth:', error);
                localStorage.removeItem('admin_auth');
            }
        }
        
        // No valid stored session, show login screen
        this.showLogin();
    }

    async handleLogin() {
        const email = document.getElementById('admin-email').value;
        const password = document.getElementById('admin-password').value;
        const errorElement = document.getElementById('login-error');

        // Hardcoded admin credentials
        if (email === 'Admin@gmail.com' && password === 'Admin@123') {
            try {
                // Simulate successful login (no Firebase auth needed for demo)
// Admin login successful
                this.currentUser = { email: email, uid: 'admin' };
                
                // Store auth in localStorage for auto-login
                const authData = {
                    email: email,
                    uid: 'admin',
                    timestamp: Date.now()
                };
                localStorage.setItem('admin_auth', JSON.stringify(authData));
                
                this.showDashboard();
                this.loadData();
                
            } catch (error) {
                console.error('Login error:', error);
                this.showError('Login failed. Please try again.');
            }
        } else {
            this.showError('Invalid credentials. Please try again.');
        }
    }

    showError(message) {
        const errorElement = document.getElementById('login-error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    }

    async handleLogout() {
        if (window.firebase && window.firebase.auth) {
            const { signOut } = window.firebase;
            await signOut(window.firebase.auth);
        }
        
        // Clear localStorage on logout
        localStorage.removeItem('admin_auth');
        
        this.currentUser = null;
        this.showLogin();
    }

    showLogin() {
        document.getElementById('login-section').style.display = 'block';
        document.getElementById('admin-dashboard').style.display = 'none';
        document.getElementById('admin-status').textContent = 'Not logged in';
        document.getElementById('logout-btn').style.display = 'none';
    }

    showDashboard() {
        document.getElementById('login-section').style.display = 'none';
        document.getElementById('admin-dashboard').style.display = 'block';
        document.getElementById('admin-status').textContent = `Logged in as ${this.currentUser.email}`;
        document.getElementById('logout-btn').style.display = 'block';
    }

    switchTab(tabName) {
        // Hide all tab contents
        const tabContents = document.querySelectorAll('.tab-content');
        tabContents.forEach(content => content.classList.remove('active'));

        // Remove active class from all tab buttons
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => btn.classList.remove('active'));

        // Show selected tab content
        const selectedTab = document.getElementById(`${tabName}-tab`);
        if (selectedTab) {
            selectedTab.classList.add('active');
        }

        // Add active class to selected tab button
        const selectedBtn = document.querySelector(`[data-tab="${tabName}"]`);
        if (selectedBtn) {
            selectedBtn.classList.add('active');
        }

        // Load data for specific tabs
        if (tabName === 'brackets') {
            // Reload brackets from Firebase and render
            this.loadBrackets().then(() => {
                this.renderAdminBrackets();
            });
        }
    }

    async loadData() {
        await this.loadTournamentSettings();
        await this.loadRegistrations();
        await this.loadBrackets(); // Load brackets when dashboard opens
        this.updateUI();
    }

    // --- Bracket Preview Flow ---
    openBracketPreview() {
        try {
            // Initialize current seeding from loaded data if empty
            if (this.bgmiSeedCurrent.length === 0 && this.bgmiTeams.length > 0) {
                this.bgmiSeedCurrent = this.bgmiTeams.map(t => t.teamName);
            }
            if (this.tekkenSeedCurrent.length === 0 && this.tekkenPlayers.length > 0) {
                this.tekkenSeedCurrent = this.tekkenPlayers.map(p => p.playerName);
            }

            // Build drafts from current seeding (do not publish)
            if (this.bgmiSeedCurrent.length > 0) {
                this.draftBgmiBracket = this.createBracket(this.bgmiSeedCurrent, 'bgmi');
            } else {
                this.draftBgmiBracket = null;
            }

            if (this.tekkenSeedCurrent.length > 0) {
                this.draftTekkenBracket = this.createBracket(this.tekkenSeedCurrent, 'tekken');
            } else {
                this.draftTekkenBracket = null;
            }

            this.isPreviewing = true;
            this.showBracketPreviewModal();
            this.renderSeedingEditor();
            this.renderPreviewBrackets();
        } catch (error) {
            console.error('Error preparing bracket preview:', error);
            alert('Failed to prepare bracket preview.');
        }
    }

    showBracketPreviewModal() {
        const modal = document.getElementById('bracket-preview-modal');
        if (!modal) return;
        modal.style.display = 'block';

        const cancelBtn = document.getElementById('cancel-bracket-preview-btn');
        const confirmBtn = document.getElementById('confirm-bracket-preview-btn');
        const applySeedsBtn = document.getElementById('apply-seeding-btn');
        if (cancelBtn) {
            cancelBtn.onclick = () => this.closeBracketPreview();
        }
        if (confirmBtn) {
            confirmBtn.onclick = () => this.confirmBracketPreview();
        }
        if (applySeedsBtn) {
            applySeedsBtn.onclick = () => this.applySeedingToDraft();
        }
    }

    closeBracketPreview() {
        const modal = document.getElementById('bracket-preview-modal');
        if (modal) modal.style.display = 'none';
        this.isPreviewing = false;
        this.draftBgmiBracket = null;
        this.draftTekkenBracket = null;
    }

    // --- Seeding Editor ---
    renderSeedingEditor() {
        const bgmiList = document.getElementById('bgmi-seeding-list');
        const tekkenList = document.getElementById('tekken-seeding-list');
        if (bgmiList) {
            bgmiList.innerHTML = this.bgmiSeedCurrent.map((name, idx) => this.renderSeedItem('bgmi', name, idx)).join('');
        }
        if (tekkenList) {
            tekkenList.innerHTML = this.tekkenSeedCurrent.map((name, idx) => this.renderSeedItem('tekken', name, idx)).join('');
        }

        // Attach button controls
        const bgmiShuffle = document.getElementById('bgmi-shuffle-seeds');
        const bgmiReset = document.getElementById('bgmi-reset-seeds');
        const tekkenShuffle = document.getElementById('tekken-shuffle-seeds');
        const tekkenReset = document.getElementById('tekken-reset-seeds');
        bgmiShuffle && (bgmiShuffle.onclick = () => { this.shuffleArray(this.bgmiSeedCurrent); this.renderSeedingEditor(); });
        bgmiReset && (bgmiReset.onclick = () => { this.bgmiSeedCurrent = [...this.bgmiSeedBase]; this.renderSeedingEditor(); });
        tekkenShuffle && (tekkenShuffle.onclick = () => { this.shuffleArray(this.tekkenSeedCurrent); this.renderSeedingEditor(); });
        tekkenReset && (tekkenReset.onclick = () => { this.tekkenSeedCurrent = [...this.tekkenSeedBase]; this.renderSeedingEditor(); });

        // Attach up/down button events
        const attachMove = (game) => {
            const list = document.getElementById(`${game}-seeding-list`);
            if (!list) return;
            list.querySelectorAll('.seed-move-up').forEach(btn => {
                btn.addEventListener('click', () => this.moveSeed(game, parseInt(btn.dataset.index), -1));
            });
            list.querySelectorAll('.seed-move-down').forEach(btn => {
                btn.addEventListener('click', () => this.moveSeed(game, parseInt(btn.dataset.index), 1));
            });
        };
        attachMove('bgmi');
        attachMove('tekken');

        // Attach simple drag and drop within lists
        const attachDnD = (game) => {
            const list = document.getElementById(`${game}-seeding-list`);
            if (!list) return;
            list.querySelectorAll('.seed-item').forEach(item => {
                item.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text/plain', JSON.stringify({ game, index: parseInt(item.dataset.index) }));
                });
                item.addEventListener('dragover', (e) => e.preventDefault());
                item.addEventListener('drop', (e) => {
                    e.preventDefault();
                    try {
                        const src = JSON.parse(e.dataTransfer.getData('text/plain'));
                        const dstIndex = parseInt(item.dataset.index);
                        if (src.game === game) {
                            this.arrayMove(game === 'bgmi' ? this.bgmiSeedCurrent : this.tekkenSeedCurrent, src.index, dstIndex);
                            this.renderSeedingEditor();
                        }
                    } catch (err) {}
                });
            });
        };
        attachDnD('bgmi');
        attachDnD('tekken');
    }

    renderSeedItem(game, name, idx) {
        return `
            <li class="seed-item" draggable="true" data-index="${idx}" style="display:flex; align-items:center; gap:8px; padding:8px 10px; border-bottom:1px solid #1a1a1d;">
                <span style=\"width:28px; color:#9aa;\">${idx + 1}</span>
                <span style=\"flex:1;\">${name}</span>
                <div style=\"display:flex; gap:6px;\">
                    <button class=\"action-btn seed-move-up\" data-index=\"${idx}\">Up</button>
                    <button class=\"action-btn seed-move-down\" data-index=\"${idx}\">Down</button>
                </div>
            </li>
        `;
    }

    moveSeed(game, index, delta) {
        const arr = game === 'bgmi' ? this.bgmiSeedCurrent : this.tekkenSeedCurrent;
        const newIndex = index + delta;
        if (newIndex < 0 || newIndex >= arr.length) return;
        this.arrayMove(arr, index, newIndex);
        this.renderSeedingEditor();
    }

    arrayMove(arr, from, to) {
        const [spliced] = arr.splice(from, 1);
        arr.splice(to, 0, spliced);
    }

    shuffleArray(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }

    applySeedingToDraft() {
        this.draftBgmiBracket = this.bgmiSeedCurrent.length ? this.createBracket(this.bgmiSeedCurrent, 'bgmi') : null;
        this.draftTekkenBracket = this.tekkenSeedCurrent.length ? this.createBracket(this.tekkenSeedCurrent, 'tekken') : null;
        this.renderPreviewBrackets();
    }

    renderPreviewBrackets() {
        if (this.draftBgmiBracket) {
            this.renderPreviewBracket('bgmi', this.draftBgmiBracket);
        } else {
            const c = document.getElementById('bgmi-preview-bracket');
            if (c) c.innerHTML = '<div class="empty-bracket"><p>No BGMI teams.</p></div>';
        }

        if (this.draftTekkenBracket) {
            this.renderPreviewBracket('tekken', this.draftTekkenBracket);
        } else {
            const c = document.getElementById('tekken-preview-bracket');
            if (c) c.innerHTML = '<div class="empty-bracket"><p>No Tekken players.</p></div>';
        }
    }

    renderPreviewBracket(gameType, bracketData) {
        const container = document.getElementById(`${gameType}-preview-bracket`);
        if (!container || !bracketData || !bracketData.rounds) return;

        let html = '<div class="admin-bracket-tree">';
        bracketData.rounds.forEach((round, roundIndex) => {
            const isFirstRound = roundIndex === 0;
            const isFinalRound = roundIndex === bracketData.rounds.length - 1;
            const roundClass = isFirstRound ? 'first-round' : isFinalRound ? 'final-round' : '';
            html += `
                <div class="admin-round ${roundClass}" data-round="${roundIndex + 1}" data-matches="${round.matches.length}">
                    <h4>${this.getRoundName(roundIndex, bracketData.rounds.length, round)}</h4>
            `;

            round.matches.forEach((match, matchIndex) => {
                const isCompleted = match.winner !== null;
                const canSwap = isFirstRound; // Allow only Round 1 rearrangements
                html += `
                    <div class="admin-match ${isCompleted ? 'completed' : ''}">
                        <div class="match-players">
                            <div class="player ${match.winner === 0 ? 'winner' : ''}">
                                <span class="preview-player" draggable="${canSwap ? 'true' : 'false'}" data-game="${gameType}" data-round="${roundIndex}" data-match="${matchIndex}" data-slot="0">${match.player1 || 'TBD'}</span>
                            </div>
                            <div class="vs">VS</div>
                            <div class="player ${match.winner === 1 ? 'winner' : ''}">
                                <span class="preview-player" draggable="${canSwap ? 'true' : 'false'}" data-game="${gameType}" data-round="${roundIndex}" data-match="${matchIndex}" data-slot="1">${match.player2 || 'TBD'}</span>
                            </div>
                        </div>
                        ${canSwap ? `<div class="match-controls"><small>Drag player names to rearrange</small></div>` : ''}
                    </div>
                `;
            });

            html += '</div>';
        });
        html += '</div>';
        container.innerHTML = html;

        // Attach drag & drop listeners (Round 1 only)
        const players = container.querySelectorAll('.preview-player');
        players.forEach(el => {
            el.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', JSON.stringify({
                    game: el.dataset.game,
                    round: parseInt(el.dataset.round),
                    match: parseInt(el.dataset.match),
                    slot: parseInt(el.dataset.slot)
                }));
            });

            el.addEventListener('dragover', (e) => {
                e.preventDefault();
            });

            el.addEventListener('drop', (e) => {
                e.preventDefault();
                try {
                    const src = JSON.parse(e.dataTransfer.getData('text/plain'));
                    const dst = {
                        game: el.dataset.game,
                        round: parseInt(el.dataset.round),
                        match: parseInt(el.dataset.match),
                        slot: parseInt(el.dataset.slot)
                    };
                    // Only allow round 1 rearrangements
                    if (src.round === 0 && dst.round === 0 && src.game === dst.game) {
                        this.movePreviewPlayer(src, dst);
                    }
                } catch (err) {
                    console.error('Drag-drop error:', err);
                }
            });
        });
    }

    swapPreviewMatch(gameType, roundIndex, matchIndex) {
        const bracket = gameType === 'bgmi' ? this.draftBgmiBracket : this.draftTekkenBracket;
        if (!bracket || !bracket.rounds || !bracket.rounds[roundIndex]) return;
        const match = bracket.rounds[roundIndex].matches[matchIndex];
        if (!match) return;

        // Swap players only in Round 1; maintain bye flags and winner null
        const tmp = match.player1;
        match.player1 = match.player2;
        match.player2 = tmp;
        // Recompute bye winner if applicable
        if (match.isBye) {
            match.winner = (match.player1 === null) ? 1 : 0;
        }

        // Rebuild auto-advance from Round 1 to Round 2 for BYEs only
        if (bracket.rounds.length > 1 && roundIndex === 0) {
            const secondRound = bracket.rounds[1];
            const nextMatchIndex = Math.floor(matchIndex / 2);
            const nextMatch = secondRound && secondRound.matches ? secondRound.matches[nextMatchIndex] : null;
            if (nextMatch && match.isBye && match.winner !== null) {
                const winnerName = match.winner === 0 ? match.player1 : match.player2;
                if (matchIndex % 2 === 0) {
                    nextMatch.player1 = winnerName;
                } else {
                    nextMatch.player2 = winnerName;
                }
            }
        }

        // Re-render preview
        this.renderPreviewBracket(gameType, bracket);
    }

    movePreviewPlayer(src, dst) {
        const bracket = src.game === 'bgmi' ? this.draftBgmiBracket : this.draftTekkenBracket;
        if (!bracket || !bracket.rounds || !bracket.rounds[0]) return;

        const srcMatch = bracket.rounds[0].matches[src.match];
        const dstMatch = bracket.rounds[0].matches[dst.match];
        if (!srcMatch || !dstMatch) return;

        // Extract names
        const srcName = src.slot === 0 ? srcMatch.player1 : srcMatch.player2;
        const dstName = dst.slot === 0 ? dstMatch.player1 : dstMatch.player2;

        // Assign swapped positions
        if (src.slot === 0) srcMatch.player1 = dstName; else srcMatch.player2 = dstName;
        if (dst.slot === 0) dstMatch.player1 = srcName; else dstMatch.player2 = srcName;

        // Reset winners for affected matches unless it's a BYE where one side is null
        [srcMatch, dstMatch].forEach(m => {
            if (m) {
                if (m.isBye) {
                    m.winner = (m.player1 === null) ? 1 : (m.player2 === null) ? 0 : null;
                } else {
                    m.winner = null;
                }
                m.score1 = 0;
                m.score2 = 0;
            }
        });

        // Re-propagate BYE winners to Round 2
        if (bracket.rounds.length > 1) {
            const secondRound = bracket.rounds[1];
            // Clear impacted next round slots (for the two impacted matches)
            [src.match, dst.match].forEach(matchIndex => {
                const nextIndex = Math.floor(matchIndex / 2);
                const nextMatch = secondRound.matches[nextIndex];
                if (nextMatch) {
                    if (matchIndex % 2 === 0) nextMatch.player1 = null; else nextMatch.player2 = null;
                }
            });

            // Re-advance any BYE winners
            bracket.rounds[0].matches.forEach((m, idx) => {
                if (m && m.isBye) {
                    m.winner = (m.player1 === null) ? 1 : 0;
                    const winnerName = m.winner === 0 ? m.player1 : m.player2;
                    const nextIndex = Math.floor(idx / 2);
                    const nextMatch = secondRound.matches[nextIndex];
                    if (nextMatch) {
                        if (idx % 2 === 0) nextMatch.player1 = winnerName; else nextMatch.player2 = winnerName;
                    }
                }
            });
        }

        // Re-render
        this.renderPreviewBracket(src.game, bracket);
    }

    async confirmBracketPreview() {
        try {
            if (!window.firebase || !window.firebase.db) return;
            if (!window.firebase.setDoc) return;
            const { doc, setDoc } = window.firebase;

            if (this.draftBgmiBracket) {
                const bgmiDoc = doc(window.firebase.db, 'tournament_brackets', 'bgmi');
                await setDoc(bgmiDoc, this.draftBgmiBracket);
                this.bgmiBracket = this.draftBgmiBracket;
            }

            if (this.draftTekkenBracket) {
                const tekkenDoc = doc(window.firebase.db, 'tournament_brackets', 'tekken');
                await setDoc(tekkenDoc, this.draftTekkenBracket);
                this.tekkenBracket = this.draftTekkenBracket;
            }

            this.closeBracketPreview();
            alert('Brackets published successfully!');
            this.renderAdminBrackets();
        } catch (error) {
            console.error('Error publishing brackets:', error);
            alert('Failed to publish brackets.');
        }
    }
    
    async loadBrackets() {
        try {
            if (!window.firebase || !window.firebase.db) {
// Firebase not loaded
                return;
            }

            const { doc, getDoc } = window.firebase;

            // Load BGMI bracket
            const bgmiDoc = doc(window.firebase.db, 'tournament_brackets', 'bgmi');
            const bgmiSnapshot = await getDoc(bgmiDoc);
            if (bgmiSnapshot.exists()) {
                this.bgmiBracket = bgmiSnapshot.data();
                } else {
                this.bgmiBracket = null;
            }

            // Load Tekken bracket
            const tekkenDoc = doc(window.firebase.db, 'tournament_brackets', 'tekken');
            const tekkenSnapshot = await getDoc(tekkenDoc);
            if (tekkenSnapshot.exists()) {
                this.tekkenBracket = tekkenSnapshot.data();
                } else {
                this.tekkenBracket = null;
            }
        } catch (error) {
            console.error('Error loading brackets:', error);
        }
    }

    async loadTournamentSettings() {
        try {
            if (!window.firebase || !window.firebase.db) return;

            const { doc, getDoc } = window.firebase;
            const settingsDoc = doc(window.firebase.db, 'tournament_settings', 'main');
            const settingsSnapshot = await getDoc(settingsDoc);

            if (settingsSnapshot.exists()) {
                this.tournamentSettings = settingsSnapshot.data();
            } else {
                // Create default settings
                this.tournamentSettings = {
                    registrationOpen: true,
                    bracketsVisible: false
                };
                await this.saveTournamentSettings();
            }
        } catch (error) {
            console.error('Error loading tournament settings:', error);
            this.tournamentSettings = {
                registrationOpen: true,
                bracketsVisible: false
            };
        }
    }

    async loadRegistrations() {
        try {
            if (!window.firebase || !window.firebase.db) return;

            const { collection, getDocs } = window.firebase;

            // Load BGMI teams
            const bgmiSnapshot = await getDocs(collection(window.firebase.db, 'bgmi_teams'));
            this.bgmiTeams = [];
            bgmiSnapshot.forEach(doc => {
                this.bgmiTeams.push({ id: doc.id, ...doc.data() });
            });
            this.bgmiSeedBase = this.bgmiTeams.map(team => team.teamName);
            this.bgmiSeedCurrent = [...this.bgmiSeedBase];

            // Load Tekken players
            const tekkenSnapshot = await getDocs(collection(window.firebase.db, 'tekken_players'));
            this.tekkenPlayers = [];
            tekkenSnapshot.forEach(doc => {
                this.tekkenPlayers.push({ id: doc.id, ...doc.data() });
            });
            this.tekkenSeedBase = this.tekkenPlayers.map(player => player.playerName);
            this.tekkenSeedCurrent = [...this.tekkenSeedBase];

        } catch (error) {
            console.error('Error loading registrations:', error);
        }
    }

    updateUI() {
        this.renderRegistrations();
        this.updateSettingsUI();
    }

    renderRegistrations() {
        // Render BGMI teams
        const bgmiBody = document.getElementById('bgmi-teams-body');
        if (bgmiBody) {
            bgmiBody.innerHTML = '';
            this.bgmiTeams.forEach(team => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${team.teamName}</td>
                    <td>${team.captainName}</td>
                    <td>${team.captainEmail}</td>
                    <td>${team.members.map(m => m.name).join(', ')}</td>
                    <td>${new Date(team.timestamp?.toDate?.() || team.timestamp).toLocaleDateString()}</td>
                `;
                bgmiBody.appendChild(row);
            });
        }

        // Render Tekken players
        const tekkenBody = document.getElementById('tekken-players-body');
        if (tekkenBody) {
            tekkenBody.innerHTML = '';
            this.tekkenPlayers.forEach(player => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${player.playerName}</td>
                    <td>${player.email}</td>
                    <td>${new Date(player.timestamp?.toDate?.() || player.timestamp).toLocaleDateString()}</td>
                `;
                tekkenBody.appendChild(row);
            });
        }
    }

    updateSettingsUI() {
        const registrationToggle = document.getElementById('registration-toggle');
        const bracketsToggle = document.getElementById('brackets-toggle');
        const registrationStatus = document.getElementById('registration-status');
        const bracketsStatus = document.getElementById('brackets-status');

        if (registrationToggle && this.tournamentSettings) {
            registrationToggle.checked = this.tournamentSettings.registrationOpen;
            registrationStatus.textContent = this.tournamentSettings.registrationOpen ? 'Open' : 'Closed';
        }

        if (bracketsToggle && this.tournamentSettings) {
            bracketsToggle.checked = this.tournamentSettings.bracketsVisible;
            bracketsStatus.textContent = this.tournamentSettings.bracketsVisible ? 'Visible' : 'Hidden';
        }
    }

    async updateRegistrationStatus(isOpen) {
        try {
            this.tournamentSettings.registrationOpen = isOpen;
            await this.saveTournamentSettings();
            
            const statusElement = document.getElementById('registration-status');
            if (statusElement) {
                statusElement.textContent = isOpen ? 'Open' : 'Closed';
            }
        } catch (error) {
            console.error('Error updating registration status:', error);
        }
    }

    async updateBracketsVisibility(isVisible) {
        try {
            this.tournamentSettings.bracketsVisible = isVisible;
            await this.saveTournamentSettings();
            
            const statusElement = document.getElementById('brackets-status');
            if (statusElement) {
                statusElement.textContent = isVisible ? 'Visible' : 'Hidden';
            }
        } catch (error) {
            console.error('Error updating brackets visibility:', error);
        }
    }

    async saveTournamentSettings() {
        try {
            if (!window.firebase || !window.firebase.db) {
                console.error('Firebase not initialized');
                return;
            }

            if (!window.firebase.setDoc) {
                console.error('setDoc is not available in window.firebase');
                return;
            }

            const { doc, setDoc } = window.firebase;
            const settingsDoc = doc(window.firebase.db, 'tournament_settings', 'main');
            await setDoc(settingsDoc, this.tournamentSettings);
        } catch (error) {
            console.error('Error saving tournament settings:', error);
        }
    }

    async generateBrackets() {
        try {
            if (!window.firebase || !window.firebase.db) {
                console.error('Firebase not initialized');
                return;
            }

            if (!window.firebase.setDoc) {
                console.error('setDoc is not available in window.firebase');
                return;
            }

            const { doc, setDoc } = window.firebase;

            // Generate BGMI bracket
            if (this.bgmiTeams.length > 0) {
                this.bgmiBracket = this.createBracket(this.bgmiTeams.map(team => team.teamName), 'bgmi');
                const bgmiDoc = doc(window.firebase.db, 'tournament_brackets', 'bgmi');
                await setDoc(bgmiDoc, this.bgmiBracket);
            }

            // Generate Tekken bracket
            if (this.tekkenPlayers.length > 0) {
                this.tekkenBracket = this.createBracket(this.tekkenPlayers.map(player => player.playerName), 'tekken');
                const tekkenDoc = doc(window.firebase.db, 'tournament_brackets', 'tekken');
                await setDoc(tekkenDoc, this.tekkenBracket);
            }

            alert('Brackets generated successfully!');
            this.renderAdminBrackets();

        } catch (error) {
            console.error('Error generating brackets:', error);
            alert('Failed to generate brackets. Please try again.');
        }
    }

    // Standard knockout bracket seed positions (prevents top seeds from meeting early)
    getSeedPositions(bracketSize) {
        // Classic tournament seeding pattern
        // For bracketSize = 16: [1, 16, 9, 8, 5, 12, 13, 4, 3, 14, 11, 6, 7, 10, 15, 2]
        const positions = [];
        
        if (bracketSize === 2) return [1, 2];
        if (bracketSize === 4) return [1, 4, 3, 2];
        if (bracketSize === 8) return [1, 8, 5, 4, 3, 6, 7, 2];
        if (bracketSize === 16) return [1, 16, 9, 8, 5, 12, 13, 4, 3, 14, 11, 6, 7, 10, 15, 2];
        if (bracketSize === 32) return [1, 32, 17, 16, 9, 24, 25, 8, 5, 28, 21, 12, 13, 20, 29, 4, 3, 30, 19, 14, 11, 22, 27, 6, 7, 26, 23, 10, 15, 18, 31, 2];
        if (bracketSize === 64) {
            // For 64, we use recursive pattern
            return [1, 64, 33, 32, 17, 48, 49, 16, 9, 56, 41, 24, 25, 40, 57, 8, 5, 60, 37, 28, 21, 44, 53, 12, 13, 52, 45, 20, 29, 36, 61, 4, 3, 62, 35, 30, 19, 46, 51, 14, 11, 54, 43, 22, 27, 38, 59, 6, 7, 58, 39, 26, 23, 42, 55, 10, 15, 50, 47, 18, 31, 34, 63, 2];
        }
        if (bracketSize === 128) {
            // For larger brackets, generate programmatically
            const result = new Array(bracketSize);
            result[0] = 1;
            result[bracketSize - 1] = 2;
            
            // Fill recursively for seeds 3 onwards
            for (let seed = 3; seed <= bracketSize; seed++) {
                // Place seed in opposite half from seed-1
                const pos = this.placeSeedInBracket(seed, bracketSize, result);
                result[pos] = seed;
            }
            return result;
        }
        
        // Default: sequential for very large brackets
        return Array.from({ length: bracketSize }, (_, i) => i + 1);
    }
    
    placeSeedInBracket(seed, bracketSize, existing) {
        if (seed <= 2) return seed === 1 ? 0 : bracketSize - 1;
        
        // Find where seed-1 is placed
        const seedMinus1Pos = existing.indexOf(seed - 1);
        if (seedMinus1Pos === -1) {
            // If not found, place in first available slot
            for (let i = 0; i < bracketSize; i++) {
                if (!existing[i]) return i;
            }
        }
        
        // Place in opposite half
        const half = bracketSize / 2;
        const inFirstHalf = seedMinus1Pos < half;
        const targetHalf = inFirstHalf ? half : 0;
        
        // Find first empty slot in target half
        for (let i = targetHalf; i < targetHalf + half; i++) {
            if (!existing[i]) return i;
        }
        
        // Fallback
        for (let i = 0; i < bracketSize; i++) {
            if (!existing[i]) return i;
        }
        return 0;
    }

    createBracket(participants, gameType) {
        const bracket = {
            gameType: gameType,
            participants: participants,
            rounds: [],
            createdAt: new Date().toISOString()
        };

        const actualParticipantCount = participants.length;
        
        // Calculate the power of 2 bracket size
        const targetBracketSize = Math.pow(2, Math.ceil(Math.log2(actualParticipantCount)));
        const numByes = targetBracketSize - actualParticipantCount;
        const numRounds = Math.ceil(Math.log2(targetBracketSize));
        
        // Creating bracket

        // Get standard tournament seed positions
        const seedPositions = this.getSeedPositions(targetBracketSize);
        
        // Create array to hold bracket slots (indices 0 to bracketSize-1)
        const bracketSlots = new Array(targetBracketSize);
        
        // Assign players to their seed positions
        for (let i = 0; i < actualParticipantCount; i++) {
            const seedPosition = seedPositions[i] - 1; // Convert to 0-based index
            bracketSlots[seedPosition] = participants[i];
        }
        
        // Assign byes to top seeds (seeds 1 through numByes get byes)
        const topSeedsWithByes = Math.min(numByes, actualParticipantCount);
        
        for (let i = 0; i < topSeedsWithByes; i++) {
            const playerSlot = seedPositions[i] - 1;
            const pairSlot = (playerSlot % 2 === 0) ? playerSlot + 1 : playerSlot - 1;
            
            if (pairSlot >= 0 && pairSlot < targetBracketSize && !bracketSlots[pairSlot]) {
                bracketSlots[pairSlot] = 'BYE';
                    // Seed gets bye
            }
        }

        // Create rounds
        for (let round = 0; round < numRounds; round++) {
            const roundData = {
                roundNumber: round + 1,
                matches: []
            };

            if (round === 0) {
                // First round - create matches from bracketSlots
                for (let match = 0; match < targetBracketSize / 2; match++) {
                    const slot1 = match * 2;
                    const slot2 = match * 2 + 1;
                    
                    const player1 = bracketSlots[slot1];
                    const player2 = bracketSlots[slot2];
                    const isBye = (player1 === 'BYE' || player2 === 'BYE');
                    
                    roundData.matches.push({
                        matchNumber: match + 1,
                        player1: player1 && player1 !== 'BYE' ? player1 : null,
                        player2: player2 && player2 !== 'BYE' ? player2 : null,
                        score1: 0,
                        score2: 0,
                        winner: isBye ? (player1 === 'BYE' ? 1 : 0) : null,
                        isBye: isBye,
                        seed1: slot1 + 1,
                        seed2: slot2 + 1
                    });
                }
            } else {
                // Subsequent rounds - create empty matches for winners
                const prevRound = bracket.rounds[round - 1];
                const numMatches = prevRound ? Math.ceil(prevRound.matches.length / 2) : 1;
                
                for (let match = 0; match < numMatches; match++) {
                    roundData.matches.push({
                        matchNumber: match + 1,
                        player1: null,
                        player2: null,
                        score1: 0,
                        score2: 0,
                        winner: null
                    });
                }
            }

            bracket.rounds.push(roundData);
        }

        // Auto-advance BYE winners to next round so names appear correctly in the tree
        if (bracket.rounds.length > 1) {
            const firstRound = bracket.rounds[0];
            const secondRound = bracket.rounds[1];

            if (firstRound && secondRound) {
                firstRound.matches.forEach((match, matchIndex) => {
                    if (match && match.isBye === true && match.winner !== null) {
                        // Ensure bye match has scores marked
                        match.score1 = match.winner === 0 ? 1 : 0;
                        match.score2 = match.winner === 1 ? 1 : 0;

                        const winnerName = match.winner === 0 ? match.player1 : match.player2;
                        const nextMatchIndex = Math.floor(matchIndex / 2);

                        if (secondRound.matches[nextMatchIndex]) {
                            // Even-index match winner goes to player1, odd-index to player2 in next round
                            if (matchIndex % 2 === 0) {
                                if (!secondRound.matches[nextMatchIndex].player1) {
                                    secondRound.matches[nextMatchIndex].player1 = winnerName;
                                }
                            } else {
                                if (!secondRound.matches[nextMatchIndex].player2) {
                                    secondRound.matches[nextMatchIndex].player2 = winnerName;
                                }
                            }
                        }
                    }
                });
            }
        }

        return bracket;
    }

    renderAdminBrackets() {
        this.renderAdminBracket('bgmi', this.bgmiBracket);
        this.renderAdminBracket('tekken', this.tekkenBracket);
    }

    renderAdminBracket(gameType, bracketData) {
        const container = document.getElementById(`${gameType}-admin-bracket`);
        if (!container) return;

        if (!bracketData || !bracketData.rounds) {
            container.innerHTML = `
                <div class="empty-bracket">
                    <h4>No bracket available</h4>
                    <p>Generate brackets first to manage matches.</p>
                </div>
            `;
            return;
        }

        let html = '<div class="admin-bracket-tree">';
        
        bracketData.rounds.forEach((round, roundIndex) => {
            // Add round number and match count for styling
            const isFirstRound = roundIndex === 0;
            const isFinalRound = roundIndex === bracketData.rounds.length - 1;
            const roundClass = isFirstRound ? 'first-round' : isFinalRound ? 'final-round' : '';
            
            html += `
                <div class="admin-round ${roundClass}" data-round="${roundIndex + 1}" data-matches="${round.matches.length}">
                    <h4>${this.getRoundName(roundIndex, bracketData.rounds.length, round)}</h4>
            `;
            
            round.matches.forEach((match, matchIndex) => {
                const isCompleted = match.winner !== null;
                html += `
                    <div class="admin-match ${isCompleted ? 'completed' : ''}">
                        <div class="match-players">
                            <div class="player ${match.winner === 0 ? 'winner' : ''}">
                                <span>${match.player1 || 'TBD'}</span>
                            </div>
                            <div class="vs">VS</div>
                            <div class="player ${match.winner === 1 ? 'winner' : ''}">
                                <span>${match.player2 || 'TBD'}</span>
                            </div>
                        </div>
                        <div class="match-controls">
                            <button class="winner-btn" data-game="${gameType}" data-round="${roundIndex}" data-match="${matchIndex}" data-winner="0" ${!match.player1 || isCompleted ? 'disabled' : ''}>
                                ${match.player1 || 'TBD'} Wins
                            </button>
                            <button class="winner-btn" data-game="${gameType}" data-round="${roundIndex}" data-match="${matchIndex}" data-winner="1" ${!match.player2 || isCompleted ? 'disabled' : ''}>
                                ${match.player2 || 'TBD'} Wins
                            </button>
                        </div>
                    </div>
                `;
            });
            
            html += '</div>';
        });

        html += '</div>';
        container.innerHTML = html;

        // Add event listeners to winner buttons
        const winnerBtns = container.querySelectorAll('.winner-btn');
        winnerBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.handleMatchWinner(
                    btn.dataset.game,
                    parseInt(btn.dataset.round),
                    parseInt(btn.dataset.match),
                    parseInt(btn.dataset.winner)
                );
            });
        });
    }

    async handleMatchWinner(gameType, roundIndex, matchIndex, winnerIndex) {
        try {
            if (!window.firebase || !window.firebase.db) return;

            const { doc, getDoc, setDoc } = window.firebase;
            const bracketDoc = doc(window.firebase.db, 'tournament_brackets', gameType);
            const bracketSnapshot = await getDoc(bracketDoc);

            if (!bracketSnapshot.exists()) return;

            const bracketData = bracketSnapshot.data();
            
            // Validate bracket structure
            if (!bracketData.rounds || !bracketData.rounds[roundIndex] || !bracketData.rounds[roundIndex].matches) {
                console.error('Invalid bracket structure');
                return;
            }
            
            const match = bracketData.rounds[roundIndex].matches[matchIndex];
            if (!match) {
                console.error(`Match not found at round ${roundIndex}, match ${matchIndex}`);
                return;
            }
            
            // Update match winner
            match.winner = winnerIndex;
            match.score1 = winnerIndex === 0 ? 1 : 0;
            match.score2 = winnerIndex === 1 ? 1 : 0;

            // Advance winner to next round (KO tree logic)
            if (roundIndex < bracketData.rounds.length - 1) {
                const nextRound = bracketData.rounds[roundIndex + 1];
                const nextMatchIndex = Math.floor(matchIndex / 2);
                
                // Validate that the next match exists
                if (nextRound && nextRound.matches && nextMatchIndex < nextRound.matches.length) {
                    const nextMatch = nextRound.matches[nextMatchIndex];
                    
                    if (nextMatch) {
                        const winnerName = winnerIndex === 0 ? match.player1 : match.player2;
                        
                        // Proper tree advancement logic:
                        // Match 0, 2, 4, 6... (even) → player1 position in next round
                        // Match 1, 3, 5, 7... (odd) → player2 position in next round
                        // This ensures fair pairing without bias
                        // Example: Match 0 winner vs Match 1 winner → both advance to same next match
                        
                        if (matchIndex % 2 === 0) {
                            nextMatch.player1 = winnerName;
                            // Advanced winner to next round
                        } else {
                            nextMatch.player2 = winnerName;
                            // Advanced winner to next round
                        }
                    } else {
                        console.warn(`Next match not found at index ${nextMatchIndex} in round ${roundIndex + 2}`);
                    }
                } else {
                    console.warn(`Cannot advance to next round: invalid bracket structure`);
                }
            }

            // Save updated bracket
            await setDoc(bracketDoc, bracketData);

            // Reload bracket data and re-render
            if (gameType === 'bgmi') {
                this.bgmiBracket = bracketData;
            } else {
                this.tekkenBracket = bracketData;
            }

            // Re-render the entire bracket section
            this.renderAdminBracket(gameType, bracketData);
            this.renderAdminBrackets(); // Force full re-render to fix any display issues
            
            // Match updated successfully

        } catch (error) {
            console.error('Error updating match winner:', error);
            alert('Failed to update match result. Please try again.');
        }
    }

    getRoundName(roundIndex, totalRounds, round) {
        const matchCount = round.matches.length;
        
        // Special naming for finals and early rounds
        if (roundIndex === totalRounds - 1) {
            if (matchCount === 1) return '🏆 FINAL';
            if (matchCount === 2) return 'Semi-Finals';
            if (matchCount <= 4) return 'Quarter-Finals';
        }
        
        // Calculate round name based on number of participants
        const participantCount = matchCount * 2;
        
        // Standard knockout naming
        const roundNames = {
            2: 'Final',
            4: 'Semi-Finals',
            8: 'Quarter-Finals',
            16: 'Round of 16',
            32: 'Round of 32',
            64: 'Round of 64',
            128: 'Round of 128',
            256: 'Round of 256'
        };
        
        return roundNames[participantCount] || `Round of ${participantCount}`;
    }

    async resetTournament() {
        if (confirm('Are you sure you want to reset the entire tournament? This will delete all brackets and reset settings.')) {
            try {
                if (!window.firebase || !window.firebase.db) return;

                const { doc, deleteDoc } = window.firebase;

                // Delete brackets
                await deleteDoc(doc(window.firebase.db, 'tournament_brackets', 'bgmi'));
                await deleteDoc(doc(window.firebase.db, 'tournament_brackets', 'tekken'));

                // Reset settings
                this.tournamentSettings = {
                    registrationOpen: true,
                    bracketsVisible: false
                };
                await this.saveTournamentSettings();

                // Clear local data
                this.bgmiBracket = null;
                this.tekkenBracket = null;

                // Reload data
                await this.loadData();
                this.renderAdminBrackets();

                alert('Tournament reset successfully!');

            } catch (error) {
                console.error('Error resetting tournament:', error);
                alert('Failed to reset tournament. Please try again.');
            }
        }
    }
}

// Initialize admin panel when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait for Firebase to be initialized
    const checkFirebase = () => {
        if (window.firebase && window.firebase.auth) {
            window.adminPanel = new AdminPanel();
        } else {
            setTimeout(checkFirebase, 100);
        }
    };
    
    checkFirebase();
});