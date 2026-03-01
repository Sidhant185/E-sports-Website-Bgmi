// Countdown Timer for Halloween Event
class CountdownTimer {
    constructor() {
        this.eventDate = new Date('2025-10-31T18:00:00'); // Halloween 2025, 6 PM
        this.elements = {
            days: document.getElementById('days'),
            hours: document.getElementById('hours'),
            minutes: document.getElementById('minutes'),
            seconds: document.getElementById('seconds')
        };
        
        this.init();
    }

    init() {
        // Check if we're on the main page
        if (!this.elements.days) return;
        
        this.updateCountdown();
        this.startTimer();
        
        // Add scroll reveal animation
        this.addScrollReveal();
    }

    startTimer() {
        // Update every second
        setInterval(() => {
            this.updateCountdown();
        }, 1000);
    }

    updateCountdown() {
        const now = new Date().getTime();
        const distance = this.eventDate.getTime() - now;

        if (distance < 0) {
            // Event has started or passed
            this.showEventLive();
            return;
        }

        // Calculate time units
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Update display with flip animation
        this.updateElement(this.elements.days, days, 3);
        this.updateElement(this.elements.hours, hours, 2);
        this.updateElement(this.elements.minutes, minutes, 2);
        this.updateElement(this.elements.seconds, seconds, 2);

        // Add pulsing effect when time is running low
        if (days === 0 && hours < 24) {
            this.addUrgencyEffect();
        }
    }

    updateElement(element, value, digits) {
        if (!element) return;
        
        const currentValue = element.textContent;
        const newValue = value.toString().padStart(digits, '0');
        
        if (currentValue !== newValue) {
            // Add flip animation
            element.classList.add('countdown-flip');
            
            // Update value after animation starts
            setTimeout(() => {
                element.textContent = newValue;
                element.classList.remove('countdown-flip');
            }, 300);
        }
    }

    showEventLive() {
        // Replace countdown with live indicator
        const countdownContainer = document.querySelector('.countdown-container');
        if (countdownContainer) {
            countdownContainer.innerHTML = `
                <div class="live-indicator">
                    <h3>🎮 The Haunting Has Begun! 🎮</h3>
                    <div class="live-status">
                        <span class="live-pulse">LIVE</span>
                        <p>The tournament is now in progress!</p>
                    </div>
                </div>
            `;
        }
    }

    addUrgencyEffect() {
        const countdownTimer = document.getElementById('countdown-timer');
        if (countdownTimer && !countdownTimer.classList.contains('urgent')) {
            countdownTimer.classList.add('urgent');
            
            // Add urgent styling
            const style = document.createElement('style');
            style.textContent = `
                .urgent .time-number {
                    animation: pulseGlow 1s ease-in-out infinite;
                    color: var(--blood-red) !important;
                    text-shadow: 0 0 15px var(--blood-red) !important;
                }
                .urgent .time-unit {
                    border-color: var(--blood-red) !important;
                    box-shadow: 0 0 20px rgba(217, 0, 0, 0.5);
                }
            `;
            document.head.appendChild(style);
        }
    }

    addScrollReveal() {
        const countdownContainer = document.querySelector('.countdown-container');
        if (countdownContainer) {
            countdownContainer.classList.add('scroll-reveal');
            
            // Use Intersection Observer for scroll reveal
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('revealed');
                    }
                });
            }, { threshold: 0.3 });
            
            observer.observe(countdownContainer);
        }
    }

    // Method to get time remaining (for other components)
    getTimeRemaining() {
        const now = new Date().getTime();
        const distance = this.eventDate.getTime() - now;
        
        if (distance < 0) return null;
        
        return {
            days: Math.floor(distance / (1000 * 60 * 60 * 24)),
            hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((distance % (1000 * 60)) / 1000),
            total: distance
        };
    }

    // Method to check if event is live
    isEventLive() {
        const now = new Date().getTime();
        return now >= this.eventDate.getTime();
    }

    // Method to get event status
    getEventStatus() {
        const now = new Date().getTime();
        const distance = this.eventDate.getTime() - now;
        
        if (distance < 0) {
            return 'live';
        } else if (distance < 24 * 60 * 60 * 1000) { // Less than 24 hours
            return 'soon';
        } else {
            return 'upcoming';
        }
    }
}

// Additional countdown utilities
class CountdownUtils {
    static formatTimeRemaining(timeRemaining) {
        if (!timeRemaining) return 'Event has started!';
        
        const { days, hours, minutes, seconds } = timeRemaining;
        
        if (days > 0) {
            return `${days} day${days !== 1 ? 's' : ''}, ${hours} hour${hours !== 1 ? 's' : ''}`;
        } else if (hours > 0) {
            return `${hours} hour${hours !== 1 ? 's' : ''}, ${minutes} minute${minutes !== 1 ? 's' : ''}`;
        } else if (minutes > 0) {
            return `${minutes} minute${minutes !== 1 ? 's' : ''}, ${seconds} second${seconds !== 1 ? 's' : ''}`;
        } else {
            return `${seconds} second${seconds !== 1 ? 's' : ''}`;
        }
    }

    static getUrgencyLevel(timeRemaining) {
        if (!timeRemaining) return 'live';
        
        const { days, hours } = timeRemaining;
        
        if (days === 0 && hours < 1) return 'critical';
        if (days === 0 && hours < 6) return 'urgent';
        if (days < 3) return 'soon';
        return 'normal';
    }

    static addUrgencyClass(element, urgencyLevel) {
        // Remove existing urgency classes
        element.classList.remove('critical', 'urgent', 'soon', 'normal');
        
        // Add new urgency class
        element.classList.add(urgencyLevel);
    }
}

// Initialize countdown when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize on main page, not admin
    if (document.getElementById('countdown-timer')) {
        window.countdownTimer = new CountdownTimer();
        
        // Make utilities available globally
        window.CountdownUtils = CountdownUtils;
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CountdownTimer, CountdownUtils };
}
