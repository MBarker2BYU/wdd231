const urlParams = new URLSearchParams(window.location.search);

const params = {
    firstName: urlParams.get('firstName'),
    lastName: urlParams.get('lastName'),
    email: urlParams.get('email'),
    phone: urlParams.get('phone'),
    orgName: urlParams.get('orgName'),
    timestamp: urlParams.get('timestamp')
};

document.getElementById('firstName').textContent = params.firstName || 'Not provided';
document.getElementById('lastName').textContent = params.lastName || 'Not provided';
document.getElementById('email').textContent = params.email || 'Not provided';
document.getElementById('phone').textContent = params.phone ? formatPhoneNumber(params.phone) : 'Not provided';
document.getElementById('orgName').textContent = params.orgName || 'Not provided';
document.getElementById('timestamp').textContent = params.timestamp || 'Not provided';

function formatPhoneNumber(phone) {
    // Remove non-digits
    const digits = phone.replace(/\D/g, '');
    // Check if we have 10 digits
    if (digits.length === 10) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    return phone; // Return original if invalid
}