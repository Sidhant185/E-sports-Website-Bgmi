// Audio Manager for UI Sound Effects
class AudioManager {
    constructor() {
        this.isMuted = false;
        this.sounds = {};
        this.volume = 0.3;
        
        this.init();
    }

    init() {
        this.loadSounds();
        this.setupMuteButton();
        this.loadMuteState();
    }

    loadSounds() {
        // Sounds disabled - no asset files
        this.sounds = {};
    }

    setupMuteButton() {
        const muteBtn = document.getElementById('mute-btn');
        if (!muteBtn) return;
        // Hide mute button since sounds are disabled
        muteBtn.style.display = 'none';
        this.updateMuteButton();
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        this.saveMuteState();
        this.updateMuteButton();
        this.playSound('click');
    }

    updateMuteButton() {
        const muteBtn = document.getElementById('mute-btn');
        if (!muteBtn) return;

        const soundIcon = muteBtn.querySelector('.sound-icon');
        if (soundIcon) {
            soundIcon.textContent = this.isMuted ? '🔇' : '🔊';
        }

        muteBtn.classList.toggle('muted', this.isMuted);
    }

    saveMuteState() {
        localStorage.setItem('esports-halloween-muted', this.isMuted.toString());
    }

    loadMuteState() {
        const savedState = localStorage.getItem('esports-halloween-muted');
        if (savedState !== null) {
            this.isMuted = savedState === 'true';
            this.updateMuteButton();
        }
    }

    playSound(soundName) {
        // Sound effects disabled
        return;
    }

    // Method to check if muted (for other components)
    isMuted() {
        return this.isMuted;
    }

    // Method to set volume
    setVolume(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        Object.values(this.sounds).forEach(sound => {
            sound.volume = this.volume;
        });
    }

    // Method to add hover sounds to elements
    addHoverSounds() {
        const hoverElements = document.querySelectorAll('.cta-btn, .game-card, .form-btn, .social-link, .action-btn');
        
        hoverElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                this.playSound('hover');
            });
        });
    }

    // Method to add click sounds to buttons
    addClickSounds() {
        const clickElements = document.querySelectorAll('button, .cta-btn, .form-btn, .action-btn');
        
        clickElements.forEach(element => {
            element.addEventListener('click', () => {
                this.playSound('click');
            });
        });
    }

    // Method to add special effects sounds
    addEffectSounds() {
        // Glitch effect sound
        const glitchElements = document.querySelectorAll('.glitch-text');
        glitchElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                this.playSound('glitch');
            });
        });

        // Ghost trail sound
        const ghostElements = document.querySelectorAll('.ghost-trail');
        ghostElements.forEach(element => {
            element.addEventListener('animationiteration', () => {
                this.playSound('ghost');
            });
        });
    }

    // Method to play ambient background sound (optional)
    playAmbient() {
        if (this.isMuted) return;
        
        const ambientSound = new Audio('assets/sounds/ambient.mp3');
        ambientSound.loop = true;
        ambientSound.volume = 0.1; // Very low volume
        ambientSound.play().catch(() => {
            // Ambient sound play failed (autoplay blocked)
        });
        
        return ambientSound;
    }
}

// Video Intro Handler
class VideoIntroHandler {
    constructor() {
        // Video intro disabled - directly show content
        this.hasPlayed = true;
    }

    setupEventListeners() {
        // Skip button
        if (this.skipBtn) {
            this.skipBtn.addEventListener('click', () => {
                this.skipIntro();
            });
        }

        // Video ended
        this.videoElement.addEventListener('ended', () => {
            this.hideIntro();
        });

        // Scroll detection
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            if (!this.hasPlayed) {
                clearTimeout(scrollTimeout);
                scrollTimeout = setTimeout(() => {
                    this.hideIntro();
                }, 100);
            }
        });

        // Click anywhere to skip
        this.videoIntro.addEventListener('click', (e) => {
            if (e.target === this.videoIntro) {
                this.skipIntro();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' || e.key === ' ') {
                this.skipIntro();
            }
        });
    }

    checkSkipPreference() {
        const skipIntro = localStorage.getItem('esports-halloween-skip-intro');
        if (skipIntro === 'true') {
            this.hideIntro();
            return;
        }
    }

    startVideo() {
        if (this.hasPlayed) return;
        
        this.videoElement.play().catch(() => {
            // If autoplay fails, show skip button immediately
            if (this.skipBtn) {
                this.skipBtn.style.display = 'block';
            }
        });
    }

    skipIntro() {
        this.hideIntro();
        this.saveSkipPreference();
        
        // Play skip sound
        if (window.audioManager) {
            window.audioManager.playSound('click');
        }
    }

    hideIntro() {
        if (this.hasPlayed) return;
        
        this.hasPlayed = true;
        this.videoElement.pause();
        
        this.videoIntro.classList.add('hidden');
        
        // Remove from DOM after animation
        setTimeout(() => {
            if (this.videoIntro.parentNode) {
                this.videoIntro.remove();
            }
        }, 500);
        
        // Trigger hero section animations
        this.triggerHeroAnimations();
    }

    saveSkipPreference() {
        localStorage.setItem('esports-halloween-skip-intro', 'true');
    }

    triggerHeroAnimations() {
        const heroTitle = document.querySelector('.hero-title');
        const heroSubtitle = document.querySelector('.hero-subtitle');
        const heroButtons = document.querySelector('.hero-buttons');
        
        if (heroTitle) {
            heroTitle.classList.add('fade-in-scale');
        }
        
        if (heroSubtitle) {
            setTimeout(() => {
                heroSubtitle.classList.add('fade-in-scale');
            }, 200);
        }
        
        if (heroButtons) {
            setTimeout(() => {
                heroButtons.classList.add('fade-in-scale');
            }, 400);
        }
    }
}

// Main Application Controller
class MainApp {
    constructor() {
        this.audioManager = null;
        this.videoIntroHandler = null;
        this.isInitialized = false;
        
        this.init();
    }

    init() {
        if (this.isInitialized) return;
        
        this.setupScrollReveals();
        this.setupQuoteCarousel();
        this.setupGameCardAnimations();
        this.loadPastTournaments();
        this.setupIntersectionObserver();
        this.checkTournamentSettings();
        
        this.isInitialized = true;
    }
    
    async checkTournamentSettings() {
        if (!window.firebase || !window.firebase.db) {
            return;
        }
        
        try {
            const { doc, getDoc } = window.firebase;
            const settingsDoc = doc(window.firebase.db, 'tournament_settings', 'main');
            const settingsSnapshot = await getDoc(settingsDoc);
            
            if (settingsSnapshot.exists()) {
                const settings = settingsSnapshot.data();
                const registrationSection = document.getElementById('registration');
                const registerButton = document.getElementById('footer-register-btn');
                
                // Hide registration section if closed
                if (!settings.registrationOpen) {
                    if (registrationSection) {
                        registrationSection.style.display = 'none';
                    }
                    if (registerButton) {
                        registerButton.style.display = 'none';
                    }
                }
            }
        } catch (error) {
            console.error('Error checking tournament settings:', error);
        }
    }

    setupScrollReveals() {
        const revealElements = document.querySelectorAll('.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                }
            });
        }, { threshold: 0.1 });

        revealElements.forEach(element => {
            observer.observe(element);
        });
    }

    setupQuoteCarousel() {
        const quotes = document.querySelectorAll('.quote');
        if (quotes.length === 0) return;
        
        let currentQuote = 0;
        
        setInterval(() => {
            quotes.forEach(quote => quote.classList.remove('active'));
            quotes[currentQuote].classList.add('active');
            currentQuote = (currentQuote + 1) % quotes.length;
        }, 4000);
    }

    setupGameCardAnimations() {
        const gameCards = document.querySelectorAll('.game-card');
        
        gameCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                if (window.audioManager) {
                    window.audioManager.playSound('hover');
                }
            });
        });
    }

    async loadPastTournaments() {
        if (!window.firebase) return;
        
        try {
            const { getDocs, collection, query, where, orderBy } = window.firebase;
            
            const tournamentsQuery = query(
                collection(window.firebase.db, 'tournaments'),
                where('status', '==', 'completed'),
                orderBy('date', 'desc')
            );
            
            const snapshot = await getDocs(tournamentsQuery);
            const tournamentsList = document.getElementById('tournaments-list');
            
            if (!tournamentsList) return;
            
            if (snapshot.empty) {
                tournamentsList.innerHTML = '<p class="no-tournaments">No completed tournaments yet. Be the first to make history!</p>';
                return;
            }
            
            tournamentsList.innerHTML = '';
            snapshot.forEach(doc => {
                const tournament = doc.data();
                const tournamentElement = document.createElement('div');
                tournamentElement.className = 'tournament-item';
                tournamentElement.innerHTML = `
                    <h4>${tournament.name}</h4>
                    <p><strong>Winner:</strong> ${tournament.winner}</p>
                    <p><strong>Date:</strong> ${new Date(tournament.date).toLocaleDateString()}</p>
                `;
                tournamentsList.appendChild(tournamentElement);
            });
            
        } catch (error) {
            console.error('Error loading past tournaments:', error);
        }
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    
                    // Play sound for certain elements
                    if (entry.target.classList.contains('game-card') && window.audioManager) {
                        window.audioManager.playSound('hover');
                    }
                }
            });
        }, { threshold: 0.3 });

        // Observe all sections
        const sections = document.querySelectorAll('section');
        sections.forEach(section => {
            observer.observe(section);
        });
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize on main page, not admin
    if (document.getElementById('three-canvas')) {
        // Initialize audio manager
        window.audioManager = new AudioManager();
        
        // Initialize video intro handler
        window.videoIntroHandler = new VideoIntroHandler();
        
        // Initialize main app
        window.mainApp = new MainApp();
        
        // Add sound effects to elements
        setTimeout(() => {
            window.audioManager.addHoverSounds();
            window.audioManager.addClickSounds();
            window.audioManager.addEffectSounds();
            
            // Add hero register button functionality
            const heroRegisterBtn = document.getElementById('register-btn');
            if (heroRegisterBtn) {
                heroRegisterBtn.addEventListener('click', () => {
                    const registrationSection = document.getElementById('registration');
                    if (registrationSection) {
                        registrationSection.scrollIntoView({ 
                            behavior: 'smooth' 
                        });
                    }
                });
            }
            
            // Add footer register button functionality
            const footerRegisterBtn = document.getElementById('footer-register-btn');
            if (footerRegisterBtn) {
                footerRegisterBtn.addEventListener('click', () => {
                    const registrationSection = document.getElementById('registration');
                    if (registrationSection) {
                        registrationSection.scrollIntoView({ 
                            behavior: 'smooth' 
                        });
                    }
                });
            }
            
            // Initialize accordion functionality
            const accordionHeaders = document.querySelectorAll('.accordion-header');
            accordionHeaders.forEach(header => {
                header.addEventListener('click', () => {
                    const accordionItem = header.parentElement;
                    const accordionContent = accordionItem.querySelector('.accordion-content');
                    
                    // Toggle active class
                    accordionItem.classList.toggle('active');
                    accordionContent.classList.toggle('active');
                });
            });
        }, 1000);
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AudioManager, VideoIntroHandler, MainApp };
}
