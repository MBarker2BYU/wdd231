const today = new Date();
const currentyear = document.getElementById("currentyear");
const lastmodified = document.getElementById("lastmodified");

currentyear.textContent = "\u00A9" + today.getFullYear();
lastmodified.textContent = document.lastModified;

async function getMenuData() {
    const response = await fetch('./data/menu.json');
    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('Menu file (menu.json) not found');
        }
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    if (!data.menu || !Array.isArray(data.menu)) {
        throw new Error('Invalid menu data format: "menu" property missing or not an array');
    }
    
    return data.menu;
}

function buildMenu(menuItems, navLinks) 
{
    navLinks.textContent = '';

    const pageName = window.location.pathname
        .split('/')
        .pop()
        .replace(/\.[^/.]+$/, '') || 'index';

    for (const item of menuItems) {
        if (!item.name || !item.url) {
            console.warn('Skipping invalid menu item:', item);
            continue;
        }

        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = item.url;
        a.textContent = item.name;

        const itemPage = item.url.replace(/\.[^/.]+$/, '');
        if (itemPage.toLowerCase() === pageName.toLowerCase()) {
            a.classList.add('active');
            a.setAttribute('aria-current', 'page');
        }

        li.appendChild(a);
        navLinks.appendChild(li);
    }

    if (navLinks.children.length === 0) {
        throw new Error('No valid menu items found in menu.json');
    }
}

async function loadMenu() {
    const navLinks = document.querySelector('.nav-links');
    if (!navLinks) {
        console.error('Navigation container (.nav-links) not found in the DOM');
        return;
    }

    navLinks.textContent = 'Loading menu...';

    try {
        const menuItems = await getMenuData();
        buildMenu(menuItems, navLinks);
    } catch (error) {
        console.error('Error loading menu:', error.message);
        navLinks.textContent = '';
        const errorMessage = document.createElement('li');
        errorMessage.className = 'error-message';
        errorMessage.textContent = `Failed to load menu: ${error.message}. Please check the server or menu.json file.`;
        navLinks.appendChild(errorMessage);
    }
}

loadMenu();


// Hamburger menu toggle
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

// Theme toggle
const themeToggle = document.querySelector('.theme-toggle');
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('light-mode');
    document.body.classList.toggle('dark-mode');
    
    const body = document.body;
    const newTheme = !body.classList.contains('light-mode') ? 'dark-mode' : 'light-mode';
    // body.classList.replace(body.classList.contains('light-mode') ? 'light-mode' : 'dark-mode', newTheme);
    localStorage.setItem('theme', newTheme);
});

// Load saved theme from localStorage
function loadTheme() 
{
    const theme = localStorage.getItem('theme');
    if (theme) 
    {
        document.body.classList.remove('light-mode', 'dark-mode');
        document.body.classList.add(theme);
    }
}

loadTheme();