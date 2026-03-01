// Brackets Display Handler
class BracketsManager {
    constructor() {
        this.bgmiBracket = null;
        this.tekkenBracket = null;
        this.tournamentSettings = null;
        this.isInitialized = false;
        
        this.init();
    }

    async init() {
        if (!window.firebase || !window.firebase.db) {
            console.error('Firebase not initialized');
            return;
        }

        try {
            await this.loadTournamentSettings();
            await this.loadBrackets();
            this.setupRealTimeListeners();
            this.renderBrackets();
            this.isInitialized = true;
        } catch (error) {
            console.error('Failed to initialize brackets:', error);
        }
    }

    async loadTournamentSettings() {
        try {
            const { collection, getDocs, doc, getDoc } = window.firebase;
            
            // Try to get tournament settings
            const settingsDoc = doc(window.firebase.db, 'tournament_settings', 'main');
            const settingsSnapshot = await getDoc(settingsDoc);
            
            if (settingsSnapshot.exists()) {
                this.tournamentSettings = settingsSnapshot.data();
            } else {
                // Default settings if not found
                this.tournamentSettings = {
                    registrationOpen: true,
                    bracketsVisible: false
                };
            }
        } catch (error) {
            console.error('Error loading tournament settings:', error);
            this.tournamentSettings = {
                registrationOpen: true,
                bracketsVisible: false
            };
        }
    }

    async loadBrackets() {
        try {
            const { collection, getDocs, doc, getDoc } = window.firebase;
            
            // Load BGMI bracket
            const bgmiDoc = doc(window.firebase.db, 'tournament_brackets', 'bgmi');
            const bgmiSnapshot = await getDoc(bgmiDoc);
            if (bgmiSnapshot.exists()) {
                this.bgmiBracket = bgmiSnapshot.data();
            }

            // Load Tekken bracket
            const tekkenDoc = doc(window.firebase.db, 'tournament_brackets', 'tekken');
            const tekkenSnapshot = await getDoc(tekkenDoc);
            if (tekkenSnapshot.exists()) {
                this.tekkenBracket = tekkenSnapshot.data();
            }
        } catch (error) {
            console.error('Error loading brackets:', error);
        }
    }

    setupRealTimeListeners() {
        if (!window.firebase || !window.firebase.db) return;

        const { doc, onSnapshot } = window.firebase;

        // Listen for tournament settings changes
        const settingsDoc = doc(window.firebase.db, 'tournament_settings', 'main');
        onSnapshot(settingsDoc, (snapshot) => {
            if (snapshot.exists()) {
                this.tournamentSettings = snapshot.data();
                this.updateStatusMessage();
                this.renderBrackets();
            }
        });

        // Listen for BGMI bracket changes
        const bgmiDoc = doc(window.firebase.db, 'tournament_brackets', 'bgmi');
        onSnapshot(bgmiDoc, (snapshot) => {
            if (snapshot.exists()) {
                this.bgmiBracket = snapshot.data();
                this.renderBrackets();
            }
        });

        // Listen for Tekken bracket changes
        const tekkenDoc = doc(window.firebase.db, 'tournament_brackets', 'tekken');
        onSnapshot(tekkenDoc, (snapshot) => {
            if (snapshot.exists()) {
                this.tekkenBracket = snapshot.data();
                this.renderBrackets();
            }
        });
    }

    updateStatusMessage() {
        const statusMessage = document.getElementById('status-message');
        if (!statusMessage) return;

        if (!this.tournamentSettings.bracketsVisible) {
            statusMessage.style.display = 'block';
            statusMessage.innerHTML = `
                <div class="status-content">
                    <h3>Brackets Coming Soon</h3>
                    <p>Tournament brackets will be available after registration closes.</p>
                </div>
            `;
        } else {
            statusMessage.style.display = 'none';
        }
    }

    renderBrackets() {
        if (!this.tournamentSettings.bracketsVisible) {
            document.getElementById('bgmi-brackets').style.display = 'none';
            document.getElementById('tekken-brackets').style.display = 'none';
            return;
        }

        // Show brackets
        if (this.bgmiBracket && this.bgmiBracket.rounds) {
            document.getElementById('bgmi-brackets').style.display = 'block';
            this.renderBracket('bgmi', this.bgmiBracket);
        }

        if (this.tekkenBracket && this.tekkenBracket.rounds) {
            document.getElementById('tekken-brackets').style.display = 'block';
            this.renderBracket('tekken', this.tekkenBracket);
        }
    }

    renderBracket(gameType, bracketData) {
        const container = document.getElementById(`${gameType}-bracket-tree`);
        if (!container) return;

        if (!bracketData.rounds || bracketData.rounds.length === 0) {
            container.innerHTML = `
                <div class="empty-bracket">
                    <h3>No Brackets Available</h3>
                    <p>Brackets will be generated after registration closes.</p>
                </div>
            `;
            return;
        }

        let html = '';
        
        bracketData.rounds.forEach((round, roundIndex) => {
            html += `
                <div class="bracket-round">
                    <div class="round-title">${this.getRoundName(roundIndex, bracketData.rounds.length)}</div>
            `;
            
            round.matches.forEach((match, matchIndex) => {
                const isCompleted = match.winner !== null;
                const isCurrent = this.isCurrentMatch(roundIndex, matchIndex, bracketData.rounds);
                
                html += `
                    <div class="match ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}">
                        <div class="player ${match.winner === 0 ? 'winner' : ''}">
                            <span class="player-name">${match.player1 || 'TBD'}</span>
                            <span class="player-score">${match.score1 || 0}</span>
                        </div>
                        <div class="player ${match.winner === 1 ? 'winner' : ''}">
                            <span class="player-name">${match.player2 || 'TBD'}</span>
                            <span class="player-score">${match.score2 || 0}</span>
                        </div>
                        <div class="match-info">Match ${matchIndex + 1}</div>
                    </div>
                `;
            });
            
            html += '</div>';
        });

        container.innerHTML = html;
    }

    getRoundName(roundIndex, totalRounds) {
        const roundNames = [
            'Final',
            'Semi-Final',
            'Quarter-Final',
            'Round of 16',
            'Round of 32',
            'Round of 64'
        ];
        
        const reverseIndex = totalRounds - 1 - roundIndex;
        return roundNames[reverseIndex] || `Round ${roundIndex + 1}`;
    }

    isCurrentMatch(roundIndex, matchIndex, rounds) {
        // Simple logic to determine current match
        // This could be enhanced with more sophisticated logic
        const currentRound = rounds.find(round => 
            round.matches.some(match => match.winner === null)
        );
        
        if (!currentRound) return false;
        
        return rounds[roundIndex] === currentRound && 
               currentRound.matches[matchIndex] && 
               currentRound.matches[matchIndex].winner === null;
    }
}

// Initialize brackets when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Wait for Firebase to be initialized
    const checkFirebase = () => {
        if (window.firebase && window.firebase.db) {
            window.bracketsManager = new BracketsManager();
        } else {
            setTimeout(checkFirebase, 100);
        }
    };
    
    checkFirebase();
});
