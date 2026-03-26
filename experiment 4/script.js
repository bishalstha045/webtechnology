// ===============================================
// SMOOTH SCROLLING FOR NAVIGATION LINKS
// ===============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===============================================
// FORM VALIDATION & SUBMISSION
// ===============================================
const form = document.querySelector('form');

form.addEventListener('submit', function (e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();
    
    // Validation
    if (name === '') {
        alert('Please enter your full name.');
        return;
    }
    
    if (email === '') {
        alert('Please enter your email address.');
        return;
    }
    
    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        return;
    }
    
    if (message === '') {
        alert('Please enter your message.');
        return;
    }
    
    // Show success message
    alert('Thank you for your message! I will get back to you soon.');
    
    // Reset form
    form.reset();
});

// ===============================================
// BACK TO TOP BUTTON
// ===============================================
window.addEventListener('scroll', function () {
    const backToTopLink = document.querySelector('a[href="#top"]');
    
    if (window.scrollY > 300) {
        backToTopLink.style.display = 'inline';
        backToTopLink.style.opacity = '1';
    } else {
        backToTopLink.style.opacity = '0';
        backToTopLink.style.display = 'none';
    }
});

// ===============================================
// ADD ACTIVE CLASS TO NAVIGATION LINKS
// ===============================================
window.addEventListener('scroll', function () {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('nav a');
    
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (scrollY >= sectionTop - 200) {
            currentSection = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + currentSection) {
            link.classList.add('active');
        }
    });
});

// ===============================================
// PAGE LOAD EFFECTS
// ===============================================
window.addEventListener('load', function () {
    // Fade in sections on load
    const sections = document.querySelectorAll('section');
    
    sections.forEach((section, index) => {
        section.style.opacity = '0';
        section.style.animation = `fadeIn 0.6s ease-in-out ${index * 0.1}s forwards`;
    });
});

// ===============================================
// HIGHLIGHT SECTIONS ON SCROLL (INTERSECTION OBSERVER)
// ===============================================
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function (entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
        }
    });
}, observerOptions);

document.querySelectorAll('section').forEach(section => {
    observer.observe(section);
});

// ===============================================
// KEYBOARD NAVIGATION
// ===============================================
document.addEventListener('keydown', function (e) {
    // Ctrl + Shift + C to jump to contact form
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        const contactSection = document.querySelector('#contact');
        contactSection.scrollIntoView({ behavior: 'smooth' });
    }
});
