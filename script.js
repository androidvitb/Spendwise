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
const lightIcon = document.getElementById('theme-toggle-light-icon');
const darkIcon = document.getElementById('theme-toggle-dark-icon');

// Check for saved theme preference
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
updateThemeIcons(savedTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcons(newTheme);
});

function updateThemeIcons(theme) {
    if (theme === 'dark') {
        lightIcon.classList.add('hidden');
        darkIcon.classList.remove('hidden');
    } else {
        lightIcon.classList.remove('hidden');
        darkIcon.classList.add('hidden');
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
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            // Close mobile menu if open
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
}
