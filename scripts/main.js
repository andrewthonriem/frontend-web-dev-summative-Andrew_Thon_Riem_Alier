import { state } from './state.js';
import { ui } from './ui.js';
import { search } from './search.js';

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Initialize modules
        state.init();
        search.init();
        ui.init();
        
        console.log('Campus Life Planner initialized successfully');
    } catch (error) {
        console.error('Failed to initialize application:', error);
        ui.announceStatus('Error initializing application. Please refresh the page.', 'error');
    }
});

// Make UI available globally for inline event handlers
window.ui = ui;