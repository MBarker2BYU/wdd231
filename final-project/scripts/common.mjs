import { loadMenu } from './menu.mjs';
import { setupAttributionsModal } from './attributions.mjs';

/**
 * Common functionality for all pages
 */
document.addEventListener('DOMContentLoaded', async () => 
{
    applyTheme();
    updateFooter();
    setupHamburgerMenu();
    setupThemeToggle();
    await loadMenu();

    await setupAttributionsModal();

    // Page-specific initialization
    const page = window.location.pathname.split('/').pop().replace(/\.[^/.]+$/, '') || 'index';
    switch (page.toLowerCase()) {
        case 'index':
            const { initializeCalculator } = await import('./ballistics-pro.mjs');
            initializeCalculator();
            break;               break;
        case 'contact':
            const { setupContactForm } = await import('./contact.mjs');
            setupContactForm();
            break;
    }
});

/**
 * Apply saved theme
 */
function applyTheme() {
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);

    // Sync toggle UI
    const toggle = document.querySelector('.toggle-container');
    const toggleText = document.querySelector('.toggle-text');
    if (toggle && toggleText) {
        toggleText.textContent = theme === 'light' ? 'Light' : 'Dark';
        toggle.classList.toggle('on', theme === 'dark');
    }
}

/**
 * Update footer with current year and last modified date
 */
function updateFooter() {
    const today = new Date();
    const currentYear = document.getElementById('currentyear');
    const lastModified = document.getElementById('lastmodified');
    if (currentYear) currentYear.textContent = `©${today.getFullYear()}`;
    if (lastModified) lastModified.textContent = document.lastModified;
}

/**
 * Set up hamburger menu toggle
 */
function setupHamburgerMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('nav ul');
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
}

/**
 * Set up theme toggle
 */
function setupThemeToggle() {
    const toggle = document.querySelector('.toggle-container');
    const toggleText = document.querySelector('.toggle-text');
    if (!toggle || !toggleText) return;

    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
    toggleText.textContent = theme === 'light' ? 'Light' : 'Dark';
    if (theme === 'dark') toggle.classList.add('on');

    toggle.addEventListener('click', async () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        toggle.classList.toggle('on');
        toggleText.textContent = newTheme === 'light' ? 'Light' : 'Dark';
        localStorage.setItem('theme', newTheme);

        if (window.location.pathname.includes('index')) {
            const { refresh } = await import('./ballistics-pro.mjs');
            refresh();
        }
    });
}