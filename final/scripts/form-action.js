document.addEventListener('DOMContentLoaded', () => {
  // Debug: Check if localStorage has the data
  console.log('localStorage contactFormData:', localStorage.getItem('contactFormData'));

  // Retrieve form data from localStorage
  const formData = JSON.parse(localStorage.getItem('contactFormData')) || {};

  // Debug: Log the parsed data
  console.log('Parsed formData:', formData);

  // Display the submitted data, with fallback if not provided
  document.getElementById('submittedName').textContent = formData.name || 'Not provided';
  document.getElementById('submittedEmail').textContent = formData.email || 'Not provided';
  document.getElementById('submittedMessage').textContent = formData.message || 'Not provided';

  // Clear the form data from localStorage after displaying
  localStorage.removeItem('contactFormData');
});