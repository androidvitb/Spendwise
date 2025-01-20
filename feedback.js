// Move Firebase config to script.js since it needs to handle env variables
let db;

// Wait for Firebase SDK to be ready
window.addEventListener('load', function() {
    // Get db instance from script.js
    db = window.firestoreDB;

    // Initialize star ratings with tooltips
    document.querySelectorAll('.star-rating').forEach(container => {
        const ratingTexts = {
            1: 'Poor',
            2: 'Fair',
            3: 'Good',
            4: 'Very Good',
            5: 'Excellent'
        };
        
        for (let i = 1; i <= 5; i++) {
            const star = document.createElement('span');
            star.innerHTML = '★';
            star.className = 'star';
            star.dataset.value = i;
            star.dataset.ratingText = ratingTexts[i];
            container.appendChild(star);
        }

        // Add ripple effect on click
        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('star')) {
                const ripple = document.createElement('div');
                ripple.className = 'ripple';
                e.target.appendChild(ripple);
                setTimeout(() => ripple.remove(), 1000);
            }
        });
    });

    // Handle star rating clicks
    document.querySelectorAll('.star-rating').forEach(container => {
        const stars = container.querySelectorAll('.star');
        stars.forEach(star => {
            star.addEventListener('click', () => {
                const value = star.dataset.value;
                stars.forEach(s => {
                    s.classList.toggle('active', s.dataset.value <= value);
                });
                container.dataset.selectedRating = value;
            });
        });
    });

    // Handle issues radio buttons
    const issuesRadios = document.querySelectorAll('input[name="issues"]');
    const issuesBox = document.getElementById('issues-box');

    issuesRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.value === 'yes') {
                issuesBox.classList.remove('hidden');
                issuesBox.classList.add('show');
            } else {
                issuesBox.classList.add('hidden');
                issuesBox.classList.remove('show');
            }
        });
    });

    // Add validation function
    function isFormValid() {
        const satisfaction = document.querySelector('[data-rating="satisfaction"]').dataset.selectedRating;
        const ease = document.querySelector('[data-rating="ease"]').dataset.selectedRating;
        const features = document.querySelector('[data-rating="features"]').dataset.selectedRating;
        
        if (!satisfaction || !ease || !features) {
            return false;
        }
        return true;
    }

    // Add visual feedback for required fields
    function showRequiredError(container) {
        container.classList.add('required-error');
        const errorMsg = document.createElement('span');
        errorMsg.className = 'error-message';
        errorMsg.textContent = 'This rating is required';
        
        // Remove existing error message if any
        const existingError = container.querySelector('.error-message');
        if (existingError) existingError.remove();
        
        container.appendChild(errorMsg);
    }

    function removeRequiredError(container) {
        container.classList.remove('required-error');
        const errorMsg = container.querySelector('.error-message');
        if (errorMsg) errorMsg.remove();
    }

    // Handle form submission
    document.getElementById('feedback-form').addEventListener('submit', async (e) => {
        e.preventDefault();

        // Check required ratings
        const ratingGroups = ['satisfaction', 'ease', 'features'];
        let isValid = true;

        ratingGroups.forEach(rating => {
            const container = document.querySelector(`[data-rating="${rating}"]`).parentElement;
            if (!document.querySelector(`[data-rating="${rating}"]`).dataset.selectedRating) {
                showRequiredError(container);
                isValid = false;
            } else {
                removeRequiredError(container);
            }
        });

        if (!isValid) {
            alert('Please complete all required ratings before submitting.');
            return;
        }

        const feedback = {
            name: document.getElementById('name').value || 'Anonymous',
            email: document.getElementById('email').value || 'Not provided',
            satisfaction: document.querySelector('[data-rating="satisfaction"]').dataset.selectedRating || 0,
            ease: document.querySelector('[data-rating="ease"]').dataset.selectedRating || 0,
            features: document.querySelector('[data-rating="features"]').dataset.selectedRating || 0,
            hasIssues: document.querySelector('input[name="issues"]:checked')?.value || 'no',
            issues: document.getElementById('issues-detail').value || '',
            suggestions: document.getElementById('suggestions').value || '',
            timestamp: new Date()
        };

        try {
            await db.collection('feedback').add(feedback);
            alert('Thank you for your feedback!');
            e.target.reset();
            document.querySelectorAll('.star').forEach(star => star.classList.remove('active'));
            document.querySelectorAll('.error-message').forEach(msg => msg.remove());
            issuesBox.classList.add('hidden');
        } catch (error) {
            console.error('Error submitting feedback:', error);
            alert('There was an error submitting your feedback. Please try again.');
        }
    });
});
