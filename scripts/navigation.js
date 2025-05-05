const hamburgerIcon = document.getElementById('hamburger-icon');
const mobileMenu = document.getElementById('mobile-menu');
const header = document.querySelector('header');

hamburgerIcon.addEventListener('click', ()=> 
    {
        hamburgerIcon.classList.toggle('open');
    });