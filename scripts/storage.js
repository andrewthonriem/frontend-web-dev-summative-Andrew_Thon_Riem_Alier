const STORAGE_KEY = 'campus-planner-data';
const SETTINGS_KEY = 'campus-planner-settings';

// Data storage functions
export const storage = {
    // Load tasks from localStorage
    loadTasks() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error loading tasks:', error);
            return [];
        }
    },

    // Save tasks to localStorage
    saveTasks(tasks) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
            return true;
        } catch (error) {
            console.error('Error saving tasks:', error);
            return false;
        }
    },

    // Load settings from localStorage
    loadSettings() {
        try {
            const settings = localStorage.getItem(SETTINGS_KEY);
            return settings ? JSON.parse(settings) : {
                dailyCap: 480,
                durationUnits: 'minutes',
                version: '1.0'
            };
        } catch (error) {
            console.error('Error loading settings:', error);
            return {
                dailyCap: 480,
                durationUnits: 'minutes',
                version: '1.0'
            };
        }
    },

    // Save settings to localStorage
    saveSettings(settings) {
        try {
            localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
            return true;
        } catch (error) {
            console.error('Error saving settings:', error);
            return false;
        }
    },

    // Export data as JSON
    exportData(tasks, settings) {
        try {
            const exportData = {
                tasks,
                settings,
                exportedAt: new Date().toISOString(),
                version: '1.0'
            };
            return JSON.stringify(exportData, null, 2);
        } catch (error) {
            console.error('Error exporting data:', error);
            return null;
        }
    },

    // Import data from JSON
    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            
            // Validate structure
            if (!this.validateImportData(data)) {
                throw new Error('Invalid data structure');
            }

            return {
                tasks: data.tasks || [],
                settings: data.settings || this.loadSettings()
            };
        } catch (error) {
            console.error('Error importing data:', error);
            throw new Error('Failed to import data: ' + error.message);
        }
    },

    // Validate imported data structure
    validateImportData(data) {
        if (typeof data !== 'object' || data === null) return false;
        
        if (data.tasks && !Array.isArray(data.tasks)) return false;
        
        // Validate task structure if tasks exist
        if (data.tasks && data.tasks.length > 0) {
            const sampleTask = data.tasks[0];
            const requiredFields = ['id', 'title', 'dueDate', 'duration', 'tag'];
            return requiredFields.every(field => field in sampleTask);
        }

        return true;
    },

    // Clear all data
    clearAllData() {
        try {
            localStorage.removeItem(STORAGE_KEY);
            localStorage.removeItem(SETTINGS_KEY);
            return true;
        } catch (error) {
            console.error('Error clearing data:', error);
            return false;
        }
    }
};