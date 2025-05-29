import { fetchAmmunitionData } from './fetch-data.js';
import { setupModal } from './modal.js';

document.addEventListener('DOMContentLoaded', () => {
  // Navigation Toggle for Mobile
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('nav ul');
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
  });

  // Fetch and Display Ammunition Data
  fetchAmmunitionData().then(data => {
    const tbody = document.querySelector('#ammoTable tbody');
    data.forEach(item => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${item.name}</td>
        <td>${item.muzzleVelocity}</td>
        <td>${item.ballisticCoefficient}</td>
        <td>${item.bulletWeight}</td>
      `;
      tbody.appendChild(row);
    });
  });

  // Function to Display Calculator Results
  const displayResults = (results) => {
    const tbody = document.querySelector('#calcResultsTable tbody');
    tbody.innerHTML = ''; // Clear previous results
    results.forEach(result => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${result.distance}</td>
        <td>${result.velocity}</td>
        <td>${result.energy}</td>
        <td>${result.drop}</td>
        <td>${result.windDrift}</td>
      `;
      tbody.appendChild(row);
    });
  };

  // Setup Modal for Calculator with Callback
  setupModal(displayResults);

  // Display Last Calculation Results (if any)
  const savedResults = localStorage.getItem('calculationResults');
  if (savedResults) {
    displayResults(JSON.parse(savedResults));
  }

  // Local Storage for Preferences (e.g., last selected ammo)
  const savedAmmo = localStorage.getItem('selectedAmmo');
  if (savedAmmo) {
    console.log('Last selected ammo:', savedAmmo);
  }
});