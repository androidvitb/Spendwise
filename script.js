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

// Update anchor links to use absolute paths
document.querySelectorAll('a').forEach(anchor => {
    if (anchor.href.startsWith('/')) {
        anchor.href = window.location.origin + anchor.href;
    }
});

// Add path handling utilities
const fixPath = (path) => {
    if (path.startsWith('/')) {
        return `.${path}`;
    }
    return path;
};

// Replace the DOMContentLoaded event handler with improved asset handling
document.addEventListener('DOMContentLoaded', () => {
    // Fix all image sources
    document.querySelectorAll('img').forEach(img => {
        if (img.src) {
            const originalSrc = img.getAttribute('src');
            img.src = fixPath(originalSrc);
        }
    });

    // Fix all link hrefs
    document.querySelectorAll('a').forEach(anchor => {
        if (anchor.href && !anchor.href.startsWith('#') && !anchor.href.startsWith('http')) {
            const originalHref = anchor.getAttribute('href');
            anchor.href = fixPath(originalHref);
        }
    });

    // Fix all stylesheet links
    document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
        if (link.href) {
            const originalHref = link.getAttribute('href');
            link.href = fixPath(originalHref);
        }
    });
});

// Update the existing error handling
window.addEventListener('error', function(e) {
    if (e.target.tagName === 'IMG') {
        console.error('Image failed to load:', e.target.src);
        // Try loading with adjusted path
        const newSrc = fixPath(e.target.getAttribute('src'));
        if (newSrc !== e.target.src) {
            e.target.src = newSrc;
        }
    }
}, true);

// Update path handling for assets and links
document.addEventListener('DOMContentLoaded', () => {
    // Fix resource loading
    document.querySelectorAll('img, script, link').forEach(element => {
        if (element.src && element.src.startsWith('/')) {
            element.src = '.' + element.src;
        }
        if (element.href && element.href.startsWith('/')) {
            element.href = '.' + element.href;
        }
    });

    // Enhanced error handling
    document.addEventListener('error', function(e) {
        if (e.target.tagName === 'IMG' || e.target.tagName === 'SCRIPT') {
            console.error('Resource failed to load:', e.target.src);
            if (e.target.dataset.fallback) {
                e.target.src = e.target.dataset.fallback;
            }
        }
    }, true);
});
