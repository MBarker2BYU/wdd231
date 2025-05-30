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
    const modeToggle = document.getElementById('modeToggle');
    const htmlElement = document.documentElement;
    const savedTheme = localStorage.getItem('theme') || 'light';

    htmlElement.setAttribute('data-theme', savedTheme);
    modeToggle.textContent = savedTheme === 'light' ? 'Dark Mode' : 'Light Mode';

    modeToggle.addEventListener('click', () => 
    {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        
        htmlElement.setAttribute('data-theme', newTheme);

        localStorage.setItem('theme', newTheme);
        modeToggle.textContent = newTheme === 'light' ? 'Dark Mode' : 'Light Mode';
    });
}