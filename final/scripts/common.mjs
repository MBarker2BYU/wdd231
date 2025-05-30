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
    const htmlElement = document.documentElement;
    const savedTheme = localStorage.getItem('theme') || 'light';

    // Set initial theme and toggle state
    htmlElement.setAttribute('data-theme', savedTheme);
    
    if (savedTheme === 'dark') {
        modeToggle.classList.add('on');
    }

    // Add event listener for toggle
    modeToggle.addEventListener('click', function () 
    {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        // Update theme, toggle state, and label
        htmlElement.setAttribute('data-theme', newTheme);
        this.classList.toggle('on');
    
        localStorage.setItem('theme', newTheme);
    });
}