export function setupModal() {
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
    const data = {
      muzzleVelocity: formData.get('muzzleVelocity'),
      ballisticCoefficient: formData.get('ballisticCoefficient'),
      bulletWeight: formData.get('bulletWeight'),
      windSpeed: formData.get('windSpeed')
    };
    localStorage.setItem('lastCalculation', JSON.stringify(data));
    console.log('Calculation submitted:', data);
    modal.close();
  });
}