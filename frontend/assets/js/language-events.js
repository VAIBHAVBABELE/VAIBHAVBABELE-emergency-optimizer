// Language toggle event handlers
document.addEventListener('DOMContentLoaded', function() {
    // Handle language toggle button clicks
    document.querySelectorAll('[data-lang]').forEach(button => {
        button.addEventListener('click', function() {
            const lang = this.getAttribute('data-lang');
            languageManager.switchLanguage(lang);
        });
    });
    
    // Initialize with saved language
    languageManager.applyLanguage();
});