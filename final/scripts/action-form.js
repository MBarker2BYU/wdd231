// Parse query parameters from the URL
const urlParams = new URLSearchParams(window.location.search);

// Display the submitted data, with fallback if not provided
document.getElementById('submittedName').textContent = urlParams.get('name') || 'Not provided';
document.getElementById('submittedEmail').textContent = urlParams.get('email') || 'Not provided';
document.getElementById('submittedMessage').textContent = urlParams.get('message') || 'Not provided';