document.addEventListener('DOMContentLoaded', function () {
    const items = document.querySelectorAll('.item');

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);  // Stop observing once it's visible
            }
        });
    }, {
        threshold: 0.1  // Trigger when 10% of the item is in view
    });

    items.forEach(item => {
        observer.observe(item);
    });
});