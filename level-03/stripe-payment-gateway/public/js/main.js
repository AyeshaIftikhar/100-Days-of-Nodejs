// Main JavaScript file

document.addEventListener('DOMContentLoaded', () => {
  // Initialize tooltips
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });

  // Handle any flash messages
  const flashMessages = document.querySelectorAll('.alert-dismissible');
  flashMessages.forEach(message => {
    setTimeout(() => {
      const alert = bootstrap.Alert.getOrCreateInstance(message);
      alert.close();
    }, 5000);
  });
});
