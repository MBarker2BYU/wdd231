document.querySelectorAll('.modal-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelector(link.getAttribute('href')).classList.add('show');
    });
});
document.querySelectorAll('.close-modal').forEach(button => {
    button.addEventListener('click', () => {
        button.closest('.modal').classList.remove('show');
    });
});
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });
});