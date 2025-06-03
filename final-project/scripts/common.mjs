import { loadMenu } from './menu.mjs';

document.addEventListener('DOMContentLoaded', () => 
{
    updateFooter();
    loadMenu();
    setupHambergerMenu();
    setupThemeToggle();
});

function updateFooter()
{
    const today = new Date();
    const currentyear = document.getElementById("currentyear");
    const lastmodified = document.getElementById("lastmodified");

    currentyear.textContent = "\u00A9" + today.getFullYear();
    lastmodified.textContent = document.lastModified;
}

function setupHambergerMenu()
{
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('nav ul');

    hamburger.addEventListener('click', () => 
    {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
}

function setupThemeToggle() 
{
    const modeToggle = document.querySelector('.toggle-container');
    const toggleText = document.querySelector('.toggle-text');
    const htmlElement = document.documentElement;
    const savedTheme = localStorage.getItem('theme') || 'light';

    // Set initial theme, toggle state, and text
    htmlElement.setAttribute('data-theme', savedTheme);
    // toggleLabel.textContent = savedTheme === 'light' ? 'Dark Mode' : 'Light Mode';
    toggleText.textContent = savedTheme === 'light' ? 'Light' : 'Dark';
    if (savedTheme === 'dark') {
        modeToggle.classList.add('on');
    }

    // Add event listener for toggle
    modeToggle.addEventListener('click', function () {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        // Update theme, toggle state, label, and text
        htmlElement.setAttribute('data-theme', newTheme);
        this.classList.toggle('on');
        // toggleLabel.textContent = newTheme === 'light' ? 'Dark Mode' : 'Light Mode';
        toggleText.textContent = newTheme === 'light' ? 'Light' : 'Dark';
        localStorage.setItem('theme', newTheme);

        if(window.location.pathname.includes('index.html'))
        {
            import('./ballistics-pro.mjs').then((module) =>
            {
               module.refresh(); 
            });
        }           

    });
}