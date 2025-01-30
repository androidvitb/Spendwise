// Add base URL configuration
const BASE_URL = window.location.origin;

// Mobile menu toggle
const mobileMenuButton = document.getElementById('mobile-menu-button');
const mobileMenu = document.getElementById('mobile-menu');

mobileMenuButton.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
});

// FAQ accordion
const faqButtons = document.querySelectorAll('.faq-button');

faqButtons.forEach(button => {
    button.addEventListener('click', () => {
        const answer = button.nextElementSibling;
        const icon = button.querySelector('i');
        
        answer.classList.toggle('hidden');
        icon.classList.toggle('rotate-180');
        
        // Close other open FAQs
        faqButtons.forEach(otherButton => {
            if (otherButton !== button) {
                const otherAnswer = otherButton.nextElementSibling;
                const otherIcon = otherButton.querySelector('i');
                
                otherAnswer.classList.add('hidden');
                otherIcon.classList.remove('rotate-180');
            }
        });
    });
});

// Theme toggler
const themeToggle = document.getElementById('theme-toggle');
const mobileThemeToggle = document.getElementById('mobile-theme-toggle');
const lightIcon = document.getElementById('theme-toggle-light-icon');
const darkIcon = document.getElementById('theme-toggle-dark-icon');
const mobileLightIcon = document.getElementById('mobile-theme-toggle-light-icon');
const mobileDarkIcon = document.getElementById('mobile-theme-toggle-dark-icon');

// Check for saved theme preference
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
updateThemeIcons(savedTheme);

// Desktop theme toggle
themeToggle?.addEventListener('click', toggleTheme);
// Mobile theme toggle
mobileThemeToggle?.addEventListener('click', toggleTheme);

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcons(newTheme);
}

function updateThemeIcons(theme) {
    // Update desktop icons
    if (lightIcon && darkIcon) {
        if (theme === 'dark') {
            lightIcon.classList.add('hidden');
            darkIcon.classList.remove('hidden');
        } else {
            lightIcon.classList.remove('hidden');
            darkIcon.classList.add('hidden');
        }
    }

    // Update mobile icons
    if (mobileLightIcon && mobileDarkIcon) {
        if (theme === 'dark') {
            mobileLightIcon.classList.add('hidden');
            mobileDarkIcon.classList.remove('hidden');
        } else {
            mobileLightIcon.classList.remove('hidden');
            mobileDarkIcon.classList.add('hidden');
        }
    }
}

// Enhanced FAQ functionality with smooth animations
document.querySelectorAll('.faq-button').forEach(button => {
    button.addEventListener('click', () => {
        const answer = button.nextElementSibling;
        const icon = button.querySelector('i');
        
        // Close all other FAQs
        document.querySelectorAll('.faq-answer').forEach(item => {
            if (item !== answer) {
                item.classList.remove('show');
                item.previousElementSibling.querySelector('i').classList.remove('rotate-180');
            }
        });
        
        // Toggle current FAQ
        answer.classList.toggle('show');
        icon.classList.toggle('rotate-180');
    });
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').slice(1);
        const target = document.getElementById(targetId);
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            mobileMenu.classList.add('hidden');
        }
    });
});

// Contact form handling
const contactForm = document.querySelector('#contact form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Add form submission logic here
        alert('Thank you for your message! We will get back to you soon.');
        contactForm.reset();
    });
};

// Enhanced error handling for resources
document.addEventListener('error', function(e) {
    if (e.target.tagName === 'IMG' || e.target.tagName === 'SCRIPT') {
        console.error('Resource failed to load:', e.target.src);
        // Optionally retry loading or show fallback
    }
}, true);
