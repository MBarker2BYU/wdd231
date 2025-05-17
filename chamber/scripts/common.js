const today = new Date();
const currentyear = document.getElementById("currentyear");
const lastmodified = document.getElementById("lastmodified");

currentyear.textContent = "\u00A9" + today.getFullYear();
lastmodified.textContent = document.lastModified;

// Load menu from JSON with enhanced error handling
fetch('./data/menu.json')
    .then(response => {
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('Menu file (menu.json) not found');
            }
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        const navLinks = document.querySelector('.nav-links');
        if (!data.menu || !Array.isArray(data.menu)) 
            {
                throw new Error('Invalid menu data format: "menu" property missing or not an array');
            }
            
        data.menu.forEach(item => {
            if (!item.name || !item.url) 
                {
                    console.warn('Skipping invalid menu item:', item);
                    return;
                }

            const li = document.createElement('li');
            const a = document.createElement('a');

            a.href = item.url;
            a.textContent = item.name;
            li.appendChild(a);
            navLinks.appendChild(li);
        });
        if (navLinks.children.length === 0) 
            {
                throw new Error('No valid menu items found in menu.json');
            }
    })
    .catch(error => {
        console.error('Error loading menu:', error.message);
        const navLinks = document.querySelector('.nav-links');
        const errorMessage = document.createElement('li');
        errorMessage.className = 'error-message';
        errorMessage.textContent = `Failed to load menu: ${error.message}. Please check the server or menu.json file.`;
        navLinks.appendChild(errorMessage);
    });

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
    themeToggle.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
});