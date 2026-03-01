// Registration Form Handler
class RegistrationForm {
    constructor() {
        this.form = document.getElementById('registration-form');
        this.currentStep = 1;
        this.totalSteps = 2; // Only 2 steps: Game selection and player/team details
        this.formData = {};
        this.isSubmitting = false;
        this.selectedGame = null;
        
        this.init();
    }

    init() {
        if (!this.form) return;
        
        this.setupEventListeners();
        this.updateStepDisplay();
        this.updateNextButton();
    }

    setupEventListeners() {
        // Game selection change - consolidated to avoid duplicate calls
        const gameInputs = this.form.querySelectorAll('input[name="game"]');
        gameInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                this.handleGameSelection(e.target.value);
            });
        });

        // Listen for clicks on the label/option-card
        const gameOptions = this.form.querySelectorAll('.game-option');
        gameOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                const input = option.querySelector('input[name="game"]');
                if (input && !input.checked) {
                    input.checked = true;
                    this.handleGameSelection(input.value);
                }
            });
        });

        // Next/Previous buttons using event delegation for dynamic elements
        this.form.addEventListener('click', (e) => {
            if (e.target.closest('.next-btn')) {
                e.preventDefault();
                this.nextStep();
            } else if (e.target.closest('.prev-btn')) {
                e.preventDefault();
                this.prevStep();
            }
        });

        // Form submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitForm();
        });

        // Real-time validation with debouncing
        const inputs = this.form.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
                this.updateNextButton();
            });
            
            // Debounced input validation to prevent excessive calls
            let inputTimeout;
            input.addEventListener('input', () => {
                this.clearFieldError(input);
                
                // Clear previous timeout
                if (inputTimeout) {
                    clearTimeout(inputTimeout);
                }
                
                // Set new timeout for debounced validation
                inputTimeout = setTimeout(() => {
                    this.updateNextButton();
                }, 300); // 300ms delay
            });
        });
    }

    handleGameSelection(gameType) {
        this.selectedGame = gameType;
        const tekkenFields = document.getElementById('tekken-fields');
        const bgmiFields = document.getElementById('bgmi-fields');
        
        if (gameType === 'tekken7') {
            tekkenFields.style.display = 'block';
            bgmiFields.style.display = 'none';
        } else if (gameType === 'bgmi') {
            tekkenFields.style.display = 'none';
            bgmiFields.style.display = 'block';
        }
        
        this.updateNextButton();
    }

    validateEmail(email) {
        if (!email) return false;
        
        // Convert to lowercase for case-insensitive validation
        const emailLower = email.toLowerCase().trim();
        
        // Check if it contains @
        if (!emailLower.includes('@')) {
            return false;
        }
        
        // Check if it ends with @vedamsot.org (lowercase)
        const vedamsotPattern = /^[a-zA-Z0-9._%+-]+@vedamsot\.org$/;
        return vedamsotPattern.test(emailLower);
    }

    async checkDuplicateRegistration(email, uid = null, gameType = null) {
        try {
            if (!window.firebase || !window.firebase.db) {
                console.error('Firebase not initialized');
                return false;
            }

            const { collection, getDocs, query, where } = window.firebase;

            // Only check for duplicates within the same game type
            if (gameType === 'bgmi') {
                // Check BGMI teams for duplicates
                const bgmiQuery = query(
                    collection(window.firebase.db, 'bgmi_teams'),
                    where('captainEmail', '==', email)
                );
                const bgmiSnapshot = await getDocs(bgmiQuery);
                
                if (!bgmiSnapshot.empty) {
                    return true; // Email already registered in BGMI
                }

                // Check team members for duplicates
                const bgmiMembersQuery = query(
                    collection(window.firebase.db, 'bgmi_teams')
                );
                const bgmiMembersSnapshot = await getDocs(bgmiMembersQuery);
                
                for (const doc of bgmiMembersSnapshot.docs) {
                    const teamData = doc.data();
                    const allEmails = [
                        teamData.captainEmail,
                        ...teamData.members.map(member => member.email)
                    ];
                    const allUIDs = [
                        teamData.captainUID,
                        ...teamData.members.map(member => member.uid)
                    ];
                    
                    if (allEmails.includes(email) || (uid && allUIDs.includes(uid))) {
                        return true;
                    }
                }
            } else if (gameType === 'tekken7') {
                // Check Tekken players for duplicates
                const tekkenQuery = query(
                    collection(window.firebase.db, 'tekken_players'),
                    where('email', '==', email)
                );
                const tekkenSnapshot = await getDocs(tekkenQuery);
                
                return !tekkenSnapshot.empty;
            }

            return false;
        } catch (error) {
            console.error('Error checking duplicates:', error);
            return false;
        }
    }

    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.name;
        let isValid = true;
        let errorMessage = '';

        // Required field validation
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = 'This field is required';
        }

        // Email validation for @vedamsot.org (case-insensitive)
        if (fieldName.includes('Email') && value) {
            if (!this.validateEmail(value)) {
                isValid = false;
                const emailLower = value.toLowerCase();
                if (!emailLower.includes('@')) {
                    errorMessage = 'Email must contain @ symbol';
                } else if (!emailLower.endsWith('@vedamsot.org')) {
                    errorMessage = 'Must be a valid @vedamsot.org email address';
                } else {
                    errorMessage = 'Invalid email format';
                }
            }
        }

        // UID validation (basic)
        if (fieldName.includes('UID') && value) {
            if (value.length < 8) {
                isValid = false;
                errorMessage = 'BGMI UID must be at least 8 characters';
            }
        }

        this.showFieldError(field, isValid ? '' : errorMessage);
        return isValid;
    }

    showFieldError(field, message) {
        const errorElement = field.parentNode.querySelector('.error-message');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = message ? 'block' : 'none';
        }
        
        if (message) {
            field.style.borderColor = 'var(--bright-red)';
        } else {
            field.style.borderColor = 'var(--blood-red)';
        }
    }

    clearFieldError(field) {
        this.showFieldError(field, '');
    }

    updateNextButton() {
        const currentStepElement = document.querySelector(`[data-step="${this.currentStep}"]`);
        if (!currentStepElement) return;
        
        const nextBtn = currentStepElement.querySelector('.next-btn');
        if (!nextBtn) return;

        let canProceed = false;

        if (this.currentStep === 1) {
            // Game selection step
            const selectedGame = document.querySelector('input[name="game"]:checked');
            canProceed = !!selectedGame;
            
            // Fallback: check if we have a selectedGame from our internal state
            if (!canProceed && this.selectedGame) {
                canProceed = true;
            }
        } else if (this.currentStep === 2) {
            // Player details step
            if (this.selectedGame === 'tekken7') {
                const playerName = document.getElementById('playerName').value.trim();
                const playerEmail = document.getElementById('playerEmail').value.trim();
                const isValidEmail = this.validateEmail(playerEmail);
                
                canProceed = playerName && playerEmail && isValidEmail;
            } else if (this.selectedGame === 'bgmi') {
                const teamName = document.getElementById('teamName').value.trim();
                const captainName = document.getElementById('captainName').value.trim();
                const captainEmail = document.getElementById('captainEmail').value.trim();
                const captainUID = document.getElementById('captainUID').value.trim();
                const member1Name = document.getElementById('member1Name').value.trim();
                const member1Email = document.getElementById('member1Email').value.trim();
                const member1UID = document.getElementById('member1UID').value.trim();
                const member2Name = document.getElementById('member2Name').value.trim();
                const member2Email = document.getElementById('member2Email').value.trim();
                const member2UID = document.getElementById('member2UID').value.trim();
                const member3Name = document.getElementById('member3Name').value.trim();
                const member3Email = document.getElementById('member3Email').value.trim();
                const member3UID = document.getElementById('member3UID').value.trim();

                canProceed = teamName && captainName && captainEmail && captainUID &&
                           member1Name && member1Email && member1UID &&
                           member2Name && member2Email && member2UID &&
                           member3Name && member3Email && member3UID &&
                           this.validateEmail(captainEmail) &&
                           this.validateEmail(member1Email) &&
                           this.validateEmail(member2Email) &&
                           this.validateEmail(member3Email);
            }
        }

        nextBtn.disabled = !canProceed;
    }

    async nextStep() {
        // If on step 1, advance to step 2
        if (this.currentStep === 1) {
            this.currentStep++;
            this.updateStepDisplay();
            this.updateNextButton();
            return;
        }
        
        // If on step 2 (final step), validate and submit
        if (this.currentStep === 2) {
            // Validate current step - check fields based on selected game
            let allValid = true;
            const inputs = [];
            
            if (this.selectedGame === 'tekken7') {
                // Tekken fields
                const playerNameField = document.getElementById('playerName');
                const playerEmailField = document.getElementById('playerEmail');
                
                if (playerNameField) inputs.push(playerNameField);
                if (playerEmailField) inputs.push(playerEmailField);
            } else if (this.selectedGame === 'bgmi') {
                // BGMI fields
                const bgmiFields = [
                    'teamName', 'captainName', 'captainEmail', 'captainUID',
                    'member1Name', 'member1Email', 'member1UID',
                    'member2Name', 'member2Email', 'member2UID',
                    'member3Name', 'member3Email', 'member3UID'
                ];
                
                bgmiFields.forEach(fieldId => {
                    const field = document.getElementById(fieldId);
                    if (field) inputs.push(field);
                });
            }
            
            for (const input of inputs) {
                const fieldValid = this.validateField(input);
                if (!fieldValid) {
                    allValid = false;
                }
            }

            // Check for duplicate registrations
            if (this.selectedGame === 'tekken7') {
                const email = document.getElementById('playerEmail').value.trim();
                if (email && await this.checkDuplicateRegistration(email, null, 'tekken7')) {
                    this.showFieldError(document.getElementById('playerEmail'), 'This email is already registered for Tekken 7');
                    allValid = false;
                }
            } else if (this.selectedGame === 'bgmi') {
                const captainEmail = document.getElementById('captainEmail').value.trim();
                const member1Email = document.getElementById('member1Email').value.trim();
                const member2Email = document.getElementById('member2Email').value.trim();
                const member3Email = document.getElementById('member3Email').value.trim();
                
                const captainUID = document.getElementById('captainUID').value.trim();
                const member1UID = document.getElementById('member1UID').value.trim();
                const member2UID = document.getElementById('member2UID').value.trim();
                const member3UID = document.getElementById('member3UID').value.trim();

                const emails = [captainEmail, member1Email, member2Email, member3Email];
                const uids = [captainUID, member1UID, member2UID, member3UID];

                for (let i = 0; i < emails.length; i++) {
                    if (emails[i] && await this.checkDuplicateRegistration(emails[i], uids[i], 'bgmi')) {
                        const fieldId = i === 0 ? 'captainEmail' : `member${i}Email`;
                        this.showFieldError(document.getElementById(fieldId), 'This email/UID is already registered for BGMI');
                        allValid = false;
                    }
                }
            }

            if (!allValid) {
                return;
            }

            // Collect form data before submission
            this.collectFormData();
            await this.submitForm();
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStepDisplay();
            this.updateNextButton();
        }
    }

    collectFormData() {
        this.formData = {
            game: this.selectedGame,
            timestamp: new Date().toISOString()
        };

        if (this.selectedGame === 'tekken7') {
            const playerName = document.getElementById('playerName').value.trim();
            const playerEmail = document.getElementById('playerEmail').value.trim();
            this.formData.playerName = playerName;
            this.formData.email = playerEmail;
        } else if (this.selectedGame === 'bgmi') {
            const teamName = document.getElementById('teamName').value.trim();
            const captainName = document.getElementById('captainName').value.trim();
            const captainEmail = document.getElementById('captainEmail').value.trim();
            const captainUID = document.getElementById('captainUID').value.trim();
            
            this.formData.teamName = teamName;
            this.formData.captainName = captainName;
            this.formData.captainEmail = captainEmail;
            this.formData.captainUID = captainUID;
            
            this.formData.members = [
                {
                    name: document.getElementById('member1Name').value.trim(),
                    email: document.getElementById('member1Email').value.trim(),
                    uid: document.getElementById('member1UID').value.trim()
                },
                {
                    name: document.getElementById('member2Name').value.trim(),
                    email: document.getElementById('member2Email').value.trim(),
                    uid: document.getElementById('member2UID').value.trim()
                },
                {
                    name: document.getElementById('member3Name').value.trim(),
                    email: document.getElementById('member3Email').value.trim(),
                    uid: document.getElementById('member3UID').value.trim()
                }
            ];
        }
    }

    populateConfirmation() {
        const confirmationContent = document.getElementById('confirmation-content');
        if (!confirmationContent) return;

        let html = '<h4>Please review your registration details:</h4>';

        if (this.selectedGame === 'tekken7') {
            html += `
                <div class="confirmation-item">
                    <span class="confirmation-label">Game:</span>
                    <span class="confirmation-value">Tekken 7</span>
                </div>
                <div class="confirmation-item">
                    <span class="confirmation-label">Player Name:</span>
                    <span class="confirmation-value">${this.formData.playerName}</span>
                </div>
                <div class="confirmation-item">
                    <span class="confirmation-label">Email:</span>
                    <span class="confirmation-value">${this.formData.email}</span>
                </div>
            `;
        } else if (this.selectedGame === 'bgmi') {
            html += `
                <div class="confirmation-item">
                    <span class="confirmation-label">Game:</span>
                    <span class="confirmation-value">BGMI Arena</span>
                </div>
                <div class="confirmation-item">
                    <span class="confirmation-label">Team Name:</span>
                    <span class="confirmation-value">${this.formData.teamName}</span>
                </div>
                <div class="confirmation-item">
                    <span class="confirmation-label">Captain:</span>
                    <span class="confirmation-value">${this.formData.captainName} (${this.formData.captainEmail})</span>
                </div>
                <div class="confirmation-item">
                    <span class="confirmation-label">Captain UID:</span>
                    <span class="confirmation-value">${this.formData.captainUID}</span>
                </div>
            `;
            
            this.formData.members.forEach((member, index) => {
                html += `
                    <div class="confirmation-item">
                        <span class="confirmation-label">Member ${index + 1}:</span>
                        <span class="confirmation-value">${member.name} (${member.email}) - UID: ${member.uid}</span>
                    </div>
                `;
            });
        }

        confirmationContent.innerHTML = html;
    }

    updateStepDisplay() {
        // Hide all steps
        const steps = this.form.querySelectorAll('.form-step');
        steps.forEach(step => step.classList.remove('active'));
        
        // Show current step
        const currentStepElement = this.form.querySelector(`[data-step="${this.currentStep}"]`);
        if (currentStepElement) {
            currentStepElement.classList.add('active');
        }

        // Update step indicator if exists
        const stepIndicator = document.querySelector('.step-indicator');
        if (stepIndicator) {
            stepIndicator.textContent = `Step ${this.currentStep} of ${this.totalSteps}`;
        }
    }

    async submitForm() {
        if (this.isSubmitting) return;
        
        // Ensure we're on the final step (step 2)
        if (this.currentStep !== 2) {
            console.error('Form submission attempted on wrong step');
            return;
        }
        
        this.isSubmitting = true;
        const submitBtn = this.form.querySelector('.submit-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span>Submitting...</span>';
        submitBtn.disabled = true;

        try {
            if (!window.firebase || !window.firebase.db) {
                throw new Error('Firebase not initialized');
            }

            // Ensure form data is collected before submission
            this.collectFormData();

            const { collection, addDoc, serverTimestamp } = window.firebase;

            // Prepare data for Firebase
            const firebaseData = {
                ...this.formData,
                timestamp: serverTimestamp()
            };

            let collectionName;
            if (this.selectedGame === 'tekken7') {
                collectionName = 'tekken_players';
            } else if (this.selectedGame === 'bgmi') {
                collectionName = 'bgmi_teams';
            }

            // Submit to Firebase
            await addDoc(collection(window.firebase.db, collectionName), firebaseData);

            // Show success message
            this.showSuccessMessage();

        } catch (error) {
            console.error('Registration error:', error);
            alert('Registration failed. Please try again.');
        } finally {
            this.isSubmitting = false;
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    }

    showSuccessMessage() {
        const form = document.getElementById('registration-form');
        const successMessage = document.getElementById('success-message');
        
        if (form && successMessage) {
            form.style.display = 'none';
            successMessage.style.display = 'block';
        }
    }

    resetForm() {
        this.currentStep = 1;
        this.formData = {};
        this.selectedGame = null;
        
        // Reset form fields
        this.form.reset();
        
        // Hide all field groups
        document.getElementById('tekken-fields').style.display = 'none';
        document.getElementById('bgmi-fields').style.display = 'none';
        
        // Show form and hide success message
        const form = document.getElementById('registration-form');
        const successMessage = document.getElementById('success-message');
        
        if (form && successMessage) {
            form.style.display = 'block';
            successMessage.style.display = 'none';
        }
        
        this.updateStepDisplay();
        this.updateNextButton();
    }
}

// Initialize registration form when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.registrationForm = new RegistrationForm();
});

// Global function for reset button
function resetForm() {
    if (window.registrationForm) {
        window.registrationForm.resetForm();
    }
}