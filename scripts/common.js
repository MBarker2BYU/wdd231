const today = new Date();
const currentyear = document.getElementById("currentyear");
const lastmodified = document.getElementById("lastmodified");

currentyear.textContent = "\u00A9" + today.getFullYear();
lastmodified.textContent = document.lastModified;

function toggleMenu() 
{
    const mobileMenu = document.getElementById('mobileMenu');
    

    mobileMenu.classList.toggle('active');
}