const hamburgerIcon = document.querySelector('#hamburger-menu');
const navMenu = document.querySelector('.nav-menu');

hamburgerIcon.addEventListener('click', () => {
                
        hamburgerIcon.classList.toggle('open');
        navMenu.classList.toggle('active');        
    });

// Close menu when clicking a link on mobile
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        if (window.innerWidth <= 600) {
            hamburgerIcon.classList.remove('open');
            navMenu.classList.remove('active');
            }
        });
    });