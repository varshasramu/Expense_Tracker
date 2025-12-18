// script.js - Unified Initialization
document.addEventListener('DOMContentLoaded', function() {
    console.log('SmartSpend Initializing...');
    
    // Check if we're on landing page or dashboard
    if (document.getElementById('dashboard-view')) {
        // DASHBOARD PAGE
        setTimeout(() => {
            document.getElementById('loading').style.display = 'none';
            
            // Initialize core systems
            if (typeof initializeApp === 'function') {
                initializeApp();
            }
            
            // Initialize dashboard
            if (typeof initDashboard === 'function') {
                initDashboard();
            }
            
            console.log('Dashboard initialized successfully');
        }, 1000);
    } else if (document.getElementById('hero')) {
        // LANDING PAGE
        // landing.js handles this
        console.log('Landing page loaded');
    }
});