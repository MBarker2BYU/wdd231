document.getElementById('lastModified').textContent = document.lastModified;

const urlParams = new URLSearchParams(window.location.search);

document.getElementById('firstName').textContent = urlParams.get('firstName') || 'Not provided';
document.getElementById('lastName').textContent = urlParams.get('lastName') || 'Not provided';
document.getElementById('email').textContent = urlParams.get('email') || 'Not provided';
document.getElementById('phone').textContent = urlParams.get('phone') || 'Not provided';
document.getElementById('orgName').textContent = urlParams.get('orgName') || 'Not provided';
document.getElementById('timestamp').textContent = urlParams.get('timestamp') || 'Not provided';