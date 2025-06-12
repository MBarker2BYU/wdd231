import { fetchData } from './utilities.mjs';

/**
 * Load navigation menu for all pages
 */
export async function loadMenu() {
    const navLinks = document.getElementById('nav-links');
    if (!navLinks) {
        console.error('Navigation container not found');
        return;
    }

    // navLinks.textContent = 'Loading menu...';

    try 
    {
        const { menu } = await fetchData('./data/menu.json');
        if (!menu?.length) throw new Error('No menu items found');

        const pageName = (window.location.pathname.split('/').pop().replace(/\.[^/.]+$/, '') || 'index').toLowerCase();
        navLinks.innerHTML = menu
            .filter(item => item.name && item.url)
            .map(item => {
                const itemPage = item.url.replace(/\.[^/.]+$/, '').toLowerCase();
                const isActive = itemPage === pageName;
                return `
                    <li>
                        <a href="${item.url}" ${isActive ? 'class="active" aria-current="page"' : ''}>
                            ${item.name}
                        </a>
                    </li>
                `;
            }).join('');

        if (!navLinks.children.length) 
            throw new Error('No valid menu items');
    } 
    catch (error) 
    {
        console.error('Error loading menu:', error);
        navLinks.innerHTML = `<li class="error-message">Failed to load menu: ${error.message}</li>`;
    }
}