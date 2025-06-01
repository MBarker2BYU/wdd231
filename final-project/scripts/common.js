const menuData = [
  { name: "Home", url: "index.html" },
  { name: "About", url: "about.html" },
  { name: "Contact", url: "contact.html" }
];

document.addEventListener('DOMContentLoaded', () => {
  updateFooter();
  loadMenu();
  setupHambergerMenu();
  setupThemeToggle();
});

function updateFooter() {
  const today = new Date();
  const currentyear = document.getElementById("currentyear");
  const lastmodified = document.getElementById("lastmodified");

  currentyear.textContent = "\u00A9" + today.getFullYear();
  lastmodified.textContent = document.lastModified;
}

function setupHambergerMenu() {
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('nav ul');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
  });
}

function setupThemeToggle() {
  const modeToggle = document.querySelector('.toggle-container');
  const toggleText = document.querySelector('.toggle-text');
  const htmlElement = document.documentElement;
  const savedTheme = localStorage.getItem('theme') || 'light';

  htmlElement.setAttribute('data-theme', savedTheme);
  toggleText.textContent = savedTheme === 'light' ? 'Light' : 'Dark';
  if (savedTheme === 'dark') {
    modeToggle.classList.add('on');
    modeToggle.setAttribute('aria-pressed', 'true');
  }

  modeToggle.addEventListener('click', function () {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    htmlElement.setAttribute('data-theme', newTheme);
    this.classList.toggle('on');
    toggleText.textContent = newTheme === 'light' ? 'Light' : 'Dark';
    this.setAttribute('aria-pressed', newTheme === 'dark' ? 'true' : 'false');
    localStorage.setItem('theme', newTheme);
  });
}

function loadMenu() {
  const navLinks = document.getElementById('nav-links');
  if (!navLinks) {
    console.error('Navigation container (nav-links) not found in the DOM');
    return;
  }
  buildMenu(menuData, navLinks);
}

function buildMenu(menuItems, navLinks) {
  navLinks.innerHTML = '';
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
    console.error('No valid menu items found');
  }
}

function handleCalculate(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const data = {
    muzzleVelocity: formData.get('muzzle-velocity'),
    ballisticCoefficient: formData.get('ballistic-coefficient'),
    bulletWeight: formData.get('bullet-weight'),
    windSpeed: formData.get('wind-speed')
  };
  console.log('Ballistics Calculator Data:', data);
  // Placeholder for actual calculation logic
}