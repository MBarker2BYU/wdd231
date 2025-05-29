import { calculateTrajectory } from './ballistics.js';

export function setupModal(displayResultsCallback) {
  const calculateBtn = document.getElementById('calculateBtn');
  const modal = document.getElementById('calcModal');
  const closeBtn = document.getElementById('closeModalBtn');
  const form = document.getElementById('calcForm');

  calculateBtn.addEventListener('click', () => {
    modal.showModal();
  });

  closeBtn.addEventListener('click', () => {
    modal.close();
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const inputs = {
      muzzleVelocity: parseFloat(formData.get('muzzleVelocity')),
      ballisticCoefficient: parseFloat(formData.get('ballisticCoefficient')),
      bulletWeight: parseFloat(formData.get('bulletWeight')),
      windSpeed: parseFloat(formData.get('windSpeed'))
    };

    // Validate inputs
    if (isNaN(inputs.muzzleVelocity) || isNaN(inputs.ballisticCoefficient) ||
        isNaN(inputs.bulletWeight) || isNaN(inputs.windSpeed)) {
      alert('Please enter valid numbers for all fields.');
      return;
    }

    // Calculate trajectory
    const results = calculateTrajectory(inputs);

    // Store the last calculation in localStorage
    localStorage.setItem('lastCalculation', JSON.stringify(inputs));
    localStorage.setItem('calculationResults', JSON.stringify(results));

    // Call the callback to display results
    if (displayResultsCallback) {
      displayResultsCallback(results);
    }

    modal.close();
  });
}