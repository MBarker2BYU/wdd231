import { saveDataToLocalStorage } from './utilities.mjs';

/**
 * Set up contact form for contact page
 */
// Implements accessible confirmation modal for contact form submission
export function setupContactForm() 
{
    try {
        const form = document.getElementById('contactForm');
        const modal = document.getElementById('contactModal');
        const closeBtn = document.getElementById('closeModalBtn');
        const modalName = document.getElementById('modalName');
        const modalEmail = document.getElementById('modalEmail');

        if (!form || !modal || !closeBtn || !modalName || !modalEmail) {
            console.error('Contact form elements not found');
            return;
        }

        // Demonstrates DOM manipulation (form data processing) and event handling (submit event)
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const data = {
                name: formData.get('name') || 'User',
                email: formData.get('email') || 'No email provided',
                message: formData.get('message') || ''
            };

            saveDataToLocalStorage('contactFormData', data);
            modalName.textContent = data.name;
            modalEmail.textContent = data.email;
            document.body.style.overflow = 'hidden';
            modal.showModal();

            form.reset();
        });

        closeBtn.addEventListener('click', () => {
            modal.close();
            document.body.style.overflow = '';
        });
    }
    catch (error) {
        console.error('Error setting up contact form:', error);
        alert('An error occurred while setting up the contact form. Please try again later.');
    }
}