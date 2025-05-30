document.getElementById('contactForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        message: formData.get('message')
    };

    localStorage.setItem('contactFormData', JSON.stringify(data));

    const contactModal = document.getElementById('contactModal');
    const closeModalBtn = document.getElementById('closeModalBtn');

    if (contactModal && closeModalBtn) {
        // Hide body scrollbars when modal is open
        document.body.style.overflow = 'hidden';
        
        contactModal.showModal();

        closeModalBtn.addEventListener('click', () => {
            contactModal.close();
            // Restore body scrollbars
            document.body.style.overflow = '';
        });

        // Optionally clear the form
        e.target.reset();
    }
});