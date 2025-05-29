document.getElementById('contactForm').addEventListener('submit', (e) => {
      e.preventDefault(); // Prevent default form submission
      const formData = new FormData(e.target);
      const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        message: formData.get('message')
      };
      // Store form data in localStorage
      localStorage.setItem('contactFormData', JSON.stringify(data));
      // Redirect to form-action.html
      window.location.href = 'form-action.html';
    });