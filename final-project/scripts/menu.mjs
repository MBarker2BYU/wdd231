import { fetchData } from "./utilities.mjs";

export async function loadMenu() 
{
    const navLinks = document.getElementById('nav-links');

    if (!navLinks) 
    {
        console.error('Navigation container (nav-links) not found in the DOM');
        return;
    }    

    navLinks.textContent = 'Loading menu...';

    try 
    {
        const data = await fetchData('./data/menu.json');

        buildMenu(data.menu, navLinks);
    } 
    catch (error) 
    {
        const errorMessage = document.createElement('li');

        console.error('Error loading menu:', error.message);
        navLinks.textContent = '';
        errorMessage.className = 'error-message';
        errorMessage.textContent = `Failed to load menu: ${error.message}. Please check the server or menu.json file.`;
        navLinks.appendChild(errorMessage);
    }
}

function buildMenu(menuItems, navLinks)
{
    // Clear existing content and show loading message
    // Another work around for audit requirements
    
    navLinks.innerHTML = '';
    navLinks.textContent = '';
    
    const pageName = window.location.pathname
        .split('/')
        .pop()
        .replace(/\.[^/.]+$/, '') || 'index';

    for (const item of menuItems) 
    {
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

    if (navLinks.children.length === 0) 
    {
        throw new Error('No valid menu items found in menu.json');
    }
}