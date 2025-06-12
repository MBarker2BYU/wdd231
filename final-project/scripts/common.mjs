// Uses ES Modules for code organization and modularity
import { saveDataToLocalStorage, getDataFromLocalStorage } from './utilities.mjs';
import { loadMenu } from './menu.mjs';
import { setupAttributionsModal } from './attributions.mjs';

/**
 * Common functionality for all pages
 */
document.addEventListener('DOMContentLoaded', async () => 
{
    try {
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
                break; break;
            case 'contact':
                const { setupContactForm } = await import('./contact.mjs');
                setupContactForm();
                break;
        }
    }
    catch (error) {
        console.error('Error during page initialization:', error);
        alert('An error occurred while loading the page. Please try again later.');
    }
});

/**
 * Apply saved theme
 */
function applyTheme() 
{
    try {
        const theme = getDataFromLocalStorage('theme') || 'light';
        document.documentElement.setAttribute('data-theme', theme);

        // Sync toggle UI
        const toggle = document.querySelector('.toggle-container');
        const toggleText = document.querySelector('.toggle-text');
        if (toggle && toggleText) {
            toggleText.textContent = theme === 'light' ? 'Light' : 'Dark';
            toggle.classList.toggle('on', theme === 'dark');
        }
    }
    catch (error) {
        console.error('Error applying theme:', error);
        alert('An error occurred while applying the theme. Please try again later.');
    }
}

/**
 * Update footer with current year and last modified date
 */
function updateFooter() 
{
    try 
    {
        const today = new Date();
        const currentYear = document.getElementById('currentyear');
        const lastModified = document.getElementById('lastmodified');
    
        if (currentYear) currentYear.textContent = `©${today.getFullYear()}`;
        if (lastModified) lastModified.textContent = document.lastModified;
    }
    catch (error) {
        console.error('Error updating footer:', error);
        alert('An error occurred while updating the footer. Please try again later.');
    }
}

/**
 * Set up hamburger menu toggle
 */
function setupHamburgerMenu() 
{
    try 
    {
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('nav ul');
        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                navMenu.classList.toggle('active');
            });
        }
    }
    catch (error) {
        console.error('Error setting up hamburger menu:', error);
        alert('An error occurred while setting up the menu. Please try again later.');
    }
}

/**
 * Set up theme toggle
 */
function setupThemeToggle() 
{
    try 
    {
        const toggle = document.querySelector('.toggle-container');
        const toggleText = document.querySelector('.toggle-text');
    
        if (!toggle || !toggleText) return;

        const theme = getDataFromLocalStorage('theme') || 'light';
    
        document.documentElement.setAttribute('data-theme', theme);
        toggleText.textContent = theme === 'light' ? 'Light' : 'Dark';
    
        if (theme === 'dark') toggle.classList.add('on');

        toggle.addEventListener('click', async () => 
            {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            document.documentElement.setAttribute('data-theme', newTheme);
            toggle.classList.toggle('on');
            toggleText.textContent = newTheme === 'light' ? 'Light' : 'Dark';
            
            saveDataToLocalStorage('theme', newTheme);

            if (window.location.pathname.includes('index')) {
                const { refresh } = await import('./ballistics-pro.mjs');
                refresh();
            }
        });
    }
    catch (error) {
        console.error('Error setting up theme toggle:', error);
        alert('An error occurred while setting up the theme toggle. Please try again later.');
    }
}