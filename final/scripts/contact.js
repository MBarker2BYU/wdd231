document.getElementById('contactForm').addEventListener('submit', (e) => 
{
    e.preventDefault(); // Prevent default form submission

    // Collect form data
    const formData = new FormData(e.target);
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        message: formData.get('message')
    };

    // Store form data in localStorage
    localStorage.setItem('contactFormData', JSON.stringify(data));

    // Show the modal
    const contactModal = document.getElementById('contactModal');
    const closeModalBtn = document.getElementById('closeModalBtn');

    if (contactModal && closeModalBtn) {
        contactModal.showModal();

        // Close the modal when the "Close" button is clicked
        closeModalBtn.addEventListener('click', () => {
            contactModal.close();
        });

        // Close the modal if the user clicks outside it (on the backdrop)
        // contactModal.addEventListener('click', (e) => {
        //     if (e.target === contactModal) {
        //         contactModal.close();
        //     }
        // });

        // Optionally clear the form
        e.target.reset();
    }
});